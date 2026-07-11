import laborConflicts from "@assets/service_areas/area-1-conflictos-laborales.webp";
import laborAdministration from "@assets/service_areas/area-2-administracion-laboral.webp";
import laborDiagnostics from "@assets/service_areas/area-3-diagnostico-relaciones-laborales.webp";
import legalLaborAudit from "@assets/service_areas/area-5-auditoria-juridico-laboral.webp";

// Santos & Saucedo (2026) presents 4 areas of specialty — labor-rooted, plus
// corporate, immigration and litigation. Each maps to an optimized WebP; these
// reuse the existing labor-area photos as a stopgap until the presentation's
// per-area photos (documents/laptop, handshake, passport, gavel) are supplied.
export const PRACTICE_IMAGES: Record<string, string> = {
  "laboral-seguridad-social": laborConflicts,
  "corporativo-contractual": laborAdministration,
  "migratorio": laborDiagnostics,
  "litigio-contencioso": legalLaborAudit,
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
