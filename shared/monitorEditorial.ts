import type { News } from "./schema";
import bundled from "./cms-media-manifest.json";

/** Illustrative editorial images, not photographs of actual client matters. */
export const HOME_MONITOR_IMAGES: Record<string, string> = {
  "conflictos-individuales-juntas-conciliacion": "/editorial/monitor-conciliacion.webp",
  "revision-administracion-laboral-preventiva": "/editorial/monitor-prevencion.webp",
  "checklist-auditoria-juridico-laboral": "/editorial/monitor-auditoria.webp",
};

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
  if (configured && configured !== initialStorageCopy && configured !== SUPERSEDED_HOME_MONITOR_IMAGES[item.slug]) {
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
