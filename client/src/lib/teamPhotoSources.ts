import type { SyntheticEvent } from "react";
import type { TeamMember } from "@shared/schema";
import { CONFIRMED_PARTNER_SLUGS } from "@shared/teamVisibility";

// La regla de quién aparece con nombre vive en shared/teamVisibility.ts (también la usa el servidor).
export { CONFIRMED_PARTNER_SLUGS, isOfCounselMember, isNamedOnTeamPage } from "@shared/teamVisibility";

// Variantes WebP de los retratos (q80, sin metadatos), generadas junto a los originales de
// attached_assets/team_photos. server/routes.ts sirve esa carpeta en /team_photos y el build
// estático la copia (en los dos casos, solo los retratos de quien el sitio nombra), así que cada
// variante vive al lado de su original. Los originales
// se conservan: son el src de respaldo si una variante no existe donde se sirven las fotos.

// Socios con <slug>-652.webp y <slug>-360.webp (el PNG pesa 0,4–0,6 MB). Los cuatro retratos se
// recortaron de nuevo (22-10-2026) con la misma escala de cabeza y los ojos a la misma altura: el
// cuadro mide 541 px (no se amplía más allá del original); el nombre "-652" se conserva porque lo
// esperan /team_photos (server/routes.ts) y el manifiesto de medios.
const PORTRAIT_WIDTH = 541;
const PORTRAIT_SLUGS = new Set([
  "mario-saucedo-montemayor",
  "enrique-santos-guzman",
  "enrique-santos-arce",
  "mario-saucedo-rodriguez",
]);

// Retratos con miniatura <slug>-128.webp (miniaturas cuadradas de 56 px de "Equipo relacionado"):
// solo quien el sitio nombra (J1). Los asociados no se nombran en ningún sitio público y sus
// slugs ya no viajan en el bundle; /team_photos tampoco sirve sus retratos. Un Of Counsel que se
// añada sin estar aquí usa su retrato original (getTeamPhotoThumb).
const THUMB_SLUGS: ReadonlySet<string> = CONFIRMED_PARTNER_SLUGS;

// Solo URLs ".../team_photos/<slug>.<png|jpg>" (con o sin base del sitio estático); cualquier
// otra ruta se usa tal cual.
const TEAM_PHOTO_URL = /^(.*\/team_photos\/)([a-z0-9-]+)\.(?:png|jpe?g)$/i;

function parseTeamPhotoUrl(url?: string | null) {
  const match = url ? TEAM_PHOTO_URL.exec(url) : null;
  return match ? { dir: match[1], slug: match[2].toLowerCase() } : null;
}

/** srcset WebP (360w y 541w) de un retrato de socio, o undefined si no hay variantes. */
export function getTeamPhotoSrcSet(url?: string | null): string | undefined {
  const parsed = parseTeamPhotoUrl(url);
  if (!parsed || !PORTRAIT_SLUGS.has(parsed.slug)) return undefined;
  return `${parsed.dir}${parsed.slug}-360.webp 360w, ${parsed.dir}${parsed.slug}-652.webp ${PORTRAIT_WIDTH}w`;
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
