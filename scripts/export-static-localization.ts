/**
 * Exporta el contenido localizado del CMS para el frontend estático.
 *
 * Este comando no traduce ni publica: toma únicamente traducciones y secciones
 * ya guardadas en la base editorial. La traducción masiva se ejecuta desde el
 * agente Polyglot o `scripts/translate-all-content.ts` y después se exporta.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, or, isNotNull } from "drizzle-orm";
import { db } from "../server/db";
import { industryGroups, news as newsTable, newsTranslations, practiceGroups, siteConfig, teamMembers, translationCache } from "../shared/schema";
import { cmsDefaults, isCmsSection, mergeCms } from "../shared/cms";
import { SUPPORTED_LANGUAGES } from "../shared/constants";

const root = process.cwd();
const translationPath = path.join(root, "shared/translation-snapshot.json");
const cmsPath = path.join(root, "shared/cms-static-snapshot.json");

const LANGUAGE_CODES = new Set(SUPPORTED_LANGUAGES.map(({ code }) => code));

function put(entries: Record<string, Record<string, string>>, contentType: string, entityId: string, language: string, field: string, value: unknown, aliases: string[] = []) {
  if (typeof value !== "string" || !value.trim()) return;
  for (const id of [entityId, ...aliases]) {
    const key = `${contentType}|${id}|${language}`;
    (entries[key] ||= {})[field] = value;
  }
}

function stableEntityId(contentType: string, slug: unknown): string | undefined {
  if (typeof slug !== "string" || !slug.trim()) return undefined;
  const prefix = contentType === "team_member"
    ? "team"
    : contentType === "practice_group"
      ? "practice"
      : contentType === "industry_group"
        ? "industry"
        : contentType === "news"
          ? "news"
          : undefined;
  return prefix ? `${prefix}-${slug}` : undefined;
}

/** Applies a language projection to a nested CMS object (SEO, links, forms, etc.). */
function overlayLanguage(base: any, localized: any, language: string): any {
  if (base === null || base === undefined) return localized;
  if (Array.isArray(base)) {
    return Array.isArray(localized)
      ? base.map((value, index) => overlayLanguage(value, localized[index], language))
      : base;
  }
  if (typeof base !== "object") return localized === undefined ? base : localized;
  const record = base as Record<string, unknown>;
  if (Object.keys(record).some((key) => LANGUAGE_CODES.has(key))) {
    return { ...record, [language]: localized };
  }
  if (!localized || typeof localized !== "object" || Array.isArray(localized)) return base;
  const output: Record<string, unknown> = { ...record };
  for (const key of Object.keys(record)) {
    output[key] = overlayLanguage(record[key], (localized as Record<string, unknown>)[key], language);
  }
  return output;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL es obligatorio para exportar la localización del CMS.");
  }

  const entries: Record<string, Record<string, string>> = {};
  const [teamRows, practiceRows, industryRows, newsRows] = await Promise.all([
    db.select({ id: teamMembers.id, slug: teamMembers.slug }).from(teamMembers),
    db.select({ id: practiceGroups.id, slug: practiceGroups.slug }).from(practiceGroups),
    db.select({ id: industryGroups.id, slug: industryGroups.slug }).from(industryGroups),
    db.select({ id: newsTable.id, slug: newsTable.slug }).from(newsTable),
  ]);
  const stableIds = new Map<string, string>();
  for (const row of teamRows) { const stable = stableEntityId("team_member", row.slug); if (stable) stableIds.set(`team_member|${row.id}`, stable); }
  for (const row of practiceRows) { const stable = stableEntityId("practice_group", row.slug); if (stable) stableIds.set(`practice_group|${row.id}`, stable); }
  for (const row of industryRows) { const stable = stableEntityId("industry_group", row.slug); if (stable) stableIds.set(`industry_group|${row.id}`, stable); }
  for (const row of newsRows) { const stable = stableEntityId("news", row.slug); if (stable) stableIds.set(`news|${row.id}`, stable); }

  const cached = await db.select().from(translationCache).where(and(
    eq(translationCache.isApproved, true),
    or(
      isNotNull(translationCache.translatedText),
      isNotNull(translationCache.translations),
    ),
  ));
  for (const row of cached) {
    const alias = stableIds.get(`${row.contentType}|${row.entityId}`);
    const aliases = alias ? [alias] : [];
    if (row.translations && typeof row.translations === "object" && !Array.isArray(row.translations)) {
      for (const [field, value] of Object.entries(row.translations as Record<string, unknown>)) {
        put(entries, row.contentType, row.entityId, row.targetLanguage, field, value, aliases);
      }
    }
    put(entries, row.contentType, row.entityId, row.targetLanguage, row.field || "content", row.translatedText, aliases);
  }

  const news = await db.select().from(newsTranslations);
  for (const row of news) {
    const alias = stableIds.get(`news|${row.newsId}`);
    const aliases = alias ? [alias] : [];
    put(entries, "news", row.newsId, row.language, "title", row.title, aliases);
    put(entries, "news", row.newsId, row.language, "excerpt", row.excerpt, aliases);
    put(entries, "news", row.newsId, row.language, "content", row.content, aliases);
    put(entries, "news", row.newsId, row.language, "seoTitle", row.seoTitle, aliases);
    put(entries, "news", row.newsId, row.language, "seoDescription", row.seoDescription, aliases);
  }

  const rows = await db.select().from(siteConfig);
  const content: Record<string, any> = structuredClone(cmsDefaults);
  const localizedRows: Array<{ section: string; language: string; content: unknown }> = [];
  for (const row of rows) {
    if (row.key.startsWith("localized.")) {
      const [, section, language] = row.key.split(".");
      if (!section || !language || !isCmsSection(section)) continue;
      try {
        const parsed = row.value ? JSON.parse(row.value) : null;
        if (parsed?.status === "published" && parsed.content !== undefined) {
          localizedRows.push({ section, language, content: parsed.content });
        }
      } catch {
        // Ignore a malformed localized row and preserve the other languages.
      }
      continue;
    }
    if (!row.key.startsWith("editorial.")) continue;
    const section = row.key.slice("editorial.".length);
    if (!isCmsSection(section)) continue;
    try {
      const parsed = row.value ? JSON.parse(row.value) : null;
      if (parsed?.content !== undefined) content[section] = mergeCms(content[section], parsed.content);
    } catch {
      // Una sección corrupta no debe impedir exportar las demás.
    }
  }
  for (const localized of localizedRows) {
    content[localized.section] = overlayLanguage(content[localized.section], localized.content, localized.language);
  }

  await mkdir(path.dirname(translationPath), { recursive: true });
  await writeFile(translationPath, `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), entries }, null, 2)}\n`, "utf8");
  await writeFile(cmsPath, `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), content }, null, 2)}\n`, "utf8");
  console.log(`[static-localization] ${Object.keys(entries).length} translation entries exported`);
  console.log(`[static-localization] ${Object.keys(content).length} CMS sections exported`);
}

main().catch((error) => {
  console.error(`[static-localization] ${(error as Error).message}`);
  process.exitCode = 1;
});
