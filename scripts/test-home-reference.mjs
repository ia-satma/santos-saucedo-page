import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.VISUAL_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const output = process.env.HERO_SCREENSHOTS_DIR ?? "/tmp/ss-home-reference";
await fs.mkdir(output, { recursive: true });
const baseline = await fs.readFile(`${output}/baseline.json`, "utf8").then(JSON.parse).catch(() => null);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/repl/tools/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [];
let cases = 0;

async function pageFor(language = "es", width = 1440, height = 900, paused = true, saveData = false, reduced = false) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: reduced ? "reduce" : "no-preference" });
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(({ language, paused, saveData }) => {
    localStorage.setItem("ss_language", language);
    localStorage.setItem("ss_language_detected", "true");
    if (paused) localStorage.setItem("ss-hero-video", "paused");
    if (saveData) Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
  }, { language, paused, saveData });
  // Never send real form submissions, translation requests or writes during UI checks.
  await page.route("**/api/**", route => /^(GET|HEAD|OPTIONS)$/.test(route.request().method())
    ? route.fallback() : route.fulfill({ status: 403, json: { message: "Writes disabled in hero UI verification" } }));
  return page;
}

async function open(page) {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator("#hero h1").waitFor();
  const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
  if (await reject.isVisible()) await reject.click();
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#hero .ss-hero-media img").evaluateAll(images =>
    Promise.all(images.map(image => image.decode())));
}

async function assertLayout(page, label) {
  const metrics = await page.locator("#hero").evaluate(hero => {
    const rect = hero.getBoundingClientRect();
    const box = el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; };
    const content = [...hero.querySelectorAll("h1,p,.ss-hero-cta")].map(el => ({
      text: el.textContent.trim(), ...box(el), clipped: el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1,
    }));
    const title = box(hero.querySelector(".ss-hero-copy"));
    const ctas = [...hero.querySelectorAll(".ss-hero-cta")].map(box);
    const toggle = hero.querySelector(".ss-hero-toggle");
    const mark = getComputedStyle(hero.querySelector(".ss-hero-mark"));
    const overlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return {
      top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width, vh: innerHeight,
      content, overflow: document.documentElement.scrollWidth > innerWidth + 1,
      overlap: ctas.some(cta => overlap(title, cta) || (toggle && overlap(cta, box(toggle)))),
      mask: mark.maskImage, markWidth: parseFloat(mark.width), markHeight: parseFloat(mark.height),
      veil: getComputedStyle(hero.querySelector(".ss-hero-veil")).backgroundColor,
    };
  });
  assert.equal(metrics.overflow, false, `${label}: no horizontal overflow`);
  assert.ok(metrics.height >= metrics.vh * .98 && metrics.height <= metrics.vh * 1.12, `${label}: approximately one viewport (${metrics.height}px)`);
  assert.equal(metrics.overlap, false, `${label}: title, CTA and video control do not overlap`);
  assert.ok(metrics.content.every(item => !item.clipped && item.left >= -1 && item.right <= metrics.width + 1
    && item.top >= metrics.top - 1 && item.bottom <= metrics.bottom + 1), `${label}: full text inside hero`);
  assert.match(metrics.mask, /seccion.*svg/, `${label}: official monogram`);
  assert.ok(Math.abs(metrics.markWidth / metrics.markHeight - 1200 / 1838) < .01, `${label}: monogram not distorted`);
  assert.notEqual(metrics.veil, "rgba(0, 0, 0, 0)", `${label}: contrast overlay`);
  assert.equal(await page.locator("main h1").count(), 1, `${label}: single semantic h1`);
  assert.equal(await page.locator("#hero h1 img").count(), 0, `${label}: title is real HTML`);
  for (const link of await page.locator(".ss-hero-cta").all()) {
    await link.focus();
    const outline = await link.evaluate(el => getComputedStyle(el).outlineWidth);
    assert.ok(parseFloat(outline) >= 2, `${label}: keyboard focus visible`);
  }
  cases++;
}

async function body(page) {
  return page.locator("main").evaluate(main => [...main.children].filter(el => el.id !== "hero").map(el => ({
    id: el.id, text: el.textContent.replace(/\s+/g, " ").trim(),
    images: [...el.querySelectorAll("img")].map(image => ({ src: image.getAttribute("src"), alt: image.alt })),
    links: [...el.querySelectorAll("a")].map(link => ({ href: link.getAttribute("href"), text: link.textContent.trim() })),
  })));
}

try {
  for (const [language, width, height] of [
    ["es", 1440, 660], ["es", 1440, 900], ["es", 1920, 1080],
    ["es", 768, 1024], ["es", 375, 812], ["es", 320, 700],
    ["en", 1440, 900], ["en", 375, 812], ["ar", 1440, 900], ["ar", 320, 700],
  ]) {
    const page = await pageFor(language, width, height);
    await open(page);
    const label = `${language} ${width}x${height}`;
    await assertLayout(page, label);
    assert.match(await page.locator(".ss-hero-year").textContent(), /2010/);
    assert.equal(await page.locator(".ss-hero-cta").nth(0).getAttribute("href"), "/about");
    assert.equal(await page.locator(".ss-hero-cta").nth(1).getAttribute("href"), "/contact");
    // Focusing a link may scroll it into view; transparency applies at the top, not after scrolling.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('header[data-testid="header"]')).backgroundColor === "rgba(0, 0, 0, 0)");
    assert.equal(await page.getByTestId("header").evaluate(el => getComputedStyle(el).backgroundColor), "rgba(0, 0, 0, 0)");
    if (width === 1440) {
      if (baseline?.[language]) assert.deepEqual(await body(page), baseline[language].body, `${label}: other sections unchanged`);
      assert.equal(await page.getByTestId("button-mobile-menu").isVisible(), false);
      assert.ok(await page.locator("#main-navigation > ul").isVisible());
    } else if (width < 1280) {
      const menu = page.getByTestId("button-mobile-menu");
      await menu.click();
      assert.ok(await page.getByTestId("modal-mobile-menu").isVisible());
      await page.keyboard.press("Escape");
      assert.ok(await menu.evaluate(el => el === document.activeElement), `${label}: menu restores focus`);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${output}/after-${language}-${width}-${height}.png` });
    if (width === 1440 && height === 900 && baseline?.[language]) {
      await page.goto(`${base}/team`, { waitUntil: "networkidle" });
      const hero = await page.locator(".editorial-page-hero").evaluate(el =>
        el.outerHTML.replace(/ data-replit-metadata="[^"]*"/g, ""));
      assert.equal(hero, baseline[language].teamHero, `${label}: internal banner unchanged`);
    }
    await page.close();
  }

  const page = await pageFor();
  await open(page);
  await page.getByTestId("button-search").click();
  assert.ok(await page.locator("#search-dialog").isVisible(), "Search opens");
  await page.keyboard.press("Escape");
  assert.ok(await page.getByTestId("button-search").evaluate(el => el === document.activeElement));
  for (const [index, route] of [[0, "/about"], [1, "/contact"]]) {
    await page.locator(".ss-hero-cta").nth(index).click();
    await page.waitForURL(`**${route}`);
    assert.ok(await page.locator("main h1").isVisible());
    await open(page);
  }
  const language = page.locator('header button[lang="en"]');
  await language.click();
  await page.getByText("Business law firm", { exact: true }).waitFor();
  assert.match(await page.locator(".ss-hero-year").textContent(), /2010/);
  await page.close();
  cases += 4;

  const cms = await pageFor("es", 320, 812);
  const config = await (await cms.request.get(`${base}/api/site-config`)).json();
  config.home = { ...config.home, es: { ...config.home?.es, hero: {
    eyebrow: "Asesoría empresarial y defensa legal para nuestros clientes",
    titleFirst: "Firma Santos", titleSecond: "Saucedo Abogados",
    primaryCta: "Conozca nuestra firma y sus áreas de práctica",
    secondaryCta: "Hable con nuestro equipo",
    tagline: "Asesoría laboral y acompañamiento jurídico de empresas",
    place: ["San Pedro Garza García", "Desde 2010"],
  } } };
  config.links = { ...config.links, about: "/offices", contact: "/careers" };
  await cms.route("**/api/site-config", route => route.fulfill({ json: config }));
  await open(cms);
  await cms.getByText("Asesoría empresarial y defensa legal para nuestros clientes", { exact: true }).waitFor();
  assert.equal(await cms.locator(".ss-hero-cta").nth(0).getAttribute("href"), "/offices");
  assert.equal(await cms.locator(".ss-hero-cta").nth(1).getAttribute("href"), "/careers");
  await assertLayout(cms, "Edited CMS text at 320px");
  await cms.close();

  const saving = await pageFor("es", 375, 812, false, true);
  await open(saving);
  assert.equal(await saving.locator("#hero video").count(), 0, "Save data keeps poster");
  assert.match(await saving.getByTestId("button-hero-video").getAttribute("aria-label"), /Reproducir/);
  await saving.close();

  const reduced = await pageFor("es", 375, 812, true, false, true);
  await open(reduced);
  await assertLayout(reduced, "Reduced motion");
  assert.equal(await reduced.locator(".ss-hero-cta").first().evaluate(el => getComputedStyle(el).transitionDuration), "0s");
  await reduced.close();

  const playing = await pageFor("es", 1440, 900, false);
  await open(playing);
  const video = playing.locator("#hero video");
  await video.waitFor();
  await playing.waitForFunction(() => { const v = document.querySelector("#hero video"); return v && v.readyState >= 2 && !v.paused; });
  assert.equal(await video.getAttribute("muted"), "", "Muted autoplay attribute");
  await playing.getByTestId("button-hero-video").click();
  assert.ok(await video.evaluate(el => el.paused), "User can pause");
  await playing.reload({ waitUntil: "networkidle" });
  assert.equal(await playing.locator("#hero video").count(), 0, "Saved pause survives refresh");
  await playing.getByTestId("button-hero-video").click();
  await playing.waitForFunction(() => { const v = document.querySelector("#hero video"); return v && !v.paused; });
  await playing.evaluate(() => window.scrollTo(0, innerHeight * 2));
  await playing.waitForFunction(() => document.querySelector("#hero video")?.paused);
  await playing.close();
  cases += 4;

  const failed = await pageFor("es", 375, 812, false);
  await failed.route("**/*.mp4", route => route.abort());
  await open(failed);
  await failed.waitForFunction(() => document.querySelector("#hero img")?.complete);
  await failed.locator("#hero .ss-hero-media img").waitFor();
  assert.ok(await failed.locator("#hero .ss-hero-media img").evaluate(el => el.naturalWidth > 0), "Failed video returns to original poster");
  await failed.close();
  cases++;

  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS ${cases} home-reference layouts and interactions; original body/internal banner preserved. Captures: ${output}`);
} finally {
  await browser.close();
}
