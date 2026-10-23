import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.VISUAL_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const screenshots = process.env.ABOUT_SCREENSHOTS_DIR ?? "/tmp/ss-about-layout";
const copy = JSON.parse(await readFile(new URL("../tests/fixtures/about-approved-copy.json", import.meta.url), "utf8"));
const configResponse = await fetch(`${baseURL}/api/site-config`);
assert.ok(configResponse.ok);
const liveConfig = await configResponse.json();
await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/repl/tools/bin/chromium",
  args: ["--no-sandbox"],
});
const runtimeErrors = [];
const normalize = text => text.replace(/\s+/g, " ").trim();

async function open(language, width, override) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  page.on("pageerror", error => runtimeErrors.push(error.message));
  await page.addInitScript(lang => {
    localStorage.setItem("ss_language", lang);
    localStorage.setItem("ss_language_detected", "true");
  }, language);
  const config = structuredClone(liveConfig);
  config.about = { ...config.about, ...structuredClone(copy) };
  override?.(config);
  await page.route("**/api/site-config", route => route.fulfill({ json: config }));
  await page.goto(`${baseURL}/about`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("nav-about-related").waitFor();
  const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
  if (await reject.isVisible()) await reject.click();
  // Full-page captures alone do not trigger all lazy images.
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(img => img.decode());
  }
  await page.evaluate(() => document.fonts.ready);
  return { page, config };
}

async function check(page, expected) {
  const main = page.locator("main");
  assert.equal(await main.locator("h1").count(), 1);
  assert.equal(await page.locator('[data-testid^="card-value-"]').count(), 4);
  assert.equal(await main.locator("img").count(), 4,
    "The new decorative cover accompanies the three unchanged gallery photographs");
  assert.equal(await page.getByTestId("section-history").locator("img").count(), 0,
    "The reception no longer occupies the introductory text column");
  assert.equal(await page.getByTestId("gallery-about-office").locator("img").count(), 3,
    "All three existing photographs belong to the lower gallery");
  if (expected) {
    const text = normalize(await main.innerText());
    for (const phrase of [expected.subtitle, expected.historyText1, expected.historyText2, expected.valuesTitle,
      ...expected.values.flatMap(value => [value.title, value.text])]) {
      assert.ok(text.includes(normalize(phrase)), `Approved content is complete: ${phrase.slice(0, 45)}`);
    }
  }
  assert.deepEqual(await page.getByTestId("section-stats").locator("dd").allTextContents(), ["40+", "72+"]);
  assert.deepEqual(await page.getByTestId("section-stats").locator(".ss-about-stat").evaluateAll(items =>
    items.map(item => item.firstElementChild.tagName)), ["DT", "DT"]);
  const layout = await main.evaluate(el => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    paragraphs: [...el.querySelectorAll(".ss-about p")].map(p => ({
      align: getComputedStyle(p).textAlign, hyphens: getComputedStyle(p).hyphens,
      wordBreak: getComputedStyle(p).wordBreak,
      clipped: p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1,
    })),
    headings: [...el.querySelectorAll("h1,h2,h3")].map(h => ({
      // Some CJK fonts extend a few pixels outside their line box without being clipped.
      clipped: (h.scrollHeight > h.clientHeight + 1 && ["hidden", "clip"].includes(getComputedStyle(h).overflowY))
        || h.scrollWidth > h.clientWidth + 1,
    })),
    images: [...el.querySelectorAll("img")].map(img => ({
      loaded: img.complete && img.naturalWidth > 0, alt: img.alt,
      filter: getComputedStyle(img).filter,
      decorative: !!img.closest('[aria-hidden="true"]'),
    })),
    order: ["section-history", "section-values", "gallery-about-office", "nav-about-related"]
      .map(id => el.querySelector(`[data-testid="${id}"]`).getBoundingClientRect().top),
  }));
  assert.equal(layout.overflow, false, "No horizontal overflow");
  assert.ok(layout.paragraphs.every(p => p.align === "justify" && p.hyphens === "none" && p.wordBreak !== "break-all" && !p.clipped),
    `Justified paragraphs retain whole words: ${JSON.stringify(layout.paragraphs)}`);
  assert.ok(layout.headings.every(h => !h.clipped), "Titles are not clipped");
  assert.ok(layout.images.every(img => img.loaded && (img.decorative || img.alt) && img.filter === "none"),
    "Color images load; informative images retain alternative text and decorative cover is hidden");
  assert.deepEqual([...layout.order].sort((a, b) => a - b), layout.order, "Principles precede the secondary photo gallery");
  const gallery = await page.getByTestId("gallery-about-office").evaluate(el => {
    const reception = el.querySelector('[data-testid="img-about-reception"]');
    const otherImages = [...el.querySelectorAll("img")].filter(img => img !== reception);
    return {
      width: el.getBoundingClientRect().width,
      reception: reception.getBoundingClientRect().toJSON(),
      naturalRatio: reception.naturalWidth / reception.naturalHeight,
      naturalWidth: reception.naturalWidth,
      others: otherImages.map(img => img.getBoundingClientRect().toJSON()),
      availableWidth: innerWidth,
    };
  });
  assert.ok(Math.abs(gallery.reception.width - gallery.width) <= 1, "Reception uses the full gallery width");
  // srcset density-corrected natural dimensions are integer-rounded by Chromium.
  assert.ok(Math.abs(gallery.reception.height - gallery.reception.width / gallery.naturalRatio)
    <= Math.max(1, gallery.reception.width / gallery.naturalWidth),
    "Reception retains its natural panorama without cropping");
  assert.ok(gallery.others.every(image => image.top >= gallery.reception.bottom),
    "The other photographs appear below the reception");
  assert.ok(Math.abs(gallery.others[0].width - gallery.others[1].width) <= 1
    && Math.abs(gallery.others[0].height - gallery.others[1].height) <= 1,
  "The two secondary photographs have equal dimensions");
  if (gallery.availableWidth >= 768) {
    assert.ok(Math.abs(gallery.others[0].top - gallery.others[1].top) <= 1,
      "The desktop/tablet pair is horizontally aligned");
  }
  const nav = page.getByTestId("nav-about-related");
  assert.deepEqual(await nav.locator("a").evaluateAll(links => links.map(link => new URL(link.href).pathname)),
    ["/team", "/practice-groups", "/news", "/offices"]);
  for (const link of await nav.locator("a").all()) {
    await link.focus();
    assert.ok(await link.evaluate(el => el === document.activeElement), "Related link is keyboard focusable");
  }
}

try {
  const cases = [["es", 1440], ["es", 1024], ["es", 768], ["es", 375], ["es", 320],
    ["en", 1440], ["en", 375], ["de", 320], ["de", 1024], ["ar", 375], ["ar", 1440], ["zh", 375],
    ["fr", 375], ["it", 375], ["ru", 375], ["ko", 375], ["ja", 375]];
  for (const [language, width] of cases) {
    const { page } = await open(language, width);
    await check(page, copy[language]);
    if (language === "ar") assert.equal(await page.locator("main").evaluate(el => getComputedStyle(el).direction), "rtl");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${screenshots}/${language}-${width}.png`, fullPage: true });
    console.log(`PASS layout, full copy, figures, images and links: ${language} ${width}px`);
    await page.close();
  }
  const { page: edited, config } = await open("es", 375, config => {
    config.about.es.historyText1 = Array(3).fill(copy.es.historyText1).join(" ");
    config.about.es.values[0].text = Array(3).fill(copy.es.values[0].text).join(" ");
    config.about.es.valuesTitle = "Cómo trabajamos con las empresas: edición desde el panel";
    config.media.photos.recepcionBanda = {
      url: "/editorial/oficina-biblioteca-1536.webp", smallUrl: "/editorial/oficina-biblioteca-1536.webp",
    };
  });
  await check(edited, config.about.es);
  assert.match(await edited.getByTestId("img-about-reception").getAttribute("src"), /oficina-biblioteca-1536\.webp$/);
  await edited.close();
  console.log("PASS CMS-edited long paragraphs, principles and image");

  const { page: navigation } = await open("es", 1440);
  for (const path of ["/team", "/practice-groups", "/news", "/offices"]) {
    const link = navigation.getByTestId("nav-about-related").locator(`a[href="${path}"]`);
    await link.focus();
    await navigation.keyboard.press("Enter");
    await navigation.waitForURL(`**${path}`);
    await navigation.getByTestId("page-about").waitFor({ state: "detached" });
    await navigation.locator("main h1").waitFor({ state: "visible" });
    await navigation.goBack({ waitUntil: "domcontentloaded" });
    await navigation.getByTestId("nav-about-related").waitFor();
  }
  await navigation.close();
  assert.deepEqual(runtimeErrors, [], "No browser runtime errors");
  console.log(`All About layout checks passed. Screenshots: ${screenshots}`);
} finally {
  await browser.close();
}
