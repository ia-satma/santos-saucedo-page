import assert from "node:assert/strict";
import { chromium } from "playwright";
import { playwrightExecutablePath } from "./lib/playwright-runtime.mjs";

const base = (process.env.VISUAL_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000")).replace(/\/$/, "");
const browser = await chromium.launch({ executablePath: playwrightExecutablePath, args: ["--no-sandbox"] });
const errors = [];
let cases = 0;

function homeUrl(language) {
  return `${base}/${language}/`;
}

async function pageFor(language, width, height, { saveData = false, reducedMotion = false } = {}) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(({ language, saveData }) => {
    localStorage.setItem("ss_language", language);
    localStorage.setItem("ss_language_detected", "true");
    if (saveData) Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
  }, { language, saveData });
  await page.route("**/api/**", route => /^(GET|HEAD|OPTIONS)$/.test(route.request().method())
    ? route.fallback()
    : route.fulfill({ status: 403, json: { message: "Writes disabled in home verification" } }));
  return page;
}

async function open(page, language) {
  await page.goto(homeUrl(language), { waitUntil: "domcontentloaded" });
  await page.locator("[data-vista=\"inicio\"] #portada-h").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.fonts.status === "loaded");
  const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
  if (await reject.isVisible()) await reject.click();
  await page.locator("#portada img").first().evaluate(image => image.decode());
}

async function assertHome(page, label) {
  const metrics = await page.locator("#portada").evaluate(hero => {
    const rect = hero.getBoundingClientRect();
    const heading = hero.querySelector("h1").getBoundingClientRect();
    const poster = hero.querySelector("img");
    return {
      height: rect.height,
      viewport: innerHeight,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      headingVisible: heading.top >= rect.top && heading.bottom <= rect.bottom,
      posterLoaded: Boolean(poster?.complete && poster.naturalWidth > 0),
      video: Boolean(hero.querySelector("video")),
    };
  });
  assert.ok(metrics.height >= metrics.viewport * 0.8, `${label}: portada fills the viewport`);
  assert.equal(metrics.overflow, false, `${label}: no horizontal overflow`);
  assert.equal(metrics.headingVisible, true, `${label}: logo stays inside portada`);
  assert.equal(metrics.posterLoaded, true, `${label}: poster is loaded`);
  assert.equal(metrics.video, true, `${label}: video element remains available`);
  assert.equal(await page.locator("main h1").count(), 1, `${label}: one semantic h1`);
  assert.equal(await page.getByTestId("button-hero-video").count(), 1, `${label}: video control exists`);
  cases += 1;
}

try {
  for (const [language, width, height] of [
    ["es", 1440, 900], ["es", 768, 1024], ["es", 375, 812], ["es", 320, 700],
    ["en", 1440, 900], ["en", 375, 812], ["ar", 1440, 900], ["ar", 320, 700],
  ]) {
    const page = await pageFor(language, width, height);
    await open(page, language);
    await assertHome(page, `${language} ${width}x${height}`);
    if (width < 1280) {
      const menu = page.getByTestId("button-mobile-menu");
      await menu.click();
      assert.equal(await page.getByTestId("modal-mobile-menu").isVisible(), true, `${language} ${width}: mobile menu opens`);
      await page.keyboard.press("Escape");
      assert.equal(await menu.evaluate(element => element === document.activeElement), true, `${language} ${width}: menu restores focus`);
    }
    await page.close();
  }

  const interactive = await pageFor("es", 1440, 900);
  await open(interactive, "es");
  const video = interactive.locator("#portada video");
  const control = interactive.getByTestId("button-hero-video");
  await video.waitFor();
  await interactive.waitForFunction(() => document.querySelector("#portada video")?.readyState >= 2);
  await control.click();
  await interactive.waitForFunction(() => document.querySelector("#portada video")?.paused === true);
  assert.match(await control.getAttribute("aria-label"), /Reanudar|Resume/);
  await control.click();
  await interactive.waitForFunction(() => document.querySelector("#portada video")?.paused === false);
  assert.match(await control.getAttribute("aria-label"), /Pausar|Pause/);
  await interactive.close();

  const saveData = await pageFor("es", 375, 812, { saveData: true });
  await open(saveData, "es");
  assert.equal(await saveData.locator("#portada img").first().evaluate(image => image.naturalWidth > 0), true, "save-data keeps a usable poster");
  await saveData.close();

  const reduced = await pageFor("es", 375, 812, { reducedMotion: true });
  await open(reduced, "es");
  await assertHome(reduced, "reduced motion");
  await reduced.close();

  const failedVideo = await pageFor("es", 375, 812);
  await failedVideo.route("**/*.mp4", route => route.abort());
  await open(failedVideo, "es");
  assert.equal(await failedVideo.locator("#portada img").first().evaluate(image => image.naturalWidth > 0), true, "poster remains available when video fails");
  await failedVideo.close();

  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS ${cases} hydrated home layouts and interactions`);
} finally {
  await browser.close();
}
