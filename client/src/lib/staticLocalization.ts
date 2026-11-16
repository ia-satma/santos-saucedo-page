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

let cmsSnapshotPromise: Promise<Snapshot> | undefined;
let translationSnapshotPromise: Promise<Snapshot> | undefined;

function loadCmsSnapshot() {
  cmsSnapshotPromise ??= import("@shared/cms-static-snapshot.json").then((module) => module.default as Snapshot);
  return cmsSnapshotPromise;
}

function loadTranslationSnapshot() {
  translationSnapshotPromise ??= import("@shared/translation-snapshot.json").then((module) => module.default as Snapshot);
  return translationSnapshotPromise;
}

export async function getStaticCmsSection(section: string, language: string): Promise<unknown> {
  const snapshot = await loadCmsSnapshot();
  const content = snapshot.content as Snapshot;
  const sectionContent = content[section];
  if (!sectionContent || typeof sectionContent !== "object") return undefined;
  return selectLanguage(sectionContent, language);
}

export async function getStaticEntityTranslation(
  contentType: string,
  entityId: string,
  language: string,
): Promise<Record<string, string> | undefined> {
  const snapshot = await loadTranslationSnapshot();
  const key = `${contentType}|${entityId}|${language}`;
  const value = (snapshot.entries as Snapshot)[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === "string" && item.trim()),
  ) as Record<string, string>;
}
