/**
 * Genera y publica las traducciones del contenido público del CMS.
 *
 * Requiere DATABASE_URL y la integración OpenAI configurada en el servidor.
 * Las claves nunca se leen del cliente. El comando es idempotente por hash de
 * origen: repetirlo solo regenera lo que cambió.
 */
import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../server/db";
import { translateLegalText, translateMultipleTexts, type LanguageCode } from "../server/openai";
import { cmsDefaults, mergeCms, type CmsValue } from "../shared/cms";
import { SUPPORTED_LANGUAGES } from "../shared/constants";
import {
  industryGroups,
  news,
  newsTranslations,
  practiceGroups,
  siteConfig,
  teamMembers,
  translationCache,
} from "../shared/schema";

const SOURCE_LANGUAGE: LanguageCode = "es";
const TARGET_LANGUAGES = SUPPORTED_LANGUAGES.map((item) => item.code).filter((code) => code !== SOURCE_LANGUAGE);
const LOCALIZED_PREFIX = "localized.";
const SKIP_KEYS = /(?:^|\.)(?:id|slug|url|href|path|imageUrl|video|poster|email|phone|linkedin|website|code|locale|date|year|order|published|enabled|visible)$/i;

type Path = (string | number)[];
type Flat = { key: string; path: Path; text: string };
type ProtectedText = { safe: string; restore: (value: string) => string };

function protectSensitiveTokens(text: string): ProtectedText {
  const values: string[] = [];
  const token = (value: string) => {
    const index = values.push(value) - 1;
    return `[[KEEP_${index}]]`;
  };
  // Public contact data is restored after translation. It never crosses the
  // provider boundary, so the AI governance gate can still block real secrets.
  const safe = text
    .replace(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, token)
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, token);
  return {
    safe,
    restore: (value: string) => value.replace(/\[\[KEEP_(\d+)\]\]/g, (_match, index) => values[Number(index)] || _match),
  };
}

function isRecord(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function flatten(value: unknown, path: Path = [], result: Flat[] = []): Flat[] {
  if (typeof value === "string") {
    const key = path.join(".");
    if (value.trim() && !SKIP_KEYS.test(key)) result.push({ key, path, text: value });
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, [...path, index], result));
    return result;
  }
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) flatten(item, [...path, key], result);
  }
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

function sourceHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function translateObject(source: unknown, targetLanguage: LanguageCode): Promise<any> {
  if (typeof source === "string") {
    const protectedText = protectSensitiveTokens(source);
    const result = protectedText.restore(await translateLegalText(protectedText.safe, SOURCE_LANGUAGE, targetLanguage));
    if (!result.trim()) {
      throw new Error(`La IA no devolvió la traducción (${targetLanguage}).`);
    }
    if (result.trim() === source.trim() && /[\p{L}]/u.test(source) && !/^[\p{Lu}][\p{L}\s.'’&-]{0,40}$/u.test(source.trim())) {
      throw new Error(`La IA devolvió el texto fuente sin traducir (${targetLanguage}).`);
    }
    return result;
  }
  const fields = flatten(source);
  if (!fields.length) return source;
  const translated: Record<string, string> = {};
  // Keep each provider request small and process target languages sequentially
  // in main(). This avoids a nine-language burst and makes retries idempotent.
  for (let index = 0; index < fields.length; index += 20) {
    const chunk = fields.slice(index, index + 20);
    const protectedFields = chunk.map((field) => ({ ...field, protected: protectSensitiveTokens(field.text) }));
    const result = await translateMultipleTexts(
      protectedFields.map(({ key, protected: value }) => ({ key, text: value.safe })),
      SOURCE_LANGUAGE,
      targetLanguage,
    );
    const unchanged = protectedFields.filter((field) => result[field.key]?.trim() === field.protected.safe.trim());
    const isLikelyProperField = (field: Flat) => /(?:titleFirst|titleSecond|place\.\d+)$/i.test(field.key);
    if (unchanged.length === chunk.length && unchanged.some((field) => !isLikelyProperField(field))) {
      throw new Error(`La IA devolvió el bloque fuente sin traducir (${targetLanguage}).`);
    }
    for (const field of protectedFields) {
      if (typeof result[field.key] !== "string" || !result[field.key].trim()) {
        throw new Error(`La IA no devolvió la traducción ${field.key} (${targetLanguage}).`);
      }
      translated[field.key] = field.protected.restore(result[field.key]);
    }
  }
  const output = structuredClone(source);
  for (const field of fields) setPath(output, field.path, translated[field.key]);
  return output;
}

async function saveLocalizedSection(section: string, source: unknown, targetLanguage: LanguageCode) {
  const key = `${LOCALIZED_PREFIX}${section}.${targetLanguage}`;
  const hash = sourceHash(source);
  const [existing] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
  let previous: any = null;
  try {
    const stored = existing?.value ? JSON.parse(existing.value) : null;
    previous = stored;
    if (stored?.status === "published" && stored.sourceHash === hash && stored.content) return false;
  } catch {
    // Regenerate malformed rows below.
  }
  const translated = await translateObject(source, targetLanguage);
  const previousRevision = previous?.status === "published" && previous.content
    ? {
        sourceHash: previous.sourceHash,
        sourceLanguage: previous.sourceLanguage,
        targetLanguage: previous.targetLanguage,
        content: previous.content,
        publishedAt: previous.publishedAt,
        version: previous.version || 1,
      }
    : previous?.previous || null;
  const value = JSON.stringify({
    status: "published",
    translationStatus: "published",
    version: (previous?.version || 0) + 1,
    sourceLanguage: SOURCE_LANGUAGE,
    targetLanguage,
    sourceHash: hash,
    sourceContent: source,
    previous: previousRevision,
    publishedAt: new Date().toISOString(),
    content: translated,
  });
  await db.insert(siteConfig)
    .values({ key, value, type: "json", category: "localization", updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteConfig.key, set: { value, type: "json", category: "localization", updatedAt: new Date() } });
  return true;
}

async function saveLocalizedFailure(section: string, source: unknown, targetLanguage: LanguageCode, error: unknown) {
  const key = `${LOCALIZED_PREFIX}${section}.${targetLanguage}`;
  const hash = sourceHash(source);
  const [existing] = await db.select({ value: siteConfig.value }).from(siteConfig).where(eq(siteConfig.key, key)).limit(1);
  let previous: any = null;
  try { previous = existing?.value ? JSON.parse(existing.value) : null; } catch { /* replace malformed metadata */ }
  const hasPublishedContent = previous?.status === "published" && previous.content;
  const value = JSON.stringify({
    // Keep the last complete publication visible while recording the failed
    // refresh. A first translation remains explicitly in error state and is
    // never exposed as empty content.
    status: hasPublishedContent ? "published" : "error",
    translationStatus: "error",
    version: previous?.version || 0,
    sourceLanguage: SOURCE_LANGUAGE,
    targetLanguage,
    sourceHash: hash,
    sourceContent: source,
    error: String(error instanceof Error ? error.message : error).slice(0, 2_000),
    failedAt: new Date().toISOString(),
    content: hasPublishedContent ? previous.content : null,
    previous: previous?.previous || null,
  });
  await db.insert(siteConfig)
    .values({ key, value, type: "json", category: "localization", updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteConfig.key, set: { value, type: "json", category: "localization", updatedAt: new Date() } });
}

async function getCmsContent() {
  const rows = await db.select().from(siteConfig);
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  const output: Record<string, any> = {};
  for (const section of Object.keys(cmsDefaults) as (keyof typeof cmsDefaults)[]) {
    let current: CmsValue = cmsDefaults[section];
    const raw = byKey.get(`editorial.${section}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        current = mergeCms(current, parsed?.content) as CmsValue;
      } catch {
        // Preserve defaults if a previous edit is malformed.
      }
    }
    output[section] = current;
  }
  return output;
}

async function saveEntityField(contentType: string, entityId: string, field: string, sourceText: string, targetLanguage: LanguageCode, translatedText: string) {
  const where = and(
    eq(translationCache.contentType, contentType),
    eq(translationCache.entityId, entityId),
    eq(translationCache.field, field),
    eq(translationCache.targetLanguage, targetLanguage),
    eq(translationCache.sourceText, sourceText),
  );
  const [existing] = await db.select().from(translationCache).where(where).limit(1);
  const values = {
    contentType,
    entityId,
    field,
    sourceLanguage: SOURCE_LANGUAGE,
    targetLanguage,
    sourceText,
    translatedText,
    isApproved: true,
    updatedAt: new Date(),
  };
  if (existing) await db.update(translationCache).set(values).where(eq(translationCache.id, existing.id));
  else await db.insert(translationCache).values(values);
}

async function translateCatalogEntity(contentType: string, entity: any, fields: string[], targetLanguage: LanguageCode) {
  const source: Record<string, string> = {};
  for (const field of fields) {
    const value = entity[`${field}Es`];
    if (typeof value === "string" && value.trim()) source[field] = value;
  }
  if (!Object.keys(source).length) return;
  const translated = await translateObject(source, targetLanguage) as Record<string, string>;
  for (const field of Object.keys(source)) {
    await saveEntityField(contentType, String(entity.id), field, source[field], targetLanguage, translated[field]);
  }
}

async function translateNewsArticle(article: any, targetLanguage: LanguageCode) {
  const source = {
    title: article.titleEs || "",
    excerpt: article.excerptEs || "",
    content: article.contentEs || "",
  };
  if (!source.title.trim() || !source.content.trim()) return;
  const translated = await translateObject(source, targetLanguage) as typeof source;
  await db.delete(newsTranslations).where(and(eq(newsTranslations.newsId, article.id), eq(newsTranslations.language, targetLanguage)));
  await db.insert(newsTranslations).values({
    newsId: article.id,
    language: targetLanguage,
    title: translated.title,
    excerpt: translated.excerpt,
    content: translated.content,
    translatedBy: "ai",
  });
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL es obligatorio.");
  if (!process.env.OPENAI_API_KEY && !(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL)) {
    throw new Error("Configura OPENAI_API_KEY o la integración OpenAI de Replit en Secrets.");
  }

  const cms = await getCmsContent();
  const sectionEntries = Object.entries(cms).filter(([, content]) => isRecord(content) && (content.es || content.en));
  const [teams, practices, industries, articles] = await Promise.all([
    db.select().from(teamMembers),
    db.select().from(practiceGroups),
    db.select().from(industryGroups),
    db.select().from(news),
  ]);
  let sections = 0;
  let errors = 0;
  // One target language at a time: all sections and public entities for the
  // current language finish before the next language starts.
  for (const target of TARGET_LANGUAGES) {
    console.log(`[translate-all] iniciando idioma ${target}`);
    for (const [section, content] of sectionEntries) {
      const source = (content as Record<string, any>).es || (content as Record<string, any>).en;
      try {
        if (await saveLocalizedSection(section, source, target)) sections++;
      } catch (error) {
        errors++;
        await saveLocalizedFailure(section, source, target, error);
        console.error(`[translate-all] ${section}/${target}: ${(error as Error).message}`);
      }
    }
    for (const entity of teams) {
      try { await translateCatalogEntity("team_member", entity, ["title", "role", "bio"], target); }
      catch (error) { errors++; console.error(`[translate-all] team_member/${entity.id}/${target}: ${(error as Error).message}`); }
    }
    for (const entity of practices) {
      try { await translateCatalogEntity("practice_group", entity, ["name", "description", "fullDescription"], target); }
      catch (error) { errors++; console.error(`[translate-all] practice_group/${entity.id}/${target}: ${(error as Error).message}`); }
    }
    for (const entity of industries) {
      try { await translateCatalogEntity("industry_group", entity, ["name", "description", "fullDescription"], target); }
      catch (error) { errors++; console.error(`[translate-all] industry_group/${entity.id}/${target}: ${(error as Error).message}`); }
    }
    for (const article of articles.filter((item) => item.published !== false)) {
      try { await translateNewsArticle(article, target); }
      catch (error) { errors++; console.error(`[translate-all] news/${article.id}/${target}: ${(error as Error).message}`); }
    }
    console.log(`[translate-all] idioma ${target} terminado`);
  }

  console.log(`[translate-all] ${sections} secciones localizadas publicadas; ${errors} errores registrados; ${TARGET_LANGUAGES.length} idiomas destino.`);
}

main().catch((error) => {
  console.error(`[translate-all] ${(error as Error).message}`);
  process.exitCode = 1;
});
