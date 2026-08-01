import "server-only";
import type { StoreListing } from "@/lib/store/listing-types";
import {
  supabaseGetPopularListings,
  supabaseRecomputeRanking,
} from "@/lib/supabase/store-listings";
import { getRankingConfig, type RankingConfig } from "@/lib/ranking/config";

/**
 * Home-page Smart Ranking reader.
 *
 * Scores are pre-computed and cached in store_listings.ranking_score. This module:
 *  1. Lazily recomputes the whole table at most once per `refreshMinutes` (a cheap
 *     safety net so the feed stays fresh even if the external hourly cron is down).
 *  2. Keeps the top candidates in an in-memory cache for a short TTL (fast reads).
 *  3. Shuffles near-equal scores on every request so the feed feels alive.
 */

let lastRecomputeAt = 0;
let candidateCache: { at: number; listings: StoreListing[] } | null = null;

const CANDIDATE_TTL_MS = 60_000; // in-memory candidate cache

/** Drop in-memory popular feed so new vendor uploads appear on the home page quickly. */
export function clearPopularListingCache(): void {
  candidateCache = null;
}

export async function maybeRecomputeRanking(cfg: RankingConfig, force = false): Promise<void> {
  const now = Date.now();
  const intervalMs = Math.max(1, cfg.refreshMinutes) * 60_000;
  if (!force && now - lastRecomputeAt < intervalMs) return;
  try {
    await supabaseRecomputeRanking(cfg);
    lastRecomputeAt = now;
    candidateCache = null; // invalidate so next read reflects new scores
  } catch {
    // Non-fatal: fall back to whatever scores are already cached in the DB.
  }
}

/** Force a recompute now (used by the admin console + cron). */
export async function recomputeRankingNow(): Promise<number> {
  const cfg = await getRankingConfig();
  const count = await supabaseRecomputeRanking(cfg);
  lastRecomputeAt = Date.now();
  candidateCache = null;
  return count;
}

async function getCandidates(cfg: RankingConfig): Promise<StoreListing[]> {
  const now = Date.now();
  if (candidateCache && now - candidateCache.at < CANDIDATE_TTL_MS) {
    return candidateCache.listings;
  }
  await maybeRecomputeRanking(cfg);
  const listings = await supabaseGetPopularListings(60);
  candidateCache = { at: now, listings };
  return listings;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle plans whose scores are within ~4% of each other, preserving overall
 * tiers. Pinned plans keep their leading order and are never shuffled.
 */
function randomizeWithinBuckets(listings: StoreListing[]): StoreListing[] {
  const pinned = listings.filter((l) => l.pinned);
  const rest = listings.filter((l) => !l.pinned);
  if (rest.length <= 1) return [...pinned, ...rest];

  const top = rest[0]?.rankingScore ?? 1;
  const step = Math.max(top * 0.04, 1e-9);

  const buckets: StoreListing[][] = [];
  let current: StoreListing[] = [];
  let bucketKey: number | null = null;
  for (const l of rest) {
    const key = Math.floor((l.rankingScore ?? 0) / step);
    if (bucketKey === null || key === bucketKey) {
      current.push(l);
    } else {
      buckets.push(current);
      current = [l];
    }
    bucketKey = key;
  }
  if (current.length) buckets.push(current);

  return [...pinned, ...buckets.flatMap((b) => (b.length > 1 ? shuffle(b) : b))];
}

export async function getPopularListings(limit?: number): Promise<StoreListing[]> {
  const cfg = await getRankingConfig();
  const candidates = await getCandidates(cfg);
  const ordered = cfg.randomize ? randomizeWithinBuckets(candidates) : candidates;
  return ordered.slice(0, limit ?? cfg.homeLimit);
}
