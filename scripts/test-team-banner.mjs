import assert from "node:assert/strict";
import { chromium } from "playwright";
import { playwrightExecutablePath } from "./lib/playwright-runtime.mjs";
import { localizedPublicPath } from "./lib/canonical-routes.mjs";

const baseURL = (process.env.VISUAL_TEST_BASE_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN ?? "127.0.0.1:5000"}`).replace(/\/$/, "");
const browser = await chromium.launch({ executablePath: playwrightExecutablePath, args: ["--no-sandbox"] });
const errors = [];
let checks = 0;

try {
  for (const [language, width] of [["es", 1440], ["es", 375], ["es", 768], ...["en", "de", "fr", "it", "ru", "zh", "ko", "ja", "ar"].map(lang => [lang, 320])]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 768, isMobile: width < 768 });
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(lang => {
      localStorage.setItem("ss_language", lang);
      localStorage.setItem("ss_language_detected", "true");
    }, language);
    await page.route("**/api/translations/**", route => route.fulfill({ json: { translations: {} } }));
    await page.route("**/api/translate-entity", route => route.fulfill({ status: 204 }));
    await page.goto(`${baseURL}${localizedPublicPath(language, "/team")}`, { waitUntil: "domcontentloaded" });
    const section = page.getByTestId("section-partners");
    await section.waitFor({ state: "visible" });
    await section.getByTestId("text-team-title").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.fonts.status === "loaded");
    const metrics = await section.evaluate(element => {
      const box = element.getBoundingClientRect();
      const heading = element.querySelector("h1").getBoundingClientRect();
      const images = [...document.querySelectorAll("main img")].map(image => ({ loaded: image.complete && image.naturalWidth > 0 }));
      return {
        height: box.height,
        titleVisible: heading.top >= box.top && heading.bottom <= box.bottom,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        background: getComputedStyle(element).backgroundImage,
        images,
      };
    });
    assert.ok(metrics.height >= 180, `${language}/${width}: team section has usable height`);
    assert.equal(metrics.titleVisible, true, `${language}/${width}: title is visible`);
    assert.equal(metrics.overflow, false, `${language}/${width}: no horizontal overflow`);
    assert.equal(metrics.background, "none", `${language}/${width}: no photographic background`);
    assert.ok(metrics.images.length >= 4, `${language}/${width}: all partner portraits are present`);
    checks += 1;
    await page.close();
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS ${checks} hydrated team layouts across languages and viewports`);
} finally {
  await browser.close();
}
