import assert from "node:assert/strict";
import { chromium } from "playwright";
import { playwrightExecutablePath } from "./lib/playwright-runtime.mjs";
import { localizedPublicPath } from "./lib/canonical-routes.mjs";

const baseURL = (process.env.VISUAL_TEST_BASE_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN ?? "127.0.0.1:5000"}`).replace(/\/$/, "");
const browser = await chromium.launch({ executablePath: playwrightExecutablePath, args: ["--no-sandbox"] });
const errors = [];
let checks = 0;
const routes = ["/about", "/practice-groups", "/team", "/news", "/contact", "/careers", "/careers/interns", "/testimonios", "/newsletter"];

async function waitForHydrated(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator("main h1").first().waitFor({ state: "visible" });
  await page.waitForFunction(() => document.fonts.status === "loaded");
}

try {
  for (const [language, width] of [["es", 1440], ["es", 768], ["es", 375], ["ar", 375], ["de", 320]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(lang => {
      localStorage.setItem("ss_language", lang);
      localStorage.setItem("ss_language_detected", "true");
    }, language);
    await page.route("**/api/translations/**", route => route.fulfill({ json: { translations: {} } }));
    await page.route("**/api/translate-entity", route => route.fulfill({ status: 204 }));
    const selected = language === "es" && width !== 768 ? routes
      : language === "ar" ? ["/team", "/practice-groups", "/careers/interns"]
      : ["/about", "/careers/interns"];
    for (const route of selected) {
      const label = `${route} ${language} ${width}`;
      await page.goto(`${baseURL}${localizedPublicPath(language, route)}`);
      await waitForHydrated(page);
      const hydratedHero = page.locator("main h1").first().locator("xpath=ancestor::*[self::header or self::section][1]");
      await hydratedHero.locator("img:visible").evaluateAll(images =>
        Promise.all(images.map(image => image.decode().catch(() => undefined))));
      const metrics = await page.locator("main h1").first().evaluate(heading => {
        const hero = heading.closest("header,section") || heading.parentElement;
        const box = hero.getBoundingClientRect();
        const style = getComputedStyle(hero);
        const h1 = heading.getBoundingClientRect();
        const media = [...hero.querySelectorAll("img,picture,video")].map(element => {
          const image = element.tagName === "IMG" ? element : element.querySelector("img");
          const visible = Boolean(image && (image.offsetWidth || image.offsetHeight || image.getClientRects().length));
          return { src: image?.getAttribute("src"), visible, loaded: image ? image.complete && image.naturalWidth > 0 : true, lazy: image?.loading === "lazy" };
        });
        return {
          background: style.backgroundImage,
          before: getComputedStyle(hero, "::before").backgroundImage,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          textFits: h1.left >= box.left - 1 && h1.right <= box.right + 1 && h1.top >= box.top - 1 && h1.bottom <= box.bottom + 1 && heading.scrollWidth <= heading.clientWidth + 1,
          media: media.filter(item => item.src && item.visible),
        };
      });
      assert.equal(metrics.background, "none", `${label}: header has no photographic background`);
      assert.equal(metrics.before, "none", `${label}: header pseudo-element has no photographic background`);
      assert.equal(metrics.overflow, false, `${label}: no horizontal overflow`);
      assert.equal(metrics.textFits, true, `${label}: heading is visible after hydration`);
      assert.ok(metrics.media.every(item => item.loaded || item.lazy), `${label}: visible header media is loaded or intentionally lazy`);
      if (route === "/team") assert.ok(await page.locator("main img").count() >= 4, `${label}: portraits remain`);
      checks += 1;
    }
    await page.goto(`${baseURL}${localizedPublicPath(language, "/offices")}`);
    await waitForHydrated(page);
    assert.equal(await page.getByTestId("section-offices-hero").locator("img").count(), 1, `${language}/${width}: office cover remains`);
    await page.close();
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS ${checks} hydrated principal headers and responsive routes`);
} finally {
  await browser.close();
}
