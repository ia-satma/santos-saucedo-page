export type PublicLanguage = "en" | "es";
export type CapabilityKind = "practice" | "industry";

export const ATTORNEY_DIRECTORY_CATEGORY_SLUGS = {
  partners: { es: "socios", en: "partners" },
  "of-counsel": { es: "of-counsel", en: "of-counsel" },
  counsel: { es: "consejeros", en: "counsel" },
  associates: { es: "asociados", en: "associates" },
} as const;

export type AttorneyDirectoryCategory = keyof typeof ATTORNEY_DIRECTORY_CATEGORY_SLUGS;

const LEGACY_SPANISH_ATTORNEY_CATEGORY_SLUGS: Readonly<Record<string, AttorneyDirectoryCategory>> = {
  socios: "partners",
  "of-counsel-sp": "of-counsel",
  "counsel-sp": "counsel",
  asociados: "associates",
};

export type LocalizedCapabilitySlug = {
  slug: string;
  slugEs?: string | null;
};

export const SPANISH_PRACTICE_SLUGS: Readonly<Record<string, string>> = {
  "corporate-ma": "corporativo-fusiones-y-adquisiciones",
  "antitrust-competition": "competencia-economica",
  arbitration: "arbitraje",
  litigation: "litigio",
  "investigations-anticorruption": "investigaciones-anticorrupcion-y-compliance",
  "bankruptcy-restructuring": "concursos-mercantiles-y-reestructuracion",
  "banking-finance": "bancario-y-financiero",
  "energy-natural-resources": "energia-y-recursos-naturales",
  esg: "esg-ambiental-social-y-gobierno-corporativo",
  "real-estate": "inmobiliario",
  "intellectual-property": "propiedad-industrial-e-intelectual",
  "labor-employment": "laboral-compensacion-de-ejecutivos-y-prestaciones",
  tax: "fiscal-consultoria-controversias-y-litigio",
  "international-trade": "comercio-exterior-y-aduanas",
  "telecommunications-media-technology": "telecomunicaciones-medios-y-tecnologia",
  environmental: "ambiental",
  "immigration-global-mobility": "migracion-y-movilidad-global",
  "projects-infrastructure": "proyectos-e-infraestructura",
  "administrative-law": "derecho-administrativo",
  "german-desk": "desk-aleman",
};

export const SPANISH_INDUSTRY_SLUGS: Readonly<Record<string, string>> = {
  "automotive-mobility-manufacturing": "automotriz-movilidad-y-manufactura",
  "consumer-goods": "bienes-de-consumo",
  "energy-natural-resources-industry": "energia-y-recursos-naturales",
  "pharmaceutical-life-sciences": "farmaceutica-y-ciencias-de-la-salud",
  "financial-services": "servicios-financieros",
  "real-estate-industry": "inmobiliario",
  "technology-industry": "tecnologia",
};

const encodeSlug = (slug: string): string => encodeURIComponent(slug);

export function defaultSpanishCapabilitySlug(kind: CapabilityKind, englishSlug: string): string {
  const slugs = kind === "practice" ? SPANISH_PRACTICE_SLUGS : SPANISH_INDUSTRY_SLUGS;
  return slugs[englishSlug] || englishSlug;
}

export function capabilityPath(
  kind: CapabilityKind,
  capability: LocalizedCapabilitySlug,
  lang: PublicLanguage,
): string {
  const prefix = lang === "es"
    ? kind === "practice" ? "practica" : "industria"
    : kind;
  const slug = lang === "es"
    ? capability.slugEs || defaultSpanishCapabilitySlug(kind, capability.slug)
    : capability.slug;
  return `/${prefix}/${encodeSlug(slug)}`;
}

export function capabilityAlternatePaths(
  kind: CapabilityKind,
  capability: LocalizedCapabilitySlug,
): { es: string; en: string } {
  return {
    es: capabilityPath(kind, capability, "es"),
    en: capabilityPath(kind, capability, "en"),
  };
}

export function attorneyPath(slug: string, lang: PublicLanguage): string {
  return `/${lang === "es" ? "abogado" : "lawyer"}/${encodeSlug(slug)}`;
}

export function articleArchiveBasePath(lang: PublicLanguage): string {
  return lang === "es" ? "/articulos" : "/articles";
}

export function articleArchivePath(lang: PublicLanguage): string {
  return `${articleArchiveBasePath(lang)}${lang === "en" ? "?lang=en" : ""}`;
}

export function articleArchiveAlternatePaths(): { es: string; en: string } {
  return {
    es: articleArchivePath("es"),
    en: articleArchivePath("en"),
  };
}

export function eventArchivePath(lang: PublicLanguage): string {
  return lang === "es" ? "/perspectivas/eventos" : "/insights/events";
}

export function eventPath(slug: string, lang: PublicLanguage): string {
  return `${eventArchivePath(lang)}/${encodeSlug(slug)}`;
}

export function attorneyDirectoryBasePath(lang: PublicLanguage): string {
  return lang === "es" ? "/abogados" : "/attorneys";
}

export function attorneyDirectoryCategoryFromSlug(
  slug: string,
  lang: PublicLanguage,
): AttorneyDirectoryCategory | null {
  const normalized = slug.trim().toLowerCase();
  if (lang === "es" && LEGACY_SPANISH_ATTORNEY_CATEGORY_SLUGS[normalized]) {
    return LEGACY_SPANISH_ATTORNEY_CATEGORY_SLUGS[normalized];
  }
  for (const [category, slugs] of Object.entries(ATTORNEY_DIRECTORY_CATEGORY_SLUGS)) {
    if (slugs[lang] === normalized) return category as AttorneyDirectoryCategory;
  }
  return null;
}

export function attorneyDirectoryPath(
  lang: PublicLanguage,
  category?: AttorneyDirectoryCategory,
): string {
  const base = attorneyDirectoryBasePath(lang);
  const categoryPath = category
    ? `/${ATTORNEY_DIRECTORY_CATEGORY_SLUGS[category][lang]}`
    : "";
  return `${base}${categoryPath}${lang === "en" ? "?lang=en" : ""}`;
}

export function attorneyDirectoryAlternatePaths(
  category?: AttorneyDirectoryCategory,
): { es: string; en: string } {
  return {
    es: attorneyDirectoryPath("es", category),
    en: attorneyDirectoryPath("en", category),
  };
}

/**
 * Normalizes only known internal attorney-directory destinations. It lets
 * persisted CMS values keep working without rewriting site_config and leaves
 * arbitrary internal or external destinations unchanged.
 */
export function normalizeAttorneyDirectoryHref(href: string, lang: PublicLanguage): string {
  const raw = href.trim();
  if (!raw.startsWith("/")) return href;

  let parsed: URL;
  try {
    parsed = new URL(raw, "https://local.invalid");
  } catch {
    return href;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  const sourceLanguage: PublicLanguage | null = segments[0] === "attorneys"
    ? "en"
    : segments[0] === "abogados"
      ? "es"
      : null;
  if (!sourceLanguage || segments.length > 2) return href;

  let category: AttorneyDirectoryCategory | undefined;
  if (segments[1]) {
    category = attorneyDirectoryCategoryFromSlug(segments[1], sourceLanguage)
      || attorneyDirectoryCategoryFromSlug(segments[1], sourceLanguage === "es" ? "en" : "es")
      || undefined;
    if (!category) return href;
  }

  const target = new URL(attorneyDirectoryPath(lang, category), "https://local.invalid");
  parsed.searchParams.forEach((value, key) => {
    if (key !== "lang") target.searchParams.append(key, value);
  });
  target.hash = parsed.hash;
  return `${target.pathname}${target.search}${target.hash}`;
}
