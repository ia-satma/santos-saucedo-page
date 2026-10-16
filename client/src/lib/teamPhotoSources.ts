import type { SyntheticEvent } from "react";
import type { TeamMember } from "@shared/schema";

// La regla de quién aparece con nombre vive en shared/teamVisibility.ts (también la usa el servidor).
export { CONFIRMED_PARTNER_SLUGS, isOfCounselMember, isNamedOnTeamPage } from "@shared/teamVisibility";

// Variantes WebP de los retratos (q80, sin metadatos), generadas junto a los originales de
// attached_assets/team_photos. server/routes.ts sirve esa carpeta en /team_photos y el build
// estático la copia entera, así que cada variante vive al lado de su original. Los originales
// se conservan: son el src de respaldo si una variante no existe donde se sirven las fotos.

// Socios con <slug>-652.webp y <slug>-360.webp (los PNG de 652 px pesan 0,5–1 MB)
const PORTRAIT_SLUGS = new Set([
  "mario-saucedo-montemayor",
  "enrique-santos-guzman",
  "enrique-santos-arce",
  "mario-saucedo-rodriguez",
]);

// Retratos con miniatura <slug>-128.webp (miniaturas cuadradas de 56 px de "Equipo relacionado")
const THUMB_SLUGS = new Set([
  "ancella-reynoso-pamanes",
  "carlos-a-cerda-ramos",
  "carlos-f-rodriguez-mirelles",
  "david-martinez-saucedo",
  "diana-g-lopez-rodriguez",
  "eduardo-castillo-cervantes",
  "enrique-santos-arce",
  "enrique-santos-guzman",
  "erick-estrada-marquez",
  "gabriela-l-garcia-vasquez",
  "huan-jose-trevino-cavazos",
  "jaime-herrera-de-herrera",
  "jorge-a-garza-martinez",
  "jorge-a-melchor-ortiz",
  "jose-maria-urena-flores",
  "lillia-cardoza-diaz-de-leon",
  "luis-a-saucedo-rodriguez",
  "maria-elena-mata-martinez",
  "mario-saucedo-montemayor",
  "mario-saucedo-rodriguez",
  "misden-castillo-chavez",
  "orlando-cantu-garza",
  "pedro-a-sanvicente-romero",
  "ruben-a-frias-garcia",
  "rubi-quintanilla-martinez",
]);

// Solo URLs ".../team_photos/<slug>.<png|jpg>" (con o sin base del sitio estático); cualquier
// otra ruta se usa tal cual.
const TEAM_PHOTO_URL = /^(.*\/team_photos\/)([a-z0-9-]+)\.(?:png|jpe?g)$/i;

function parseTeamPhotoUrl(url?: string | null) {
  const match = url ? TEAM_PHOTO_URL.exec(url) : null;
  return match ? { dir: match[1], slug: match[2].toLowerCase() } : null;
}

/** srcset WebP (360w y 652w) de un retrato de socio, o undefined si no hay variantes. */
export function getTeamPhotoSrcSet(url?: string | null): string | undefined {
  const parsed = parseTeamPhotoUrl(url);
  if (!parsed || !PORTRAIT_SLUGS.has(parsed.slug)) return undefined;
  return `${parsed.dir}${parsed.slug}-360.webp 360w, ${parsed.dir}${parsed.slug}-652.webp 652w`;
}

/** Miniatura WebP de 128 px para avatares; si no hay, la URL original. */
export function getTeamPhotoThumb(url?: string | null): string | undefined {
  const parsed = parseTeamPhotoUrl(url);
  if (!parsed || !THUMB_SLUGS.has(parsed.slug)) return url || undefined;
  return `${parsed.dir}${parsed.slug}-128.webp`;
}

/**
 * onError de un <img> con srcset: la primera vez quita srcset y sizes, y el navegador
 * carga el src original. Devuelve false cuando ya no queda respaldo (falló el original).
 */
export function fallbackToOriginalSrc(event: SyntheticEvent<HTMLImageElement>): boolean {
  const img = event.currentTarget;
  if (!img.hasAttribute("srcset")) return false;
  img.removeAttribute("srcset");
  img.removeAttribute("sizes");
  return true;
}

// Prioridad de descarga alta para el retrato principal. React 18 no conoce la prop
// fetchPriority (avisa en desarrollo); el atributo HTML en minúsculas pasa tal cual.
export const highFetchPriority = { fetchpriority: "high" } as Record<string, string>;
