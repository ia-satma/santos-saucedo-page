import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/constants";
import { publicRoute } from "@shared/publicRoutes";

const LANGUAGE_CODES = new Set<string>(SUPPORTED_LANGUAGES.map(({ code }) => code));

function cleanBase(value: string): string {
  const base = value.replace(/\/+$/, "");
  return base === "/" ? "" : base;
}

/** Base path used by the static Pages build, empty for the live app. */
export const PUBLIC_BASE_PATH = cleanBase(import.meta.env.BASE_URL || "/");

export function isLanguageCode(value: string | undefined | null): value is LanguageCode {
  return !!value && LANGUAGE_CODES.has(value);
}

/** Remove the deployment base path without touching the route itself. */
export function stripPublicBase(pathname: string): string {
  const path = pathname || "/";
  if (PUBLIC_BASE_PATH && (path === PUBLIC_BASE_PATH || path.startsWith(PUBLIC_BASE_PATH + "/"))) {
    return path.slice(PUBLIC_BASE_PATH.length) || "/";
  }
  return path.startsWith("/") ? path : "/" + path;
}

export function getLanguageFromPath(pathname: string): LanguageCode | null {
  const route = stripPublicBase(pathname);
  const code = route.split("/")[1];
  return isLanguageCode(code) ? code : null;
}

/** Remove a language segment from a route. */
export function stripLanguagePrefix(pathname: string): string {
  const route = stripPublicBase(pathname);
  const parts = route.split("/");
  return isLanguageCode(parts[1]) ? ("/" + parts.slice(2).join("/")).replace(/\/$/, "") || "/" : route;
}

function splitSuffix(pathname: string): { path: string; suffix: string } {
  const match = /^([^?#]*)([?#].*)?$/.exec(pathname);
  return { path: match?.[1] || "/", suffix: match?.[2] || "" };
}

/** Build a public URL with a language prefix while preserving query and hash. */
export function localizedPath(language: LanguageCode, pathname: string): string {
  const { path, suffix } = splitSuffix(pathname || "/");
  const route = stripLanguagePrefix(path);
  const localizedRoute = publicRoute(language, route);
  const normalizedRoute = localizedRoute === "/" ? "" : localizedRoute.replace(/^\/+/, "");
  const output = PUBLIC_BASE_PATH + "/" + language + (normalizedRoute ? "/" + normalizedRoute : "/");
  return output.replace(/\/{2,}/g, "/") + suffix;
}

/** Prefix an internal link for the active language. Admin and API paths stay unlocalized. */
export function localizeHref(href: string, language: LanguageCode): string {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return href;
  if (/^(?:[a-z]+:)?\/\//i.test(href)) return href;
  const { path, suffix } = splitSuffix(href);
  const route = stripLanguagePrefix(path);
  if (/^\/(?:admin|api|assets|static-api|team_photos|v3|favicon|robots|sitemap)/i.test(route)) return href;
  return localizedPath(language, route) + suffix;
}

/** Route-only value used by SEO metadata and tests. */
export function localizedRoute(language: LanguageCode, route: string): string {
  const value = localizedPath(language, route);
  return PUBLIC_BASE_PATH && value.startsWith(PUBLIC_BASE_PATH) ? value.slice(PUBLIC_BASE_PATH.length) || "/" : value;
}

