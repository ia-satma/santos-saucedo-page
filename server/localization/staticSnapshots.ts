import { readFile } from "node:fs/promises";
import path from "node:path";
import cmsStaticSnapshot from "@shared/cms-static-snapshot.json";
import translationSnapshot from "@shared/translation-snapshot.json";
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

const root = process.cwd();
const staticApi = path.join(root, "dist", "public", "static-api");
const shared = path.join(root, "shared");

export async function readStaticCmsSection(section: string, language: string): Promise<unknown> {
  const embeddedContent = (cmsStaticSnapshot as { content?: Snapshot }).content;
  const embeddedSection = embeddedContent?.[section];
  if (embeddedSection && typeof embeddedSection === "object" && !Array.isArray(embeddedSection)) {
    const embeddedValue = selectLanguage(embeddedSection, language);
    if (embeddedValue !== undefined) return embeddedValue;
  }
  const snapshot = await readJson([
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
  const embeddedEntries = (translationSnapshot as { entries?: Snapshot }).entries;
  const embeddedValue = embeddedEntries?.[`${contentType}|${entityId}|${language}`];
  if (embeddedValue && typeof embeddedValue === "object" && !Array.isArray(embeddedValue)) {
    return Object.fromEntries(
      Object.entries(embeddedValue).filter(([, item]) => typeof item === "string" && item.trim()),
    ) as Record<string, string>;
  }
  const snapshot = await readJson([
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
