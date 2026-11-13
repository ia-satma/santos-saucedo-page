import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { playwrightExecutablePath } from "./lib/playwright-runtime.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotDir = path.join(projectRoot, "tests", "visual", "creemos");
const baseURL = process.env.VISUAL_TEST_BASE_URL ?? "http://127.0.0.1:5000";
const updateSnapshots = process.env.UPDATE_VISUAL_SNAPSHOTS === "1";

const cases = [
  { language: "es", viewport: "desktop", width: 1440, height: 1000 },
  { language: "es", viewport: "mobile", width: 375, height: 812 },
  { language: "en", viewport: "desktop", width: 1440, height: 1000 },
  { language: "en", viewport: "mobile", width: 375, height: 812 },
];

const expectedContent = {
  es: {
    label: "Nuestra filosofía",
    title: "Preparamos cada asunto como si fuera a llegar a juicio.",
    paragraphs: ["Prevención primero", "capacidad de reacción"],
  },
  en: {
    label: "Our philosophy",
    title: "We prepare every matter as if it were going to trial.",
    paragraphs: ["Prevention first", "capacity to respond"],
  },
};

function compareImages(actual, expected, limit = 0.5) {
  return Promise.all([
    sharp(actual).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(expected).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]).then(([actualImage, expectedImage]) => {
    if (actualImage.info.width !== expectedImage.info.width
      || actualImage.info.height !== expectedImage.info.height) {
      return {
        matches: false,
        reason: `dimensions differ (${actualImage.info.width}x${actualImage.info.height} vs ${expectedImage.info.width}x${expectedImage.info.height})`,
      };
    }

    let changedPixels = 0;
    const channels = 4;
    for (let offset = 0; offset < actualImage.data.length; offset += channels) {
      const differs = [0, 1, 2].some((channel) =>
        Math.abs(actualImage.data[offset + channel] - expectedImage.data[offset + channel]) > 20,
      );
      if (differs) changedPixels += 1;
    }

    const totalPixels = actualImage.info.width * actualImage.info.height;
    const changedPercent = (changedPixels / totalPixels) * 100;
    return {
      matches: changedPercent <= limit,
      reason: `${changedPercent.toFixed(2)}% of pixels differ (limit: ${limit.toFixed(2)}%)`,
    };
  });
}

async function main() {
  await mkdir(snapshotDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    ...(playwrightExecutablePath ? { executablePath: playwrightExecutablePath } : {}),
    args: ["--no-sandbox"],
  });

  try {
    for (const testCase of cases) {
      const { language, viewport, width, height } = testCase;
      const expected = expectedContent[language];
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
        locale: language === "es" ? "es-MX" : "en",
      });
      const page = await context.newPage();
      await page.addInitScript((lang) => {
        localStorage.setItem("ss_language", lang);
        localStorage.setItem("ss_language_detected", "true");
      }, language);
      await page.goto(`${baseURL}/${language}/`, { waitUntil: "domcontentloaded" });

      const section = page.locator('section[aria-labelledby="ini-filo-h"]');
      await section.waitFor({ state: "visible" });
      await section.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const image = document.querySelector('section[aria-labelledby="ini-filo-h"] img');
        return Boolean(image?.getAttribute("src") && image.complete);
      });
      await section.locator("img").evaluate((image) => image.decode?.().catch(() => {}));
      await page.evaluate(() => document.fonts.ready);
      // The philosophy image fades in after the first intersection callback. Let that
      // deterministic transition settle before capturing the approved reference.
      await page.waitForTimeout(300);

      const sectionData = await section.evaluate((element) => {
        const textOf = (node) => node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
        const paragraphs = [...element.querySelectorAll("p.sh-filo__p")];
        const paragraphAlignments = [...element.querySelectorAll("p")].map((paragraph) => ({
          isExplanation: paragraph.matches("p.sh-filo__p"),
          alignment: getComputedStyle(paragraph).textAlign,
        }));
        const justified = [...element.querySelectorAll("*")]
          .filter((child) => getComputedStyle(child).textAlign === "justify")
          .map((child) => ({
            text: child.textContent?.trim() ?? "",
            isExplanation: child.matches("p.sh-filo__p"),
          }));
        const heading = element.querySelector("h2");
        const label = element.querySelector("a.sh-boton");

        return {
          language: document.documentElement.lang,
          paragraphs: paragraphs.map(textOf),
          paragraphAlignments,
          justified,
          heading: textOf(heading),
          headingAlignment: heading ? getComputedStyle(heading).textAlign : null,
          label: textOf(label),
          labelAlignment: label ? getComputedStyle(label).textAlign : null,
        };
      });

      assert.equal(sectionData.language, language === "es" ? "es-MX" : "en",
        `${language}/${viewport}: section should declare the displayed language`);
      assert.equal(sectionData.label, expected.label, `${language}/${viewport}: section label`);
      assert.equal(sectionData.heading, expected.title, `${language}/${viewport}: section title`);
      assert.equal(sectionData.paragraphs.length, 1,
        `${language}/${viewport}: exactly one explanatory paragraph should be present`);
      for (const phrase of expected.paragraphs) {
        assert.ok(sectionData.paragraphs.some((paragraph) => paragraph.includes(phrase)),
          `${language}/${viewport}: expected ${language} copy containing "${phrase}"`);
      }
      assert.equal(sectionData.justified.length, 0,
        `${language}/${viewport}: the philosophy band must not justify its text`);
      assert.notEqual(sectionData.headingAlignment, "justify",
        `${language}/${viewport}: the section title must not be justified`);
      assert.notEqual(sectionData.labelAlignment, "justify",
        `${language}/${viewport}: the section label must not be justified`);

      const screenshot = await section.screenshot({ animations: "disabled" });
      const snapshotName = `${language}-${viewport}.png`;
      const snapshotPath = path.join(snapshotDir, snapshotName);
      if (updateSnapshots) {
        await writeFile(snapshotPath, screenshot);
        console.log(`Updated ${path.relative(projectRoot, snapshotPath)}`);
      } else {
        let expectedScreenshot;
        try {
          expectedScreenshot = await readFile(snapshotPath);
        } catch {
          throw new Error(
            `Missing visual baseline ${path.relative(projectRoot, snapshotPath)}. `
            + "Run npm run test:visual:creemos:update to create the approved reference images.",
          );
        }
        const comparison = await compareImages(screenshot, expectedScreenshot, viewport === "mobile" ? 2 : 0.5);
        assert.ok(comparison.matches,
          `${language}/${viewport}: visual regression detected: ${comparison.reason}. `
          + "Review the change, then run npm run test:visual:creemos:update to accept it.");
        console.log(`Passed ${language}/${viewport} (${comparison.reason})`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
