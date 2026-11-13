import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CmsSection } from '@shared/cms';
import { mergeCms } from '@shared/cmsMerge';
import { queryClient } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@shared/constants';

export const CMS_QUERY = ['/api/site-config'] as const;

const LANGUAGE_CODES: ReadonlySet<string> = new Set(SUPPORTED_LANGUAGES.map(({ code }) => code));

function hasLanguageMap(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasLanguageMap);
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return Object.keys(record).some((key) => LANGUAGE_CODES.has(key)) || Object.values(record).some(hasLanguageMap);
}

function hasLanguageValue(value: unknown, language: string): boolean {
  if (Array.isArray(value)) return value.some((item) => hasLanguageValue(item, language));
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => LANGUAGE_CODES.has(key))) return language in record;
  return Object.values(record).some((item) => hasLanguageValue(item, language));
}

function mergeLocalized(base: any, localized: any): any {
  if (localized === undefined) return base;
  if (Array.isArray(base) || Array.isArray(localized)) return localized;
  if (base && typeof base === 'object' && localized && typeof localized === 'object') {
    const output: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(localized)) {
      output[key] = mergeLocalized(output[key], value);
    }
    return output;
  }
  return localized;
}

function overlayLanguage(base: any, localized: any, language: string): any {
  if (base === null || base === undefined) return localized;
  if (Array.isArray(base)) {
    return Array.isArray(localized)
      ? base.map((value, index) => overlayLanguage(value, localized[index], language))
      : base;
  }
  if (typeof base !== 'object') return localized === undefined ? base : localized;
  const record = base as Record<string, unknown>;
  if (Object.keys(record).some((key) => LANGUAGE_CODES.has(key))) {
    const fallback = record.en ?? record.es;
    const current = record[language] ?? fallback;
    return { ...record, [language]: mergeLocalized(mergeLocalized(fallback, current), localized) };
  }
  if (!localized || typeof localized !== 'object' || Array.isArray(localized)) return base;
  const output: Record<string, unknown> = { ...record };
  for (const key of Object.keys(record)) {
    output[key] = overlayLanguage(record[key], (localized as Record<string, unknown>)[key], language);
  }
  return output;
}

/** Reads editable CMS content and its published localized snapshot for non-source languages. */
export function useCmsContent<T>(section: CmsSection, fallback: T): T {
  const { language } = useLanguage();
  const { data } = useQuery<Record<string, unknown>>({
    queryKey: CMS_QUERY,
    staleTime: 15000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });
  const override = data?.[section];
  const base = useMemo(() => mergeCms(fallback, override), [fallback, override]);
  // The bundled defaults already contain all ten language keys. That must not
  // prevent a published CMS localization row from replacing the default, so
  // only skip the endpoint when the live editorial override itself contains
  // the requested language.
  const overrideHasLanguage = hasLanguageValue(override, language);
  // Static builds expose the same published localized rows through
  // static-api/site-config.json. Reading that endpoint here keeps the public
  // frontend independent from the CMS server while preserving one code path
  // for live and static deployments.
  const needsLocalizedSnapshot = language !== 'es' && language !== 'en' && hasLanguageMap(base) && !overrideHasLanguage;
  const { data: localized } = useQuery<Record<string, unknown>>({
    queryKey: [`/api/localized-content/${section}/${language}`],
    enabled: needsLocalizedSnapshot,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
  return useMemo(() => {
    if (!hasLanguageMap(base) || language === 'es' || language === 'en') return base;
    const selected = localized && Object.keys(localized).length > 0
      ? localized
      : undefined;
    if (!selected || typeof selected !== 'object') return base;
    const result = overlayLanguage(base, selected, language) as Record<string, unknown>;
    // Legacy V3 components use an ES/EN content type while the visitor may
    // select another language. Mirror the published language into EN so those
    // components render the localized copy without reintroducing English text.
    if (Object.keys(result).some((key) => LANGUAGE_CODES.has(key))) result.en = result[language];
    return result as T;
  }, [base, localized, language, section]);
}

let channel: BroadcastChannel | undefined;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  channel = new BroadcastChannel('santos-cms-content');
  channel.onmessage = () => { void queryClient.invalidateQueries(); };
}
export function notifyCmsSaved() {
  void queryClient.invalidateQueries();
  channel?.postMessage({ type: 'content-saved' });
}

if (typeof window !== 'undefined') {
  window.addEventListener('ss:cms-catalog-saved', () => notifyCmsSaved());
}
