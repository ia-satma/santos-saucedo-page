import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.VISUAL_TEST_BASE_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
const routes = [
  "/about", "/practice-groups", "/team", "/news", "/contact",
  "/careers", "/careers/interns", "/testimonios", "/newsletter",
];
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/repl/tools/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [];
let baseline;
try { baseline = JSON.parse(await readFile("/tmp/ss-main-banners-before.json", "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
let checks = 0;
try {
  for (const [language, width] of [
    ["es", 1440], ["es", 768], ["es", 375], ["ar", 375], ["de", 320],
  ]) {
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
      await page.goto(`${baseURL}${route}`);
      const hero = page.locator(".ss-principal-page-hero");
      await hero.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await hero.locator("img,picture,video").count(), 0, `${label}: no banner media`);
      const layout = await hero.evaluate(el => {
        const style = getComputedStyle(el), rect = el.getBoundingClientRect();
        return {
          background: style.backgroundImage, color: style.backgroundColor,
          after: getComputedStyle(el, "::after").backgroundImage,
          mark: getComputedStyle(el, "::before").maskImage,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          textFits: [...el.querySelectorAll("h1,p")].every(text => {
            const box = text.getBoundingClientRect();
            return box.left >= rect.left - 1 && box.right <= rect.right + 1
              && box.top >= rect.top - 1 && box.bottom <= rect.bottom + 1
              && text.scrollWidth <= text.clientWidth + 1;
          }),
        };
      });
      assert.equal(layout.background, "none", `${label}: no background photograph`);
      assert.equal(layout.after, "none", `${label}: no photographic overlay`);
      assert.equal(layout.color, "rgb(24, 23, 91)", `${label}: original navy identity`);
      assert.match(layout.mark, /seccion.*svg/, `${label}: official SS preserved`);
      assert.ok(!layout.overflow && layout.textFits, `${label}: readable responsive title`);
      if (language === "es" && width === 1440 && baseline) {
        await page.waitForLoadState("networkidle");
        const current = await page.locator("main").evaluate(main => {
          const normalize = s => s.replace(/\s+/g, " ").trim();
          const copy = main.cloneNode(true), hero = copy.querySelector(".editorial-page-hero");
          const heroText = normalize(hero.textContent);
          hero.remove();
          return {
            heroText, bodyText: normalize(copy.textContent),
            bodyImages: [...copy.querySelectorAll("img")].map(img => img.getAttribute("src")),
          };
        });
        const { heroText, bodyText, bodyImages } = baseline[route];
        assert.deepEqual(current, { heroText, bodyText, bodyImages }, `${label}: copy and body images unchanged`);
      }
      if (route === "/team") {
        assert.ok(await page.locator("main img").count() >= 4, "All four partner portraits remain");
      }
      checks++;
    }
    await page.goto(`${baseURL}/offices`);
    await page.locator(".ss-office-cover > img").waitFor({ state: "attached" });
    assert.equal(await page.locator(".ss-office-cover > img").count(), 1,
      "The original office photographic cover remains unchanged");
    await page.close();
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS: ${checks} principal headers without images; body/portrait preservation, responsive layout, RTL and original Offices cover.`);
} finally {
  await browser.close();
}
