export const NEWS_SLUG_MAX_LENGTH = 160;

export const NEWS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type NewsSlugNormalizationSource =
  | "canonical"
  | "text"
  | "relative-route"
  | "site-url";

export type NewsSlugInvalidReason =
  | "EMPTY"
  | "EXTERNAL_URL"
  | "INVALID_URL"
  | "UNSAFE_PATH";

export type NormalizedNewsSlug = {
  slug: string;
  changed: boolean;
  source: NewsSlugNormalizationSource;
};

export class NewsSlugNormalizationError extends Error {
  readonly code = "NEWS_SLUG_INVALID" as const;

  constructor(readonly reason: NewsSlugInvalidReason) {
    super("Invalid news slug");
    this.name = "NewsSlugNormalizationError";
  }
}

const OWN_PUBLIC_HOSTS = new Set(["santossaucedo.com", "www.santossaucedo.com"]);
const ROUTE_PATTERN = /^\/?(?:news|noticias)\/([^/]+)\/?$/;
const URL_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i;
const ENCODED_PATH_SEPARATOR_PATTERN = /%(?:2f|5c)/i;

/**
 * Validates the exact value stored in `news.slug`. This intentionally does not
 * trim or normalize: administrative APIs must reject, rather than reinterpret,
 * a non-canonical value.
 */
export function isCanonicalNewsSlug(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= NEWS_SLUG_MAX_LENGTH
    && NEWS_SLUG_PATTERN.test(value);
}

/**
 * Existing records may contain repeated or trailing hyphens created by the
 * legacy CMS. They still resolve as one safe Express path segment and remain
 * editable, but new or changed slugs must use the stricter canonical format.
 */
export function isRouteSafeLegacyNewsSlug(value: unknown): value is string {
  return typeof value === "string"
    && /^(?=.*[a-z0-9])[a-z0-9-]+$/.test(value);
}

export function assertCanonicalNewsSlug(value: unknown): asserts value is string {
  if (!isCanonicalNewsSlug(value)) {
    throw new NewsSlugNormalizationError(typeof value === "string" && value.length === 0 ? "EMPTY" : "UNSAFE_PATH");
  }
}

function invalid(reason: NewsSlugInvalidReason): never {
  throw new NewsSlugNormalizationError(reason);
}

function containsEncodedPathSeparator(value: string): boolean {
  let candidate = value;
  for (let pass = 0; pass < 8; pass += 1) {
    if (ENCODED_PATH_SEPARATOR_PATTERN.test(candidate)) return true;
    let decoded: string;
    try {
      decoded = decodeURIComponent(candidate);
    } catch {
      return false;
    }
    if (decoded === candidate) return false;
    candidate = decoded;
  }
  return ENCODED_PATH_SEPARATOR_PATTERN.test(candidate);
}

function hasTraversalSegment(pathname: string): boolean {
  let candidate = pathname;
  for (let pass = 0; pass < 8; pass += 1) {
    if (candidate.split("/").some((segment) => segment === "." || segment === "..")) return true;
    let decoded: string;
    try {
      decoded = decodeURIComponent(candidate);
    } catch {
      return false;
    }
    if (decoded === candidate) return false;
    candidate = decoded;
  }
  return candidate.split("/").some((segment) => segment === "." || segment === "..");
}

function decodeRouteSegment(segment: string): string {
  if (containsEncodedPathSeparator(segment)) invalid("UNSAFE_PATH");
  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return invalid("UNSAFE_PATH");
  }
  if (!decoded || decoded.includes("/") || decoded.includes("\\") || decoded === "." || decoded === "..") {
    invalid("UNSAFE_PATH");
  }
  return decoded;
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, NEWS_SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");

  if (!slug) invalid("EMPTY");
  if (!isCanonicalNewsSlug(slug)) invalid("UNSAFE_PATH");
  return slug;
}

function normalizeCandidate(
  candidate: string,
  rawInput: string,
  source: NewsSlugNormalizationSource,
): NormalizedNewsSlug {
  const slug = isCanonicalNewsSlug(candidate) ? candidate : slugify(candidate);
  return {
    slug,
    changed: slug !== rawInput,
    source: isCanonicalNewsSlug(rawInput) ? "canonical" : source,
  };
}

function extractRelativeRoute(raw: string): string | null {
  const routeLike = /^\/?(?:news|noticias)\//.test(raw);
  if (!routeLike) return null;
  if (raw.includes("?") || raw.includes("#") || containsEncodedPathSeparator(raw) || hasTraversalSegment(raw)) {
    invalid("UNSAFE_PATH");
  }
  const match = ROUTE_PATTERN.exec(raw);
  if (!match) invalid("UNSAFE_PATH");
  return decodeRouteSegment(match[1]);
}

function extractOwnSiteUrl(raw: string): string | null {
  if (!URL_SCHEME_PATTERN.test(raw)) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return invalid("INVALID_URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") invalid("INVALID_URL");
  if (!OWN_PUBLIC_HOSTS.has(parsed.hostname) || parsed.port) invalid("EXTERNAL_URL");
  if (parsed.username || parsed.password) invalid("INVALID_URL");
  if (containsEncodedPathSeparator(parsed.pathname) || hasTraversalSegment(parsed.pathname)) invalid("UNSAFE_PATH");

  const match = /^\/(?:news|noticias)\/([^/]+)\/?$/.exec(parsed.pathname);
  if (!match) invalid("UNSAFE_PATH");
  return decodeRouteSegment(match[1]);
}

/**
 * Converts a title, a canonical slug, or one of the explicitly supported
 * Santos & Saucedo news URLs into a single safe slug segment. It never performs I/O
 * and never mutates persisted data.
 */
export function normalizeNewsSlugInput(input: string): NormalizedNewsSlug {
  const raw = input.trim();
  if (!raw) invalid("EMPTY");
  if (raw.includes("\\")) invalid("UNSAFE_PATH");

  const ownUrlSegment = extractOwnSiteUrl(raw);
  if (ownUrlSegment !== null) {
    return normalizeCandidate(ownUrlSegment, input, "site-url");
  }

  if (raw.startsWith("//") || URL_SCHEME_PATTERN.test(raw)) invalid("INVALID_URL");

  const relativeRouteSegment = extractRelativeRoute(raw);
  if (relativeRouteSegment !== null) {
    return normalizeCandidate(relativeRouteSegment, input, "relative-route");
  }

  if (raw.includes("/")) invalid("UNSAFE_PATH");
  return normalizeCandidate(raw, input, isCanonicalNewsSlug(raw) ? "canonical" : "text");
}

/**
 * Appends a deterministic suffix without ever exceeding the persisted slug
 * limit. Automated creators use this instead of concatenating after
 * normalization, which could otherwise produce an invalid 161+ character
 * slug at the exact moment a collision is resolved.
 */
export function appendCanonicalNewsSlugSuffix(baseInput: string, suffixInput: string): string {
  const base = normalizeNewsSlugInput(baseInput).slug;
  const suffix = normalizeNewsSlugInput(suffixInput).slug;
  const availableBaseLength = NEWS_SLUG_MAX_LENGTH - suffix.length - 1;
  if (availableBaseLength < 1) invalid("UNSAFE_PATH");

  const truncatedBase = base.slice(0, availableBaseLength).replace(/-+$/g, "");
  if (!truncatedBase) invalid("UNSAFE_PATH");

  const candidate = `${truncatedBase}-${suffix}`;
  assertCanonicalNewsSlug(candidate);
  return candidate;
}
