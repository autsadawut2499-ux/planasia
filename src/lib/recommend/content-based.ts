import { parseAreaSqm } from "@/lib/format";
import type { StoreListing } from "@/lib/store/listing-types";
import type { RecommendationFilters } from "@/lib/recommend/types";

/**
 * Content-based similarity between a listing and the user's explicit filters.
 * Returns a 0..1 score plus the reason keys for each criterion that matched.
 * Missing filters are simply skipped (they neither help nor hurt).
 */
export function scoreContent(
  listing: StoreListing,
  filters: RecommendationFilters | undefined,
): { score: number; reasons: string[] } {
  if (!filters) return { score: 0, reasons: [] };

  const parts: number[] = [];
  const reasons: string[] = [];

  const area = parseAreaSqm(listing.area);

  if (filters.beds && filters.beds > 0) {
    parts.push(proximity(listing.beds, filters.beds, 2));
    if (listing.beds === filters.beds) reasons.push("beds");
  }

  if (filters.baths && filters.baths > 0) {
    parts.push(proximity(listing.baths, filters.baths, 2));
    if (listing.baths === filters.baths) reasons.push("baths");
  }

  if (filters.livingRooms && filters.livingRooms > 0) {
    const living = listing.livingRooms ?? 0;
    parts.push(proximity(living, filters.livingRooms, 1));
    if (living === filters.livingRooms) reasons.push("livingRooms");
  }

  if (filters.floors && filters.floors > 0) {
    const match = listing.floors === filters.floors;
    parts.push(match ? 1 : 0);
    if (match) reasons.push("floors");
  }

  // Metric footprint matching (width × length in metres). Exact within ±1m,
  // decaying with distance beyond the tolerance.
  if (filters.widthMeters && filters.widthMeters > 0 && listing.widthMeters != null) {
    const within = Math.abs(listing.widthMeters - filters.widthMeters) <= 1;
    parts.push(within ? 1 : proximityFloat(listing.widthMeters, filters.widthMeters, 4));
    if (within) reasons.push("width");
  }
  if (filters.lengthMeters && filters.lengthMeters > 0 && listing.lengthMeters != null) {
    const within = Math.abs(listing.lengthMeters - filters.lengthMeters) <= 1;
    parts.push(within ? 1 : proximityFloat(listing.lengthMeters, filters.lengthMeters, 4));
    if (within) reasons.push("length");
  }

  if ((filters.areaMin || filters.areaMax) && area != null) {
    const min = filters.areaMin ?? 0;
    const max = filters.areaMax ?? Number.POSITIVE_INFINITY;
    if (area >= min && area <= max) {
      parts.push(1);
      reasons.push("area");
    } else {
      // Soft penalty proportional to how far outside the range we are.
      const nearest = area < min ? min : max === Number.POSITIVE_INFINITY ? area : max;
      const span = Math.max(max === Number.POSITIVE_INFINITY ? min : max - min, 1);
      parts.push(clamp01(1 - Math.abs(area - nearest) / span));
    }
  }

  if (filters.budgetMin || filters.budgetMax) {
    // Match the buyer's budget against the estimated construction cost when
    // available (the real financial decision driver), else fall back to price.
    const target = listing.constructionCostEstimate ?? listing.price;
    const min = filters.budgetMin ?? 0;
    const max = filters.budgetMax ?? Number.POSITIVE_INFINITY;
    if (target >= min && target <= max) {
      parts.push(1);
      reasons.push("budget");
    } else {
      const nearest = target < min ? min : max === Number.POSITIVE_INFINITY ? target : max;
      const span = Math.max(max === Number.POSITIVE_INFINITY ? min : max - min, 1);
      parts.push(clamp01(1 - Math.abs(target - nearest) / span));
    }
  }

  const styleTarget = (filters.style || filters.collection || "").toLowerCase();
  if (styleTarget) {
    const listingStyle = (listing.style || "").toLowerCase();
    const listingCollection = ((listing as { collection?: string }).collection || "").toLowerCase();
    const match = listingStyle === styleTarget || listingCollection === styleTarget;
    parts.push(match ? 1 : 0);
    if (match) reasons.push("style");
  }

  if (parts.length === 0) return { score: 0, reasons: [] };
  const score = parts.reduce((a, b) => a + b, 0) / parts.length;
  return { score: clamp01(score), reasons };
}

/**
 * Content similarity between two listings (feature vector cosine-ish blend),
 * used for the "similar plans" seed on detail pages.
 */
export function listingSimilarity(a: StoreListing, b: StoreListing): number {
  if (a.id === b.id) return 0;
  const parts: number[] = [
    proximity(a.beds, b.beds, 3),
    proximity(a.baths, b.baths, 3),
    a.floors === b.floors ? 1 : 0,
    a.style?.toLowerCase() === b.style?.toLowerCase() ? 1 : 0,
  ];
  const areaA = parseAreaSqm(a.area);
  const areaB = parseAreaSqm(b.area);
  if (areaA != null && areaB != null) {
    parts.push(clamp01(1 - Math.abs(areaA - areaB) / Math.max(areaA, areaB, 1)));
  }
  parts.push(clamp01(1 - Math.abs(a.price - b.price) / Math.max(a.price, b.price, 1)));
  return clamp01(parts.reduce((x, y) => x + y, 0) / parts.length);
}

/** 1 when equal, decaying linearly to 0 at `tolerance` units apart. */
function proximity(value: number, target: number, tolerance: number): number {
  return clamp01(1 - Math.abs(value - target) / Math.max(tolerance, 1));
}

/** Continuous variant of {@link proximity} for metric (float) dimensions. */
function proximityFloat(value: number, target: number, tolerance: number): number {
  return clamp01(1 - Math.abs(value - target) / Math.max(tolerance, 0.5));
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
