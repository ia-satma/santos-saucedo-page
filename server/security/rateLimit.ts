import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { editorialDb } from "../db";

type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

const digestKey = (key: string) =>
  crypto.createHash("sha256").update(key, "utf8").digest("hex");
const bucketKeyFor = (key: string) => `__rate_limit__:${digestKey(key)}`;
const encodeBucket = (hitCount: number, windowResetAt: Date, blockedUntil: Date | null) =>
  JSON.stringify({ hitCount, windowResetAt: windowResetAt.toISOString(), blockedUntil: blockedUntil?.toISOString() ?? null });

/**
 * Shared PostgreSQL limiter for public and authentication-sensitive flows.
 * The row lock keeps limits consistent when Replit runs several instances.
 */
export async function consumeRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
  blockMs = windowMs,
): Promise<RateLimitResult> {
  const bucketKey = bucketKeyFor(key);
  const now = new Date();
  const windowReset = new Date(now.getTime() + windowMs);
  const blockedUntil = new Date(now.getTime() + blockMs);

  return editorialDb.transaction(async (tx) => {
    await tx.execute(sql`
      INSERT INTO site_config (key, value, type, category, updated_at)
      VALUES (${bucketKey}, ${encodeBucket(0, windowReset, null)}, 'json', 'security', now())
      ON CONFLICT (key) DO NOTHING
    `);

    const result = await tx.execute(sql`
      SELECT value FROM site_config WHERE key = ${bucketKey}
      FOR UPDATE
    `);
    const raw = result.rows[0] as { value: string | null } | undefined;
    let row: { hitCount: number; windowResetAt: string; blockedUntil: string | null } | undefined;
    try { row = raw?.value ? JSON.parse(raw.value) : undefined; } catch { row = undefined; }
    if (!row) return { allowed: false, retryAfter: Math.ceil(windowMs / 1000) };

    const resetAt = new Date(row.windowResetAt);
    const activeBlock = row.blockedUntil ? new Date(row.blockedUntil) : null;
    if (activeBlock && activeBlock > now) {
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((activeBlock.getTime() - now.getTime()) / 1000)) };
    }

    if (resetAt <= now) {
      await tx.execute(sql`
        UPDATE site_config SET value = ${encodeBucket(1, windowReset, null)}, updated_at = now()
        WHERE key = ${bucketKey}
      `);
      return { allowed: true, retryAfter: Math.ceil(windowMs / 1000) };
    }

    const nextCount = Number(row.hitCount) + 1;
    if (nextCount > maxAttempts) {
      const blockUntil = new Date(Math.max(blockedUntil.getTime(), resetAt.getTime()));
      await tx.execute(sql`
        UPDATE site_config SET value = ${encodeBucket(nextCount, resetAt, blockUntil)}, updated_at = now()
        WHERE key = ${bucketKey}
      `);
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((blockUntil.getTime() - now.getTime()) / 1000)) };
    }

    await tx.execute(sql`
      UPDATE site_config SET value = ${encodeBucket(nextCount, resetAt, null)}, updated_at = now()
      WHERE key = ${bucketKey}
    `);
    return { allowed: true, retryAfter: Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)) };
  });
}

export async function clearRateLimit(key: string): Promise<void> {
  await editorialDb.execute(sql`DELETE FROM site_config WHERE key = ${bucketKeyFor(key)}`);
}

export async function cleanRateLimitBuckets(): Promise<number> {
  const rows = await editorialDb.execute(sql`SELECT key, value FROM site_config WHERE key LIKE '__rate_limit__:%'`);
  let removed = 0;
  for (const row of rows.rows as { key: string; value: string | null }[]) {
    try {
      const bucket = JSON.parse(row.value || '{}') as { windowResetAt?: string; blockedUntil?: string | null };
      const expiresAt = new Date(bucket.blockedUntil || bucket.windowResetAt || 0);
      if (expiresAt < new Date()) {
        await editorialDb.execute(sql`DELETE FROM site_config WHERE key = ${row.key}`);
        removed += 1;
      }
    } catch {
      await editorialDb.execute(sql`DELETE FROM site_config WHERE key = ${row.key}`);
      removed += 1;
    }
  }
  return removed;
}
