import type { LanguageCode } from "@shared/constants";

export type TeamMosaicItem = {
  id: string;
  mediaPath: string;
  enabled: boolean;
  order: number;
  altByLanguage: Partial<Record<LanguageCode, string>>;
  focalPoint?: { x: number; y: number };
};

function numberInRange(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : fallback;
}

export function normalizeTeamMosaic(value: unknown): TeamMosaicItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index): TeamMosaicItem | null => {
      if (typeof entry === "string") {
        return { id: `team-${index + 1}`, mediaPath: entry, enabled: true, order: index, altByLanguage: {} };
      }
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
      const item = entry as Record<string, unknown>;
      const mediaPath = typeof item.mediaPath === "string"
        ? item.mediaPath
        : typeof item.url === "string" ? item.url : typeof item.src === "string" ? item.src : "";
      if (!mediaPath) return null;
      const altSource = item.altByLanguage && typeof item.altByLanguage === "object" && !Array.isArray(item.altByLanguage)
        ? item.altByLanguage as Record<string, unknown>
        : {};
      const altByLanguage: Partial<Record<LanguageCode, string>> = {};
      for (const [language, alt] of Object.entries(altSource)) {
        if (typeof alt === "string") altByLanguage[language as LanguageCode] = alt;
      }
      const focal = item.focalPoint && typeof item.focalPoint === "object" && !Array.isArray(item.focalPoint)
        ? item.focalPoint as Record<string, unknown>
        : undefined;
      return {
        id: typeof item.id === "string" && item.id ? item.id : `team-${index + 1}`,
        mediaPath,
        enabled: item.enabled !== false,
        order: numberInRange(item.order, index),
        altByLanguage,
        ...(focal ? { focalPoint: { x: numberInRange(focal.x, 50), y: numberInRange(focal.y, 50) } } : {}),
      };
    })
    .filter((item): item is TeamMosaicItem => Boolean(item))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
}

export function teamMosaicForPublic(value: unknown): TeamMosaicItem[] {
  return normalizeTeamMosaic(value).filter((item) => item.enabled);
}
