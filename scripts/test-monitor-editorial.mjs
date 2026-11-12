import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { runMonitorVisualChecks } from "./visual/monitor.mjs";

const baseURL = process.env.VISUAL_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const screenshots = process.env.MONITOR_SCREENSHOTS_DIR ?? "/tmp/ss-monitor-editorial";
await mkdir(screenshots, { recursive: true });
const visualOnly = process.argv.includes("--visual-only");
let articles;
if (!visualOnly) {
  let response = await fetch(`${baseURL}/api/news`);
  if (!response.ok) response = await fetch(`${baseURL}/static-api/news.json`);
  assert.ok(response.ok, "Public news API is available");
  articles = await response.json();
  assert.ok(articles.length >= 3, "Development fixture has three real publications");
}
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ?? (existsSync("/repl/tools/bin/chromium") ? "/repl/tools/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const errors = [];

async function pageFor(language, width) {
  const page = await browser.newPage({ viewport: { width, height: 2400 } });
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(lang => {
    localStorage.setItem("ss_language", lang);
    localStorage.setItem("ss_language_detected", "true");
  }, language);
  return page;
}

async function open(page, language = "es") {
  await page.goto(`${baseURL}/${language}/`, { waitUntil: "domcontentloaded" });
  await page.locator("#news").waitFor();
  const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
  if (await reject.isVisible()) await reject.click();
}

async function openArchive(page, language = "es") {
  await page.goto(`${baseURL}/${language}/news`, { waitUntil: "domcontentloaded" });
  await page.locator('[data-testid="page-news"]').waitFor();
  const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
  if (await reject.isVisible()) await reject.click();
}

async function assertLayout(page, count) {
  const section = page.locator("#news");
  assert.equal(await section.locator("li").count(), count);
  const metrics = await section.evaluate(el => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    titles: [...el.querySelectorAll("h3")].map(h => ({
      clipped: h.scrollHeight > h.clientHeight + 1,
      overflow: h.scrollWidth > h.clientWidth + 1,
    })),
    excerpts: [...el.querySelectorAll("li > p:not(.ss-label)")].map(p => ({
      clipped: p.scrollHeight > p.clientHeight + 1,
      overflow: p.scrollWidth > p.clientWidth + 1,
    })),
  }));
  assert.equal(metrics.overflow, false, "No horizontal page overflow");
  assert.ok(metrics.titles.every(t => !t.clipped && !t.overflow), "Full titles remain readable");
  assert.ok(metrics.excerpts.every(p => !p.clipped && !p.overflow), "Excerpts remain readable");
  for (const link of await section.locator("li a").all()) {
    assert.match(await link.getAttribute("href"), /^\/(?:[a-z]{2}\/)?news\/[^/]+$/);
    const label = await link.getAttribute("aria-label") || await link.textContent();
    assert.ok(label?.trim().length > 0, "Complete accessible link title");
  }
}

try {
  await runMonitorVisualChecks(browser, baseURL);
  if (!visualOnly) {
  for (const [language, width] of [["es", 1440], ["es", 768], ["es", 375], ["es", 320], ["en", 1440], ["en", 375]]) {
    const page = await pageFor(language, width);
    await open(page, language);
    await page.locator("#news li").first().waitFor();
    await page.locator("#news").evaluate(el => window.scrollTo({ top: el.offsetTop - 160, behavior: "instant" }));
    await assertLayout(page, 3);
    await page.locator("#news").screenshot({ path: `${screenshots}/${language}-${width}.png` });
    const first = page.locator("#news li a").first();
    const target = await first.getAttribute("href");
    await first.click();
    await page.waitForURL(`**${target}`);
    await page.locator("h1").waitFor({ state: "visible" });
    await page.goto(`${baseURL}/${language}/news`, { waitUntil: "domcontentloaded" });
    await page.locator('main a[href*="/news/"]').first().waitFor();
    assert.equal(await page.getByTestId("home-monitor-stories").count(), 0, "Archive keeps its original presentation");
    console.log(`PASS real publications, layout, links and archive: ${language} ${width}px`);
    await page.close();
  }

  for (const language of ["es", "en"]) {
    const page = await pageFor(language, 375);
    let items = [];
    let status = 200;
    let delayed = false;
    let release;
    const fulfillState = async route => {
      if (delayed) await new Promise(resolve => { release = resolve; });
      await route.fulfill({ status, json: status === 200 ? items : { message: "Test service unavailable" } });
    };
    await page.route("**/api/news", fulfillState);
    await page.route("**/static-api/news.json", fulfillState);
    for (const count of [0, 1, 2, 3]) {
      items = articles.slice(0, count);
      await openArchive(page, language);
      if (count) {
        await page.locator("main ul#ps-mon-lista > li").first().waitFor();
        assert.equal(await page.locator("main ul#ps-mon-lista > li").count(), count);
      } else {
        await page.locator("main [role=status]").filter({ hasText: /Aún no|There are no/ }).waitFor();
      }
    }
    // Drafts stay excluded while published rows retain their links and titles.
    items = [
      { ...articles[0], slug: "editorial-without-image" },
      { ...articles[1] },
      { ...articles[2], published: false, featuredHome: true },
    ];
    await openArchive(page, language);
    await page.locator("main ul#ps-mon-lista > li").first().waitFor();
    assert.equal(await page.locator("main ul#ps-mon-lista > li").count(), 2, "Draft excluded, published links retain titles");
    status = 503;
    await openArchive(page, language);
    await page.locator("main [role=status]").filter({ hasText: /No fue posible|could not/ }).waitFor();
    assert.equal(await page.locator("main ul#ps-mon-lista > li").count(), 0);
    status = 200;
    items = articles;
    delayed = true;
    await openArchive(page, language);
    await page.locator('main [role=status][aria-live="polite"]').waitFor({ state: "attached" });
    await page.locator('main ul[aria-busy="true"]').waitFor();
    assert.ok(release, "Loading state is shown while request is pending");
    delayed = false;
    release();
    await page.locator("main ul#ps-mon-lista > li").first().waitFor();
    console.log(`PASS zero/one/two/three, drafts, error and loading: ${language}`);
    await page.close();
  }
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`All Monitor editorial checks passed. Screenshots: ${screenshots}`);
} finally {
  await browser.close();
}
