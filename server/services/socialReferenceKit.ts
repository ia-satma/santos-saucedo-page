import path from "node:path";
import { readFile, readdir } from "node:fs/promises";

export const SOCIAL_REFERENCE_KIT = {
  id: "santos-saucedo-social-kit-2026-11",
  label: "Kit de redes sociales Santos & Saucedo",
  root: path.join(process.cwd(), "server/assets/social-templates/kit-redes-sociales"),
  catalog: path.join(process.cwd(), "server/assets/social-templates/kit-redes-sociales/Catalogo Redes Sociales (offline).html"),
  skill: path.join(process.cwd(), "server/assets/social-templates/kit-redes-sociales/SKILL.md"),
} as const;

export type SocialReferenceTemplate = { id: string; kind: "post" | "carousel"; label: string; file: string };
export type SocialReferenceTemplateSummary = { id: string; kind: "post" | "carousel"; label: string; screens: number; fonts: string[]; colors: string[] };
const labelFromFilename = (filename: string) => filename.replace(/\.html$/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

export async function listSocialReferenceTemplates(): Promise<SocialReferenceTemplate[]> {
  const entries = await Promise.all(([
    ["post", path.join(SOCIAL_REFERENCE_KIT.root, "plantillas", "posts")],
    ["carousel", path.join(SOCIAL_REFERENCE_KIT.root, "plantillas", "carruseles")],
  ] as const).map(async ([kind, directory]) => {
    const files = await readdir(directory, { withFileTypes: true }).catch(() => []);
    return files.filter((entry) => entry.isFile() && !entry.name.startsWith("._") && entry.name.toLowerCase().endsWith(".html")).map((entry) => ({
      id: `${kind}:${entry.name.replace(/\.html$/i, "")}`,
      kind,
      label: labelFromFilename(entry.name),
      file: path.join(directory, entry.name),
    } satisfies SocialReferenceTemplate));
  }));
  return entries.flat().sort((a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label, "es"));
}

export async function getSocialReferenceTemplate(templateId: string | undefined) {
  if (!templateId) return undefined;
  const template = (await listSocialReferenceTemplates()).find((item) => item.id === templateId);
  if (!template) return undefined;
  const source = await readFile(template.file, "utf8").catch(() => "");
  const fonts = Array.from(new Set(Array.from(source.matchAll(/font-family:\s*['\"]?([^;'\"]+)/gi), (match) => match[1].trim()))).slice(0, 6);
  const colors = Array.from(new Set(source.match(/#[0-9a-f]{6}/gi) ?? [])).map((color) => color.toLowerCase()).slice(0, 12);
  return {
    ...template,
    summary: {
      screens: Math.max(1, (source.match(/data-screen-label=/g) ?? []).length),
      fonts,
      colors,
    } satisfies Omit<SocialReferenceTemplateSummary, "id" | "kind" | "label">,
  };
}

export const SOCIAL_REFERENCE_GUIDANCE = `
KIT APROBADO DE REFERENCIA — ${SOCIAL_REFERENCE_KIT.label}
- Usa las plantillas como punto de partida visual, sin limitar las ideas ni repetir siempre el mismo formato.
- Posts y carruseles usan lienzo cuadrado 1080 × 1080, márgenes amplios, Lora para titulares y DM Sans para texto.
- Respeta azul #0B2850, lima #BBF741, verde de texto #5E8F17 sobre blanco, gris #EEF2F6 y líneas #D3DBE6.
- Las fotos conservan su color natural. Solo se permite un degradado parcial inferior para legibilidad.
- Un carrusel debe tener portada, contenido con una o dos ideas por diapositiva y cierre con contacto. Alterna fondos claros, oscuros, grises y lima.
- Elige la familia más cercana al objetivo: dato o cifra, noticia, cita, pregunta frecuente, servicio, guía, mito o realidad, paso a paso, calendario, comparativo o equipo.
- Texto mínimo de 24 px, titular de hasta 12 palabras y bajada de hasta 20 cuando el formato lo permita. Si una norma o cifra no está sustentada, marca revisión humana.
- El agente puede proponer nuevos conceptos y composiciones. La referencia orienta la calidad y la marca, no funciona como catálogo cerrado.
`;
