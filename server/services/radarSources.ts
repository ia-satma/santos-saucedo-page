import { normalizeRadarItem, type RadarItem, type RadarSourceType } from "./laborRadar";
import { normalizeScjnSqliteExport } from "./scjnSqliteRadar";
import { load as loadHtml } from "cheerio";

export const RADAR_ENTITIES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
  "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero",
  "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
  "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
] as const;

export type RadarRunResult = {
  source: RadarSourceType;
  items: RadarItem[];
  errors: string[];
  retrievedAt: string;
};

const DOF_BASE = "https://sidof.segob.gob.mx";
const SJF_DEFAULT = "https://bicentenario.scjn.gob.mx/repositorio-scjn/api/v1/tesis/ids";
const SCJN_PRESS_INDEX = "https://www.scjn.gob.mx/multimedia/comunicados";
const TFCA_BOLETIN_INDEX = "https://portales.segob.gob.mx/es/TFCA/Boletin_Laboral";
const MAX_BODY = 4_000_000;

const SCJN_PRESS_HOSTS = ["www.scjn.gob.mx", "scjn.gob.mx", "www.internet2.scjn.gob.mx", "internet2.scjn.gob.mx"];
const TFCA_HOSTS = ["portales.segob.gob.mx", "www.gob.mx", "gob.mx"];

const LABOR_TOPIC_PATTERN = /laboral|trabaj|salari|emple|sindicat|patron|trabajador|despid|jornad|seguridad social|pension|conciliacion|servidor publico|burocrat|funcionari|nomina|prestacion|vacacion|subcontrat|riesgo de trabajo/i;

function folded(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-MX");
}

function topicsFor(value: string, base: string[]): string[] {
  const topics = [...base];
  if (LABOR_TOPIC_PATTERN.test(folded(value))) topics.push("laboral");
  return Array.from(new Set(topics));
}

function mxDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Monterrey" }).format(date);
}

function dofDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}

function isoDate(value: unknown, fallback: string): string {
  const raw = textValue(value, fallback);
  const match = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : raw;
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    headers: { accept: "*/*", "user-agent": "Santos-Saucedo-Radar/1.0", ...(init?.headers || {}) },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Fuente ${response.status} en ${new URL(url).hostname}`);
  const body = await response.text();
  if (body.length > MAX_BODY) throw new Error("La respuesta de la fuente excede el límite permitido");
  try { return JSON.parse(body); } catch { throw new Error("La fuente no devolvió JSON válido"); }
}

async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const response = await fetch(url, {
    ...init,
    headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Santos-Saucedo-Radar/1.0", ...(init?.headers || {}) },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Fuente ${response.status} en ${new URL(url).hostname}`);
  const body = await response.text();
  if (body.length > MAX_BODY) throw new Error("La respuesta de la fuente excede el límite permitido");
  return body;
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

function listFrom(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const key of ["items", "data", "results", "tesis", "ids", "NotasMatutinas", "NotasVespertinas", "NotasExtraordinarias"]) {
    if (Array.isArray(record[key])) return record[key];
  }
  return [];
}

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : fallback;
}

function safeOfficialUrl(url: string, allowedHosts: string[]): string {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !allowedHosts.includes(parsed.hostname.toLowerCase())) {
    throw new Error("La URL de la fuente no pertenece al dominio oficial configurado");
  }
  return parsed.toString();
}

async function fetchDof(date: string, limit: number): Promise<RadarRunResult> {
  const retrievedAt = new Date().toISOString();
  const errors: string[] = [];
  const items: RadarItem[] = [];
  try {
    const daily = await fetchJson(`${DOF_BASE}/dof/sidof/notas/${dofDate(date)}`);
    const notes = ["NotasMatutinas", "NotasVespertinas", "NotasExtraordinarias"].flatMap((key) => listFrom(asRecord(daily)[key]));
    for (const note of notes.slice(0, Math.max(1, Math.min(limit, 100)))) {
      const id = String(note.codNota ?? note.id ?? "").trim();
      if (!id) continue;
      try {
        const detail = asRecord(await fetchJson(`${DOF_BASE}/dof/sidof/notas/nota/${encodeURIComponent(id)}`)).Nota;
        const title = textValue(detail?.titulo, textValue(note.titulo ?? note.title, `Nota DOF ${id}`));
        const sourceUrl = safeOfficialUrl(`${DOF_BASE}/notas/${id}`, ["sidof.segob.gob.mx"]);
        items.push(normalizeRadarItem({
          sourceType: "dof", sourceId: id, title, summary: textValue(detail?.codOrgaUno || note.codOrgaUno),
          content: "", officialUrl: sourceUrl, publishedAt: isoDate(detail?.fecha || note.fecha, date),
          metadata: { codDiario: detail?.codDiario ?? note.codDiario, seccion: detail?.codSeccion ?? note.codSeccion, autoridad: detail?.codOrgaUno ?? note.codOrgaUno },
          topics: ["México"], detectedAt: retrievedAt,
        }, new Date(retrievedAt)));
      } catch (error) { errors.push(`DOF ${id}: ${(error as Error).message}`); }
    }
  } catch (error) { errors.push(`DOF: ${(error as Error).message}`); }
  return { source: "dof", items, errors, retrievedAt };
}

async function fetchSjf(date: string, limit: number): Promise<RadarRunResult> {
  const retrievedAt = new Date().toISOString();
  const errors: string[] = [];
  const items: RadarItem[] = [];
  const configured = process.env.SJF_RADAR_FEED_URL || SJF_DEFAULT;
  try {
    const feedUrl = new URL(configured);
    const sjfHost = feedUrl.hostname.toLowerCase();
    if (sjfHost !== "scjn.gob.mx" && !sjfHost.endsWith(".scjn.gob.mx")) throw new Error("SJF_RADAR_FEED_URL debe ser un dominio oficial de SCJN");
    if (feedUrl.pathname.endsWith("/ids")) feedUrl.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 50)));
    const payload = await fetchJson(feedUrl.toString());
    const records = listFrom(payload).slice(0, Math.min(limit, 50));
    for (const record of records) {
      const item = asRecord(record);
      const id = String(item.idTesis ?? item.id ?? item.digitalRegistry ?? item.registro ?? "").trim();
      const title = textValue(item.rubro ?? item.titulo ?? item.title, id ? `Tesis SJF ${id}` : "");
      if (!id || !title) continue;
      const officialUrl = safeOfficialUrl(`https://sjf2.scjn.gob.mx/detalle/tesis/${encodeURIComponent(id)}`, ["sjf2.scjn.gob.mx"]);
      items.push(normalizeRadarItem({ sourceType: "sjf", sourceId: id, title, summary: textValue(item.materia ?? item.abstract), content: textValue(item.texto), officialUrl, publishedAt: item.fechaPublicacion ?? item.fecha ?? date, metadata: { epoca: item.epoca, instancia: item.instancia, materia: item.materia }, topics: ["México"], detectedAt: retrievedAt }, new Date(retrievedAt)));
    }
    if (!records.length) errors.push("SJF no devolvió registros en el endpoint configurado");
  } catch (error) { errors.push(`SJF: ${(error as Error).message}`); }
  return { source: "sjf", items, errors, retrievedAt };
}

async function fetchScjnSqlite(date: string, limit: number): Promise<RadarRunResult> {
  const retrievedAt = new Date().toISOString();
  const errors: string[] = [];
  const exportUrl = (process.env.SCJN_SQLITE_EXPORT_URL || "").trim();
  if (!exportUrl) {
    return { source: "scjn_sqlite", items: [], errors: ["SCJN_SQLITE_EXPORT_URL no está configurado; publica el JSON exportado por SCJN_SQLITE para activarlo."], retrievedAt };
  }
  try {
    const parsed = new URL(exportUrl);
    if (parsed.protocol !== "https:") throw new Error("SCJN_SQLITE_EXPORT_URL debe usar HTTPS");
    const items = normalizeScjnSqliteExport(await fetchJson(parsed.toString()), date).slice(0, Math.min(Math.max(limit, 1), 100));
    if (!items.length) errors.push("SCJN_SQLITE no devolvió tesis con identificador");
    return { source: "scjn_sqlite", items, errors, retrievedAt };
  } catch (error) {
    return { source: "scjn_sqlite", items: [], errors: [`SCJN SQLite: ${(error as Error).message}`], retrievedAt };
  }
}

function htmlDate(value: string, fallback: string): string {
  const iso = value.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const spanish = value.match(/\b(\d{1,2})\s+(?:de\s+)?([a-záéíóúñ]+)\s+(?:de\s+)?(20\d{2})\b/i);
  if (spanish) {
    const months: Record<string, string> = { enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06", julio: "07", agosto: "08", septiembre: "09", setiembre: "09", octubre: "10", noviembre: "11", diciembre: "12" };
    const month = months[folded(spanish[2])];
    if (month) return `${spanish[3]}-${month}-${spanish[1].padStart(2, "0")}`;
  }
  return fallback;
}

function sourceIdFromUrl(url: string, fallback: string): string {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("id") || parsed.pathname.split("/").filter(Boolean).pop() || fallback;
  } catch { return fallback; }
}

/**
 * Reads the SCJN public communications index. The index contains a human
 * readable subject and a link to the original SCJN communication. We keep
 * every finding as an unpublished Radar draft for editorial approval.
 */
async function fetchScjnPress(date: string, limit: number): Promise<RadarRunResult> {
  const retrievedAt = new Date().toISOString();
  const errors: string[] = [];
  const items: RadarItem[] = [];
  try {
    const html = await fetchText(SCJN_PRESS_INDEX);
    const $ = loadHtml(html);
    const rows: Array<{ title: string; summary: string; href: string; dateText?: string }> = [];
    $("table tbody tr").each((_index, element) => {
      const cells = $(element).find("td");
      const anchor = cells.eq(1).find("a[href]").first();
      const href = anchor.attr("href");
      if (!href) return;
      rows.push({ title: textValue(cells.eq(0).text(), "Comunicado SCJN"), summary: textValue(anchor.text()), href, dateText: textValue(cells.eq(2).text()) });
    });
    if (!rows.length) {
      $("a[href*='comunicado.asp']").each((_index, element) => {
        const href = $(element).attr("href");
        if (href) rows.push({ title: "Comunicado SCJN", summary: textValue($(element).text()), href, dateText: textValue($(element).closest("tr").text()) });
      });
    }
    const seen = new Set<string>();
    for (const row of rows.slice(0, Math.min(Math.max(limit, 1), 100))) {
      try {
        const officialUrl = safeOfficialUrl(new URL(row.href, SCJN_PRESS_INDEX).toString(), SCJN_PRESS_HOSTS);
        if (seen.has(officialUrl)) continue;
        seen.add(officialUrl);
        const sourceId = sourceIdFromUrl(officialUrl, row.title);
        const combined = `${row.title} ${row.summary}`;
        items.push(normalizeRadarItem({
          sourceType: "scjn_press" as RadarSourceType,
          sourceId,
          title: row.title || `Comunicado SCJN ${sourceId}`,
          summary: row.summary || row.title,
          content: row.summary || row.title,
          officialUrl,
          publishedAt: htmlDate(row.dateText || "", date),
          metadata: { section: "Comunicados SCJN", publishedDateSource: row.dateText ? "fecha publicada por SCJN" : "fecha de revisión del Radar" },
          topics: topicsFor(combined, ["México", "SCJN", "comunicado"]),
          detectedAt: retrievedAt,
        }, new Date(retrievedAt)));
      } catch (error) { errors.push(`SCJN comunicado: ${(error as Error).message}`); }
    }
    if (!items.length) errors.push("SCJN comunicados no devolvió enlaces oficiales");
  } catch (error) { errors.push(`SCJN comunicados: ${(error as Error).message}`); }
  return { source: "scjn_press" as RadarSourceType, items, errors, retrievedAt };
}

/**
 * Reads the public TFCA labor bulletin calendar. Bulletin links are PDFs
 * hosted on the official SEGOB portal. The portal itself warns that these
 * bulletins are informational, so metadata keeps that warning with the draft.
 */
async function fetchTfca(date: string, limit: number): Promise<RadarRunResult> {
  const retrievedAt = new Date().toISOString();
  const errors: string[] = [];
  const items: RadarItem[] = [];
  try {
    const html = await fetchText(TFCA_BOLETIN_INDEX);
    const $ = loadHtml(html);
    const rows: Array<{ day: string; month: string; href: string }> = [];
    $("a[href]").each((_index, element) => {
      const href = $(element).attr("href") || "";
      if (!/\.pdf(?:[?#].*)?$/i.test(href)) return;
      const anchor = $(element);
      const day = textValue(anchor.text());
      const caption = textValue(anchor.closest("table").find("caption").first().text());
      rows.push({ day, month: caption, href });
    });
    const seen = new Set<string>();
    for (const row of rows.slice(0, Math.min(Math.max(limit, 1), 100))) {
      try {
        const officialUrl = safeOfficialUrl(new URL(row.href, TFCA_BOLETIN_INDEX).toString(), TFCA_HOSTS);
        if (seen.has(officialUrl)) continue;
        seen.add(officialUrl);
        const sourceId = sourceIdFromUrl(officialUrl, `TFCA-${row.day || "boletin"}`);
        const publicationDate = htmlDate(`${row.day} ${row.month}`, date);
        const summary = `Boletín Laboral del Tribunal Federal de Conciliación y Arbitraje${row.day ? ` del día ${row.day}` : ""}.`;
        items.push(normalizeRadarItem({
          sourceType: "tfca" as RadarSourceType,
          sourceId,
          title: `Boletín Laboral TFCA${row.day ? ` — ${row.day}` : ""}`,
          summary,
          content: `${summary} El portal oficial indica que la información es de carácter informativo y debe ser revisada antes de cualquier uso jurídico.`,
          officialUrl,
          publishedAt: publicationDate,
          metadata: { section: "Boletín Laboral TFCA", informationalOnly: true, sourceNotice: "El portal declara que la información no es oficial para procesos jurídicos." },
          topics: ["México", "TFCA", "laboral"],
          detectedAt: retrievedAt,
        }, new Date(retrievedAt)));
      } catch (error) { errors.push(`TFCA boletín: ${(error as Error).message}`); }
    }
    if (!items.length) errors.push("TFCA no devolvió boletines PDF oficiales");
  } catch (error) { errors.push(`TFCA: ${(error as Error).message}`); }
  return { source: "tfca" as RadarSourceType, items, errors, retrievedAt };
}

export async function runRadarSources(input: { date?: string; sources?: RadarSourceType[]; limit?: number } = {}): Promise<{ results: RadarRunResult[]; items: RadarItem[]; errors: string[]; date: string }> {
  const date = input.date || mxDate();
  const defaultSources: RadarSourceType[] = ["dof", "sjf", "scjn_press", "tfca"];
  if (process.env.SCJN_SQLITE_EXPORT_URL) defaultSources.push("scjn_sqlite");
  const sources = input.sources?.filter((source) => ["dof", "sjf", "scjn_press", "tfca", "scjn_sqlite"].includes(source)) || defaultSources;
  const results = await Promise.all(sources.map((source) => {
    if (source === "dof") return fetchDof(date, input.limit || 25);
    if (source === "sjf") return fetchSjf(date, input.limit || 25);
    if (source === "scjn_press") return fetchScjnPress(date, input.limit || 25);
    if (source === "scjn_sqlite") return fetchScjnSqlite(date, input.limit || 25);
    return fetchTfca(date, input.limit || 25);
  }));
  return { results, items: results.flatMap((result) => result.items), errors: results.flatMap((result) => result.errors), date };
}
