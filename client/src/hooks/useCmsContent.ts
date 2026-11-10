import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mergeCms, type CmsSection } from '@shared/cms';
import { queryClient } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';

export const CMS_QUERY = ['/api/site-config'] as const;

function hasLanguageMap(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && ('es' in value || 'en' in value);
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
  const overrideHasLanguage = hasLanguageMap(override) && language in override;
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
    const selected = localized && Object.keys(localized).length > 0 ? localized : base[language];
    if (!selected || typeof selected !== 'object') return base;
    // Legacy V3 components use an ES/EN content type while the visitor may
    // select another language. Mirror the published language into EN so those
    // components render the localized copy without reintroducing English text.
    return { ...base, [language]: selected, en: selected } as T;
  }, [base, localized, language]);
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
