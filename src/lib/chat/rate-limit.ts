/**
 * Lightweight in-memory rate limiter for the AI concierge — a first-line cost
 * guard so a single visitor can't rack up Claude spend.
 *
 * Sliding window over request timestamps, with two tiers (per-minute burst +
 * per-hour ceiling). State lives in module memory, so it's per-Function-instance:
 * on Fluid Compute one warm instance serves most traffic, which is enough to
 * blunt abuse. For hard, cross-instance guarantees later, swap the Map for
 * Upstash Redis (Vercel Marketplace) behind this same function signature.
 */

type Tier = { windowMs: number; max: number };

const TIERS: Tier[] = [
  { windowMs: 60_000, max: 12 }, // 12 messages / minute (burst)
  { windowMs: 3_600_000, max: 80 }, // 80 messages / hour (ceiling)
];

const HOUR = 3_600_000;
const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the caller may retry, when blocked. */
  retryAfter?: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  // Keep only timestamps from the last hour (the widest window).
  const recent = (hits.get(key) ?? []).filter((t) => now - t < HOUR);

  for (const { windowMs, max } of TIERS) {
    const inWindow = recent.filter((t) => now - t < windowMs);
    if (inWindow.length >= max) {
      const oldest = Math.min(...inWindow);
      return { ok: false, retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
    }
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the Map can't grow unbounded on a long-lived instance.
  if (hits.size > 5_000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= HOUR)) hits.delete(k);
    }
  }

  return { ok: true };
}
