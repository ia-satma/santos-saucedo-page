import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.VISUAL_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const screenshots = process.env.MONITOR_SCREENSHOTS_DIR ?? "/tmp/ss-monitor-editorial";
await mkdir(screenshots, { recursive: true });
const response = await fetch(`${baseURL}/api/news`);
assert.ok(response.ok, "Public news API is available");
const articles = await response.json();
assert.ok(articles.length >= 3, "Development fixture has three real publications");
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/repl/tools/bin/chromium",
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

async function open(page) {
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.locator("#news").waitFor();
  const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
  if (await reject.isVisible()) await reject.click();
}

async function assertLayout(page, count) {
  const section = page.locator("#news");
  assert.equal(await section.locator("article").count(), count);
  const metrics = await section.evaluate(el => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    titles: [...el.querySelectorAll("h3")].map(h => ({
      clipped: h.scrollHeight > h.clientHeight + 1,
      overflow: h.scrollWidth > h.clientWidth + 1,
    })),
    excerpts: [...el.querySelectorAll("article a > div > p:not(.ss-label)")].map(p => ({
      height: p.getBoundingClientRect().height, line: parseFloat(getComputedStyle(p).lineHeight),
    })),
  }));
  assert.equal(metrics.overflow, false, "No horizontal page overflow");
  assert.ok(metrics.titles.every(t => !t.clipped && !t.overflow), "Full titles remain readable");
  assert.ok(metrics.excerpts.every(p => p.height <= p.line + 1), "Excerpts occupy at most one line");
  for (const link of await section.locator("article a").all()) {
    assert.match(await link.getAttribute("href"), /^\/news\/[^/]+$/);
    assert.ok((await link.getAttribute("aria-label")).length > 0, "Complete accessible link title");
  }
}

try {
  for (const [language, width] of [["es", 1440], ["es", 768], ["es", 375], ["es", 320], ["en", 1440], ["en", 375]]) {
    const page = await pageFor(language, width);
    await open(page);
    await page.locator("#news article").first().waitFor();
    await page.locator("#news").evaluate(el => window.scrollTo({ top: el.offsetTop - 160, behavior: "instant" }));
    await page.locator("#news img").evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await assertLayout(page, 3);
    assert.equal(await page.locator("#news img").count(), 3);
    assert.ok(await page.locator("#news img").evaluateAll(images => images.every(i => i.naturalWidth > 0 && getComputedStyle(i).filter === "none")));
    await page.locator("#news").screenshot({ path: `${screenshots}/${language}-${width}.png` });
    const first = page.locator("#news article a").first();
    const target = await first.getAttribute("href");
    await first.click();
    await page.waitForURL(`**${target}`);
    await page.locator("h1").waitFor({ state: "visible" });
    await page.goto(`${baseURL}/news`, { waitUntil: "domcontentloaded" });
    await page.locator('main a[href^="/news/"]').first().waitFor();
    assert.equal(await page.getByTestId("home-monitor-stories").count(), 0, "Archive keeps its original presentation");
    console.log(`PASS real publications, images, layout, links and archive: ${language} ${width}px`);
    await page.close();
  }

  for (const language of ["es", "en"]) {
    const page = await pageFor(language, 375);
    let items = [];
    let status = 200;
    let delayed = false;
    let release;
    await page.route("**/api/news", async route => {
      if (delayed) await new Promise(resolve => { release = resolve; });
      await route.fulfill({ status, json: status === 200 ? items : { message: "Test service unavailable" } });
    });
    for (const count of [0, 1, 2, 3]) {
      items = articles.slice(0, count);
      await open(page);
      if (count) await page.locator("#news article").first().waitFor();
      else await page.locator("#news [role=status]").filter({ hasText: language === "es" ? "Aún no" : "There are no" }).waitFor();
      await assertLayout(page, count);
    }
    // Future news may lack an image; a failed editor URL must not remove its link/title.
    items = [
      { ...articles[0], slug: "editorial-without-image", imageUrl: null },
      { ...articles[1], imageUrl: "/uploads/monitor-test-image-missing.webp" },
      { ...articles[2], published: false, featuredHome: true },
    ];
    await open(page);
    await page.locator("#news article").first().waitFor();
    await page.locator("#news").scrollIntoViewIfNeeded();
    await page.locator("#news").getByText(language === "es" ? "Imagen no disponible" : "Image unavailable").first().waitFor();
    await assertLayout(page, 2);
    assert.equal(await page.locator("#news article h3").count(), 2, "Draft excluded, image failure retains articles");
    status = 503;
    await open(page);
    await page.locator("#news [role=status]").filter({ hasText: language === "es" ? "No fue posible" : "could not" }).waitFor();
    assert.equal(await page.locator("#news article").count(), 0);
    status = 200;
    items = articles;
    delayed = true;
    await open(page);
    await page.locator('#news [role=status][aria-live="polite"]').waitFor();
    assert.ok(release, "Loading state is shown while request is pending");
    delayed = false;
    release();
    await page.locator("#news article").first().waitFor();
    console.log(`PASS zero/one/two/three, missing image, failed image, drafts, error and loading: ${language}`);
    await page.close();
  }
  // Simulate an empty bucket, including initial DB storage URLs and freshly seeded nulls.
  const fresh = await pageFor("es", 1440);
  let freshArticles = articles;
  await fresh.route("**/media/**", route => route.fulfill({ status: 404, body: "Empty storage bucket" }));
  await fresh.route("**/api/news", route => route.fulfill({ json: freshArticles }));
  for (const seededWithImages of [true, false]) {
    freshArticles = seededWithImages ? articles : articles.map(item => ({ ...item, imageUrl: null }));
    await open(fresh);
    await fresh.locator("#news article").first().waitFor();
    await fresh.locator("#news").scrollIntoViewIfNeeded();
    await fresh.locator("#news img").evaluateAll(images => Promise.all(images.map(image => image.decode())));
    assert.equal(await fresh.locator("#news img").count(), 3);
    assert.ok(await fresh.locator("#news img").evaluateAll(images => images.every(image =>
      image.naturalWidth > 0 && new URL(image.src).pathname.startsWith("/editorial/"),
    )), "Bundled images load with empty App Storage");
  }
  await fresh.close();
  console.log("PASS fresh installation with empty App Storage, with and without initial image URLs");
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`All Monitor editorial checks passed. Screenshots: ${screenshots}`);
} finally {
  await browser.close();
}
