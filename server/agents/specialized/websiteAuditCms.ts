import { cmsDefaults, cmsSections, isCmsSection, mergeCms, validateCmsValue, type CmsSection } from "@shared/cms";

export type CmsAuditFinding = {
  category: "cms" | "media" | "routes";
  issueType: string;
  severity: "critical" | "high" | "medium" | "low";
  details: Record<string, unknown>;
  recommendation: string;
  url?: string;
};

export type CmsAuditSnapshot = {
  sections: Record<string, unknown>;
  overrides?: Record<string, unknown>;
  localizedKeys?: string[];
};

/** Every public page points to the CMS sections that render its visible content. */
export const CMS_ROUTE_SECTIONS: Readonly<Record<string, readonly CmsSection[]>> = {
  "/": ["home", "layout", "media", "navigation", "chrome", "links", "theme", "heroLabels", "contactData", "forms"],
  "/about": ["about", "v3", "seo"],
  "/practice-groups": ["practices", "practice-services", "practice-detail", "practice-names", "practice-short-names", "seo", "media"],
  "/industries": ["industries", "industry-detail", "seo", "media"],
  "/team": ["team", "profile", "seo", "media"],
  "/news": ["news-intro", "monitor-ui", "monitor-subscribe", "news-detail", "seo", "media"],
  "/contact": ["contact", "contactData", "contact-consent", "contact-feedback", "forms", "privacy-contact", "seo"],
  "/careers": ["careers", "forms", "contactData", "seo"],
  "/careers/interns": ["interns", "forms", "contactData", "seo"],
  "/offices": ["officeLabels", "offices", "contactData", "seo", "media"],
  "/privacy-policy": ["privacy", "privacy-contact", "seo"],
  "/terms": ["terms", "terms-contact", "seo"],
  "/newsletter": ["newsletter", "forms", "contactData", "seo"],
  "/testimonios": ["testimonials", "seo"],
};

const REQUIRED_SECTIONS = new Set<CmsSection>([
  "home", "about", "practices", "industries", "team", "contact", "privacy", "terms",
  "navigation", "forms", "media", "v3",
]);

function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (value && typeof value === "object") return Object.values(value).some(hasMeaningfulValue);
  return false;
}

function sectionFromLocalizedKey(key: string): string | null {
  const match = /^localized\.([^.]+)\.(?:[a-z]{2})$/i.exec(key);
  return match?.[1] || null;
}

export function auditCmsSnapshot(snapshot: CmsAuditSnapshot): CmsAuditFinding[] {
  const findings: CmsAuditFinding[] = [];
  const declared = new Set<string>(cmsSections.map((section) => section.key));
  const sections = snapshot.sections;

  for (const [section, override] of Object.entries(snapshot.overrides || {})) {
    if (!declared.has(section)) {
      findings.push({
        category: "cms",
        issueType: "orphan_cms_section",
        severity: "low",
        details: { section },
        recommendation: `Elimina o migra la sección editorial desconocida "${section}".`,
      });
      continue;
    }
    if (!isCmsSection(section)) continue;
    const errors = validateCmsValue(section, mergeCms(cmsDefaults[section], override));
    if (errors.length) {
      findings.push({
        category: "cms",
        issueType: "invalid_cms_section",
        severity: "high",
        details: { section, errors: errors.slice(0, 10) },
        recommendation: `Corrige la estructura de "${section}" desde el editor del CMS antes de publicar.`,
        url: cmsSections.find((item) => item.key === section)?.path,
      });
    }
  }

  for (const [route, required] of Object.entries(CMS_ROUTE_SECTIONS)) {
    for (const section of required) {
      if (!declared.has(section)) {
        findings.push({
          category: "cms",
          issueType: "frontend_section_without_cms_definition",
          severity: "high",
          details: { route, section },
          recommendation: `Añade la sección "${section}" al catálogo del CMS o actualiza el mapeo de ${route}.`,
          url: route,
        });
      }
    }
  }

  for (const section of Array.from(REQUIRED_SECTIONS)) {
    if (!hasMeaningfulValue(sections[section])) {
      findings.push({
        category: "cms",
        issueType: "empty_cms_section",
        severity: "high",
        details: { section },
        recommendation: `Completa la sección "${section}" en el CMS antes de publicar la página.`,
        url: cmsSections.find((item) => item.key === section)?.path,
      });
    }
  }

  for (const key of snapshot.localizedKeys || []) {
    const section = sectionFromLocalizedKey(key);
    if (section && !declared.has(section)) {
      findings.push({
        category: "cms",
        issueType: "orphan_localized_section",
        severity: "low",
        details: { key },
        recommendation: `Elimina la traducción localizada de "${section}" porque no existe una sección CMS publicada.`,
      });
    }
  }

  return findings;
}

export type TestimonialAuditRecord = {
  id: string;
  status?: string | null;
  published?: boolean | null;
  origin?: string | null;
  consentAt?: Date | string | null;
  approvedBy?: string | null;
  approvedAt?: Date | string | null;
  quote?: string | null;
  authorName?: string | null;
};

export function auditTestimonials(records: readonly TestimonialAuditRecord[]): CmsAuditFinding[] {
  const findings: CmsAuditFinding[] = [];
  for (const record of records) {
    const status = String(record.status || "pending");
    if (!["captured", "pending", "approved", "rejected"].includes(status)) {
      findings.push({
        category: "cms",
        issueType: "testimonial_invalid_status",
        severity: "high",
        details: { testimonialId: record.id, status },
        recommendation: "Mueve el testimonio a capturado, pendiente, aprobado o rechazado desde el panel.",
        url: "/testimonios",
      });
    }
    if (record.published === true && (status !== "approved" || !record.approvedAt || !record.approvedBy)) {
      findings.push({
        category: "cms",
        issueType: "testimonial_published_without_approval",
        severity: "critical",
        details: { testimonialId: record.id, status, approvedAt: record.approvedAt || null, approvedBy: record.approvedBy || null },
        recommendation: "Oculta el testimonio y exige aprobación humana antes de volver a publicarlo.",
        url: "/testimonios",
      });
    }
    if (status === "approved" && (!record.approvedAt || !record.approvedBy)) {
      findings.push({
        category: "cms",
        issueType: "testimonial_missing_approval_provenance",
        severity: "high",
        details: { testimonialId: record.id },
        recommendation: "Completa la identidad y fecha de aprobación en el panel.",
        url: "/testimonios",
      });
    }
    if ((record.origin === "invite" || record.origin === "public_form") && !record.consentAt) {
      findings.push({
        category: "cms",
        issueType: "testimonial_missing_consent",
        severity: "high",
        details: { testimonialId: record.id, origin: record.origin },
        recommendation: "Conserva la constancia de consentimiento antes de revisar o publicar el testimonio.",
        url: "/testimonios",
      });
    }
    if (!String(record.quote || "").trim() || !String(record.authorName || "").trim()) {
      findings.push({
        category: "cms",
        issueType: "testimonial_incomplete",
        severity: "medium",
        details: { testimonialId: record.id },
        recommendation: "Completa el texto y el nombre de la persona antes de aprobarlo.",
        url: "/testimonios",
      });
    }
  }
  return findings;
}

export type MediaReference = { url: string; source: string; kind?: string };

const MEDIA_PATH = /^\/(?:editorial|video|v3|media|uploads|generated-images|generated-audio|generated-presentations|images|partner_photos|associate_photos|of_counsel_photos|counsel_photos)\//i;
const MEDIA_KEY = /(?:image|video|poster|logo|favicon|photo|media|src|path)$/i;

export function collectCmsMediaReferences(value: unknown, source = "cms", key = ""): MediaReference[] {
  if (typeof value === "string") {
    const clean = value.split(/[?#]/, 1)[0];
    const mediaContext = /(?:media|photo|photos|hero|gallery|image|video|logo|favicon)/i.test(source);
    if ((MEDIA_KEY.test(key) || MEDIA_PATH.test(clean) || (mediaContext && /^https:\/\//i.test(clean))) && clean) {
      return [{ url: clean, source, kind: key || undefined }];
    }
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectCmsMediaReferences(item, `${source}[${index}]`, key));
  }
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([childKey, childValue]) =>
    collectCmsMediaReferences(childValue, `${source}.${childKey}`, childKey),
  );
}

export function auditMediaReferences(
  references: readonly MediaReference[],
  isAvailable: (url: string) => Promise<boolean>,
): Promise<CmsAuditFinding[]> {
  const unique = new Map<string, MediaReference>();
  for (const reference of references) unique.set(reference.url, reference);
  return Promise.all(Array.from(unique.values()).map(async (reference) => {
    if (await isAvailable(reference.url)) return null;
    const isVideo = /video|\.mp4$|\.webm$|\.mov$|\.ogv$/i.test(`${reference.kind || ""} ${reference.url}`);
    return {
      category: "media" as const,
      issueType: "missing_media",
      severity: isVideo ? "high" as const : "medium" as const,
      details: { url: reference.url, source: reference.source, kind: reference.kind || null },
      recommendation: `Verifica que ${reference.url} exista en App Storage o sustituye el archivo desde el CMS.`,
      url: reference.url,
    };
  })).then((items) => items.filter(Boolean) as CmsAuditFinding[]);
}

const STATIC_ROUTES = new Set([
  "/", "/about", "/industries", "/practice-groups", "/team", "/news", "/contact", "/careers",
  "/careers/interns", "/privacy-policy", "/terms", "/offices", "/testimonios", "/testimonios/escribir",
  "/newsletter", "/newsletter/unsubscribe",
]);
const LEGACY_ROUTES = new Set(["/industry-groups", "/experience", "/articles", "/events", "/testimonials"]);
const LOCALES = new Set(["es", "en", "de", "zh", "ko", "ja", "ar", "ru", "fr", "it"]);

function routeExists(pathname: string): boolean {
  if (STATIC_ROUTES.has(pathname) || LEGACY_ROUTES.has(pathname)) return true;
  return /^\/(?:practice-groups|team|news)\/[^/]+$/.test(pathname);
}

export type RouteReference = { href: string; source: string };

export function collectCmsRouteReferences(value: unknown, source = "cms", key = ""): RouteReference[] {
  if (typeof value === "string") {
    if (value.startsWith("/") && !value.startsWith("//") && (key === "href" || key === "path" || key === "route" || key === "url" || source.includes("navigation") || source.includes("links"))) {
      return [{ href: value, source }];
    }
    return [];
  }
  if (Array.isArray(value)) return value.flatMap((item, index) => collectCmsRouteReferences(item, `${source}[${index}]`, key));
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([childKey, childValue]) => collectCmsRouteReferences(childValue, `${source}.${childKey}`, childKey));
}

export function auditCanonicalRoutes(references: readonly RouteReference[]): CmsAuditFinding[] {
  const findings: CmsAuditFinding[] = [];
  const seen = new Set<string>();
  for (const reference of references) {
    const raw = reference.href;
    if (seen.has(`${reference.source}:${raw}`)) continue;
    seen.add(`${reference.source}:${raw}`);
    const [withoutHash] = raw.split("#", 1);
    const [pathname] = withoutHash.split("?", 1);
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] && LOCALES.has(segments[0])) {
      findings.push({ category: "routes", issueType: "locale_embedded_in_cms_route", severity: "medium", details: { href: raw, source: reference.source }, recommendation: "Guarda la ruta sin prefijo de idioma. El router añade el idioma seleccionado.", url: raw });
      continue;
    }
    if (pathname !== "/" && pathname.endsWith("/")) {
      findings.push({ category: "routes", issueType: "non_canonical_trailing_slash", severity: "low", details: { href: raw, source: reference.source }, recommendation: "Usa la ruta canónica sin barra final.", url: raw });
    }
    if (LEGACY_ROUTES.has(pathname)) {
      findings.push({ category: "routes", issueType: "legacy_redirect_route", severity: "medium", details: { href: raw, source: reference.source }, recommendation: "Sustituye este enlace por la ruta canónica vigente.", url: raw });
    } else if (!routeExists(pathname)) {
      findings.push({ category: "routes", issueType: "unknown_internal_route", severity: "high", details: { href: raw, source: reference.source }, recommendation: "Corrige el destino en Menús, enlaces o bloques del CMS.", url: raw });
    }
  }
  return findings;
}
