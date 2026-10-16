import type { News } from "./schema";

// Notas del Monitor Laboral en el sitio público (J2). Un solo criterio para el servidor
// (server/routes.ts: /api/news, /api/search, mapa del sitio…) y el build estático
// (script/generate-static-api.ts). El panel /admin lee las notas completas por sus rutas
// autenticadas (/api/admin/news…).

type PublicationFields = Pick<News, "published" | "publishAt">;

/** Publicada y con su fecha de publicación (si la tiene) ya cumplida. */
export function isPublicNews(item: PublicationFields, now: Date = new Date()): boolean {
  if (item.published !== true) return false;
  if (!item.publishAt) return true;
  const publishAt = new Date(item.publishAt);
  return !Number.isNaN(publishAt.getTime()) && publishAt <= now;
}

// Lo que leen las páginas públicas (Monitor, nota, portada, buscador, ficha de socio). Lista de
// campos permitidos, no de campos quitados: un campo nuevo del CMS no sale hasta añadirlo aquí.
// Fuera quedan los del proceso interno (processingStatus, lastError, failedStep,
// lastProcessedAt, councilVerdict), la programación (publishAt) y authorId.
const PUBLIC_NEWS_FIELDS = [
  "id",
  "slug",
  "title",
  "titleEs",
  "excerpt",
  "excerptEs",
  "content",
  "contentEs",
  "imageUrl",
  "documentUrl",
  "documentUrlEs",
  "sourceUrl",
  "tags",
  "featuredHome",
  "date",
  "category",
  "categoryEs",
  // Siempre true aquí; las listas del cliente lo comprueban (item.published !== false)
  "published",
] as const satisfies readonly (keyof News)[];

export type PublicNews = Pick<News, (typeof PUBLIC_NEWS_FIELDS)[number]>;

/** DTO público de una nota: solo los campos de PUBLIC_NEWS_FIELDS. */
export function toPublicNews(item: Partial<News>): PublicNews {
  const out: Record<string, unknown> = {};
  for (const key of PUBLIC_NEWS_FIELDS) {
    out[key] = item[key] ?? null;
  }
  return out as PublicNews;
}
