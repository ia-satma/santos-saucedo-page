import { useQuery } from "@tanstack/react-query";
import { CMS_QUERY, useCmsContent } from "@/hooks/useCmsContent";
import defaults from "@shared/cms-defaults.json";
import type { SiteNavigation, NavigationEntry } from "@shared/siteControls";
import { siteLink } from "@shared/siteControls";
import type { Chrome26Strings } from "./chrome26";
export function useSiteNavigation(code: string, chrome: Chrome26Strings) {
  const value = useCmsContent(
    "navigation",
    defaults.navigation,
  ) as SiteNavigation;
  const { data } = useQuery<Record<string, unknown>>({ queryKey: CMS_QUERY });
  const label = (item: NavigationEntry) =>
    item.labels[code] || item.labels.en || item.labels.es || "";
  const localize = <T extends NavigationEntry>(items: T[]) =>
    items
      .filter((i) => i.visible && siteLink.safeParse(i.href).success)
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((i) => ({ ...i, label: label(i) }));
  const items = data?.navigation
    ? value.items
    : value.items.map((item, i) => ({
        ...item,
        labels: { ...item.labels, [code]: chrome.nav[i]?.label || label(item) },
        visible: chrome.nav[i]?.visible !== false,
        // Las entradas sin par en chrome26 (Testimonios) conservan su propio orden
        order: chrome.nav[i]?.order ?? item.order,
      }));
  return {
    ...value,
    items: localize(items).map((i) => ({
      ...i,
      children: localize(i.children),
    })),
    footerItems: localize(value.footerItems),
    legalItems: localize(value.legalItems),
  };
}
