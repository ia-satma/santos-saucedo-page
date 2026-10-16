import test from "node:test";
import assert from "node:assert/strict";
import defaults from "../../shared/cms-defaults.json";
import {
  createChoice,
  parseChoice,
  trackingAllowed,
  rejected,
} from "../../client/src/features/privacy/consentState";
import { applyTracking } from "../../client/src/features/privacy/tracking";
const settings = structuredClone(defaults.consent),
  integrations = structuredClone(defaults.integrations);
test("cookie preferences expire, reject old versions and require explicit boolean categories", () => {
  const saved = createChoice(
    { analytics: true, external: false, leadinfo: false },
    settings,
    integrations,
    1000,
  );
  assert.equal(
    parseChoice(JSON.stringify(saved), settings, integrations, 1001)?.categories
      .analytics,
    true,
  );
  assert.equal(
    parseChoice(
      JSON.stringify(saved),
      settings,
      integrations,
      saved.expiresAt + 1,
    ),
    null,
  );
  assert.equal(
    parseChoice(
      JSON.stringify(saved),
      { ...settings, version: "new" },
      integrations,
      1001,
    ),
    null,
  );
  assert.equal(
    parseChoice(
      JSON.stringify({ ...saved, categories: { analytics: "yes" } }),
      settings,
      integrations,
      1001,
    ),
    null,
  );
  assert.equal(parseChoice("accepted", settings, integrations), null);
});
test("new analytics or Leadinfo activation requires a new choice and excludes previews/admin", () => {
  const saved = createChoice(
    { analytics: true, external: true, leadinfo: true },
    settings,
    integrations,
  );
  const changed = {
    ...integrations,
    ga4: { enabled: true, measurementId: "G-TEST123" },
  };
  assert.equal(parseChoice(JSON.stringify(saved), settings, changed), null);
  const publicLocation = {
    protocol: "https:",
    hostname: new URL(integrations.siteUrl).hostname,
    pathname: "/news",
    search: "",
  };
  assert(trackingAllowed(integrations, publicLocation));
  for (const patch of [
    { pathname: "/admin/news" },
    { search: "?cms-preview=1" },
    { search: "?preview=true" },
    { protocol: "http:" },
    { hostname: "unapproved.example" },
  ])
    assert.equal(
      trackingAllowed(integrations, { ...publicLocation, ...patch }),
      false,
    );
});
test("analytics loads once after consent, omits query values and stops on withdrawal", () => {
  const original = {
    window: globalThis.window,
    document: globalThis.document,
    location: globalThis.location,
  };
  const elements: any[] = [];
  const cookies: string[] = [];
  const location = {
    protocol: "https:",
    hostname: "santos.example.test",
    pathname: "/contact",
    search: "?email=private@example.test",
    reload: () => {
      throw new Error("Unexpected reload");
    },
  };
  const document = {
    get cookie() {
      return "_ga=test; _gid=test; preference=es";
    },
    set cookie(v: string) {
      cookies.push(v);
    },
    querySelector: (selector: string) =>
      elements.find(
        (e) => selector === "script[data-ss-ga4]" && e.dataset.ssGa4,
      ),
    createElement: () => ({
      dataset: {},
      remove() {
        const i = elements.indexOf(this);
        if (i >= 0) elements.splice(i, 1);
      },
    }),
    head: { appendChild: (el: any) => elements.push(el) },
  };
  const window: any = { location };
  Object.assign(globalThis, { window, document, location });
  try {
    const config = {
      ...integrations,
      siteUrl: "https://santos.example.test",
      ga4: { enabled: true, measurementId: "G-LOCALTEST" },
    };
    applyTracking(config, rejected);
    assert.equal(elements.length, 0);
    applyTracking(config, { ...rejected, analytics: true });
    assert.equal(elements.length, 1);
    assert.equal(
      elements[0].src,
      "https://www.googletagmanager.com/gtag/js?id=G-LOCALTEST",
    );
    applyTracking(config, { ...rejected, analytics: true });
    assert.equal(elements.length, 1);
    const calls = window.dataLayer.map((a: any) => Array.from(a));
    const page = calls.find(
      (a: any[]) => a[0] === "event" && a[1] === "page_view",
    );
    assert.equal(page[2].page_location, "https://santos.example.test/contact");
    assert(!JSON.stringify(calls).includes("private@example.test"));
    applyTracking(config, rejected, true);
    assert.equal(elements.length, 0);
    assert.equal(window["ga-disable-G-LOCALTEST"], true);
    assert(cookies.some((c) => c.startsWith("_ga=")));
    assert(!cookies.some((c) => c.startsWith("preference=")));
  } finally {
    Object.assign(globalThis, original);
  }
});
