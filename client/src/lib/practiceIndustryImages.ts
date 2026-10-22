// These same public URLs are stored on each practice record so the persistent
// media importer can move them to app storage without changing the catalog.
export const PRACTICE_IMAGES: Record<string, string> = {
  "laboral-seguridad-social": "/editorial/practice-laboral.webp",
  "corporativo-contractual": "/editorial/practice-corporativo.webp",
  "migratorio": "/editorial/practice-migratorio.webp",
  "litigio-contencioso": "/editorial/practice-litigio.webp",
};

// No static industry images: the industry-groups page is not part of the S&S
// labor site. Kept for API compatibility with getIndustryImage().
export const INDUSTRY_IMAGES: Record<string, string> = {};

const FALLBACK_IMAGE = PRACTICE_IMAGES["laboral-seguridad-social"];

export function getPracticeImage(slug: string, override?: string | null): string {
  return override && override.trim().length > 0 ? override : (PRACTICE_IMAGES[slug] || FALLBACK_IMAGE);
}

export function getIndustryImage(slug: string, override?: string | null): string {
  if (override && override.trim().length > 0) return override;
  return INDUSTRY_IMAGES[slug] || FALLBACK_IMAGE;
}
