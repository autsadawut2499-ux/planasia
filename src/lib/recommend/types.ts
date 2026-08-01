import type { StoreListing } from "@/lib/store/listing-types";

/** Explicit, user-provided constraints (content-based filtering inputs). */
export interface RecommendationFilters {
  beds?: number;
  baths?: number;
  floors?: number;
  /** Interior area range in square metres. */
  areaMin?: number;
  areaMax?: number;
  /** Desired plot/structure footprint in metres (±1m match). */
  widthMeters?: number;
  lengthMeters?: number;
  /** Budget range in THB (matched against construction-cost estimate). */
  budgetMin?: number;
  budgetMax?: number;
  style?: string;
  collection?: string;
}

export interface RecommendationRequest {
  /** Stable viewer key (OAuth id or browser UUID). */
  viewerKey?: string;
  filters?: RecommendationFilters;
  /** Bias results toward plans similar to this one (e.g. on a detail page). */
  seedListingId?: string;
  /** Listing ids to exclude (already owned, current plan, etc.). */
  excludeIds?: string[];
  limit?: number;
}

/** Per-signal breakdown so the UI can explain "why" a plan was recommended. */
export interface MatchBreakdown {
  /** 0..1 — match against explicit filters. */
  content: number;
  /** 0..1 — item-item collaborative signal from co-views/co-purchases. */
  collaborative: number;
  /** 0..1 — affinity with the viewer's own behavioural history. */
  behavior: number;
  /** 0..1 — global popularity prior (cold-start fallback). */
  popularity: number;
  /** 0..1 — sales/conversion velocity of this plan (drives the booster). */
  salesVelocity: number;
  /** Multiplier applied to the base score (recently-viewed × conversion). */
  conversionBoost: number;
}

export interface ScoredListing {
  listing: StoreListing;
  /** Final blended score, 0..100 ("match score"). */
  matchScore: number;
  breakdown: MatchBreakdown;
  /** Short bilingual-ready reason keys for the UI badge/tooltip. */
  reasons: string[];
}
