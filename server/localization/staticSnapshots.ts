import { readFile } from "node:fs/promises";
import path from "node:path";
import { SUPPORTED_LANGUAGES } from "@shared/constants";

type Snapshot = Record<string, unknown>;
const LANGUAGE_CODES: ReadonlySet<string> = new Set(SUPPORTED_LANGUAGES.map(({ code }) => code));

function selectLanguage(value: unknown, language: string): unknown {
  if (Array.isArray(value)) return value.map((item) => selectLanguage(item, language));
  if (!value || typeof value !== "object") return value;
  const record = value as Snapshot;
  if (Object.keys(record).some((key) => LANGUAGE_CODES.has(key))) {
    return record[language] ?? record.es ?? record.en;
  }
  return Object.fromEntries(
    Object.entries(record).map(([key, item]) => [key, selectLanguage(item, language)]),
  );
}

async function readJson(paths: string[]): Promise<Snapshot | null> {
  for (const filePath of paths) {
    try {
      const value = JSON.parse(await readFile(filePath, "utf8"));
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Snapshot;
      }
    } catch {
      // Development reads shared/, while deployments read dist/public/.
    }
  }
  return null;
}

const snapshotCache = new Map<string, Promise<Snapshot | null>>();
function readCachedJson(key: string, paths: string[]) {
  const cached = snapshotCache.get(key);
  if (cached) return cached;
  const pending = readJson(paths);
  snapshotCache.set(key, pending);
  return pending;
}

const root = process.cwd();
const staticApi = path.join(root, "dist", "public", "static-api");
const shared = path.join(root, "shared");

export async function readStaticCmsSection(section: string, language: string): Promise<unknown> {
  const snapshot = await readCachedJson("cms", [
    path.join(staticApi, "site-config.json"),
    path.join(shared, "cms-static-snapshot.json"),
  ]);
  if (!snapshot) return undefined;
  const content = "content" in snapshot && snapshot.content && typeof snapshot.content === "object"
    ? snapshot.content as Snapshot
    : snapshot;
  const sectionContent = content[section];
  if (!sectionContent || typeof sectionContent !== "object") return undefined;
  return selectLanguage(sectionContent, language);
}

export async function readStaticEntityTranslation(
  contentType: string,
  entityId: string,
  language: string,
): Promise<Record<string, string> | undefined> {
  const snapshot = await readCachedJson("translations", [
    path.join(staticApi, "translations.json"),
    path.join(shared, "translation-snapshot.json"),
  ]);
  if (!snapshot || !snapshot.entries || typeof snapshot.entries !== "object") return undefined;
  const key = `${contentType}|${entityId}|${language}`;
  const value = (snapshot.entries as Snapshot)[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === "string" && item.trim()),
  ) as Record<string, string>;
}
