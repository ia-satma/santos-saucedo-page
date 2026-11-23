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
  const path = href.split(/[?#]/, 1)[0].replace(/\/+$/, "").toLowerCase();
  if (!path) return "home";
  if (path === "/about" || path === "/nuestra-firma") return "about";
  if (path.includes("practice") || path.includes("practica")) return "practices";
  if (path.includes("industry") || path.includes("industria")) return "industries";
  if (path === "/team" || path.startsWith("/team/") || path === "/socios" || path.startsWith("/socios/")) return "team";
  if (path === "/news" || path.startsWith("/news/") || path === "/monitor-laboral" || path.startsWith("/monitor-laboral/")) return "news";
  if (path === "/careers/interns" || path === "/pasantias" || path === "/interns") return "interns";
  if (path.includes("career") || path.includes("carrera")) return "careers";
  if (path === "/newsletter" || path === "/boletin" || path === "/newsletter/unsubscribe" || path === "/boletin/unsubscribe") return "newsletter";
  if (path === "/contact" || path === "/contacto") return "contact";
  if (path.includes("testimon")) return "testimonials";
  if (path === "/testimonios/escribir") return "testimonials";
  if (path.includes("office") || path.includes("oficina")) return "offices";
  if (path.includes("privacy") || path.includes("privacidad")) return "privacy";
  if (path.includes("term") || path.includes("termin")) return "terms";
  return "";
}
