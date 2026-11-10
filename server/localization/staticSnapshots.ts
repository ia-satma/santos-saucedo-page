import { readFile } from "node:fs/promises";
import path from "node:path";

type Snapshot = Record<string, unknown>;

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
  const snapshot = await readJson([
    path.join(staticApi, "site-config.json"),
    path.join(shared, "cms-static-snapshot.json"),
  ]);
  if (!snapshot) return undefined;
  const content = "content" in snapshot && snapshot.content && typeof snapshot.content === "object"
    ? snapshot.content as Snapshot
    : snapshot;
  const sectionContent = content[section];
  if (!sectionContent || typeof sectionContent !== "object" || Array.isArray(sectionContent)) return undefined;
  return (sectionContent as Snapshot)[language];
}

export async function readStaticEntityTranslation(
  contentType: string,
  entityId: string,
  language: string,
): Promise<Record<string, string> | undefined> {
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
