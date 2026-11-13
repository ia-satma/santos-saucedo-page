import { normalizeRadarItem, type RadarItem } from "./laborRadar";

/**
 * Maps rows exported from SCJN_SQLITE's `tesis` table into the shared Radar
 * contract. The downloader owns synchronization and SQLite storage. The CMS
 * only ingests the small JSON export it produces, preserving source IDs and
 * official links for human review.
 */
export type ScjnSqliteRow = Record<string, unknown>;

const LABORAL = /laboral|trabajo|salario|empleo|sindicat|seguridad social|patron|trabajador|despido|jornada|pension|riesgo de trabajo/i;
const MONTHS: Record<string, string> = {
  enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06",
  julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
};

function value(row: ScjnSqliteRow, ...keys: string[]): string {
  for (const key of keys) {
    const raw = row[key];
    if (typeof raw === "string" && raw.trim()) return raw.replace(/\s+/g, " ").trim();
    if (typeof raw === "number") return String(raw);
  }
  return "";
}

function dateValue(row: ScjnSqliteRow, fallback: string): string {
  const direct = value(row, "published_at", "fecha_publicacion", "fechaPublicacion", "fecha", "date");
  if (/^\d{4}-\d{2}-\d{2}/.test(direct)) {
    const iso = direct.slice(0, 10);
    if (!Number.isNaN(Date.parse(`${iso}T00:00:00Z`))) return iso;
  }
  const mx = direct.match(/^(\d{1,2})[\\/-](\d{1,2})[\\/-](20\d{2})$/);
  if (mx) {
    const iso = `${mx[3]}-${mx[2].padStart(2, "0")}-${mx[1].padStart(2, "0")}`;
    if (!Number.isNaN(Date.parse(`${iso}T00:00:00Z`))) return iso;
  }
  const year = value(row, "anio", "año", "year");
  const month = value(row, "mes", "month").toLowerCase();
  const monthNumber = /^\d{1,2}$/.test(month) ? month.padStart(2, "0") : MONTHS[month];
  if (/^\d{4}$/.test(year) && monthNumber) return `${year}-${monthNumber}-01`;
  return fallback;
}

function officialTesisUrl(candidate: string, id: string): string {
  const fallback = `https://sjf2.scjn.gob.mx/detalle/tesis/${encodeURIComponent(id)}`;
  try {
    const parsed = new URL(candidate);
    const hosts = new Set(["sjf2.scjn.gob.mx", "bicentenario.scjn.gob.mx", "www.scjn.gob.mx", "scjn.gob.mx", "www.internet2.scjn.gob.mx", "internet2.scjn.gob.mx"]);
    if (parsed.protocol === "https:" && hosts.has(parsed.hostname.toLowerCase())) return parsed.toString();
  } catch {
    // A malformed exported URL is replaced by the deterministic SCJN detail URL.
  }
  return fallback;
}

function rowsFrom(payload: unknown): ScjnSqliteRow[] {
  if (Array.isArray(payload)) return payload.filter((row): row is ScjnSqliteRow => Boolean(row && typeof row === "object" && !Array.isArray(row)));
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["tesis", "items", "data", "results", "rows"]) {
    if (Array.isArray(record[key])) return rowsFrom(record[key]);
  }
  return [];
}

export function normalizeScjnSqliteExport(payload: unknown, fallbackDate: string): RadarItem[] {
  return rowsFrom(payload).flatMap((row) => {
    const id = value(row, "id_tesis", "idTesis", "id", "registro", "registro_digital");
    const title = value(row, "rubro", "titulo", "title") || (id ? `Tesis SCJN ${id}` : "");
    if (!id || !title) return [];
    const materia = value(row, "materias", "materia");
    const texto = value(row, "texto", "text", "contenido");
    const precedentes = value(row, "precedentes");
    const officialUrl = officialTesisUrl(value(row, "source_url", "sourceUrl", "url"), id);
    const searchable = `${title} ${materia} ${texto}`;
    const topics = ["México", ...(materia ? materia.split(/[,;|]/).map((item) => item.trim()).filter(Boolean) : [])];
    if (LABORAL.test(searchable)) topics.push("Derecho laboral");
    return [normalizeRadarItem({
      sourceType: "scjn_sqlite",
      sourceId: id,
      title,
      summary: [materia, value(row, "instancia"), value(row, "epoca", "época")].filter(Boolean).join(" · "),
      content: [texto, precedentes ? `Precedentes: ${precedentes}` : ""].filter(Boolean).join("\n\n"),
      officialUrl,
      publishedAt: dateValue(row, fallbackDate),
      metadata: {
        epoca: value(row, "epoca", "época"),
        instancia: value(row, "instancia"),
        organo: value(row, "organo_juris", "organoJuris"),
        tipo: value(row, "tipo_tesis", "tipoTesis"),
        huella: value(row, "huella_digital", "huellaDigital"),
        source: "SCJN_SQLITE",
      },
      topics,
      detectedAt: new Date().toISOString(),
    })];
  });
}
