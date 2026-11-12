import type { LanguageCode } from "./constants";

/** Stable internal route IDs used by CMS values and APIs. */
export const PUBLIC_ROUTE_MAP = {
  "/about": "/nuestra-firma",
  "/practice-groups": "/practicas",
  "/industries": "/industrias",
  "/team": "/socios",
  "/news": "/monitor-laboral",
  "/careers": "/carreras",
  "/careers/interns": "/pasantias",
  "/contact": "/contacto",
  "/offices": "/oficinas",
  "/privacy-policy": "/aviso-de-privacidad",
  "/terms": "/terminos",
  "/testimonios": "/testimonios",
  "/newsletter": "/boletin",
} as const;

const INTERNAL_TO_SPANISH = new Map<string, string>(Object.entries(PUBLIC_ROUTE_MAP));
const SPANISH_TO_INTERNAL = new Map<string, string>(
  Object.entries(PUBLIC_ROUTE_MAP).map(([internal, localized]) => [localized, internal]),
);

function mapPrefix(route: string, map: Map<string, string>): string {
  const normalized = route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}`;
  let best = "";
  for (const key of Array.from(map.keys())) {
    if (normalized === key || normalized.startsWith(`${key}/`)) {
      if (key.length > best.length) best = key;
    }
  }
  if (!best) return normalized;
  return map.get(best)! + normalized.slice(best.length);
}

/** Convert a stable CMS route to its Spanish public route. */
export function toSpanishRoute(route: string): string {
  return mapPrefix(route, INTERNAL_TO_SPANISH);
}

/** Convert a Spanish public route back to the stable internal route. */
export function fromSpanishRoute(route: string): string {
  return mapPrefix(route, SPANISH_TO_INTERNAL);
}

/** Localized public route. Spanish uses editorial slugs. Other languages retain stable slugs. */
export function publicRoute(language: LanguageCode, route: string): string {
  const internal = fromSpanishRoute(route);
  return language === "es" ? toSpanishRoute(internal) : internal;
}

export function publicRouteAliases(): ReadonlyArray<{ internal: string; spanish: string }> {
  return Object.entries(PUBLIC_ROUTE_MAP).map(([internal, spanish]) => ({ internal, spanish }));
}
