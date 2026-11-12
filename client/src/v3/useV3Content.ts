import defaults from "@shared/cms-defaults.json";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useLanguage } from "@/contexts/LanguageContext";

export type V3Content = typeof defaults.v3;
export type V3LocaleContent = V3Content["es"];

/** V3 editorial copy and media, selected from the CMS for the active language. */
export function useV3Content(): { content: V3Content; locale: V3LocaleContent } {
  const { language } = useLanguage();
  const content = useCmsContent("v3", defaults.v3) as V3Content;
  return { content, locale: content[language] ?? content.en };
}

export function v3Template(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)), template);
}
