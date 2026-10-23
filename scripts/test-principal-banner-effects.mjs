import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.VISUAL_TEST_BASE_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
const output = "/tmp/ss-main-banner-effects";
await mkdir(output, { recursive: true });
const routes = [
  "/about", "/practice-groups", "/team", "/news", "/contact",
  "/careers", "/careers/interns", "/testimonios", "/newsletter",
];
let baseline;
try { baseline = JSON.parse(await readFile("/tmp/ss-main-banners-before.json", "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/repl/tools/bin/chromium",
  args: ["--no-sandbox"],
});
const errors = [];
async function settle(hero) {
  await hero.evaluate(async el => {
    await new Promise(requestAnimationFrame);
    await Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished));
  });
}
async function state(hero) {
  return hero.evaluate(el => {
    const heading = el.querySelector("h1");
    const mark = getComputedStyle(el, "::before"), line = getComputedStyle(heading, "::after");
    const matrix = value => value === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(value);
    const markMatrix = matrix(mark.transform), lineMatrix = matrix(line.transform);
    const rect = box => box && [box.x, box.y, box.width, box.height];
    const bounds = el.getBoundingClientRect(), title = heading.getBoundingClientRect();
    const paragraphs = [...el.querySelectorAll("p")].filter(p => !p.closest(".ss-eyebrow"));
    return {
      geometry: {
        banner: rect(bounds), heading: rect(title),
        // Its top must stay put; asynchronous body content can change its own height.
        body: rect(el.nextElementSibling?.getBoundingClientRect())?.slice(0, 3),
      },
      height: bounds.height, titleText: heading.textContent,
      fits: [heading, ...paragraphs].every(text => {
        const box = text.getBoundingClientRect();
        return box.left >= bounds.left - 1 && box.right <= bounds.right + 1
          && box.top >= bounds.top - 1 && box.bottom <= bounds.bottom + 1
          && text.scrollWidth <= text.clientWidth + 1;
      }),
      subtitleBelow: paragraphs.every(p => p.getBoundingClientRect().top >= title.bottom - 1),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      markAlpha: Number(mark.backgroundColor.match(/[\d.]+/g).at(-1)),
      markScale: markMatrix.a, markX: markMatrix.e, markIdentity: markMatrix.isIdentity,
      markEvents: mark.pointerEvents, markDuration: parseFloat(mark.transitionDuration),
      line: parseFloat(line.width) * Math.abs(lineMatrix.a),
      lineDuration: parseFloat(line.transitionDuration),
      lineContent: line.content, lineEvents: line.pointerEvents, lineOrigin: line.transformOrigin,
      cursor: getComputedStyle(el).cursor, dir: getComputedStyle(el).direction,
    };
  });
}
let checks = 0;
try {
  for (const [lang, width, touch, selected] of [
    ["es", 1440, false, routes], ["es", 375, true, routes],
    ["es", 768, false, ["/practice-groups", "/careers/interns", "/newsletter"]],
    ["ar", 1440, false, ["/team", "/practice-groups", "/careers/interns"]],
    ["ar", 375, true, ["/team", "/practice-groups", "/careers/interns"]],
    ["de", 320, true, ["/about", "/practice-groups", "/careers/interns"]],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 }, hasTouch: touch, isMobile: touch,
    });
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(language => {
      localStorage.setItem("ss_language", language);
      localStorage.setItem("ss_language_detected", "true");
    }, lang);
    await page.route("**/api/translations/**", route => route.fulfill({ json: { translations: {} } }));
    await page.route("**/api/translate-entity", route => route.fulfill({ status: 204 }));
    for (const route of selected) {
      const label = `${lang} ${width} ${route}`;
      await page.mouse.move(0, 0);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`${baseURL}${route}`);
      const hero = page.locator(".ss-principal-page-hero");
      await hero.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState("networkidle");
      const reject = page.getByRole("button", { name: /^(Rechazar opcionales|Reject optional)$/ });
      if (await reject.isVisible()) await reject.click();
      await page.mouse.move(0, 0);
      await settle(hero);
      const rest = await state(hero);
      assert.ok(rest.fits && !rest.overflow && rest.subtitleBelow, `${label}: copy and rule never overlap or clip`);
      assert.equal(rest.lineContent, '""', `${label}: decorative rule exists`);
      assert.equal(rest.lineEvents, "none");
      assert.equal(rest.markEvents, "none");
      assert.notEqual(rest.cursor, "pointer", `${label}: decoration is not a fake link`);
      assert.ok(Math.abs(rest.markAlpha - 0.055) < 1 / 255, `${label}: approved watermark alpha`);
      assert.ok(rest.markIdentity, `${label}: watermark is at rest`);
      if (rest.dir === "rtl") assert.ok(parseFloat(rest.lineOrigin) >= 130, "RTL rule starts on right");
      if (lang === "es" && width === 1440) {
        assert.ok(rest.height <= 460, `${label}: compact desktop banner`);
        if (baseline && route !== "/team") {
          assert.ok(rest.height < baseline[route].height * 0.85, `${label}: noticeably less empty height`);
        }
        if (route === "/team") assert.ok(rest.height <= 360, "Socios keeps its compact size");
      }
      const capture = lang === "es" && width === 1440
        && ["/team", "/about", "/practice-groups"].includes(route);
      const name = route.slice(1).replaceAll("/", "-");
      if (capture) await hero.screenshot({ path: `${output}/${name}-rest.png` });
      const [x, y, w, h] = rest.geometry.banner;
      await page.mouse.move(x + w / 2, y + h / 2);
      await settle(hero);
      const hovered = await state(hero);
      assert.deepEqual(hovered.geometry, rest.geometry, `${label}: hover never moves title or following content`);
      assert.equal(hovered.markAlpha, rest.markAlpha);
      assert.equal(hovered.titleText, rest.titleText);
      if (touch) {
        assert.ok(hovered.markIdentity && rest.line >= 130 && hovered.line >= 130,
          `${label}: finished static touch presentation`);
      } else {
        assert.ok(Math.abs(hovered.markX) >= 20 && hovered.markScale >= 1.06,
          `${label}: clearly larger watermark motion than the previous version`);
        assert.ok(hovered.line - rest.line >= 90 && hovered.line >= 130,
          `${label}: rule visibly draws out`);
        assert.ok(rest.markDuration > 0 && rest.lineDuration > 0, `${label}: transitions apply in both directions`);
        assert.ok(rest.dir === "rtl" ? hovered.markX > 0 : hovered.markX < 0,
          `${label}: motion follows reading direction`);
      }
      if (capture) await hero.screenshot({ path: `${output}/${name}-hover.png` });
      if (lang === "es" && width === 375 && route === "/practice-groups") {
        await hero.screenshot({ path: `${output}/practice-groups-mobile.png` });
      }
      await page.mouse.move(0, 0);
      await settle(hero);
      const returned = await state(hero);
      assert.ok(returned.markIdentity && Math.abs(returned.line - rest.line) < 1,
        `${label}: reversible effect`);
      assert.deepEqual(returned.geometry, rest.geometry);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.mouse.move(x + w / 2, y + h / 2);
      await settle(hero);
      const reduced = await state(hero);
      // The site's global reduced-motion rule uses a near-zero !important duration.
      assert.ok(reduced.markIdentity && reduced.line >= 130
        && reduced.markDuration <= 0.0001 && reduced.lineDuration <= 0.0001,
      `${label}: reduced motion shows a complete static rule`);
      await hero.locator("h1").evaluate(el => { el.textContent = Array(7).fill(el.textContent).join(" "); });
      assert.ok((await state(hero)).fits, `${label}: long headings grow instead of clipping`);
      checks++;
    }
    await page.close();
  }
  const page = await browser.newPage();
  for (const route of ["/", "/offices", "/terms", "/privacy-policy",
    "/testimonios/escribir", "/newsletter/unsubscribe", "/not-a-page"]) {
    await page.goto(`${baseURL}${route}`);
    await page.locator("h1").first().waitFor();
    assert.equal(await page.locator(".ss-principal-page-hero").count(), 0,
      `${route}: excluded from principal-header effects`);
  }
  await page.close();
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(`PASS: ${checks} real hover/touch/reduced-motion cases; compact layout, RTL, long headings and exclusions. Captures: ${output}`);
} finally {
  await browser.close();
}
