import {
  consentPolicyKey,
  type ConsentSettings,
  type SiteIntegrations,
} from "@shared/siteIntegrations";
export const CONSENT_KEY = "ss-cookie-choice-v1";
export type Categories = {
  analytics: boolean;
  external: boolean;
  leadinfo: boolean;
};
export type ConsentChoice = {
  version: string;
  expiresAt: number;
  categories: Categories;
};
export const rejected: Categories = {
  analytics: false,
  external: false,
  leadinfo: false,
};
export function parseChoice(
  raw: string | null,
  settings: ConsentSettings,
  integrations: SiteIntegrations,
  now = Date.now(),
): ConsentChoice | null {
  try {
    const value = JSON.parse(raw || "null");
    if (
      !value ||
      value.version !== consentPolicyKey(settings, integrations) ||
      !Number.isFinite(value.expiresAt) ||
      value.expiresAt <= now ||
      !value.categories ||
      !["analytics", "external", "leadinfo"].every(
        (k) => typeof value.categories[k] === "boolean",
      )
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export function createChoice(
  categories: Categories,
  settings: ConsentSettings,
  integrations: SiteIntegrations,
  now = Date.now(),
): ConsentChoice {
  return {
    version: consentPolicyKey(settings, integrations),
    expiresAt: now + settings.validityMonths * 30 * 24 * 60 * 60 * 1000,
    categories,
  };
}
export function trackingAllowed(
  integrations: SiteIntegrations,
  location: {
    protocol: string;
    hostname: string;
    pathname: string;
    search: string;
  },
) {
  return (
    location.protocol === "https:" &&
    location.hostname === new URL(integrations.siteUrl).hostname &&
    !location.pathname.startsWith("/admin") &&
    !location.pathname.startsWith("/api") &&
    !new URLSearchParams(location.search).has("cms-preview") &&
    !new URLSearchParams(location.search).has("preview")
  );
}
