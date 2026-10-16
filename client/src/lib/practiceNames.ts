import type { LanguageCode } from "@shared/schema";

// Nombre de cada práctica por idioma, con la clave del slug de la base. Español e inglés son
// los nombres de la base (practice_groups.name_es / name). En los demás idiomas, un solo
// término por práctica: el de la descripción SEO de Prácticas en ese idioma (SEOHead). En
// japonés y coreano, ese mismo término en todo el sitio (移民 y 이민, no 出入国管理 ni 출입국;
// 企業法務 y 기업, no 会社法 ni 회사).
export const PRACTICE_SLUGS = [
  "laboral-seguridad-social",
  "corporativo-contractual",
  "migratorio",
  "litigio-contencioso",
] as const;

export type PracticeSlug = (typeof PRACTICE_SLUGS)[number];

const NAMES: Record<PracticeSlug, Record<LanguageCode, string>> = {
  "laboral-seguridad-social": {
    es: "Laboral y seguridad social",
    en: "Labor and social security",
    de: "Arbeits- und Sozialversicherungsrecht",
    zh: "劳动与社会保障",
    ko: "노동 및 사회보장",
    ja: "労働・社会保障",
    ar: "العمل والضمان الاجتماعي",
    ru: "Трудовое право и социальное обеспечение",
    fr: "Droit du travail et sécurité sociale",
    it: "Lavoro e previdenza sociale",
  },
  "corporativo-contractual": {
    es: "Corporativo y contractual",
    en: "Corporate and contractual",
    de: "Gesellschafts- und Vertragsrecht",
    zh: "公司与合同",
    ko: "기업 및 계약",
    ja: "企業法務・契約",
    ar: "الشركات والعقود",
    ru: "Корпоративное и договорное право",
    fr: "Droit des sociétés et des contrats",
    it: "Societario e contrattuale",
  },
  migratorio: {
    es: "Migratorio",
    en: "Immigration",
    de: "Migrationsrecht",
    zh: "移民",
    ko: "이민",
    ja: "移民",
    ar: "الهجرة",
    ru: "Миграционное право",
    fr: "Immigration",
    it: "Immigrazione",
  },
  "litigio-contencioso": {
    es: "Litigio",
    en: "Litigation",
    de: "Prozessführung",
    zh: "诉讼",
    ko: "소송",
    ja: "訴訟",
    ar: "التقاضي",
    ru: "Судебные споры",
    fr: "Contentieux",
    it: "Contenzioso",
  },
};

// Etiquetas cortas (select de Contacto): las del documento de redacción en español
// (Laboral · Corporativo · Migratorio · Litigio) y su equivalente corto en cada idioma,
// con el mismo término que el nombre largo.
const SHORT_NAMES: Record<PracticeSlug, Record<LanguageCode, string>> = {
  "laboral-seguridad-social": {
    es: "Laboral",
    en: "Labor",
    de: "Arbeitsrecht",
    zh: "劳动",
    ko: "노동",
    ja: "労働",
    ar: "العمل",
    ru: "Трудовое право",
    fr: "Travail",
    it: "Lavoro",
  },
  "corporativo-contractual": {
    es: "Corporativo",
    en: "Corporate",
    de: "Gesellschaftsrecht",
    zh: "公司",
    ko: "기업",
    ja: "企業法務",
    ar: "الشركات",
    ru: "Корпоративное право",
    fr: "Sociétés",
    it: "Societario",
  },
  migratorio: {
    es: "Migratorio",
    en: "Immigration",
    de: "Migrationsrecht",
    zh: "移民",
    ko: "이민",
    ja: "移民",
    ar: "الهجرة",
    ru: "Миграционное право",
    fr: "Immigration",
    it: "Immigrazione",
  },
  "litigio-contencioso": {
    es: "Litigio",
    en: "Litigation",
    de: "Prozessführung",
    zh: "诉讼",
    ko: "소송",
    ja: "訴訟",
    ar: "التقاضي",
    ru: "Судебные споры",
    fr: "Contentieux",
    it: "Contenzioso",
  },
};

function isPracticeSlug(slug: string): slug is PracticeSlug {
  return (PRACTICE_SLUGS as readonly string[]).includes(slug);
}

/** Nombre de la práctica en el idioma dado; undefined si el slug no es de las cuatro prácticas. */
export function practiceName(slug: string, lang: LanguageCode | string): string | undefined {
  if (!isPracticeSlug(slug)) return undefined;
  return NAMES[slug][lang as LanguageCode] ?? NAMES[slug].en;
}

/** Etiqueta corta (select de Contacto); undefined si el slug no es de las cuatro prácticas. */
export function practiceShortName(slug: string, lang: LanguageCode | string): string | undefined {
  if (!isPracticeSlug(slug)) return undefined;
  return SHORT_NAMES[slug][lang as LanguageCode] ?? SHORT_NAMES[slug].en;
}

/** Nombre para mostrar de un registro de practice_groups: en español e inglés, el de la base
    (lo que la firma edite manda); en los demás idiomas, el de esta tabla y, si el slug no
    está en ella, el inglés de la base. */
export function localizedPracticeName(
  group: { slug: string; name: string; nameEs?: string | null },
  lang: LanguageCode | string,
): string {
  if (lang === "es") return group.nameEs || group.name;
  if (lang === "en") return group.name;
  return practiceName(group.slug, lang) ?? group.name;
}
