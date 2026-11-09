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
import { newsTranslations, siteConfig, translationCache } from "../shared/schema";
import { isCmsSection } from "../shared/cms";

const root = process.cwd();
const translationPath = path.join(root, "shared/translation-snapshot.json");
const cmsPath = path.join(root, "shared/cms-static-snapshot.json");

function put(entries: Record<string, Record<string, string>>, contentType: string, entityId: string, language: string, field: string, value: unknown) {
  if (typeof value !== "string" || !value.trim()) return;
  const key = `${contentType}|${entityId}|${language}`;
  (entries[key] ||= {})[field] = value;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL es obligatorio para exportar la localización del CMS.");
  }

  const entries: Record<string, Record<string, string>> = {};
  const cached = await db.select().from(translationCache).where(and(
    eq(translationCache.isApproved, true),
    or(
      isNotNull(translationCache.translatedText),
      isNotNull(translationCache.translations),
    ),
  ));
  for (const row of cached) {
    if (row.translations && typeof row.translations === "object" && !Array.isArray(row.translations)) {
      for (const [field, value] of Object.entries(row.translations as Record<string, unknown>)) {
        put(entries, row.contentType, row.entityId, row.targetLanguage, field, value);
      }
    }
    put(entries, row.contentType, row.entityId, row.targetLanguage, row.field || "content", row.translatedText);
  }

  const news = await db.select().from(newsTranslations);
  for (const row of news) {
    put(entries, "news", row.newsId, row.language, "title", row.title);
    put(entries, "news", row.newsId, row.language, "excerpt", row.excerpt);
    put(entries, "news", row.newsId, row.language, "content", row.content);
    put(entries, "news", row.newsId, row.language, "seoTitle", row.seoTitle);
    put(entries, "news", row.newsId, row.language, "seoDescription", row.seoDescription);
  }

  const rows = await db.select().from(siteConfig);
  const content: Record<string, any> = {};
  for (const row of rows) {
    if (row.key.startsWith("localized.")) {
      const [, section, language] = row.key.split(".");
      if (!section || !language || !isCmsSection(section)) continue;
      try {
        const parsed = row.value ? JSON.parse(row.value) : null;
        if (parsed?.status === "published" && parsed.content !== undefined) {
          content[section] = { ...(content[section] || {}), [language]: parsed.content };
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
      if (parsed?.content !== undefined) content[section] = parsed.content;
    } catch {
      // Una sección corrupta no debe impedir exportar las demás.
    }
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
