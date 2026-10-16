import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mergeCms, type CmsSection } from '@shared/cms';
import { queryClient } from '@/lib/queryClient';

export const CMS_QUERY = ['/api/site-config'] as const;
export function useCmsContent<T>(section: CmsSection, fallback: T): T {
  const { data } = useQuery<Record<string, unknown>>({
    queryKey: CMS_QUERY,
    staleTime: 15000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });
  const override = data?.[section];
  return useMemo(() => mergeCms(fallback, override), [fallback, override]);
}

// A saved edit refreshes other open tabs without reloading a page or interrupting a form.
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
