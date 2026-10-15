// Fecha de las publicaciones del Monitor Laboral: un solo formato por idioma en el listado
// (/news, /articles), en el artículo y en sus relacionados. En español, "15 de octubre de 2026"
// (sin la coma del patrón inglés). Árabe en calendario gregoriano y cifras latinas, como la
// cabecera (chrome26: locale "ar"); "ar-SA" daría el calendario islámico en algunos navegadores.
const NEWS_DATE_LOCALES: Record<string, string> = {
  en: "en-US",
  es: "es-MX",
  de: "de-DE",
  zh: "zh-CN",
  ko: "ko-KR",
  ja: "ja-JP",
  ar: "ar-u-ca-gregory-nu-latn",
  ru: "ru-RU",
  fr: "fr-FR",
  it: "it-IT",
};

export function formatNewsDate(date: string | Date | null | undefined, language: string): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(NEWS_DATE_LOCALES[language] || "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
