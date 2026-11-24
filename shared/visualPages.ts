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
const MEDIA_KEY = /^(?:image|video|poster|media|asset|photo|logo|icon|background|src)(?:[A-Z_]|$)/i;
const SOURCE_REF = /^[A-Za-z][A-Za-z0-9_-]{0,80}\.[A-Za-z][A-Za-z0-9_-]*(?:\.[A-Za-z][A-Za-z0-9_-]*){0,5}$/;
const VISUAL_PROP_KEYS: Record<string, readonly string[]> = {
  HeroBlock: ["id", "eyebrow", "title", "description", "mediaPath", "tone", "sourceMap"],
  VideoBlock: ["id", "videoPath", "posterPath", "alt", "tone", "sourceMap"],
  TextBlock: ["id", "title", "body", "tone", "sourceMap"],
  QuoteBlock: ["id", "quote", "author", "sourceMap"],
  StatsBlock: ["id", "title", "items", "sourceMap"],
  PracticesGrid: ["id", "source", "limit", "tone", "sourceMap"],
  IndustriesGrid: ["id", "source", "limit", "tone", "sourceMap"],
  TeamGrid: ["id", "source", "limit", "tone", "sourceMap"],
  NewsFeed: ["id", "source", "limit", "tone", "sourceMap"],
  MediaBlock: ["id", "mediaPath", "alt", "caption", "sourceMap"],
  Gallery: ["id", "source", "limit", "tone", "sourceMap"],
  Map: ["id", "source", "tone", "sourceMap"],
  Form: ["id", "formId", "tone", "sourceMap"],
  VisualSheet: ["id", "sheetId", "tone", "sourceMap"],
  Navigation: ["id", "source", "tone", "sourceMap"],
  Footer: ["id", "source", "tone", "sourceMap"],
  SectionBlock: ["id", "sectionId", "title", "description", "sourceMap"],
  Spacer: ["id", "size", "sourceMap"],
};

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
    const componentType = String(component.type);
    if (!(VISUAL_COMPONENT_TYPES as readonly string[]).includes(componentType)) errors.push(`El componente ${index + 1} no está permitido.`);
    if (!isRecord(component.props)) errors.push(`El componente ${index + 1} debe incluir propiedades válidas.`);
    const allowedProps = VISUAL_PROP_KEYS[componentType];
    if (allowedProps && isRecord(component.props)) {
      for (const key of Object.keys(component.props)) {
        if (!allowedProps.includes(key)) errors.push(`La propiedad ${key} del componente ${index + 1} no está permitida.`);
      }
      const sourceMap = component.props.sourceMap;
      if (sourceMap !== undefined) {
        if (!isRecord(sourceMap)) errors.push(`El mapa CMS del componente ${index + 1} no es válido.`);
        else for (const [field, path] of Object.entries(sourceMap)) {
          if (!/^[A-Za-z][A-Za-z0-9_-]{0,40}$/.test(field) || typeof path !== "string" || !SOURCE_REF.test(path)) {
            errors.push(`La referencia CMS ${field} del componente ${index + 1} no es válida.`);
          }
        }
      }
    }
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
/**
 * Normalizes a visual document while keeping an explicit migration boundary.
 * Version zero was the pre-release shape and used the same component payload,
 * so it can be upgraded without rewriting the document. Future versions are
 * rejected until a migration is added deliberately.
 */
export function migrateVisualPageData(value: unknown, fromVersion = VISUAL_SCHEMA_VERSION): VisualPageData {
  if (!Number.isInteger(fromVersion) || fromVersion < 0) {
    throw new Error("La versión de la configuración visual no es válida.");
  }
  if (fromVersion > VISUAL_SCHEMA_VERSION) {
    throw new Error(`La configuración visual usa una versión futura (${fromVersion}).`);
  }
  return normalizeVisualPageData(value);
}
export function visualPageKey(pageId: VisualPageId, language: LanguageCode) { return `visual.${pageId}.${language}`; }
export const visualPageLimits = { maxBytes: MAX_BYTES, maxDepth: MAX_DEPTH, maxComponents: MAX_COMPONENTS } as const;
