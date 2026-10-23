import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.VISUAL_TEST_BASE_URL
  ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
const output = "/tmp/ss-photo-page-headers";
await mkdir(output, { recursive: true });
const routes = [
  "/about", "/practice-groups", "/team", "/news", "/contact",
  "/careers", "/careers/interns", "/testimonios", "/newsletter",
];
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/repl/tools/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [];
const clean = text => text.replace(/\s+/g, " ").trim();
const getJSON = async path => {
  const response = await fetch(`${baseURL}${path}`);
  assert.ok(response.ok, `${path} loads`);
  return response.json();
};
async function openPage(language, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(lang => {
    localStorage.setItem("ss_language", lang);
    localStorage.setItem("ss_language_detected", "true");
  }, language);
  await page.route("**/api/translations/**", route => route.fulfill({ json: { translations: {} } }));
  await page.route("**/api/translate-entity", route => route.fulfill({ status: 204 }));
  return page;
}
let checks = 0;
try {
  // Optional before-change capture, produced independently before implementation.
  let baseline;
  try { baseline = JSON.parse(await readFile("/tmp/ss-photo-headers-before.json", "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const sources = new Set();
  for (const [lang, width] of [
    ["es", 1440], ["es", 768], ["es", 375], ["ar", 375],
    ...["en", "de", "fr", "it", "ru", "zh", "ko", "ja"].map(lang => [lang, 320]),
  ]) {
    const page = await openPage(lang, width);
    const selected = ["es", "ar"].includes(lang) ? routes : ["/about", "/careers/interns", "/news"];
    for (const route of selected) {
      const label = `${route} ${lang} ${width}`;
      await page.goto(`${baseURL}${route}`);
      const hero = page.locator(".ss-photo-page-hero");
      await hero.locator("h1").waitFor();
      assert.equal(await page.locator("main h1").count(), 1, label);
      const image = hero.locator(".ss-photo-page-hero__image");
      await image.evaluate(img => img.decode());
      await page.evaluate(() => document.fonts.ready);
      const geometry = await hero.evaluate(el => {
        const r = el.getBoundingClientRect(), image = el.querySelector("img");
        const imgRect = image.getBoundingClientRect();
        const mark = getComputedStyle(el, "::before"), shade = getComputedStyle(el, "::after");
        return {
          x: r.x, width: r.width, height: r.height,
          imageWidth: imgRect.width, imageHeight: imgRect.height,
          imageFilter: getComputedStyle(image).filter,
          objectFit: getComputedStyle(image).objectFit,
          loaded: image.complete && image.naturalWidth > 0,
          src: image.getAttribute("src"),
          decorative: image.alt === "" && !!image.closest('[aria-hidden="true"]'),
          eager: image.loading === "eager" && image.getAttribute("fetchpriority") === "high",
          mark: Number(mark.zIndex), shade: Number(shade.zIndex),
          media: Number(getComputedStyle(image.parentElement).zIndex),
          content: Number(getComputedStyle(el.querySelector(".ss-container")).zIndex),
          text: [...el.querySelectorAll("h1,p")].map(text => {
            const box = text.getBoundingClientRect();
            return {
              inside: box.left >= r.left - 1 && box.right <= r.right + 1
                && box.top >= r.top - 1 && box.bottom <= r.bottom + 1,
              clipped: text.scrollWidth > text.clientWidth + 1
                || (text.scrollHeight > text.clientHeight + 1
                  && ["hidden", "clip"].includes(getComputedStyle(text).overflowY)),
            };
          }),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      assert.equal(geometry.x, 0, `${label}: edge-to-edge cover`);
      assert.equal(geometry.width, width, `${label}: full width`);
      assert.ok(geometry.height >= 420 && geometry.loaded, label);
      assert.ok(Math.abs(geometry.imageHeight - geometry.height) < 2
        && geometry.imageWidth === geometry.width, `${label}: cover fills banner`);
      assert.equal(geometry.objectFit, "cover", label);
      assert.equal(geometry.imageFilter, "none", `${label}: natural color`);
      assert.ok(geometry.decorative && geometry.eager, `${label}: decorative, priority-loaded`);
      assert.ok(geometry.media < geometry.shade && geometry.shade < geometry.mark
        && geometry.mark < geometry.content, `${label}: correct image/shade/mark/text stacking`);
      assert.ok(!geometry.overflow && geometry.text.every(text => text.inside && !text.clipped),
        `${label}: full text, no overflow or clipping`);
      sources.add(geometry.src);
      if (lang === "es" && width === 1440 && baseline) {
        await page.waitForLoadState("networkidle");
        const current = await page.locator("main").evaluate(main => {
          const clean = s => s.replace(/\s+/g, " ").trim(), copy = main.cloneNode(true);
          const hero = copy.querySelector(".editorial-page-hero");
          const heroText = clean(hero.textContent);
          hero.remove();
          return {
            heroText, bodyText: clean(copy.textContent),
            bodyImages: [...copy.querySelectorAll("img")].map(img => img.getAttribute("src")),
          };
        });
        assert.deepEqual(current, baseline[route], `${label}: all copy and body photos preserved`);
      }
      const skip = page.getByTestId("link-skip-to-main");
      await skip.focus();
      assert.ok(await skip.evaluate(el => el === document.activeElement), `${label}: keyboard navigation`);
      const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
      if (await reject.isVisible()) await reject.click();
      if (lang === "es" && [1440, 375].includes(width)) {
        await page.screenshot({ path: `${output}/${width}-${route.slice(1).replaceAll("/", "-")}.png` });
      }
      checks++;
    }
    await page.close();
  }
  assert.ok(sources.size >= 7, "Each section has a considered image; not the same photo everywhere");
  const [practices, team, news] = await Promise.all([
    getJSON("/api/practice-groups"), getJSON("/api/team"), getJSON("/api/news"),
  ]);
  const page = await openPage("es", 1440);
  for (const route of [
    "/", "/offices", "/terms", "/privacy-policy", "/testimonios/escribir",
    "/newsletter/unsubscribe", "/not-a-page",
    `/practice-groups/${practices[0].slug}`, `/team/${team[0].slug}`, `/news/${news[0].slug}`,
  ]) {
    await page.goto(`${baseURL}${route}`);
    await page.locator("h1").first().waitFor();
    assert.equal(await page.locator(".ss-photo-page-hero").count(), 0,
      `${route}: excluded page retains its existing header`);
  }
  await page.close();

  // No external writes: simulate a failed image, then a CMS media refresh in this browser only.
  const config = await getJSON("/api/site-config");
  const failed = await openPage("es", 375);
  let replacement = false;
  await failed.route("**/api/site-config", route => route.fulfill({
    json: {
      ...config, media: { ...config.media, photos: {
        ...config.media?.photos,
        salaPanoramica: replacement
          ? { url: "/editorial/oficina-sala-panoramica-1536.webp",
            smallUrl: "/editorial/oficina-sala-panoramica-768.webp" }
          : { url: "/missing-header-image.webp", smallUrl: "/missing-header-small.webp" },
      } },
    },
  }));
  await failed.route("**/missing-header-*.webp", route => route.abort());
  await failed.goto(`${baseURL}/about`);
  const cover = failed.locator(".ss-photo-page-hero");
  await cover.locator("h1").waitFor();
  await cover.locator("img").waitFor({ state: "detached" });
  const fallbackSize = await cover.boundingBox();
  assert.equal(await cover.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(24, 23, 91)");
  assert.ok(await cover.locator("h1").isVisible(), "Failed image preserves title and navy surface");
  replacement = true;
  await failed.evaluate(() => window.dispatchEvent(new Event("ss:cms-catalog-saved")));
  await cover.locator("img").waitFor();
  await cover.locator("img").evaluate(img => img.decode());
  assert.deepEqual(await cover.boundingBox(), fallbackSize, "Loading replacement creates no layout shift");
  await failed.close();
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS: ${checks} photographic headers across 10 languages; copy/body parity, loading, RTL, exclusions and failed-source recovery. Captures: ${output}`);
} finally {
  await browser.close();
}
