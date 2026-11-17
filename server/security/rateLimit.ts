import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "../db";

type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

const digestKey = (key: string) =>
  crypto.createHash("sha256").update(key, "utf8").digest("hex");

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
  const bucketKey = digestKey(key);
  const now = new Date();
  const windowReset = new Date(now.getTime() + windowMs);
  const blockedUntil = new Date(now.getTime() + blockMs);

  return db.transaction(async (tx) => {
    await tx.execute(sql`
      INSERT INTO rate_limit_buckets (bucket_key, hit_count, window_reset_at, blocked_until)
      VALUES (${bucketKey}, 0, ${windowReset}, NULL)
      ON CONFLICT (bucket_key) DO NOTHING
    `);

    const result = await tx.execute(sql`
      SELECT hit_count, window_reset_at, blocked_until
      FROM rate_limit_buckets
      WHERE bucket_key = ${bucketKey}
      FOR UPDATE
    `);
    const row = result.rows[0] as {
      hit_count: number;
      window_reset_at: Date | string;
      blocked_until: Date | string | null;
    } | undefined;
    if (!row) return { allowed: false, retryAfter: Math.ceil(windowMs / 1000) };

    const resetAt = new Date(row.window_reset_at);
    const activeBlock = row.blocked_until ? new Date(row.blocked_until) : null;
    if (activeBlock && activeBlock > now) {
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((activeBlock.getTime() - now.getTime()) / 1000)) };
    }

    if (resetAt <= now) {
      await tx.execute(sql`
        UPDATE rate_limit_buckets
        SET hit_count = 1, window_reset_at = ${windowReset}, blocked_until = NULL
        WHERE bucket_key = ${bucketKey}
      `);
      return { allowed: true, retryAfter: Math.ceil(windowMs / 1000) };
    }

    const nextCount = Number(row.hit_count) + 1;
    if (nextCount > maxAttempts) {
      const blockUntil = new Date(Math.max(blockedUntil.getTime(), resetAt.getTime()));
      await tx.execute(sql`
        UPDATE rate_limit_buckets
        SET hit_count = ${nextCount}, blocked_until = ${blockUntil}
        WHERE bucket_key = ${bucketKey}
      `);
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((blockUntil.getTime() - now.getTime()) / 1000)) };
    }

    await tx.execute(sql`
      UPDATE rate_limit_buckets
      SET hit_count = ${nextCount}
      WHERE bucket_key = ${bucketKey}
    `);
    return { allowed: true, retryAfter: Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)) };
  });
}

export async function clearRateLimit(key: string): Promise<void> {
  await db.execute(sql`DELETE FROM rate_limit_buckets WHERE bucket_key = ${digestKey(key)}`);
}

export async function cleanRateLimitBuckets(): Promise<number> {
  const result = await db.execute(sql`
    DELETE FROM rate_limit_buckets
    WHERE COALESCE(blocked_until, window_reset_at) < now()
  `);
  return Number(result.rowCount || 0);
}
