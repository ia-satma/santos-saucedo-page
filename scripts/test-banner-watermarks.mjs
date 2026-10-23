import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.VISUAL_TEST_BASE_URL
  ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
const output = "/tmp/ss-banner-watermarks";
await mkdir(output, { recursive: true });
async function catalog(path) {
  const response = await fetch(`${baseURL}/api/${path}`);
  assert.ok(response.ok, `Catalog ${path} loads`);
  return response.json();
}
const [practices, team, news] = await Promise.all(
  ["practice-groups", "team", "news"].map(catalog),
);
const routes = [
  "/about", "/practice-groups", "/team", "/news", "/contact",
  "/careers", "/careers/interns", "/privacy-policy", "/terms",
  "/testimonios", "/testimonios/escribir", "/newsletter", "/not-a-page",
  `/practice-groups/${practices[0].slug}`,
  `/team/${team[0].slug}`, `/news/${news[0].slug}`,
];
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ?? "/repl/tools/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [];
const assets = new Set();
let checks = 0;
try {
  for (const [language, width] of [
    ["es", 1440], ["es", 375], ["ar", 1440], ["ar", 375],
    ["de", 320], ["ja", 768],
  ]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(lang => {
      localStorage.setItem("ss_language", lang);
      localStorage.setItem("ss_language_detected", "true");
    }, language);
    // Read-only verification: no paid translation work or form submissions.
    await page.route("**/api/translations/**", route => route.fulfill({
      json: { translations: {} },
    }));
    await page.route("**/api/translate-entity", route => route.fulfill({ status: 204 }));
    const selected = language === "es" ? routes : [
      "/practice-groups", "/about", "/privacy-policy", `/news/${news[0].slug}`,
    ];
    for (const route of selected) {
      await page.goto(`${baseURL}${route}`);
      const hero = page.locator(".editorial-page-hero").first();
      await hero.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      const before = await hero.boundingBox();
      const mark = await hero.evaluate(el => {
        const css = getComputedStyle(el, "::before");
        const rect = el.getBoundingClientRect();
        return {
          content: css.content, mask: css.maskImage, z: css.zIndex,
          events: css.pointerEvents, opacity: css.backgroundColor,
          left: parseFloat(css.left), right: parseFloat(css.right),
          width: parseFloat(css.width), direction: getComputedStyle(el).direction,
          heroWidth: rect.width, heroHeight: rect.height,
          height: parseFloat(css.height), top: parseFloat(css.top),
          paper: el.classList.contains("editorial-page-hero--paper"),
          isolated: getComputedStyle(el).isolation,
        };
      });
      const label = `${language} ${width} ${route}`;
      assert.equal(mark.content, '""', `${label}: decorative empty content`);
      assert.match(mark.mask, /seccion.*\.svg/, `${label}: official symbol`);
      assets.add(mark.mask.match(/url\(["']?(.*?)["']?\)/)[1]);
      assert.equal(mark.z, "-1", `${label}: behind content`);
      assert.equal(mark.events, "none", `${label}: no click interception`);
      assert.equal(mark.isolated, "isolate", `${label}: contained stacking`);
      const color = mark.opacity.match(/[\d.]+/g).map(Number);
      assert.deepEqual(color.slice(0, 3), mark.paper ? [29, 28, 104] : [255, 255, 255]);
      // Chromium serializes alpha through an 8-bit channel; allow its rounding.
      assert.ok(Math.abs(color[3] - (mark.paper ? 0.035 : 0.055)) < 1 / 255);
      assert.ok(mark.left >= 0 && mark.right >= 0, `${label}: inside banner`);
      assert.equal(mark.top, 0);
      assert.ok(Math.abs(mark.height - mark.heroHeight) < 2);
      assert.ok(mark.direction === "rtl" ? mark.left < mark.right : mark.right < mark.left,
        `${label}: symbol follows inline-end`);
      assert.ok(await page.evaluate(() =>
        document.documentElement.scrollWidth <= innerWidth + 1), `${label}: no overflow`);
      const hidden = await page.addStyleTag({
        content: ".editorial-page-hero::before { content: none !important; }",
      });
      assert.deepEqual(await hero.boundingBox(), before, `${label}: layout unchanged`);
      await hidden.evaluate(el => el.remove());
      const reject = page.getByRole("button", {
        name: /^(Rechazar opcionales|Reject optional)$/,
      });
      if (await reject.isVisible()) await reject.click();
      if (["/practice-groups", "/privacy-policy"].includes(route) && language === "es") {
        await page.screenshot({ path: `${output}/${width}-${route.slice(1)}.png` });
      }
      checks++;
    }
    await page.close();
  }
  for (const url of assets) {
    const response = await fetch(new URL(url, baseURL));
    assert.ok(response.ok, "Official mask is served successfully");
    assert.equal(await response.text(),
      await readFile("attached_assets/ss26/seccion.svg", "utf8"));
  }
  const page = await browser.newPage();
  for (const route of ["/", "/offices", "/newsletter/unsubscribe", "/admin/login"]) {
    await page.goto(`${baseURL}${route}`);
    await page.locator(route === "/admin/login" ? "form" : "h1").first().waitFor();
    assert.equal(await page.locator(".editorial-page-hero").count(), 0,
      `${route}: existing non-editorial surfaces preserved`);
  }
  await page.close();
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS: ${checks} banner/viewport/language checks; official mask loads; layout and excluded surfaces preserved. Captures: ${output}`);
} finally {
  await browser.close();
}
