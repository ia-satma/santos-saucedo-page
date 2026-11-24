import { SUPPORTED_LANGUAGES, type LanguageCode } from "./constants";

export const VISUAL_SCHEMA_VERSION = 1;

export const VISUAL_PAGE_IDS = [
  "home", "about", "practices", "industries", "team", "news", "contact",
  "careers", "interns", "offices", "newsletter", "testimonials", "privacy", "terms", "not-found",
] as const;
export type VisualPageId = typeof VISUAL_PAGE_IDS[number];

export const VISUAL_COMPONENT_TYPES = [
  "HeroBlock", "VideoBlock", "TextBlock", "QuoteBlock", "StatsBlock", "PracticesGrid", "IndustriesGrid", "TeamGrid",
  "NewsFeed", "MediaBlock", "Gallery", "Map", "Form", "VisualSheet", "Navigation", "Footer", "SectionBlock", "Spacer",
] as const;
export type VisualComponentType = typeof VISUAL_COMPONENT_TYPES[number];

export type VisualScalar = string | number | boolean | null;
export type VisualValue = VisualScalar | VisualValue[] | { [key: string]: VisualValue };
export type VisualComponent = { type: VisualComponentType; props: Record<string, VisualValue> };
export type VisualPageData = { content: VisualComponent[]; root?: Record<string, VisualValue> };
export type VisualPageStored = {
  pageId: VisualPageId;
  language: LanguageCode;
  schemaVersion: number;
  content: VisualPageData;
  draft?: VisualPageData;
  previous?: VisualPageData | null;
  updatedAt?: string;
  updatedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
};

const MAX_BYTES = 500_000;
const MAX_DEPTH = 12;
const MAX_COMPONENTS = 100;
const UNSAFE_KEY = /^(?:__proto__|prototype|constructor|dangerouslySetInnerHTML|on[a-z])/i;
const UNSAFE_VALUE = /(?:<\/?script\b|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|on[a-z]+\s*=)/i;
const MEDIA_KEY = /(?:^|_)(?:image|video|poster|media|asset|photo|logo|icon|background|src)(?:$|_)/i;

export function isVisualPageId(value: string): value is VisualPageId {
  return (VISUAL_PAGE_IDS as readonly string[]).includes(value);
}
export function isVisualLanguage(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some(({ code }) => code === value);
}
export function emptyVisualPageData(): VisualPageData { return { content: [], root: {} }; }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value && typeof value === "object" && !Array.isArray(value)); }
function byteLength(value: unknown) { return new TextEncoder().encode(JSON.stringify(value)).byteLength; }
function safeUrl(value: string, key: string): boolean {
  if (!/^(?:href|url|link|target)$/i.test(key)) return true;
  if (value.startsWith("/")) return true;
  return /^https:\/\//i.test(value);
}
function walk(value: unknown, depth: number, path: string[], errors: string[]) {
  if (depth > MAX_DEPTH) { errors.push(`La configuración visual supera la profundidad máxima en ${path.join(".") || "root"}.`); return; }
  if (typeof value === "string") {
    if (UNSAFE_VALUE.test(value)) errors.push(`El campo ${path.join(".") || "root"} contiene contenido inseguro.`);
    const key = path.at(-1) || "";
    if (MEDIA_KEY.test(key) && /^https?:\/\//i.test(value)) errors.push(`El medio ${path.join(".")} debe usar una ruta interna.`);
    if (!safeUrl(value, key)) errors.push(`El enlace ${path.join(".")} debe ser interno o usar HTTPS.`);
    return;
  }
  if (Array.isArray(value)) { value.forEach((item, index) => walk(item, depth + 1, [...path, String(index)], errors)); return; }
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (UNSAFE_KEY.test(key)) { errors.push(`La propiedad ${[...path, key].join(".")} no está permitida.`); continue; }
      walk(item, depth + 1, [...path, key], errors);
    }
  }
}
export function validateVisualPageData(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ["La configuración visual debe ser un objeto."];
  if (!Array.isArray(value.content)) errors.push("La configuración visual debe incluir una lista de componentes.");
  if (Array.isArray(value.content) && value.content.length > MAX_COMPONENTS) errors.push(`La configuración visual no puede superar ${MAX_COMPONENTS} componentes.`);
  if (Array.isArray(value.content)) value.content.forEach((component, index) => {
    if (!isRecord(component)) { errors.push(`El componente ${index + 1} no es válido.`); return; }
    if (!(VISUAL_COMPONENT_TYPES as readonly string[]).includes(String(component.type))) errors.push(`El componente ${index + 1} no está permitido.`);
    if (!isRecord(component.props)) errors.push(`El componente ${index + 1} debe incluir propiedades válidas.`);
  });
  walk(value, 0, [], errors);
  if (errors.length === 0 && byteLength(value) > MAX_BYTES) errors.push(`La configuración visual no puede superar ${MAX_BYTES} bytes.`);
  return errors;
}
export function normalizeVisualPageData(value: unknown): VisualPageData {
  const errors = validateVisualPageData(value);
  if (errors.length) throw new Error(errors.join(" "));
  const data = value as VisualPageData;
  return { content: data.content.map((component) => ({ type: component.type, props: { ...component.props } })), root: data.root ? { ...data.root } : {} };
}
export function visualPageKey(pageId: VisualPageId, language: LanguageCode) { return `visual.${pageId}.${language}`; }
export const visualPageLimits = { maxBytes: MAX_BYTES, maxDepth: MAX_DEPTH, maxComponents: MAX_COMPONENTS } as const;
