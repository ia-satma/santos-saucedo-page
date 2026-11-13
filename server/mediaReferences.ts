import { db } from "./db";
import fs from "node:fs";
import path from "node:path";
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
  // Some official brand assets are bundled into the public frontend rather
  // than stored in a CMS row. Include source/build text so those files are
  // not reported as orphaned when they are still reachable by the site.
  for (const root of ["client", "server", "shared", "dist/public"]) {
    collectSourceStrings(path.resolve(process.cwd(), root), corpus);
  }
  return corpus;
}

function collectSourceStrings(root: string, output: string[]): void {
  if (!fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") collectSourceStrings(entryPath, output);
      continue;
    }
    if (!/\.(?:css|html|js|json|jsx|map|svg|ts|tsx)$/i.test(entry.name)) continue;
    try {
      const stat = fs.statSync(entryPath);
      if (stat.size <= 3_000_000) output.push(fs.readFileSync(entryPath, "utf8"));
    } catch {
      // A file can disappear during a rebuild. The database corpus remains authoritative.
    }
  }
}

export function mediaIsReferenced(media: Pick<typeof mediaItems.$inferSelect, "path" | "filename" | "originalName">, corpus: string[]): boolean {
  const tokens = [media.path, media.filename, media.originalName, `/uploads/${media.filename}`]
    .map((token) => token?.trim())
    .filter((token): token is string => Boolean(token));
  return tokens.some((token) => corpus.some((value) => value.includes(token)));
}

export function mediaIsActiveOrphan(
  media: Pick<typeof mediaItems.$inferSelect, "path" | "filename" | "originalName" | "archivedAt">,
  corpus: string[],
): boolean {
  return !media.archivedAt && !mediaIsReferenced(media, corpus);
}
