import cmsSnapshot from "@shared/cms-static-snapshot.json";
import translationSnapshot from "@shared/translation-snapshot.json";

type Snapshot = Record<string, unknown>;

export function getStaticCmsSection(section: string, language: string): unknown {
  const content = cmsSnapshot.content as Snapshot;
  const sectionContent = content[section];
  if (!sectionContent || typeof sectionContent !== "object" || Array.isArray(sectionContent)) return undefined;
  return (sectionContent as Snapshot)[language];
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
