import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { monitorArticles } from "./monitor-fixture.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const baselines = path.join(root, "tests/visual/monitor");
const results = path.join(root, "generated-artifacts/monitor");
const update = process.env.UPDATE_VISUAL_SNAPSHOTS === "1";
const verifyDetector = process.argv.includes("--verify-detector");
assert.ok(!(update && verifyDetector), "Do not update baselines during detector verification");
// Sticky navigation is outside this section's scope. Keep its layout space,
// but exclude its scroll-dependent overlay from the section capture.
const screenshotOptions = {
  animations: "disabled", caret: "hide",
  style: "header { visibility: hidden !important; }",
};
const cases = [
  ["es", "desktop", 1440, 1000],
  ["es", "mobile", 375, 812],
  ["en", "desktop", 1440, 1000],
  ["en", "mobile", 375, 812],
];

// A small per-channel tolerance permits minor antialiasing differences. Comparing
// 128px tiles as well as the section prevents whitespace diluting a title/crop change.
export async function compareMonitorImages(actual, expected, diffPath) {
  const [a, b] = await Promise.all([actual, expected].map(image =>
    sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
    return { matches: false, reason: `dimensions ${a.info.width}×${a.info.height} instead of ${b.info.width}×${b.info.height}` };
  }
  const diff = Buffer.alloc(a.data.length);
  const tiles = new Map();
  let changed = 0;
  for (let i = 0; i < a.data.length; i += 3) {
    const differs = [0, 1, 2].some(c => Math.abs(a.data[i + c] - b.data[i + c]) > 20);
    if (differs) {
      changed++;
      const pixel = i / 3;
      const tile = `${Math.floor((pixel % a.info.width) / 128)},${Math.floor(pixel / a.info.width / 128)}`;
      tiles.set(tile, (tiles.get(tile) ?? 0) + 1);
    }
    diff[i] = differs ? 255 : Math.round(b.data[i] * 0.25);
    diff[i + 1] = differs ? 0 : Math.round(b.data[i + 1] * 0.25);
    diff[i + 2] = differs ? 80 : Math.round(b.data[i + 2] * 0.25);
  }
  const ratio = changed / (a.info.width * a.info.height);
  const maxTilePixels = Math.max(0, ...tiles.values());
  const matches = ratio <= 0.002 && maxTilePixels <= 128 * 128 * 0.03;
  if (diffPath && !matches) {
    await sharp(diff, { raw: { width: a.info.width, height: a.info.height, channels: 3 } }).png().toFile(diffPath);
  }
  return { matches, reason: `${(ratio * 100).toFixed(3)}% pixels changed (limit 0.200%); busiest tile ${maxTilePixels}px (limit 491px)` };
}

export async function runMonitorVisualChecks(browser, baseURL) {
  await mkdir(results, { recursive: true });
  if (update) await mkdir(baselines, { recursive: true });
  const failures = [];
  const manifest = { browser: browser.version(), platform: process.platform, cases: {} };
  for (const [language, device, width, height] of cases) {
    const name = `${language}-${device}`;
    const context = await browser.newContext({
      viewport: { width, height }, deviceScaleFactor: 1,
      locale: language === "es" ? "es-MX" : "en-US", timezoneId: "UTC",
      reducedMotion: "reduce", colorScheme: "light", serviceWorkers: "block",
    });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.addInitScript(lang => {
        localStorage.setItem("ss_language", lang);
        localStorage.setItem("ss_language_detected", "true");
      }, language);
      await page.route("**/api/news", route => route.fulfill({ json: monitorArticles }));
      // Ignore edits to CMS copy while still exercising the real section and CSS.
      await page.route("**/api/site-config", route => route.fulfill({ json: {} }));
      await page.route("**/__monitor_visual__/*", async route => {
        const filename = new URL(route.request().url()).pathname.split("/").pop();
        assert.ok(monitorArticles.some(item => item.imageUrl.endsWith(`/${filename}`)));
        await route.fulfill({
          contentType: "image/webp",
          body: await readFile(path.join(root, "client/public/editorial", filename)),
        });
      });
      await page.goto(baseURL, { waitUntil: "domcontentloaded" });
      const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
      if (await reject.isVisible()) await reject.click();
      const section = page.locator("#news");
      await section.locator("article").nth(2).waitFor();
      // Trigger every lazy image, even cards below the mobile viewport.
      for (const image of await section.locator("img").all()) await image.scrollIntoViewIfNeeded();
      await section.evaluate(async el => {
        await Promise.all([...el.querySelectorAll("img")].map(image => image.decode()));
        for (const family of ["SS Serif", "SS Sans"]) {
          const loaded = await document.fonts.load(`400 24px "${family}"`, "Prevención Laboral");
          if (!loaded.length || loaded.some(font => font.status !== "loaded")) {
            throw new Error(`Font failed: ${family}`);
          }
        }
        await document.fonts.ready;
      });
      assert.equal(await section.locator("img").count(), 3, `${name}: all fixture images loaded`);
      await section.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      // Do not capture a partially visible heading if reveal animations return.
      await page.waitForFunction(() => [...document.querySelectorAll("#news h2, #news h2 *")]
        .every(el => {
          for (let node = el; node && node.id !== "news"; node = node.parentElement) {
            if (Number(getComputedStyle(node).opacity) < 1) return false;
          }
          return true;
        }));
      assert.deepEqual(errors, [], `${name}: no runtime errors`);
      const targets = [section];
      manifest.cases[name] = [];
      for (const [index, target] of targets.entries()) {
        const key = index === 0 ? name : `${name}-card-${index}`;
        const reference = path.join(baselines, `${key}.webp`);
        const actual = await target.screenshot(screenshotOptions);
        const metadata = await sharp(actual).metadata();
        manifest.cases[name].push({ key, width: metadata.width, height: metadata.height });
        if (update) {
          await sharp(actual).webp({ lossless: true, effort: 6 }).toFile(reference);
          console.log(`UPDATED ${key}`);
        } else {
          const actualPath = path.join(results, `${key}-actual.png`);
          const diffPath = path.join(results, `${key}-diff.png`);
          await rm(diffPath, { force: true });
          await writeFile(actualPath, actual);
          let expected;
          try { expected = await readFile(reference); }
          catch { throw new Error(`Missing baseline ${reference}. Review and create references with npm run test:visual:monitor:update.`); }
          const comparison = await compareMonitorImages(actual, expected, diffPath);
          if (!comparison.matches) {
            await writeFile(path.join(results, `${key}-expected.webp`), expected);
            failures.push(`${key}: ${comparison.reason}`);
          }
          console.log(`${comparison.matches ? "PASS" : "FAIL"} ${key}: ${comparison.reason}`);
        }
      }
      if (verifyDetector) {
        const expected = await readFile(path.join(baselines, `${name}.webp`));
        for (const [regression, css] of [
          ["hierarchy", "#news article:first-child h3 { font-size: 18px !important; }"],
          ["spacing", '#news [data-testid="home-monitor-stories"] { gap: 0 !important; margin-top: 0 !important; }'],
          ["image-crop", "#news article img { object-position: 50% 100% !important; }"],
          ["clipped-title", "#news article h3 { max-height: 16px !important; overflow: hidden !important; }"],
        ]) {
          const style = await page.addStyleTag({ content: css });
          try {
            const mutated = await section.screenshot(screenshotOptions);
            const comparison = await compareMonitorImages(mutated, expected);
            assert.equal(comparison.matches, false, `${name}: detector missed ${regression}`);
            console.log(`PASS detector rejects ${name}/${regression}`);
          } finally {
            await style.evaluate(el => el.remove());
          }
        }
      }
    } finally {
      await context.close();
    }
  }
  await writeFile(path.join(results, "run.json"), JSON.stringify(manifest, null, 2));
  if (update) await writeFile(path.join(baselines, "environment.json"), JSON.stringify(manifest, null, 2));
  assert.equal(failures.length, 0, `Monitor visual regressions:\n${failures.join("\n")}\nInspect actual/expected/diff in ${results}. Do not update references without reviewing the changes.`);
}
