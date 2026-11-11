import { db } from "./db";
import {
  alliances,
  banners,
  blogPosts,
  emailSignatures,
  generatedAudio,
  generatedDocuments,
  generatedImages,
  generatedPresentations,
  industryGroups,
  mediaItems,
  news,
  officeImages,
  offices,
  practiceGroups,
  siteConfig,
  socialAssets,
  specializedDesks,
  teamMembers,
} from "@shared/schema";

const MEDIA_REFERENCE_TABLES = [
  news,
  officeImages,
  practiceGroups,
  industryGroups,
  teamMembers,
  blogPosts,
  offices,
  alliances,
  specializedDesks,
  siteConfig,
  banners,
  generatedImages,
  generatedAudio,
  generatedPresentations,
  generatedDocuments,
  socialAssets,
  emailSignatures,
] as const;

function collectStrings(value: unknown, output: string[]): void {
  if (typeof value === "string") {
    output.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, output));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, output));
  }
}

/**
 * Returns every string persisted in CMS records that may contain a media URL,
 * object key, filename, or JSON payload. This keeps the orphan audit from
 * treating logos, team photos, generated previews, and signatures as unused
 * simply because they do not belong to a news article.
 */
export async function loadMediaReferenceCorpus(): Promise<string[]> {
  const corpus: string[] = [];
  for (const table of MEDIA_REFERENCE_TABLES) {
    const rows = await db.select().from(table);
    rows.forEach((row) => collectStrings(row, corpus));
  }
  return corpus;
}

export function mediaIsReferenced(media: Pick<typeof mediaItems.$inferSelect, "path" | "filename" | "originalName">, corpus: string[]): boolean {
  const tokens = [media.path, media.filename, media.originalName, `/uploads/${media.filename}`]
    .map((token) => token?.trim())
    .filter((token): token is string => Boolean(token));
  return tokens.some((token) => corpus.some((value) => value.includes(token)));
}
