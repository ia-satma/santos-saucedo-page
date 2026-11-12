import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/constants";
import generated from "./locales.generated.json";

type BaseLocale<T> = { es: T; en: T };

/** Combines the approved Spanish/English source with the generated copies for the other site languages. */
export function localizedRecord<T>(name: keyof typeof generated, base: BaseLocale<T>, hydrate?: (value: unknown) => T): Record<LanguageCode, T> {
  const result: Partial<Record<LanguageCode, T>> = { ...base };
  for (const { code } of SUPPORTED_LANGUAGES) {
    if (code === "es" || code === "en") continue;
    const value = generated[name]?.[code];
    if (value !== undefined) result[code] = hydrate ? hydrate(value) : value as T;
  }
  return result as Record<LanguageCode, T>;
}
