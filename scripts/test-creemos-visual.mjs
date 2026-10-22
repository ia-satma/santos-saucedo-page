import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotDir = path.join(projectRoot, "tests", "visual", "creemos");
const baseURL = process.env.VISUAL_TEST_BASE_URL ?? "http://127.0.0.1:5000";
const systemChromium = "/repl/tools/bin/chromium";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync(systemChromium) ? systemChromium : undefined);
const updateSnapshots = process.env.UPDATE_VISUAL_SNAPSHOTS === "1";

const cases = [
  { language: "es", viewport: "desktop", width: 1440, height: 1000 },
  { language: "es", viewport: "mobile", width: 375, height: 812 },
  { language: "en", viewport: "desktop", width: 1440, height: 1000 },
  { language: "en", viewport: "mobile", width: 375, height: 812 },
];

const expectedContent = {
  es: {
    label: "Lo que creemos",
    title: "La prevención es la primera defensa.",
    paragraphs: ["conflictos laborales", "la mayor parte de nuestro trabajo"],
  },
  en: {
    label: "What we believe",
    title: "Prevention is the first defense.",
    paragraphs: ["labor disputes", "most of our work is preventive"],
  },
};

function compareImages(actual, expected) {
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
      matches: changedPercent <= 0.5,
      reason: `${changedPercent.toFixed(2)}% of pixels differ (limit: 0.50%)`,
    };
  });
}

async function main() {
  await mkdir(snapshotDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
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
      await page.addInitScript((lang) => localStorage.setItem("ss_language", lang), language);
      await page.goto(baseURL, { waitUntil: "domcontentloaded" });

      const section = page.locator('section[aria-labelledby="ss26-creemos"]');
      await section.waitFor({ state: "visible" });
      await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);

      const sectionData = await section.evaluate((element) => {
        const paragraphs = [...element.querySelectorAll(".ss-creemos-body > * > p")];
        const paragraphAlignments = [...element.querySelectorAll("p")].map((paragraph) => ({
          isExplanation: paragraph.matches(".ss-creemos-body > * > p"),
          alignment: getComputedStyle(paragraph).textAlign,
        }));
        const justified = [...element.querySelectorAll("*")]
          .filter((child) => getComputedStyle(child).textAlign === "justify")
          .map((child) => ({
            text: child.textContent?.trim() ?? "",
            isExplanation: child.matches(".ss-creemos-body > * > p"),
          }));
        const heading = element.querySelector("h2");
        const label = element.querySelector(".ss-label > span:not([aria-hidden])");
        const mainSections = [...document.querySelectorAll("main > section")];
        const sectionIndex = mainSections.indexOf(element);
        const adjacentHeadingAlignment = [mainSections[sectionIndex - 1], mainSections[sectionIndex + 1]]
          .filter(Boolean)
          .map((adjacent) => {
            const adjacentHeading = adjacent.querySelector("h2");
            return adjacentHeading ? getComputedStyle(adjacentHeading).textAlign : null;
          });

        return {
          language: element.getAttribute("lang"),
          paragraphs: paragraphs.map((paragraph) => paragraph.textContent?.trim() ?? ""),
          paragraphAlignments,
          justified,
          heading: heading?.textContent?.trim() ?? "",
          headingAlignment: heading ? getComputedStyle(heading).textAlign : null,
          label: label?.textContent?.trim() ?? "",
          labelAlignment: label ? getComputedStyle(label).textAlign : null,
          adjacentHeadingAlignment,
        };
      });

      assert.equal(sectionData.language, language === "es" ? "es-MX" : "en",
        `${language}/${viewport}: section should declare the displayed language`);
      assert.equal(sectionData.label, expected.label, `${language}/${viewport}: section label`);
      assert.equal(sectionData.heading, expected.title, `${language}/${viewport}: section title`);
      assert.equal(sectionData.paragraphs.length, 2,
        `${language}/${viewport}: exactly two explanatory paragraphs should be present`);
      for (const phrase of expected.paragraphs) {
        assert.ok(sectionData.paragraphs.some((paragraph) => paragraph.includes(phrase)),
          `${language}/${viewport}: expected ${language} copy containing "${phrase}"`);
      }
      assert.equal(sectionData.justified.length, 2,
        `${language}/${viewport}: only two elements should have justified alignment`);
      assert.ok(sectionData.justified.every((element) => element.isExplanation),
        `${language}/${viewport}: justified elements must be the two explanatory paragraphs`);
      assert.ok(sectionData.paragraphAlignments
        .filter((paragraph) => paragraph.alignment === "justify")
        .every((paragraph) => paragraph.isExplanation),
      `${language}/${viewport}: no other paragraph should have justified alignment`);
      assert.notEqual(sectionData.headingAlignment, "justify",
        `${language}/${viewport}: the section title must not be justified`);
      assert.notEqual(sectionData.labelAlignment, "justify",
        `${language}/${viewport}: the section label must not be justified`);
      assert.ok(sectionData.adjacentHeadingAlignment.every((alignment) => alignment !== "justify"),
        `${language}/${viewport}: adjacent section headings must not be justified`);

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
        const comparison = await compareImages(screenshot, expectedScreenshot);
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
