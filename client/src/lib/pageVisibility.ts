import type { CmsValue } from "@shared/cms";

export type PageVisibility = { enabled: boolean; blocks: Record<string, boolean> };

const blockAliases: Record<string, Record<string, string>> = {
  team: { carrusel: "socios", perfiles: "colaboradores" },
  about: { laminas: "laminaSiempreAdelante" },
};

export function withPreviewPageVisibility(layout: unknown, authorized: boolean): unknown {
  if (!authorized || !layout || typeof layout !== "object" || Array.isArray(layout)) return layout;
  const record = layout as Record<string, unknown>;
  if (!record.pages || typeof record.pages !== "object" || Array.isArray(record.pages)) return layout;
  return {
    ...record,
    pages: Object.fromEntries(Object.entries(record.pages).map(([page, value]) => [
      page,
      value && typeof value === "object" && !Array.isArray(value) ? { ...(value as Record<string, unknown>), enabled: true } : value,
    ])),
  };
}

export function pageVisibility(layout: unknown, page: string): PageVisibility {
  const pages = layout && typeof layout === "object" && !Array.isArray(layout)
    ? (layout as Record<string, unknown>).pages
    : undefined;
  const value = pages && typeof pages === "object" && !Array.isArray(pages)
    ? (pages as Record<string, unknown>)[page]
    : undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) return { enabled: true, blocks: {} };
  const record = value as Record<string, unknown>;
  const blocks = record.blocks && typeof record.blocks === "object" && !Array.isArray(record.blocks)
    ? Object.fromEntries(Object.entries(record.blocks).map(([key, enabled]) => [key, enabled !== false]))
    : {};
  const aliases = blockAliases[page] ?? {};
  for (const [legacy, canonical] of Object.entries(aliases)) {
    // Los layouts guardados antes de la migración contienen la clave antigua y reciben
    // las claves canónicas desde defaults. Un estado antiguo oculto conserva prioridad.
    if (blocks[legacy] === false) {
      blocks[canonical] = false;
    } else if (!Object.prototype.hasOwnProperty.call(blocks, canonical) && Object.prototype.hasOwnProperty.call(blocks, legacy)) {
      blocks[canonical] = blocks[legacy];
    }
  }
  return { enabled: record.enabled !== false, blocks };
}

export function blockVisible(layout: CmsValue | unknown, page: string, block: string): boolean {
  const state = pageVisibility(layout, page);
  return state.enabled && state.blocks[block] !== false;
}
