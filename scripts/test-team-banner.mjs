import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.VISUAL_TEST_BASE_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
const browser = await chromium.launch({
  executablePath: "/repl/tools/bin/chromium",
  args: ["--no-sandbox"],
});
let baseline;
try { baseline = JSON.parse(await readFile("/tmp/ss-team-banner-before.json", "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const errors = [];
const rect = async locator => {
  const box = await locator.boundingBox();
  return [box.x, box.y, box.width, box.height];
};
async function settledMotion(hero) {
  await hero.evaluate(async el => {
    await new Promise(requestAnimationFrame);
    await Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished));
  });
}
async function identity(hero) {
  return hero.evaluate(el => {
    const value = getComputedStyle(el, "::before").transform;
    return value === "none" || new DOMMatrixReadOnly(value).isIdentity;
  });
}
let checks = 0;
try {
  for (const [language, width, touch] of [
    ["es", 1440, false], ["es", 375, true], ["es", 768, false],
    ...["en", "de", "fr", "it", "ru", "zh", "ko", "ja", "ar"].map(lang => [lang, 320, true]),
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 }, hasTouch: touch, isMobile: touch,
    });
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(lang => {
      localStorage.setItem("ss_language", lang);
      localStorage.setItem("ss_language_detected", "true");
    }, language);
    await page.route("**/api/translations/**", route => route.fulfill({ json: { translations: {} } }));
    await page.route("**/api/translate-entity", route => route.fulfill({ status: 204 }));
    await page.goto(`${baseURL}/team`);
    const hero = page.getByTestId("section-team-hero");
    await hero.locator("h1").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelectorAll("main img").length >= 4);
    const layout = await hero.evaluate(el => {
      const box = el.getBoundingClientRect(), heading = el.querySelector("h1").getBoundingClientRect();
      const mark = getComputedStyle(el, "::before");
      return {
        height: box.height, titleVisible: heading.top >= box.top && heading.bottom <= box.bottom,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        watermark: mark.backgroundColor, pointer: mark.pointerEvents,
        background: getComputedStyle(el).backgroundImage,
      };
    });
    assert.ok(layout.height >= 260 && layout.height <= 400, `${language}/${width}: compact height`);
    assert.ok(layout.titleVisible && !layout.overflow, `${language}/${width}: full readable title`);
    assert.equal(layout.background, "none");
    assert.equal(await hero.locator("img,video,picture").count(), 0);
    assert.equal(layout.pointer, "none");
    if (language === "es" && baseline?.[`/team-${width}`]) {
      await page.waitForLoadState("networkidle");
      const before = baseline[`/team-${width}`];
      assert.ok(layout.height < before.height * 0.7, "Header height reduced by more than 30%");
      const current = await page.locator("main").evaluate(main => {
        const copy = main.cloneNode(true);
        copy.querySelector(".editorial-page-hero").remove();
        return {
          text: copy.textContent.replace(/\s+/g, " ").trim(),
          images: [...copy.querySelectorAll("img")].map(img => img.getAttribute("src")),
        };
      });
      assert.deepEqual(current, { text: before.text, images: before.images },
        "All partner text, portraits and body content remain unchanged");
    }
    const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
    if (await reject.isVisible()) await reject.click();
    const size = await rect(hero);
    await page.mouse.move(width / 2, size[1] + size[3] / 2);
    await settledMotion(hero);
    assert.equal(await identity(hero), touch, "Hover motion only for a fine-pointer mouse");
    assert.deepEqual(await rect(hero), size, "Hover never changes banner geometry");
    assert.equal(await hero.evaluate(el => getComputedStyle(el, "::before").backgroundColor),
      layout.watermark, "Hover does not increase watermark opacity");
    await page.mouse.move(0, 0);
    await settledMotion(hero);
    assert.ok(await identity(hero), "Watermark returns to its original position");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.mouse.move(width / 2, size[1] + size[3] / 2);
    await settledMotion(hero);
    assert.ok(await identity(hero), "Reduced motion disables the effect");
    // Stress text wrapping without modifying CMS data or the public site.
    await hero.locator("h1").evaluate(el => {
      el.textContent = Array(6).fill("Socios y responsabilidad profesional compartida").join(" ");
    });
    assert.ok(await hero.evaluate(el => {
      const box = el.getBoundingClientRect(), text = el.querySelector("h1");
      const heading = text.getBoundingClientRect();
      return heading.bottom <= box.bottom && heading.top >= box.top
        && text.scrollWidth <= text.clientWidth + 1;
    }), "Long titles grow naturally instead of clipping");
    if (baseline?.[`/about-${width}`]) {
      await page.goto(`${baseURL}/about`);
      const other = page.getByTestId("section-about-hero");
      await other.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.ok(Math.abs((await other.boundingBox()).height - baseline[`/about-${width}`].height) < 1,
        "Shared header dimensions stay unchanged on other pages");
    }
    checks++;
    await page.close();
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS: ${checks} layouts across 10 languages; compact size, mouse/touch/reduced-motion, stable hover geometry, long copy and unchanged partner content.`);
} finally {
  await browser.close();
}
