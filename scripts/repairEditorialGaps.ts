import "dotenv/config";
import { eq, isNull } from "drizzle-orm";
import { db } from "../server/db";
import { mediaItems, news, newsTranslations } from "../shared/schema";
import { initializeAgents, orchestrator } from "../server/agents";
import type { LanguageCode } from "../shared/constants";

const LANGUAGES: LanguageCode[] = ["en", "es", "de", "zh", "ko", "ja", "ar", "ru", "fr", "it"];
const actorId = process.env.REPAIR_ACTOR_ID || null;

async function repairTranslations(articleId: string, missing: LanguageCode[]) {
  if (missing.length === 0) return { success: true, translated: 0 };
  const result = await orchestrator.executeImmediately("polyglot_translator", {
    articleId,
    targetLanguages: missing,
    forceRetranslate: false,
    applyChanges: true,
  }, { actorId, origin: "manual" });
  return {
    success: result.success,
    translated: Number((result.data as { translatedCount?: number } | undefined)?.translatedCount || 0),
    error: result.error,
  };
}

async function repairImage(articleId: string) {
  const result = await orchestrator.executeImmediately("image_suggestion", {
    articleId,
    applyChanges: true,
  }, { actorId, origin: "manual" });
  return {
    success: result.success,
    imageUrl: (result.data as { imageUrl?: string } | undefined)?.imageUrl || null,
    error: result.error,
  };
}

async function main() {
  await initializeAgents();
  const articles = await db.select().from(news).where(eq(news.published, true));
  const results: Array<Record<string, unknown>> = [];

  for (const article of articles) {
    const existing = await db.select({ language: newsTranslations.language })
      .from(newsTranslations)
      .where(eq(newsTranslations.newsId, article.id));
    const translated = new Set(existing.map((row) => row.language as LanguageCode));
    const missing = LANGUAGES.filter((language) => language !== "en" && language !== "es" && !translated.has(language));
    const entry: Record<string, unknown> = { articleId: article.id, title: article.title, missingLanguages: missing };

    if (missing.length > 0) entry.translation = await repairTranslations(article.id, missing);
    if (!article.imageUrl?.trim()) entry.image = await repairImage(article.id);
    results.push(entry);
    console.log(JSON.stringify(entry));
  }

  const referenced = new Set(
    articles.map((article) => article.imageUrl).filter((value): value is string => Boolean(value?.trim())),
  );
  const orphans = await db.select().from(mediaItems).where(isNull(mediaItems.archivedAt));
  const orphanReport = orphans
    .filter((media) => !referenced.has(media.path) && !referenced.has(`/uploads/${media.filename}`) && !referenced.has(media.filename))
    .map((media) => ({ id: media.id, originalName: media.originalName, path: media.path }));
  if (process.env.ARCHIVE_ORPHANS === "true") {
    for (const orphan of orphanReport) {
      await db.update(mediaItems).set({ archivedAt: new Date() }).where(eq(mediaItems.id, orphan.id));
    }
  }
  console.log(JSON.stringify({ orphanMediaReview: orphanReport, archivedOrphans: process.env.ARCHIVE_ORPHANS === "true" }));

  const failed = results.some((entry) =>
    [entry.translation, entry.image].some((value) => value && (value as { success?: boolean }).success === false),
  );
  if (failed) process.exitCode = 1;
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
