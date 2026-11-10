import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import {
  generatedImages,
  generatedAudio,
  generatedPresentations,
  socialAssets,
  news,
  type GeneratedImage,
  type InsertGeneratedImage,
  type GeneratedAudio,
  type InsertGeneratedAudio,
  type GeneratedPresentation,
  type InsertGeneratedPresentation,
  type SocialAsset,
  type InsertSocialAsset,
} from "@shared/schema";
export class GeneratedAssetsRepository {
  async getGeneratedImages(): Promise<
    (GeneratedImage & {
      articleTitle: string | null;
      articleSlug: string | null;
    })[]
  > {
    const rows = await db
      .select({
        id: generatedImages.id,
        imageUrl: generatedImages.imageUrl,
        prompt: generatedImages.prompt,
        sanitizedPrompt: generatedImages.sanitizedPrompt,
        engine: generatedImages.engine,
        articleId: generatedImages.articleId,
        createdAt: generatedImages.createdAt,
        articleTitle: news.titleEs,
        articleSlug: news.slug,
      })
      .from(generatedImages)
      .leftJoin(news, eq(generatedImages.articleId, news.id))
      .orderBy(desc(generatedImages.createdAt));
    return rows;
  }

  async createGeneratedImage(
    image: InsertGeneratedImage,
  ): Promise<GeneratedImage> {
    const [created] = await db
      .insert(generatedImages)
      .values(image)
      .returning();
    return created;
  }

  async deleteGeneratedImage(id: string): Promise<boolean> {
    const result = await db
      .delete(generatedImages)
      .where(eq(generatedImages.id, id))
      .returning();
    return result.length > 0;
  }

  async getGeneratedAudio(): Promise<
    (GeneratedAudio & {
      articleTitle: string | null;
      articleSlug: string | null;
    })[]
  > {
    const rows = await db
      .select({
        id: generatedAudio.id,
        audioUrl: generatedAudio.audioUrl,
        sourceText: generatedAudio.sourceText,
        voiceId: generatedAudio.voiceId,
        engine: generatedAudio.engine,
        sourceType: generatedAudio.sourceType,
        articleId: generatedAudio.articleId,
        createdAt: generatedAudio.createdAt,
        articleTitle: news.titleEs,
        articleSlug: news.slug,
      })
      .from(generatedAudio)
      .leftJoin(news, eq(generatedAudio.articleId, news.id))
      .orderBy(desc(generatedAudio.createdAt));
    return rows;
  }

  async createGeneratedAudio(
    audio: InsertGeneratedAudio,
  ): Promise<GeneratedAudio> {
    const [created] = await db.insert(generatedAudio).values(audio).returning();
    return created;
  }

  async deleteGeneratedAudio(id: string): Promise<boolean> {
    const result = await db
      .delete(generatedAudio)
      .where(eq(generatedAudio.id, id))
      .returning();
    return result.length > 0;
  }

  async getGeneratedPresentations(): Promise<GeneratedPresentation[]> {
    return await db
      .select()
      .from(generatedPresentations)
      .orderBy(desc(generatedPresentations.createdAt));
  }

  async getGeneratedPresentationById(
    id: string,
  ): Promise<GeneratedPresentation | undefined> {
    const [presentation] = await db
      .select()
      .from(generatedPresentations)
      .where(eq(generatedPresentations.id, id));
    return presentation;
  }

  async createGeneratedPresentation(
    presentation: InsertGeneratedPresentation & { id?: string },
  ): Promise<GeneratedPresentation> {
    const [created] = await db
      .insert(generatedPresentations)
      .values(presentation)
      .returning();
    return created;
  }

  async deleteGeneratedPresentation(id: string): Promise<boolean> {
    const result = await db
      .delete(generatedPresentations)
      .where(eq(generatedPresentations.id, id))
      .returning();
    return result.length > 0;
  }

  async getSocialAssets(kind?: string): Promise<SocialAsset[]> {
    const query = db.select().from(socialAssets).orderBy(desc(socialAssets.createdAt));
    if (!kind) return query;
    return db.select().from(socialAssets).where(eq(socialAssets.kind, kind)).orderBy(desc(socialAssets.createdAt));
  }

  async getSocialAssetById(id: string): Promise<SocialAsset | undefined> {
    const [asset] = await db.select().from(socialAssets).where(eq(socialAssets.id, id));
    return asset;
  }

  async createSocialAsset(asset: any): Promise<SocialAsset> {
    const [created] = await db.insert(socialAssets).values(asset).returning();
    return created;
  }

  async updateSocialAsset(id: string, data: any): Promise<SocialAsset | undefined> {
    const [updated] = await db.update(socialAssets).set({ ...data, updatedAt: new Date() }).where(eq(socialAssets.id, id)).returning();
    return updated;
  }

  async archiveSocialAsset(id: string): Promise<boolean> {
    const result = await db.update(socialAssets).set({ status: "archived", archivedAt: new Date(), updatedAt: new Date() }).where(eq(socialAssets.id, id)).returning({ id: socialAssets.id });
    return result.length > 0;
  }
}
