/**
 * A minimal fixed-window rate limiter.
 *
 * HONEST LIMITATION: this is in-process memory. It is genuinely effective on a
 * single Node instance and genuinely useless behind several — each instance
 * keeps its own counters. ROZE runs one process in Phase 1, so this is the
 * right amount of machinery. If the site is ever scaled horizontally, swap the
 * Map for Redis; the call sites do not change. Documented in EXTENDING.md.
 *
 * Used by /track, where the risk is someone brute-forcing order references.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number };

export function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 } = {},
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;

  // Opportunistic cleanup so the Map cannot grow without bound.
  if (buckets.size > 5_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}
