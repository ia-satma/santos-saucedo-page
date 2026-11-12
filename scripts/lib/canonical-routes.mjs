const spanishRoutes = new Map([
  ["/about", "/nuestra-firma"],
  ["/practice-groups", "/practicas"],
  ["/industries", "/industrias"],
  ["/team", "/socios"],
  ["/news", "/monitor-laboral"],
  ["/careers", "/carreras"],
  ["/careers/interns", "/pasantias"],
  ["/contact", "/contacto"],
  ["/offices", "/oficinas"],
  ["/privacy-policy", "/aviso-de-privacidad"],
  ["/terms", "/terminos"],
  ["/newsletter", "/boletin"],
]);

function mapPrefix(route, map) {
  const normalized = route === "/" ? "/" : `/${String(route).replace(/^\/+|\/+$/g, "")}`;
  let match = "";
  for (const key of map.keys()) {
    if (normalized === key || normalized.startsWith(`${key}/`)) {
      if (key.length > match.length) match = key;
    }
  }
  return match ? map.get(match) + normalized.slice(match.length) : normalized;
}

export function localizedPublicPath(language, internalRoute) {
  const route = language === "es" ? mapPrefix(internalRoute, spanishRoutes) : internalRoute;
  return `/${language}${route === "/" ? "/" : route}`;
}

export function spanishPublicPath(internalRoute) {
  return localizedPublicPath("es", internalRoute);
}

export const LEGACY_SPANISH_ALIASES = Object.fromEntries(spanishRoutes);
