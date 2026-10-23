import type { News } from "./schema";
import bundled from "./cms-media-manifest.json";

/** Illustrative editorial images, not photographs of actual client matters. */
export const HOME_MONITOR_IMAGES: Record<string, string> = {
  "conflictos-individuales-juntas-conciliacion": "/editorial/monitor-conciliacion.webp",
  "revision-administracion-laboral-preventiva": "/editorial/monitor-prevencion.webp",
  "checklist-auditoria-juridico-laboral": "/editorial/monitor-auditoria.webp",
};

export function getHomeMonitorImage(item: Pick<News, "slug" | "imageUrl">): string | null {
  // An editor's selection always wins over the initial editorial series.
  const configured = item.imageUrl?.trim();
  if (configured) return configured;
  const source = HOME_MONITOR_IMAGES[item.slug];
  if (!source) return null;
  const asset = bundled.find((entry) => entry.url === source);
  return asset ? `/media/${asset.key}` : source;
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
