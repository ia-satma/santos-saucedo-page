import { useCmsContent } from "@/hooks/useCmsContent";
import type { LanguageCode } from "@shared/schema";

// Nombre de la página de la oficina (/offices), el mismo en h1, pestaña, pie y enlaces de cada idioma.
export const OFFICE_LABEL: Record<LanguageCode, string> = {
  es: "La oficina",
  en: "The office",
  // I6: "Das Büro" y no "Die Kanzlei", que junto a "Über die Kanzlei" se lee como la firma
  de: "Das Büro",
  fr: "Le bureau",
  it: "La sede",
  ru: "Офис",
  zh: "办公室",
  ja: "オフィス",
  ko: "사무실",
  ar: "المكتب",
};

export const officeLabel = (lang: LanguageCode | string): string =>
  OFFICE_LABEL[lang as LanguageCode] ?? OFFICE_LABEL.en;

export function useOfficeLabel() {
  const labels = useCmsContent("officeLabels", OFFICE_LABEL);
  return (lang: string) => labels[lang as LanguageCode] ?? labels.en;
}
