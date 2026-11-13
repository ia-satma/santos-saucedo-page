import { normalizeRadarItem, type RadarItem, type RadarSourceType } from "./laborRadar";

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
const MAX_BODY = 4_000_000;

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

export async function runRadarSources(input: { date?: string; sources?: RadarSourceType[]; limit?: number } = {}): Promise<{ results: RadarRunResult[]; items: RadarItem[]; errors: string[]; date: string }> {
  const date = input.date || mxDate();
  const sources = input.sources?.filter((source) => source === "dof" || source === "sjf") || ["dof", "sjf"];
  const results = await Promise.all(sources.map((source) => source === "dof" ? fetchDof(date, input.limit || 25) : fetchSjf(date, input.limit || 25)));
  return { results, items: results.flatMap((result) => result.items), errors: results.flatMap((result) => result.errors), date };
}
