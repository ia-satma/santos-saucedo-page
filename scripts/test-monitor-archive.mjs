import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

// Run against the workspace server; fixtures stay in the browser, never the database.
const baseURL = process.env.MONITOR_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync("/repl/tools/bin/chromium") ? "/repl/tools/bin/chromium" : undefined);
const fixtures = Array.from({ length: 27 }, (_, index) => ({
  id: `archive-${index}`,
  slug: index === 0 ? "conflictos-individuales-juntas-conciliacion" : `archive-${index}`,
  title: `Publication ${index}`,
  titleEs: `Publicación ${index}`,
  excerpt: `Employment analysis ${index}`,
  excerptEs: `Análisis laboral ${index}`,
  date: new Date(Date.UTC(2026, 9, 27 - index)).toISOString(),
  category: index % 2 === 0 ? "insights" : "alerts",
  published: true,
  // Custom editor choice, missing image, and broken image cases.
  imageUrl: index === 1 ? "/editorial/monitor-prevencion.webp"
    : index === 2 ? "/editorial/test-intentionally-missing.webp" : null,
}));
fixtures.push({ ...fixtures[0], id: "unpublished", slug: "unpublished", published: false });

const browser = await chromium.launch({ headless: true, executablePath, args: ["--no-sandbox"] });
try {
  for (const language of ["es", "en"]) {
    for (const width of [375, 1440]) {
      for (const route of ["/news", "/articles"]) {
        const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.addInitScript((lang) => localStorage.setItem("ss_language", lang), language);
        let data = fixtures;
        await page.route("**/api/news", (request) => request.fulfill({ json: data }));
        await page.route("**/editorial/test-intentionally-missing.webp", (request) => request.fulfill({ status: 404 }));
        // /articles is intentionally retained as a legacy redirect to /news.
        const prefix = "news";
        const rows = page.locator(`[data-testid^="card-${prefix}-"]`);
        const search = page.getByTestId("input-search-news");
        const next = page.getByRole("button", { name: language === "es" ? "Siguiente" : "Next", exact: true });
        const previous = page.getByRole("button", { name: language === "es" ? "Anterior" : "Previous", exact: true });
        const expectCount = async (count) => {
          await page.waitForFunction(({ prefix, count }) =>
            document.querySelectorAll(`[data-testid^="card-${prefix}-"]`).length === count,
          { prefix, count });
        };
        await page.goto(baseURL + route, { waitUntil: "domcontentloaded" });
        await expectCount(12);
        assert.equal(new URL(page.url()).pathname, "/news");
        assert.equal(await rows.first().locator("h2").innerText(), language === "es" ? "Publicación 0" : "Publication 0");
        assert.equal(await rows.first().locator("a").getAttribute("href"), "/news/conflictos-individuales-juntas-conciliacion");
        assert.equal(await rows.first().locator("img").getAttribute("src"), "/editorial/monitor-conciliacion.webp");
        assert.equal(await rows.nth(1).locator("img").getAttribute("src"), "/editorial/monitor-prevencion.webp");
        assert.equal(await rows.first().locator("img").getAttribute("alt"), "");
        await rows.nth(2).scrollIntoViewIfNeeded();
        await rows.nth(2).getByText(language === "es" ? "Imagen no disponible" : "Image unavailable").waitFor();
        assert.equal(await rows.nth(3).locator("img").count(), 0);
        assert.equal(await previous.isDisabled(), true);
        await next.click();
        await page.waitForFunction(() => document.querySelector('button[aria-current="page"]')?.textContent?.trim() === "2");
        assert.equal(await rows.first().locator("h2").innerText(), language === "es" ? "Publicación 12" : "Publication 12");
        await next.click();
        await expectCount(3);
        assert.equal(await next.isDisabled(), true);
        await search.fill("archive-no-match");
        await expectCount(0);
        assert.equal(await next.count(), 0);
        await search.fill("Publication 0");
        await expectCount(1); // Searches both source languages, regardless of interface.
        await search.fill("");
        await expectCount(12);
        assert.equal(await previous.isDisabled(), true);
        {
          await next.click();
          await page.getByTestId("button-filter-alerts").click();
          await expectCount(12);
          assert.equal(await previous.isDisabled(), true);
          assert.equal(await rows.first().locator("h2").innerText(), language === "es" ? "Publicación 1" : "Publication 1");
          await next.click();
          await expectCount(1);
          await page.getByTestId("button-filter-all").click();
          await expectCount(12);
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
        assert.deepEqual(errors, []);

        data = [];
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.getByTestId("container-news-empty").waitFor();
        assert.equal(await rows.count(), 0);
        assert.equal(await next.count(), 0);
        assert.equal(await search.count(), 0);
        console.log(`PASS ${route} ${language} ${width}px: images, translations, paging, search, filters, empty state, no overflow`);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
