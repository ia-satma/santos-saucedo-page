import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.VISUAL_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const output = "/tmp/ss-practice-directory";
await mkdir(output, { recursive: true });
const response = await fetch(`${baseURL}/api/practice-groups`);
assert.ok(response.ok);
const groups = await response.json();
assert.equal(groups.length, 4, "The real catalog contains four practices");
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ?? (existsSync("/repl/tools/bin/chromium") ? "/repl/tools/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const errors = [];

async function pageFor(language, width, { cached = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(lang => {
    localStorage.setItem("ss_language", lang);
    localStorage.setItem("ss_language_detected", "true");
  }, language);
  // Explicitly exercise cached translations / English source, without starting paid jobs.
  await page.route("**/api/translations/**", route => route.fulfill({
    json: { translations: cached ? { description: "Beschreibung aus der gespeicherten Übersetzung." } : {} },
  }));
  await page.route("**/api/translate-entity", route => route.fulfill({ status: 204 }));
  return page;
}

async function open(page) {
  await page.goto(`${baseURL}/practice-groups`, { waitUntil: "domcontentloaded" });
  const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
  if (await reject.isVisible()) await reject.click();
}

async function checkRows(page, language, items = groups) {
  await page.getByTestId(`link-practice-group-${items[0].slug}`).waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (const group of items) {
    const link = page.getByTestId(`link-practice-group-${group.slug}`);
    const heading = page.getByTestId(`text-practice-group-name-${group.slug}`);
    const description = page.getByTestId(`text-practice-group-desc-${group.slug}`);
    assert.equal(await link.getAttribute("href"), `/practice-groups/${group.slug}`);
    assert.equal(await link.getAttribute("aria-labelledby"), await heading.getAttribute("id"));
    assert.equal(await link.getAttribute("aria-describedby"), await description.getAttribute("id"));
    if (language === "es" || language === "en") {
      assert.equal(await heading.innerText(), language === "es" ? group.nameEs : group.name);
      assert.equal(await description.innerText(), language === "es" ? group.descriptionEs : group.description);
    }
    const image = link.locator("img");
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img => img.decode());
    assert.equal(await image.getAttribute("alt"), "", "Image doesn't repeat accessible link name");
    assert.equal(await image.getAttribute("src"), `/editorial/practice-${({
        "laboral-seguridad-social": "laboral",
        "corporativo-contractual": "corporativo",
        migratorio: "migratorio",
        "litigio-contencioso": "litigio",
      })[group.slug]}.webp`);
    assert.ok(await image.evaluate(img => img.naturalWidth > 0 && getComputedStyle(img).filter === "none"));
    const layout = await link.evaluate(el => {
      const heading = el.querySelector("h2");
      const p = el.querySelector("p");
      return {
        // CJK glyph ink may extend a few pixels beyond the line box without being clipped.
        headingFits: heading.scrollWidth <= heading.clientWidth + 1
          && getComputedStyle(heading).overflowY === "visible"
          && getComputedStyle(heading).webkitLineClamp === "none",
        paragraphFits: p.scrollHeight <= p.clientHeight + 1 && p.scrollWidth <= p.clientWidth + 1,
        justify: getComputedStyle(p).textAlign,
        hyphens: getComputedStyle(p).hyphens,
        imageWidth: el.querySelector("img").getBoundingClientRect().width,
      };
    });
    assert.ok(layout.headingFits && layout.paragraphFits, `Complete readable text: ${language} ${group.slug}`);
    assert.equal(layout.justify, "justify");
    assert.equal(layout.hyphens, "none");
    assert.ok(layout.imageWidth > 240, "Photo has substantial presence, not a thumbnail");
    await link.focus();
    // A real keyboard key puts the browser into focus-visible modality.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    assert.ok(await link.evaluate(el => el.matches(":focus-visible")
      && getComputedStyle(el).outlineStyle !== "none"), "Visible keyboard focus");
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal overflow");
}

async function checkPhotoParity(width, items = groups) {
  const page = await pageFor("es", width);
  await page.route("**/api/practice-groups", route => route.fulfill({ json: items }));
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  const homePhotos = {};
  for (const group of items) {
    const image = page.locator(`#practices a[href="/practice-groups/${group.slug}"] img`);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img => img.decode());
    homePhotos[group.slug] = await image.getAttribute("src");
  }
  await open(page);
  for (const group of items) {
    const image = page.getByTestId(`link-practice-group-${group.slug}`).locator("img");
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img => img.decode());
    assert.equal(await image.getAttribute("src"), homePhotos[group.slug], `Same photo on both pages: ${group.slug}`);
    assert.ok(await image.evaluate(img => img.complete && img.naturalWidth > 0));
  }
  await page.close();
  console.log(`PASS matching homepage/directory photographs: ${width}px`);
}

try {
  // Record images may be empty, older office photographs or another area's photograph.
  const oldImages = groups.map((group, index) => ({
    ...group,
    imageUrl: ["/editorial/oficina-biblioteca-1536.webp", "/editorial/practice-migratorio.webp", "", null][index],
  }));
  for (const width of [1440, 375]) {
    await checkPhotoParity(width);
    await checkPhotoParity(width, oldImages);
  }
  for (const [language, width] of [
    ["es", 1440], ["es", 1024], ["es", 768], ["es", 375], ["es", 320],
    ["en", 1440], ["en", 375], ["de", 768], ["de", 320], ["ru", 375],
    ["ar", 1440], ["ar", 375], ["fr", 375], ["it", 375], ["zh", 375], ["ja", 375], ["ko", 375],
  ]) {
    const page = await pageFor(language, width);
    await open(page);
    await checkRows(page, language);
    if (language === "ar") {
      assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
      const source = page.getByTestId(`text-practice-group-desc-${groups[0].slug}`);
      assert.equal(await source.getAttribute("lang"), "en");
      assert.equal(await source.locator("bdi").getAttribute("dir"), "ltr");
    }
    if (["es", "en", "ar"].includes(language)) {
      await page.locator("main").screenshot({ path: `${output}/${language}-${width}.png` });
    }
    if (language === "es" && width === 1440) {
      for (const group of groups) {
        const link = page.getByTestId(`link-practice-group-${group.slug}`);
        await link.focus();
        await page.keyboard.press("Enter");
        await page.waitForURL(`**/practice-groups/${group.slug}`);
        await page.locator("main h1").waitFor();
        await open(page);
      }
    }
    console.log(`PASS real images, complete content, links, focus and layout: ${language} ${width}px`);
    await page.close();
  }

  const edited = await pageFor("es", 375);
  const custom = groups.map((g, i) => ({
    ...g,
    nameEs: i === 0 ? "Nombre editado de práctica" : g.nameEs,
    descriptionEs: i === 0 ? `${g.descriptionEs} Texto adicional aprobado desde el editor.` : g.descriptionEs,
    imageUrl: i === 0 ? "/editorial/practice-migratorio.webp" : null,
  }));
  await edited.route("**/api/practice-groups", route => route.fulfill({ json: custom }));
  await edited.route("**/api/site-config", async route => {
    const original = await route.fetch();
    const config = await original.json();
    await route.fulfill({ json: { ...config, practices: { es: { subtitle: "Introducción editada desde el panel." } } } });
  });
  await open(edited);
  await checkRows(edited, "es", custom);
  assert.equal(await edited.getByTestId("text-practice-groups-subtitle").innerText(), "Introducción editada desde el panel.");
  await edited.close();
  const translated = await pageFor("de", 375, { cached: true });
  await open(translated);
  await translated.getByTestId(`text-practice-group-desc-${groups[0].slug}`)
    .filter({ hasText: "Beschreibung aus der gespeicherten Übersetzung." }).waitFor();
  assert.equal(await translated.getByTestId(`text-practice-group-desc-${groups[0].slug}`).getAttribute("lang"), null);
  await translated.close();
  console.log("PASS edited CMS/catalog text, approved photos despite image overrides, and cached translation");

  for (const language of ["es", "en"]) {
    for (const state of ["empty", "error", "loading"]) {
      const page = await pageFor(language, 375);
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      await page.route("**/api/practice-groups", async route => {
        if (state === "loading") await gate;
        await route.fulfill({ status: state === "error" ? 500 : 200, json: state === "error" ? { message: "Unavailable" } : [] });
      });
      await open(page);
      if (state === "loading") {
        await page.getByTestId("skeleton-practice-group-0").waitFor();
        assert.equal(await page.locator('[data-testid^="skeleton-practice-group-"]').count(), 4);
      } else {
        await page.getByTestId(`container-practice-groups-${state}`).waitFor();
        assert.equal(await page.locator('main a[href^="/practice-groups/"]').count(), 0);
      }
      release();
      await page.close();
      console.log(`PASS ${language} ${state} state`);
    }
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
} finally {
  await browser.close();
}
