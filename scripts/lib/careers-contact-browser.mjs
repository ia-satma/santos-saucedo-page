import assert from "node:assert/strict";
import { chromium } from "playwright";

export const baseURL = process.env.VISUAL_TEST_BASE_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
export const output = "/tmp/ss-careers-contact";
export const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/repl/tools/bin/chromium",
  args: ["--no-sandbox"],
});
export const errors = [], unexpectedWrites = [];
export async function openPage(lang = "es", width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(language => {
    localStorage.setItem("ss_language", language);
    localStorage.setItem("ss_language_detected", "true");
  }, lang);
  // Tests never submit to the real server, including background translation work.
  await page.route("**/api/**", route => {
    if (["GET", "HEAD", "OPTIONS"].includes(route.request().method())) return route.continue();
    unexpectedWrites.push(`${route.request().method()} ${route.request().url()}`);
    return route.abort();
  });
  await page.route("**/api/translations/**", route => route.fulfill({ json: { translations: {} } }));
  await page.route("**/api/translate-entity", route => route.fulfill({ status: 204 }));
  return page;
}
export async function visit(page, route) {
  await page.goto(`${baseURL}${route}`);
  await page.locator("main h1").waitFor();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
  if (await reject.isVisible()) await reject.click();
}
export async function loadPhotos(page) {
  for (const photo of await page.locator("main img").all()) {
    await photo.scrollIntoViewIfNeeded();
    assert.ok(await photo.evaluate(async image => {
      await image.decode().catch(() => {});
      return image.complete && image.naturalWidth > 0;
    }), "Existing office photography loads");
  }
}
export async function copy(page) {
  return page.locator("main").evaluate(main => {
    const normalize = s => s.replace(/\s+/g, " ").trim();
    return {
      paragraphs: [...main.querySelectorAll("p")].map(e => normalize(e.textContent)).sort(),
      headings: [...main.querySelectorAll("h1,h2,h3")].map(e => normalize(e.textContent)).sort(),
      images: [...main.querySelectorAll("img")].map(e => ({ src: e.getAttribute("src"), alt: e.alt })),
      links: [...main.querySelectorAll("a")].map(e => ({
        href: e.getAttribute("href"), text: normalize(e.textContent),
        target: e.getAttribute("target"), rel: e.getAttribute("rel"),
      })),
      hero: main.querySelector(".editorial-page-hero").outerHTML,
      heroHeight: main.querySelector(".editorial-page-hero").getBoundingClientRect().height,
      formFields: [...main.querySelectorAll("input,textarea,select,[role=combobox]")].map(e => ({
        tag: e.tagName, name: e.name || null, type: e.getAttribute("type"),
        required: e.required ?? null, accept: e.getAttribute("accept"),
      })),
    };
  });
}
