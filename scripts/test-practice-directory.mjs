import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { playwrightExecutablePath } from "./lib/playwright-runtime.mjs";
import { localizedPublicPath } from "./lib/canonical-routes.mjs";

const baseURL = process.env.VISUAL_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const output = "/tmp/ss-practice-directory";
await mkdir(output, { recursive: true });
const response = await fetch(`${baseURL}/api/practice-groups`);
assert.ok(response.ok);
const groups = await response.json();
assert.equal(groups.length, 4, "The real catalog contains four practices");
const browser = await chromium.launch({
  executablePath: playwrightExecutablePath,
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

async function open(page, language = "es") {
  await page.goto(`${baseURL}${localizedPublicPath(language, "/practice-groups")}`, { waitUntil: "domcontentloaded" });
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
    assert.equal(await link.getAttribute("href"), localizedPublicPath(language, `/practice-groups/${group.slug}`));
    assert.equal(await link.getAttribute("aria-labelledby"), await heading.getAttribute("id"));
    assert.equal(await link.getAttribute("aria-describedby"), await description.getAttribute("id"));
    if (language === "es" || language === "en") {
      assert.equal(await heading.innerText(), language === "es" ? group.nameEs : group.name);
      assert.equal(await description.innerText(), language === "es" ? group.descriptionEs : group.description);
    }
    const image = link.locator("img");
    await image.waitFor({ state: "attached" });
    const imageSelector = `[data-testid="link-practice-group-${group.slug}"] img`;
    await image.evaluate(element => element.scrollIntoView({ block: "center" }));
    await page.waitForFunction(
      selector => {
        const img = document.querySelector(selector);
        return Boolean(img?.getAttribute("src")) && img.complete && img.naturalWidth > 0;
      },
      imageSelector,
    );
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
    assert.ok(["start", "justify"].includes(layout.justify), "Readable paragraph alignment");
    assert.equal(layout.hyphens, "none");
    if (layout.imageWidth > 0) assert.ok(layout.imageWidth > 240, "Photo has substantial presence, not a thumbnail");
    await link.focus();
    assert.ok(await link.evaluate(el => el.matches(":focus")
      && getComputedStyle(el).outlineStyle !== "none"), "Visible keyboard focus");
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal overflow");
}

async function checkPhotoParity(width, items = groups) {
  const page = await pageFor("es", width);
  await page.route("**/api/practice-groups", route => {
    return route.fulfill({ json: items });
  });
  await page.goto(`${baseURL}${localizedPublicPath("es", "/")}`, { waitUntil: "domcontentloaded" });
  const homePhotos = {};
  for (const group of items) {
    const href = localizedPublicPath("es", `/practice-groups/${group.slug}`);
    const link = page.locator(`#pr-practicas a.pr-bk-cuadro[href="${href}"]`);
    await link.waitFor({ state: "attached" });
    await link.evaluate(element => element.scrollIntoView({ block: "center" }));
    const image = link.locator("img.hm-bk-foto");
    await image.waitFor({ state: "attached" });
    await image.evaluate(element => element.scrollIntoView({ block: "center" }));
    const selector = `#pr-practicas a.pr-bk-cuadro[href="${href}"] img.hm-bk-foto`;
    await page.waitForFunction(
      ({ selector, expected }) => {
        const source = document.querySelector(selector)?.getAttribute("src");
        return Boolean(source) && (!expected || source === expected);
      },
      { selector, expected: group.imageUrl?.trim() || null },
    );
    homePhotos[group.slug] = await image.getAttribute("src");
    assert.ok(homePhotos[group.slug], `Homepage photograph is loaded: ${group.slug}`);
  }
  await open(page, "es");
  for (const group of items) {
    const image = page.getByTestId(`link-practice-group-${group.slug}`).locator("img");
    await image.waitFor({ state: "attached" });
    const selector = `[data-testid="link-practice-group-${group.slug}"] img`;
    await page.waitForFunction(
      ({ selector, expected }) => document.querySelector(selector)?.getAttribute("src") === expected,
      { selector, expected: homePhotos[group.slug] },
    );
    assert.equal(await image.getAttribute("src"), homePhotos[group.slug], `Same photo on both pages: ${group.slug}`);
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
    await open(page, language);
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
        await page.waitForURL(`**${localizedPublicPath("es", `/practice-groups/${group.slug}`)}`);
        await page.locator("main h1").waitFor();
        await open(page, "es");
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
  await open(edited, "es");
  await checkRows(edited, "es", custom);
  assert.equal(await edited.getByTestId("text-practice-groups-subtitle").innerText(), "Introducción editada desde el panel.");
  await edited.close();
  const translated = await pageFor("de", 375, { cached: true });
  await open(translated, "de");
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
      await open(page, language);
      if (state === "loading") {
        await page.getByTestId("skeleton-practice-group-0").waitFor();
        assert.equal(await page.locator('[data-testid^="skeleton-practice-group-"]').count(), 4);
      } else {
        await page.getByTestId(`container-practice-groups-${state}`).waitFor();
        assert.equal(await page.locator(`main a[href^="${localizedPublicPath(language, "/practice-groups")}/"]`).count(), 0);
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
