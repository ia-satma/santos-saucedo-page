import type { Express } from "express";
import { createHash } from "node:crypto";
import { count, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  agentJobs,
  news,
  newsTranslations,
  translationCache,
  contentAnalysis,
  siteConfig,
} from "@shared/schema";
import { authMiddleware, requirePermission } from "../auth";
import { SUPPORTED_LANGUAGES } from "../openai";
import type { LanguageCode } from "@shared/constants";
import { cmsDefaults, cmsSections, mergeCms, type CmsValue } from "@shared/cms";
import { z } from "zod/v3";

const languageCodeSet: Set<string> = new Set(SUPPORTED_LANGUAGES.map(({ code }) => code));
const sourceHash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const nonTranslatablePath = /(?:^|\.)(?:id|slug|url|href|path|image|imageUrl|video|poster|email|phone|linkedin|website|code|locale|date|year|order|published|enabled|visible)$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function languageProjection(value: unknown, language: string): unknown {
  if (Array.isArray(value)) return value.map((item) => languageProjection(item, language));
  if (!isRecord(value)) return value;
  if (Object.keys(value).some((key) => languageCodeSet.has(key))) {
    return languageProjection(value[language] ?? value.es ?? value.en, language);
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, languageProjection(item, language)]));
}

function explicitLanguageProjection(value: unknown, language: string): unknown {
  if (Array.isArray(value)) return value.map((item) => explicitLanguageProjection(item, language));
  if (!isRecord(value)) return value;
  if (Object.keys(value).some((key) => languageCodeSet.has(key))) {
    return value[language] === undefined ? undefined : explicitLanguageProjection(value[language], language);
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, explicitLanguageProjection(item, language)]));
}

function hasLanguageNode(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasLanguageNode);
  if (!isRecord(value)) return false;
  if (Object.keys(value).some((key) => languageCodeSet.has(key))) return true;
  return Object.values(value).some(hasLanguageNode);
}

function textLeaves(value: unknown, path: string[] = [], result: Map<string, string> = new Map()) {
  if (typeof value === "string") {
    if (value.trim() && !nonTranslatablePath.test(path.join("."))) result.set(path.join("."), value);
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => textLeaves(item, [...path, String(index)], result));
    return result;
  }
  if (isRecord(value)) Object.entries(value).forEach(([key, item]) => textLeaves(item, [...path, key], result));
  return result;
}

function localizedCoverage(content: CmsValue, localized: unknown, language: string) {
  const source = textLeaves(languageProjection(content, "es"));
  const translated = localized !== undefined
    ? textLeaves(localized)
    : textLeaves(explicitLanguageProjection(content, language));
  const translatedCount = Array.from(source.keys()).filter((key) => translated.get(key)?.trim()).length;
  return { translated: translatedCount, total: source.size };
}
export function registerAgentReportRoutes(app: Express) {
  const allLanguageCodes: LanguageCode[] = SUPPORTED_LANGUAGES.map(({ code }) => code as LanguageCode);
  const readActiveLanguages = async () => {
    const [row] = await db
      .select({ value: siteConfig.value })
      .from(siteConfig)
      .where(eq(siteConfig.key, "active_languages"))
      .limit(1);
    const saved = (row?.value || "")
      .split(",")
      .map((code) => code.trim())
      .filter((code): code is LanguageCode => allLanguageCodes.includes(code as LanguageCode));
    return saved.length ? Array.from(new Set(saved)) : ["es", "en"];
  };

  app.get("/api/active-languages", async (_req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store");
      const activeLanguages = await readActiveLanguages();
      res.json({
        activeLanguages,
        languages: SUPPORTED_LANGUAGES.map((language) => ({
          ...language,
          enabled: activeLanguages.includes(language.code),
        })),
      });
    } catch {
      res.status(503).json({ error: "No se pudo consultar los idiomas activos." });
    }
  });

  app.put(
    "/api/admin/active-languages",
    authMiddleware,
    requirePermission("advanced"),
    async (req, res) => {
      const requested = Array.isArray(req.body?.activeLanguages)
        ? req.body.activeLanguages.filter((code: unknown): code is string => typeof code === "string")
        : [];
      const activeLanguages: LanguageCode[] = Array.from(new Set(requested))
        .filter((code): code is LanguageCode => allLanguageCodes.includes(code as LanguageCode));
      if (!activeLanguages.includes("es")) {
        return res.status(400).json({ error: "Español debe permanecer activo porque es el idioma base del CMS." });
      }
      try {
        const value = activeLanguages.join(",");
        await db
          .insert(siteConfig)
          .values({ key: "active_languages", value, type: "text", category: "localization", updatedAt: new Date() })
          .onConflictDoUpdate({ target: siteConfig.key, set: { value, type: "text", category: "localization", updatedAt: new Date() } });
        res.json({
          activeLanguages,
          languages: SUPPORTED_LANGUAGES.map((language) => ({ ...language, enabled: activeLanguages.includes(language.code) })),
        });
      } catch {
        res.status(503).json({ error: "No se pudieron guardar los idiomas activos." });
      }
    },
  );

  app.get(
    "/api/admin/agent-metrics",
    authMiddleware,
    requirePermission("advanced"),
    async (_req, res) => {
      try {
        const [jobs, translations, cache, analysis] = await Promise.all([
          db
            .select({
              agentType: agentJobs.agentType,
              status: agentJobs.status,
              total: count(),
              duration: sql<number>`coalesce(avg(extract(epoch from (${agentJobs.completedAt} - ${agentJobs.startedAt}))),0)`,
            })
            .from(agentJobs)
            .groupBy(agentJobs.agentType, agentJobs.status),
          db
            .select({ language: newsTranslations.language, total: count() })
            .from(newsTranslations)
            .groupBy(newsTranslations.language),
          db.select({ total: count() }).from(translationCache),
          db.select({ total: count() }).from(contentAnalysis),
        ]);
        res.json({
          jobs: jobs.map((j) => ({ ...j, duration: Number(j.duration) })),
          translations,
          cachedTranslations: cache[0].total,
          analyzedArticles: analysis[0].total,
        });
      } catch {
        res
          .status(503)
          .json({ error: "No se pudieron consultar las métricas." });
      }
    },
  );
  app.get(
    "/api/admin/translation-overview",
    authMiddleware,
    requirePermission("advanced"),
    async (_req, res) => {
      try {
        const [articles, translations, activeLanguages, cmsRows] = await Promise.all([
          db
            .select({
              id: news.id,
              title: news.title,
              titleEs: news.titleEs,
              excerpt: news.excerpt,
              excerptEs: news.excerptEs,
              content: news.content,
              contentEs: news.contentEs,
              published: news.published,
            })
            .from(news),
          db
            .select({
              newsId: newsTranslations.newsId,
              language: newsTranslations.language,
              isApproved: newsTranslations.isApproved,
            })
            .from(newsTranslations),
          readActiveLanguages(),
          db.select({ key: siteConfig.key, value: siteConfig.value }).from(siteConfig),
        ]);
        const languages = activeLanguages;
        const allLanguages = SUPPORTED_LANGUAGES.map((language) => ({
          ...language,
          enabled: activeLanguages.includes(language.code),
        }));
        const hasText = (value: unknown) => typeof value === "string" && value.trim().length > 0;
        const articleRows = articles.map((a) => {
          const translatedLanguages = [
            hasText(a.titleEs) && hasText(a.excerptEs) ? "es" : null,
            hasText(a.title) && hasText(a.excerpt) ? "en" : null,
            ...translations.filter((t) => t.newsId === a.id).map((t) => t.language),
          ].filter((language): language is string => Boolean(language));
          return {
            ...a,
            translatedLanguages,
            pendingLanguages: translations
              .filter((t) => t.newsId === a.id && t.isApproved === false)
              .map((t) => t.language),
            missingLanguages: languages.filter(
              (l) => !translatedLanguages.includes(l),
            ),
          };
        });
        const totalCells = articleRows.length * languages.length;
        const translatedCells = articleRows.reduce(
          (sum, article) => sum + languages.filter((language) => article.translatedLanguages.includes(language)).length,
          0,
        );
        const languageCoverage = languages.map((language) => {
          const translated = articleRows.filter((article) => article.translatedLanguages.includes(language)).length;
          return {
            ...SUPPORTED_LANGUAGES.find((item) => item.code === language)!,
            translated,
            total: articleRows.length,
            percentage: articleRows.length ? Math.round((translated / articleRows.length) * 100) : 100,
          };
        });
        const savedSections = new Map<string, unknown>();
        const localizedSections = new Map<string, { content: unknown; sourceHash?: string }>();
        for (const row of cmsRows) {
          if (row.key.startsWith("editorial.")) {
            try {
              const parsed = row.value ? JSON.parse(row.value) : null;
              if (parsed?.content !== undefined) savedSections.set(row.key.slice("editorial.".length), parsed.content);
            } catch {
              // Preserve the rest of the overview when an override is malformed.
            }
          }
          const match = /^localized\.([^.]+)\.([a-z]{2})$/.exec(row.key);
          if (!match || !languageCodeSet.has(match[2])) continue;
          try {
            const parsed = row.value ? JSON.parse(row.value) : null;
            if (parsed?.status === "published" && parsed.content !== undefined) localizedSections.set(`${match[1]}:${match[2]}`, { content: parsed.content, sourceHash: parsed.sourceHash });
          } catch {
            // A malformed localized copy is counted as missing content.
          }
        }
        const pageCoverage = cmsSections.filter((section) => hasLanguageNode(mergeCms(cmsDefaults[section.key], savedSections.get(section.key)))).map((section) => {
          const content = mergeCms(cmsDefaults[section.key], savedSections.get(section.key)) as CmsValue;
          const byLanguage = languages.map((language) => {
            const localized = localizedSections.get(`${section.key}:${language}`);
            const source = languageProjection(content, "es");
            const result = localizedCoverage(content, localized && localized.sourceHash === sourceHash(source) ? localized.content : undefined, language);
            return { language, ...result, percentage: result.total ? Math.round((result.translated / result.total) * 100) : 100 };
          });
          const translated = byLanguage.reduce((sum, row) => sum + row.translated, 0);
          const total = byLanguage.reduce((sum, row) => sum + row.total, 0);
          return { section: section.key, label: section.label, path: section.path, translated, total, percentage: total ? Math.round((translated / total) * 100) : 100, byLanguage };
        });
        const siteTranslatedCells = pageCoverage.reduce((sum, page) => sum + page.translated, 0);
        const siteTotalCells = pageCoverage.reduce((sum, page) => sum + page.total, 0);
        const siteLanguageCoverage = languages.map((language) => {
          const rows = pageCoverage.flatMap((page) => page.byLanguage.filter((item) => item.language === language));
          const translated = rows.reduce((sum, row) => sum + row.translated, 0);
          const total = rows.reduce((sum, row) => sum + row.total, 0);
          return { ...SUPPORTED_LANGUAGES.find((item) => item.code === language)!, translated, total, percentage: total ? Math.round((translated / total) * 100) : 100 };
        });
        res.json({
          languages,
          allLanguages,
          activeLanguages,
          coverage: {
            translatedCells,
            totalCells,
            percentage: totalCells ? Math.round((translatedCells / totalCells) * 100) : 100,
          },
          languageCoverage,
          siteCoverage: {
            translatedCells: siteTranslatedCells,
            totalCells: siteTotalCells,
            percentage: siteTotalCells ? Math.round((siteTranslatedCells / siteTotalCells) * 100) : 100,
            languageCoverage: siteLanguageCoverage,
            pages: pageCoverage,
          },
          articles: articleRows,
        });
      } catch {
        res
          .status(503)
          .json({
            error: "No se pudo consultar la cobertura de traducciones.",
          });
      }
    },
  );

  app.post(
    "/api/admin/news/:newsId/translations/:language/approve",
    authMiddleware,
    requirePermission("advanced"),
    async (req, res) => {
      const newsId = z.string().uuid().safeParse(req.params.newsId);
      const language = z.string().length(2).safeParse(req.params.language);
      if (!newsId.success || !language.success || !allLanguageCodes.includes(language.data as LanguageCode)) {
        return res.status(400).json({ error: "Traducción inválida." });
      }
      try {
        const [updated] = await db
          .update(newsTranslations)
          .set({ isApproved: true })
          .where(sql`${newsTranslations.newsId} = ${newsId.data} AND ${newsTranslations.language} = ${language.data}`)
          .returning({ id: newsTranslations.id });
        if (!updated) return res.status(404).json({ error: "No existe una traducción para aprobar." });
        await db
          .update(translationCache)
          .set({ isApproved: true, updatedAt: new Date() })
          .where(sql`${translationCache.entityId} = ${newsId.data} AND ${translationCache.contentType} = 'news' AND ${translationCache.targetLanguage} = ${language.data}`);
        res.json({ approved: true, newsId: newsId.data, language: language.data });
      } catch {
        res.status(503).json({ error: "No se pudo aprobar la traducción." });
      }
    },
  );
}
