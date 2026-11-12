import path from "node:path";

export const SOCIAL_REFERENCE_KIT = {
  id: "santos-saucedo-social-kit-2026-11",
  label: "Kit de redes sociales Santos & Saucedo",
  root: path.join(process.cwd(), "server/assets/social-templates/kit-redes-sociales"),
  catalog: path.join(process.cwd(), "server/assets/social-templates/kit-redes-sociales/Catalogo Redes Sociales (offline).html"),
  skill: path.join(process.cwd(), "server/assets/social-templates/kit-redes-sociales/SKILL.md"),
} as const;

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
