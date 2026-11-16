import type { CmsValue } from "@shared/cms";

export type PageVisibility = { enabled: boolean; blocks: Record<string, boolean> };

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
  return { enabled: record.enabled !== false, blocks };
}

export function blockVisible(layout: CmsValue | unknown, page: string, block: string): boolean {
  const state = pageVisibility(layout, page);
  return state.enabled && state.blocks[block] !== false;
}
