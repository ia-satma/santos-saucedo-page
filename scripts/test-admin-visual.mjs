import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { playwrightExecutablePath } from "./lib/playwright-runtime.mjs";

const baseURL = process.env.VISUAL_TEST_BASE_URL ?? "http://127.0.0.1:5000";
const screenshotDir = process.env.ADMIN_VISUAL_SCREENSHOTS_DIR ?? "/tmp/ss-admin-visual";
const token = process.env.ADMIN_VISUAL_TOKEN ?? "";
const repeats = Math.max(1, Number(process.env.ADMIN_VISUAL_REPEATS ?? "1"));

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "laptop", width: 1024, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];

const authenticatedRoutes = [
  "/admin/dashboard",
  "/admin/manual",
  "/admin/content",
  "/admin/media",
  "/admin/testimonials",
  "/admin/site-config/home",
  "/admin/agents",
  "/admin/documents",
];

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(overflow, false, `${label}: no horizontal overflow`);
}

async function assertFocusRing(page, label) {
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return false;
    const style = getComputedStyle(element);
    return element.matches(":focus-visible") && style.outlineStyle !== "none";
  });
  assert.equal(focused, true, `${label}: keyboard focus is visible`);
}

async function checkLogin(page, viewport, capture) {
  await page.goto(`${baseURL}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("text-login-title").waitFor();
  await page.getByTestId("input-username").waitFor();
  await page.getByTestId("input-password").waitFor();
  await page.getByTestId("button-login").waitFor();
  await assertNoHorizontalOverflow(page, `login/${viewport}`);
  await assertFocusRing(page, `login/${viewport}`);
  if (capture) await page.screenshot({ path: `${screenshotDir}/login-${viewport}.png`, fullPage: true });
}

async function checkAuthenticatedRoute(page, route, viewport, capture) {
  await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded" });
  await page.locator("#admin-main").waitFor();
  await assertNoHorizontalOverflow(page, `${route}/${viewport}`);
  const navigation = page.locator("nav[aria-label='Navegación de administración']");
  if (viewport === "mobile" || viewport === "tablet") {
    const trigger = page.getByRole("button", { name: "Abrir navegación" });
    await trigger.click();
    await page.getByRole("heading", { name: "Navegación del panel" }).waitFor();
  } else {
    await navigation.waitFor();
  }
  await assertFocusRing(page, `${route}/${viewport}`);
  if (capture) await page.screenshot({ path: `${screenshotDir}${route.replaceAll("/", "-")}-${viewport}.png`, fullPage: true });
}

async function runIteration(browser, iteration) {
  await mkdir(screenshotDir, { recursive: true });
  const currentViewports = iteration === 1 ? viewports : viewports.filter(({ name }) => name === "desktop" || name === "mobile");
  for (const viewport of currentViewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "reduce",
      locale: "es-MX",
    });
    const page = await context.newPage();
    if (token) {
      await context.addCookies([{
        name: "ss_admin_session",
        value: token,
        url: baseURL,
        httpOnly: true,
        sameSite: "Lax",
      }]);
    }
    const capture = iteration === 1;
    const loginPage = token ? await context.newPage() : page;
    await checkLogin(loginPage, viewport.name, capture);
    if (token) await loginPage.close();
    if (token) {
      for (const route of authenticatedRoutes) {
        await checkAuthenticatedRoute(page, route, viewport.name, capture);
      }
    }
    await context.close();
  }
  console.log(`Admin visual smoke iteration ${iteration}/${repeats} passed`);
}

const browser = await chromium.launch({
  ...(playwrightExecutablePath ? { executablePath: playwrightExecutablePath } : {}),
  args: ["--no-sandbox"],
});

try {
  for (let iteration = 1; iteration <= repeats; iteration += 1) {
    await runIteration(browser, iteration);
  }
  if (!token) {
    console.log("Authenticated admin routes skipped. Set ADMIN_VISUAL_TOKEN to exercise the full CMS matrix.");
  }
} finally {
  await browser.close();
}
