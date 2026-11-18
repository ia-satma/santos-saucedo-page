import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { siteConfig } from "@shared/schema";

const REDIRECT_PREFIX = "news.slug_redirect.";
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,158}[a-z0-9])?$/;

export function newsSlugRedirectKey(slug: string): string {
  return `${REDIRECT_PREFIX}${slug}`;
}

export async function recordNewsSlugRedirect(fromSlug: string, toSlug: string): Promise<void> {
  if (
    fromSlug === toSlug
    || !SLUG_PATTERN.test(fromSlug)
    || !SLUG_PATTERN.test(toSlug)
  ) return;

  await db.insert(siteConfig).values({
    key: newsSlugRedirectKey(fromSlug),
    value: toSlug,
    type: "text",
    category: "seo",
    description: "Redirección histórica de slug de Monitor Laboral",
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: siteConfig.key,
    set: { value: toSlug, type: "text", category: "seo", updatedAt: new Date() },
  });
}

export async function getNewsSlugRedirect(slug: string): Promise<string | undefined> {
  if (!SLUG_PATTERN.test(slug)) return undefined;
  const [row] = await db.select({ value: siteConfig.value })
    .from(siteConfig)
    .where(and(eq(siteConfig.key, newsSlugRedirectKey(slug)), eq(siteConfig.category, "seo")))
    .limit(1);
  return row?.value && SLUG_PATTERN.test(row.value) ? row.value : undefined;
}
