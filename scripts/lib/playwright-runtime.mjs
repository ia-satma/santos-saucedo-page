import { existsSync } from "node:fs";
import { chromium } from "playwright";

const configuredPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim();
const bundledPath = chromium.executablePath();

export const playwrightExecutablePath = [configuredPath, bundledPath]
  .find((candidate) => candidate && existsSync(candidate));
