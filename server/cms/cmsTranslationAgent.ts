import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { cmsDefaults, isCmsSection, mergeCms, type CmsSection, type CmsValue } from "@shared/cms";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@shared/constants";
import { siteConfig, translationCache } from "@shared/schema";
import { translateMultipleTexts } from "../openai";

const SOURCE_LANGUAGE: LanguageCode = "es";
const TARGET_LANGUAGES = SUPPORTED_LANGUAGES.map(({ code }) => code).filter((code) => code !== SOURCE_LANGUAGE) as LanguageCode[];
const SKIP_KEYS = /(?:^|\.)(?:id|slug|url|href|path|image|imageUrl|video|poster|email|phone|linkedin|website|code|locale|date|year|order|published|enabled|visible)$/i;
const LANGUAGE_CODES: Set<string> = new Set(SUPPORTED_LANGUAGES.map(({ code }) => code));
type Path = (string | number)[];
type FlatText = { key: string; path: Path; text: string };

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function projectLanguage(value: unknown, language: LanguageCode): any {
  if (Array.isArray(value)) return value.map((item) => projectLanguage(item, language));
  if (!isRecord(value)) return value;
  if (Object.keys(value).some((key) => LANGUAGE_CODES.has(key))) return projectLanguage(value[language] ?? value.es ?? value.en, language);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, projectLanguage(item, language)]));
}

function flatten(value: unknown, path: Path = [], result: FlatText[] = []): FlatText[] {
  if (typeof value === "string") {
    const key = path.join(".");
    if (value.trim() && !SKIP_KEYS.test(key)) result.push({ key, path, text: value });
    return result;
  }
  if (Array.isArray(value)) value.forEach((item, index) => flatten(item, [...path, index], result));
  else if (isRecord(value)) Object.entries(value).forEach(([key, item]) => flatten(item, [...path, key], result));
  return result;
}

function setPath(root: any, path: Path, value: string) {
  let cursor = root;
  path.slice(0, -1).forEach((part, index, parts) => {
    const next = parts[index + 1];
    if (cursor[part] === undefined) cursor[part] = typeof next === "number" ? [] : {};
    cursor = cursor[part];
  });
  if (path.length) cursor[path[path.length - 1]] = value;
}

function hashSource(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function protectSensitiveTokens(text: string) {
  const values: string[] = [];
  const token = (value: string) => `[[KEEP_${values.push(value) - 1}]]`;
  return {
    safe: text.replace(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, token).replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, token),
    restore: (value: string) => value.replace(/\[\[KEEP_(\d+)\]\]/g, (_match, index) => values[Number(index)] || _match),
  };
}

export async function getCmsSectionSource(section: string): Promise<{ section: CmsSection; source: CmsValue; sourceHash: string } | undefined> {
  if (!isCmsSection(section)) return undefined;
  const [row] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, `editorial.${section}`)).limit(1);
  let override: any;
  try {
    const stored = row?.value ? JSON.parse(row.value) : null;
    override = stored?.draft ?? stored?.content;
  } catch {
    override = undefined;
  }
  const content = mergeCms(cmsDefaults[section as CmsSection], override) as CmsValue;
  const source = projectLanguage(content, SOURCE_LANGUAGE) as CmsValue;
  return { section: section as CmsSection, source, sourceHash: hashSource(source) };
}

async function translateObject(source: CmsValue, targetLanguage: LanguageCode): Promise<CmsValue> {
  const fields = flatten(source);
  const output = structuredClone(source);
  for (let index = 0; index < fields.length; index += 20) {
    const chunk = fields.slice(index, index + 20);
    const protectedFields = chunk.map((field) => ({ ...field, protected: protectSensitiveTokens(field.text) }));
    const translations = await translateMultipleTexts(protectedFields.map(({ key, protected: value }) => ({ key, text: value.safe })), SOURCE_LANGUAGE, targetLanguage);
    for (const field of chunk) {
      const protectedField = protectedFields.find((item) => item.key === field.key)!;
      const translated = protectedField.protected.restore(translations[field.key] || "");
      if (typeof translated !== "string" || !translated.trim()) throw new Error(`La IA no devolvió ${field.key} (${targetLanguage}).`);
      setPath(output, field.path, translated);
    }
  }
  return output;
}

export async function generateCmsTranslationProposal(sectionName: string, sourceHash: string, targetLanguages: LanguageCode[] = TARGET_LANGUAGES) {
  const current = await getCmsSectionSource(sectionName);
  if (!current) return { success: false, error: "Sección CMS inválida." };
  if (current.sourceHash !== sourceHash) return { success: false, stale: true, error: "La sección cambió antes de procesar la traducción." };
  const fields = flatten(current.source);
  if (!fields.length) return { success: true, section: current.section, sourceHash, proposals: 0 };
  let proposals = 0;
  for (const targetLanguage of Array.from(new Set(targetLanguages)).filter((language) => language !== SOURCE_LANGUAGE)) {
    const translated = await translateObject(current.source, targetLanguage);
    const sourceText = `sha256:${sourceHash}`;
    const [existing] = await db.select({ id: translationCache.id }).from(translationCache).where(and(
      eq(translationCache.contentType, "site_content"),
      eq(translationCache.entityId, current.section),
      eq(translationCache.targetLanguage, targetLanguage),
      eq(translationCache.sourceText, sourceText),
    )).limit(1);
    const values = { contentType: "site_content", entityId: current.section, field: null, sourceLanguage: SOURCE_LANGUAGE, targetLanguage, sourceText, translations: translated, translatedText: null, isApproved: false, updatedAt: new Date() };
    if (existing) await db.update(translationCache).set(values).where(eq(translationCache.id, existing.id));
    else await db.insert(translationCache).values(values);
    const localizedKey = `localized.${current.section}.${targetLanguage}`;
    const [localizedRow] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, localizedKey)).limit(1);
    let previous: any = null;
    try { previous = localizedRow?.value ? JSON.parse(localizedRow.value) : null; } catch { previous = null; }
    const localizedValue = JSON.stringify({ status: "pending", translationStatus: "pending", version: (previous?.version || 0) + 1, sourceLanguage: SOURCE_LANGUAGE, targetLanguage, sourceHash, sourceContent: current.source, content: previous?.status === "published" ? previous.content : null, pendingContent: translated, previous: previous?.previous || null, updatedAt: new Date().toISOString() });
    await db.insert(siteConfig).values({ key: localizedKey, value: localizedValue, type: "json", category: "localization", updatedAt: new Date() }).onConflictDoUpdate({ target: siteConfig.key, set: { value: localizedValue, type: "json", category: "localization", updatedAt: new Date() } });
    proposals++;
  }
  return { success: true, section: current.section, sourceHash, proposals };
}

export const cmsTranslationTargetLanguages = TARGET_LANGUAGES;
