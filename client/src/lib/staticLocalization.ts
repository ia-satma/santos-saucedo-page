import cmsSnapshot from "@shared/cms-static-snapshot.json";
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

export function getStaticCmsSection(section: string, language: string): unknown {
  const content = cmsSnapshot.content as Snapshot;
  const sectionContent = content[section];
  if (!sectionContent || typeof sectionContent !== "object") return undefined;
  return selectLanguage(sectionContent, language);
}

export function getStaticEntityTranslation(
  contentType: string,
  entityId: string,
  language: string,
): Record<string, string> | undefined {
  const key = `${contentType}|${entityId}|${language}`;
  const value = (translationSnapshot.entries as Snapshot)[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === "string" && item.trim()),
  ) as Record<string, string>;
}
