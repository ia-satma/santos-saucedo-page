import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

const baseURL = process.env.PARAGRAPH_TEST_BASE_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:5000");
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ?? (existsSync("/repl/tools/bin/chromium") ? "/repl/tools/bin/chromium" : undefined);
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
try {
  for (const language of ["es", "en"]) {
    for (const width of [375, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.addInitScript((lang) => localStorage.setItem("ss_language", lang), language);
      const paths = ["/", "/about", "/practice-groups", "/team", "/news", "/contact",
        "/careers", "/careers/interns", "/offices", "/testimonios", "/privacy-policy", "/terms", "/newsletter"];
      for (const endpoint of ["news", "team", "practice-groups"]) {
        const response = await page.request.get(`${baseURL}/api/${endpoint}`);
        assert.ok(response.ok(), endpoint);
        const first = (await response.json()).find((item) => item.slug);
        if (first) paths.push(`/${endpoint}/${first.slug}`);
      }
      for (const path of paths) {
        await page.goto(baseURL + path, { waitUntil: "networkidle" });
        await page.locator("main").waitFor();
        await page.evaluate(() => document.fonts.ready);
        const failures = await page.evaluate(() => {
          const errors = [];
          for (const p of document.querySelectorAll("main p, footer p, .ss-prose")) {
            if (getComputedStyle(p).hyphens !== "none") {
              errors.push(`Automatic hyphens: ${p.textContent.slice(0, 80)}`);
            }
            // Measure each visible word, including paragraphs with nested inline elements.
            const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              const node = walker.currentNode;
              for (const match of node.textContent.matchAll(/[\p{L}\p{M}]+/gu)) {
                const range = document.createRange();
                range.setStart(node, match.index);
                range.setEnd(node, match.index + match[0].length);
                const lines = new Set([...range.getClientRects()].filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top)));
                if (lines.size > 1) errors.push(`Split word: ${match[0]}`);
              }
            }
          }
          return errors;
        });
        assert.deepEqual(failures, [], `${path} ${language} ${width}px`);
      }
      console.log(`PASS ${language} ${width}px: ${paths.length} public pages, no automatic hyphens or split paragraph words`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
