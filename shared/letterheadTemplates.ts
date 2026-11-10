export const LETTERHEAD_TEMPLATE_IDS = ["clasica", "banda-azul", "trama", "pie-azul"] as const;
export type LetterheadTemplateId = typeof LETTERHEAD_TEMPLATE_IDS[number];
export const DEFAULT_LETTERHEAD_TEMPLATE: LetterheadTemplateId = "clasica";

const templateDetails: Record<LetterheadTemplateId, { label: string; description: string }> = {
  clasica: { label: "01 · Clásica", description: "Logotipo azul, marca de agua lateral y pie claro." },
  "banda-azul": { label: "02 · Bandas azules", description: "Encabezado y pie azules con marca de agua al centro." },
  trama: { label: "03 · Trama institucional", description: "Fondo con patrón del monograma y pie claro." },
  "pie-azul": { label: "04 · Pie azul", description: "Encabezado blanco, marca de agua lateral y pie azul." },
};

export const letterheadTemplates = LETTERHEAD_TEMPLATE_IDS.map((id) => ({
  id,
  ...templateDetails[id],
  previewUrl: `/letterheads/${id}.png`,
}));
