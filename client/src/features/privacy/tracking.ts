import type { SiteIntegrations } from "@shared/siteIntegrations";
import type { Categories } from "./consentState";
import { trackingAllowed } from "./consentState";
type TrackingWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  GlobalLeadinfoNamespace?: string[];
  leadinfo?: ((...args: unknown[]) => void) & { q: unknown[]; t: string };
  [key: string]: unknown;
};
let analyticsId = "";
let lastPage = "";
let leadinfoLoaded = false;
function clearCookies(prefix: RegExp) {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (!prefix.test(name)) continue;
    const labels = location.hostname.split(".");
    const domains = [
      "",
      ...labels.slice(0, -1).map((_, i) => "." + labels.slice(i).join(".")),
    ];
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}${domain ? "; Domain=" + domain : ""}`;
  }
}
export function applyTracking(
  settings: SiteIntegrations,
  categories: Categories,
  explicitChange = false,
) {
  const w = window as unknown as TrackingWindow;
  const allowed = trackingAllowed(settings, window.location);
  const analytics =
    allowed &&
    settings.ga4.enabled &&
    categories.analytics &&
    /^G-[A-Z0-9]+$/.test(settings.ga4.measurementId);
  if (
    analyticsId &&
    (!analytics || analyticsId !== settings.ga4.measurementId)
  ) {
    w[`ga-disable-${analyticsId}`] = true;
    document.querySelector("script[data-ss-ga4]")?.remove();
    w.gtag?.("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    clearCookies(/^_ga(?:_|$)|^_gid$|^_gat/);
    analyticsId = "";
    lastPage = "";
  }
  if (analytics) {
    w.dataLayer = w.dataLayer || [];
    w.gtag =
      w.gtag ||
      function () {
        w.dataLayer!.push(arguments);
      };
    w[`ga-disable-${settings.ga4.measurementId}`] = false;
    if (!analyticsId) {
      w.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      w.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      w.gtag("js", new Date());
      w.gtag("config", settings.ga4.measurementId, {
        send_page_view: false,
        page_location: settings.siteUrl.replace(/\/$/, "") + location.pathname,
        page_title: location.pathname,
        page_referrer: "",
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      const script = document.createElement("script");
      script.async = true;
      script.dataset.ssGa4 = "true";
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.ga4.measurementId)}`;
      document.head.appendChild(script);
      analyticsId = settings.ga4.measurementId;
    }
    const path = location.pathname;
    if (path !== lastPage) {
      w.gtag?.("event", "page_view", {
        send_to: analyticsId,
        page_location: settings.siteUrl.replace(/\/$/, "") + path,
        page_path: path,
        page_title: path,
        page_referrer: "",
      });
      lastPage = path;
    }
  }
  const lead =
    allowed &&
    settings.leadinfo.enabled &&
    settings.leadinfo.disclosureReviewed &&
    categories.leadinfo &&
    Boolean(settings.leadinfo.siteId);
  if (lead && !leadinfoLoaded) {
    w.GlobalLeadinfoNamespace = w.GlobalLeadinfoNamespace || [];
    if (!w.GlobalLeadinfoNamespace.includes("leadinfo"))
      w.GlobalLeadinfoNamespace.push("leadinfo");
    const client =
      w.leadinfo ||
      Object.assign(
        function (...args: unknown[]) {
          client.q.push(args);
        },
        { q: [] as unknown[], t: settings.leadinfo.siteId },
      );
    client.t = settings.leadinfo.siteId;
    w.leadinfo = client;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.ssLeadinfo = "true";
    script.src = "https://cdn.leadinfo.net/ping.js";
    document.head.appendChild(script);
    leadinfoLoaded = true;
  }
  if (!lead && leadinfoLoaded) {
    document.querySelector("script[data-ss-leadinfo]")?.remove();
    clearCookies(/^_li_|^_leadinfo/);
    leadinfoLoaded = false;
    if (explicitChange) window.location.reload();
  }
}
