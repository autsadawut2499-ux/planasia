import { getListings } from "@/lib/store/db";
import type { StoreListing } from "@/lib/store/listing-types";
import {
  getInteractionsForViewer,
  getRecentInteractions,
  EVENT_WEIGHT,
  type StoreInteraction,
} from "@/lib/supabase/interactions";
import { CoOccurrenceModel } from "@/lib/recommend/collaborative";
import { listingSimilarity, scoreContent } from "@/lib/recommend/content-based";
import {
  collectChatKeywords,
  computeDwellSeconds,
  computeSalesVelocity,
} from "@/lib/recommend/conversion";
import type {
  MatchBreakdown,
  RecommendationRequest,
  ScoredListing,
} from "@/lib/recommend/types";

/**
 * Blend weights for the hybrid recommender. When a signal is unavailable for a
 * given request (e.g. no filters, or a brand-new viewer with no history) its
 * weight is redistributed across the remaining active signals so the final
 * match score always spans a meaningful 0..100 range.
 */
const WEIGHTS = {
  content: 0.4,
  collaborative: 0.3,
  behavior: 0.2,
  popularity: 0.1,
};

export async function recommendListings(
  req: RecommendationRequest,
): Promise<ScoredListing[]> {
  const [listings, viewerHistory, recentInteractions] = await Promise.all([
    getListings(),
    req.viewerKey ? getInteractionsForViewer(req.viewerKey) : Promise.resolve([]),
    getRecentInteractions(),
  ]);

  return rankListings({
    listings,
    viewerHistory,
    recentInteractions,
    req,
  });
}

/** Pure ranking core — separated so it is trivially unit-testable. */
export function rankListings(params: {
  listings: StoreListing[];
  viewerHistory: StoreInteraction[];
  recentInteractions: StoreInteraction[];
  req: RecommendationRequest;
}): ScoredListing[] {
  const { listings, viewerHistory, recentInteractions, req } = params;
  const exclude = new Set(req.excludeIds ?? []);
  const byId = new Map(listings.map((l) => [l.id, l]));

  const coModel = CoOccurrenceModel.build(recentInteractions);

  // Anchors = what the viewer already engaged with, weighted by strength.
  // A seed listing (detail-page context) is injected as a strong anchor.
  const anchors = new Map<string, number>();
  for (const it of viewerHistory) {
    anchors.set(it.listingId, Math.max(anchors.get(it.listingId) ?? 0, it.weight));
  }
  if (req.seedListingId) {
    anchors.set(req.seedListingId, EVENT_WEIGHT.purchase);
  }

  // Global popularity prior (normalised to 0..1).
  const popularity = new Map<string, number>();
  for (const it of recentInteractions) {
    popularity.set(it.listingId, (popularity.get(it.listingId) ?? 0) + it.weight);
  }
  const maxPopularity = Math.max(1, ...popularity.values());

  // Behaviour affinity: treat the viewer's engaged listings as an implicit
  // "taste vector" and reward content similarity to them.
  const behaviorAnchors = [...anchors.keys()]
    .map((id) => byId.get(id))
    .filter((l): l is StoreListing => Boolean(l));

  // Real-time conversion signals.
  const salesVelocityRaw = computeSalesVelocity(recentInteractions);
  const maxVelocity = Math.max(1, ...salesVelocityRaw.values());
  const dwellSeconds = computeDwellSeconds(viewerHistory);
  const chatKeywords = collectChatKeywords(viewerHistory);
  const viewedIds = new Set(viewerHistory.map((it) => it.listingId));

  const hasFilters = Boolean(req.filters && Object.keys(req.filters).length > 0);
  const hasBehavior = behaviorAnchors.length > 0;
  const hasCollaborative = anchors.size > 0;

  const scored: Array<ScoredListing & { rank: number }> = [];

  for (const listing of listings) {
    if (exclude.has(listing.id)) continue;
    // Never recommend the exact plan the viewer is currently looking at.
    if (req.seedListingId && listing.id === req.seedListingId) continue;

    const content = hasFilters ? scoreContent(listing, req.filters) : { score: 0, reasons: [] };

    const collaborative = hasCollaborative
      ? coModel.scoreForAnchors(listing.id, anchors)
      : 0;

    let behavior = hasBehavior
      ? behaviorAnchors.reduce((best, anchor) => Math.max(best, listingSimilarity(anchor, listing)), 0)
      : 0;

    // Chat-intent match: reward plans whose text aligns with chat keywords.
    const chatMatch = matchesChatKeywords(listing, chatKeywords);
    if (chatMatch) behavior = Math.max(behavior, 0.7);

    const pop = (popularity.get(listing.id) ?? 0) / maxPopularity;
    const salesVelocity = (salesVelocityRaw.get(listing.id) ?? 0) / maxVelocity;

    const breakdown: MatchBreakdown = {
      content: content.score,
      collaborative,
      behavior,
      popularity: pop,
      salesVelocity,
      conversionBoost: 1,
    };

    const base = blend(breakdown, { hasFilters, hasBehavior, hasCollaborative });

    // --- Real-time conversion booster (multiplicative reranker) ---
    // Recently-viewed re-engagement boost (1.15×), amplified by dwell time.
    let recentlyViewedBoost = 1;
    if (viewedIds.has(listing.id)) {
      const dwellBonus = Math.min((dwellSeconds.get(listing.id) ?? 0) / 600, 0.1);
      recentlyViewedBoost = 1.15 + dwellBonus;
    }
    // Conversion velocity boost: 1 + salesVelocity(0..10) * 0.05  → 1.0..1.5×.
    const conversionWeight = 1 + salesVelocity * 10 * 0.05;
    const conversionBoost = recentlyViewedBoost * conversionWeight;
    breakdown.conversionBoost = conversionBoost;

    const finalScore = base * conversionBoost;
    const matchScore = Math.min(100, Math.round(finalScore));

    const reasons = buildReasons({
      contentReasons: content.reasons,
      collaborative,
      behavior,
      pop,
      salesVelocity,
      chatMatch,
    });

    // Keep the unclamped finalScore for ranking so boosters differentiate ties.
    scored.push({ listing, matchScore, breakdown, reasons, rank: finalScore });
  }

  scored.sort((a, b) => b.rank - a.rank);
  const limit = req.limit ?? 8;
  return scored.slice(0, limit).map(({ rank: _rank, ...rest }) => rest);
}

/** True when a listing's text matches any of the viewer's chat keywords. */
function matchesChatKeywords(listing: StoreListing, keywords: string[]): boolean {
  if (keywords.length === 0) return false;
  const haystack = `${listing.name} ${listing.description} ${listing.style} ${listing.collection ?? ""}`.toLowerCase();
  return keywords.some((k) => haystack.includes(k));
}

/**
 * Weighted blend with dynamic re-normalisation: only signals that are actually
 * available for this request contribute, and their weights are rescaled to sum
 * to 1 so the score always uses the full 0..100 range.
 */
function blend(
  b: MatchBreakdown,
  active: { hasFilters: boolean; hasBehavior: boolean; hasCollaborative: boolean },
): number {
  const activeWeights: Array<[number, number]> = [];
  if (active.hasFilters) activeWeights.push([b.content, WEIGHTS.content]);
  if (active.hasCollaborative) activeWeights.push([b.collaborative, WEIGHTS.collaborative]);
  if (active.hasBehavior) activeWeights.push([b.behavior, WEIGHTS.behavior]);
  // Popularity always participates as a cold-start prior.
  activeWeights.push([b.popularity, WEIGHTS.popularity]);

  const weightSum = activeWeights.reduce((s, [, w]) => s + w, 0);
  if (weightSum <= 0) return 0;
  const raw = activeWeights.reduce((s, [value, w]) => s + value * w, 0) / weightSum;
  return Math.round(clamp01(raw) * 100);
}

function buildReasons(input: {
  contentReasons: string[];
  collaborative: number;
  behavior: number;
  pop: number;
  salesVelocity: number;
  chatMatch: boolean;
}): string[] {
  const reasons = [...input.contentReasons];
  if (input.chatMatch) reasons.push("chatIntent");
  if (input.collaborative >= 0.5) reasons.push("boughtTogether");
  if (input.behavior >= 0.6 && !input.chatMatch) reasons.push("similarTaste");
  if (input.salesVelocity >= 0.6) reasons.push("bestSeller");
  if (input.pop >= 0.6 && reasons.length === 0) reasons.push("popular");
  return reasons.slice(0, 3);
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
