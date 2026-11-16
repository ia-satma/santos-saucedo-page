import { useQuery } from "@tanstack/react-query";
import { CMS_QUERY, useCmsContent } from "@/hooks/useCmsContent";
import { navigationDefaults } from "@/lib/cmsLightDefaults";
import { layoutDefaults } from "@/lib/cmsLightDefaults";
import { blockVisible, pageVisibility } from "@/lib/pageVisibility";
import type { SiteNavigation, NavigationEntry } from "@shared/siteControls";
import { siteLink } from "@shared/siteControls";
import type { Chrome26Strings } from "./chrome26";
export function useSiteNavigation(code: string, chrome: Chrome26Strings) {
  const value = useCmsContent(
    "navigation",
    navigationDefaults,
  ) as unknown as SiteNavigation;
  const layout = useCmsContent("layout", layoutDefaults);
  const { data } = useQuery<Record<string, unknown>>({ queryKey: CMS_QUERY });
  const label = (item: NavigationEntry) =>
    item.labels[code] || item.labels.en || item.labels.es || "";
  const localize = <T extends NavigationEntry>(items: T[]) =>
    items
      .filter((i) => {
        if (!i.visible || !siteLink.safeParse(i.href).success) return false;
        const page = pageKeyForHref(i.href);
        if (!pageVisibility(layout, page).enabled) return false;
        return page !== "news" || blockVisible(layout, "home", "monitor");
      })
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

function pageKeyForHref(href: string) {
  if (href === "/" || href === "") return "home";
  if (href.includes("practice")) return "practices";
  if (href.includes("industry")) return "industries";
  if (href === "/team" || href.includes("/team/")) return "team";
  if (href === "/news" || href.includes("/news/")) return "news";
  if (href.includes("career") || href.includes("intern")) return "careers";
  if (href === "/contact") return "contact";
  if (href.includes("testimon")) return "testimonials";
  if (href.includes("office")) return "offices";
  if (href === "/about") return "about";
  return "";
}
