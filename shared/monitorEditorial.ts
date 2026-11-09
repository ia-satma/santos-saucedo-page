import type { News } from "./schema";
import bundled from "./cms-media-manifest.json";

/** Fotos reales de la oficina para las tres notas iniciales del Monitor. Antes eran ilustraciones
    hechas con IA (monitor-*.webp) y en la junta del 6-11-2026 el cliente dijo que se ven «muy IA». */
export const HOME_MONITOR_IMAGES: Record<string, string> = {
  "conflictos-individuales-juntas-conciliacion": "/editorial/obra-mazo-1536.webp",
  "revision-administracion-laboral-preventiva": "/editorial/oficina-mesa-trabajo-1536.webp",
  "checklist-auditoria-juridico-laboral": "/editorial/biblioteca-1536.webp",
};

// Las ilustraciones retiradas, en cualquiera de sus copias (la del build, la de App Storage o la
// importada al panel): si una nota todavía la tiene, se cambia por su foto de la oficina.
const RETIRED_MONITOR_ART = /(^|\/|-)monitor-(conciliacion|prevencion|auditoria)\.webp$/;

// Only these initial illustrations are replaced; subsequent editor selections remain intact.
export const SUPERSEDED_HOME_MONITOR_IMAGES: Record<string, string> = {
  "conflictos-individuales-juntas-conciliacion": "/media/public/media/7479b8e67581a61b69d0de23-monitor-conciliacion.webp",
  "revision-administracion-laboral-preventiva": "/media/public/media/a9ab918e924e9ec44b595495-monitor-prevencion.webp",
  "checklist-auditoria-juridico-laboral": "/media/public/media/7452be85216837d058faefe7-monitor-auditoria.webp",
};

export function getHomeMonitorImage(item: Pick<News, "slug" | "imageUrl">): string | null {
  const configured = item.imageUrl?.trim();
  const source = HOME_MONITOR_IMAGES[item.slug];
  if (!source) return configured || null;
  const asset = bundled.find((entry) => entry.url === source);
  const initialStorageCopy = asset ? `/media/${asset.key}` : null;
  // Initial artwork ships in the build, so even an empty bucket needs no manual import.
  // A genuinely custom editor selection still wins; uploaded media remains persistent.
  if (configured && configured !== initialStorageCopy && configured !== SUPERSEDED_HOME_MONITOR_IMAGES[item.slug] && !RETIRED_MONITOR_ART.test(configured)) {
    return configured;
  }
  return source;
}

export function selectHomeMonitorItems(items: News[], limit = 3): News[] {
  const count = Number.isFinite(limit) ? Math.min(3, Math.max(0, Math.floor(limit))) : 3;
  const timestamp = (date: News["date"]) => date ? new Date(date).getTime() || 0 : 0;
  return items
    .filter((item) => item.published !== false)
    .sort((a, b) =>
      Number(b.featuredHome === true) - Number(a.featuredHome === true)
      || timestamp(b.date) - timestamp(a.date),
    )
    .slice(0, count);
}
