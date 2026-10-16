import type { Express } from "express";
import { count, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  agentJobs,
  news,
  newsTranslations,
  translationCache,
  contentAnalysis,
} from "@shared/schema";
import { authMiddleware, requirePermission } from "../auth";
import { SUPPORTED_LANGUAGES } from "../openai";
export function registerAgentReportRoutes(app: Express) {
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
        const [articles, translations] = await Promise.all([
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
        ]);
        const languages = SUPPORTED_LANGUAGES.map((l) => l.code);
        res.json({
          languages,
          articles: articles.map((a) => {
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
          }),
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
