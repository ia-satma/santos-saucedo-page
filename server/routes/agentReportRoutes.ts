import type { Express } from "express";
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
    return saved.length ? Array.from(new Set(saved)) : allLanguageCodes;
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
        const [articles, translations, activeLanguages] = await Promise.all([
          db
            .select({
              id: news.id,
              title: news.title,
              titleEs: news.titleEs,
              published: news.published,
            })
            .from(news),
          db
            .select({
              newsId: newsTranslations.newsId,
              language: newsTranslations.language,
            })
            .from(newsTranslations),
          readActiveLanguages(),
        ]);
        const languages = activeLanguages;
        const allLanguages = SUPPORTED_LANGUAGES.map((language) => ({
          ...language,
          enabled: activeLanguages.includes(language.code),
        }));
        const articleRows = articles.map((a) => {
          const translatedLanguages = Array.from(
            new Set([
              "es",
              "en",
              ...translations
                .filter((t) => t.newsId === a.id)
                .map((t) => t.language),
            ]),
          );
          return {
            ...a,
            translatedLanguages,
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
        res.json({
          languages,
          allLanguages,
          activeLanguages,
          coverage: {
            translatedCells,
            totalCells,
            percentage: totalCells ? Math.round((translatedCells / totalCells) * 100) : 100,
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
}
