import laborConflicts from "@assets/service_areas/area-1-conflictos-laborales.webp";
import laborAdministration from "@assets/service_areas/area-2-administracion-laboral.webp";
import laborDiagnostics from "@assets/service_areas/area-3-diagnostico-relaciones-laborales.webp";
import improvementPlans from "@assets/service_areas/area-4-planes-mejora.webp";
import legalLaborAudit from "@assets/service_areas/area-5-auditoria-juridico-laboral.webp";
import strategicTraining from "@assets/service_areas/area-6-planeacion-capacitacion.webp";

// Santos & Saucedo is a labor-law boutique with 6 practice areas, each with an
// optimized WebP. The inherited Von Wobeser full-service practice/industry
// images (p-*/i-*, ~58 MB of PNGs) were statically imported here and shipped in
// the bundle even though S&S never renders them (their slugs don't exist in the
// data, and the industry-groups page isn't routed). They were removed to keep
// the site fast; only the 6 labor WebP images remain.
export const PRACTICE_IMAGES: Record<string, string> = {
  "conflictos-individuales-colectivos": laborConflicts,
  "administracion-laboral": laborAdministration,
  "diagnostico-relaciones-laborales": laborDiagnostics,
  "planes-mejora": improvementPlans,
  "auditoria-juridico-laboral": legalLaborAudit,
  "planeacion-estrategica-capacitacion": strategicTraining,
};

// No static industry images: the industry-groups page is not part of the S&S
// labor site. Kept for API compatibility with getIndustryImage().
export const INDUSTRY_IMAGES: Record<string, string> = {};

const FALLBACK_IMAGE = laborConflicts;

export function getPracticeImage(slug: string, override?: string | null): string {
  return PRACTICE_IMAGES[slug] || (override && override.trim().length > 0 ? override : FALLBACK_IMAGE);
}

export function getIndustryImage(slug: string, override?: string | null): string {
  if (override && override.trim().length > 0) return override;
  return INDUSTRY_IMAGES[slug] || FALLBACK_IMAGE;
}
