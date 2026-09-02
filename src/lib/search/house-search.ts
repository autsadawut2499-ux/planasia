/**
 * AI-Powered House Search Logic
 *
 * Part 1 — Hard Constraints: deterministic numeric filters (no AI).
 * Part 2 — Soft Constraints: style / lifestyle / site intent scoring.
 * Part 3 — Guardrails: ranking boost + friendly near-match fallback.
 */

import { parseAreaSqm } from "@/lib/format";
import type { StoreListing } from "@/lib/store/listing-types";
import { isListingPurchasable } from "@/lib/store/listing-purchase";

/** Part 1 — backend-only, 100% deterministic. */
export interface HardConstraints {
  /** Listing sale price floor (THB). */
  priceMin?: number;
  /** Listing sale price ceiling (THB). Spec: price <= user_max_budget. */
  priceMax?: number;
  /** Minimum bedrooms. */
  minBeds?: number;
  /** Minimum bathrooms. */
  minBaths?: number;
  /** Minimum living / reception rooms. */
  minLivingRooms?: number;
  /** Usable interior area (m²). */
  areaMin?: number;
  areaMax?: number;
  floors?: number;
}

/** Part 2 — AI/heuristic intent (soft scoring, never hard-excludes alone). */
export interface SoftConstraints {
  /** Style tags e.g. Modern, Warm/Cozy, Minimal. */
  styleTags?: string[];
  /** Lifestyle features e.g. Home Office, Elderly Bedroom on 1st Floor. */
  lifestyleFeatures?: string[];
  /** Physical site intent. */
  siteConstraints?: Array<"narrow-lot" | "wide-lot" | "small-footprint">;
  /** Extra free-text keywords for text match. */
  keywords?: string[];
}

export interface HouseSearchQuery {
  hard?: HardConstraints;
  soft?: SoftConstraints;
  limit?: number;
  /** When true, skip published+approved gate (admin/seller tooling only). */
  includeUnapproved?: boolean;
}

export interface HouseSearchHit {
  listing: StoreListing;
  matchScore: number;
  softScore: number;
  rankBoost: number;
  reasons: string[];
  isFallback: boolean;
}

export interface HouseSearchResult {
  hits: HouseSearchHit[];
  exactCount: number;
  usedFallback: boolean;
  /** Friendly bilingual notice when exact matches are empty. */
  fallbackMessage: { th: string; en: string } | null;
}

const NEW_ARRIVAL_MS = 1000 * 60 * 60 * 24 * 21; // 21 days

/** Published + admin-approved (legacy null moderation = approved). */
export function passesStatusGate(
  listing: Pick<StoreListing, "moderationStatus" | "isPublished">,
): boolean {
  return isListingPurchasable(listing);
}

/**
 * Part 1 — Hard Constraints.
 * Numeric / status rules only. AI must not override these.
 */
export function passesHardConstraints(
  listing: StoreListing,
  hard: HardConstraints | undefined,
  opts?: { includeUnapproved?: boolean },
): boolean {
  if (!opts?.includeUnapproved && !passesStatusGate(listing)) return false;

  if (!hard) return true;

  if (hard.priceMin != null && hard.priceMin > 0 && listing.price < hard.priceMin) {
    return false;
  }
  // Spec: WHERE price <= user_max_budget
  if (hard.priceMax != null && hard.priceMax > 0 && listing.price > hard.priceMax) {
    return false;
  }

  if (hard.minBeds != null && hard.minBeds > 0 && listing.beds < hard.minBeds) {
    return false;
  }
  if (hard.minBaths != null && hard.minBaths > 0 && listing.baths < hard.minBaths) {
    return false;
  }
  if (
    hard.minLivingRooms != null &&
    hard.minLivingRooms > 0 &&
    (listing.livingRooms ?? 0) < hard.minLivingRooms
  ) {
    return false;
  }

  if (hard.floors != null && hard.floors > 0 && listing.floors !== hard.floors) {
    return false;
  }

  if (
    (hard.areaMin != null && hard.areaMin > 0) ||
    (hard.areaMax != null && hard.areaMax > 0)
  ) {
    const area = parseAreaSqm(listing.area);
    if (area == null) return false;
    if (hard.areaMin != null && hard.areaMin > 0 && area < hard.areaMin) return false;
    if (hard.areaMax != null && hard.areaMax > 0 && area > hard.areaMax) return false;
  }

  return true;
}

/** Relax hard constraints one step for near-match fallback. */
export function relaxHardConstraints(hard: HardConstraints): HardConstraints {
  const next: HardConstraints = { ...hard };
  if (next.priceMax != null && next.priceMax > 0) {
    next.priceMax = Math.round(next.priceMax * 1.25);
  }
  if (next.minBeds != null && next.minBeds > 1) {
    next.minBeds = Math.max(1, next.minBeds - 1);
  }
  if (next.minBaths != null && next.minBaths > 1) {
    next.minBaths = Math.max(1, next.minBaths - 1);
  }
  if (next.minLivingRooms != null && next.minLivingRooms > 1) {
    next.minLivingRooms = Math.max(1, next.minLivingRooms - 1);
  }
  if (next.areaMin != null && next.areaMin > 0) {
    next.areaMin = Math.round(next.areaMin * 0.85);
  }
  if (next.areaMax != null && next.areaMax > 0) {
    next.areaMax = Math.round(next.areaMax * 1.15);
  }
  return next;
}

/**
 * Part 2 — Soft Constraints scoring (0..1).
 * Style / lifestyle / site / keywords — never used alone to hard-exclude.
 */
export function scoreSoftConstraints(
  listing: StoreListing,
  soft: SoftConstraints | undefined,
): { score: number; reasons: string[] } {
  if (!soft) return { score: 0, reasons: [] };

  const parts: number[] = [];
  const reasons: string[] = [];
  const haystack = buildListingHaystack(listing);

  const styleTags = (soft.styleTags ?? []).map(normalizeTag).filter(Boolean);
  if (styleTags.length > 0) {
    const listingStyle = normalizeTag(listing.style);
    const styleHit = styleTags.some(
      (tag) =>
        listingStyle.includes(tag) ||
        tag.includes(listingStyle) ||
        haystack.includes(tag) ||
        STYLE_ALIASES[tag]?.some((a) => listingStyle.includes(a) || haystack.includes(a)),
    );
    parts.push(styleHit ? 1 : 0.15);
    if (styleHit) reasons.push("style");
  }

  const lifestyle = (soft.lifestyleFeatures ?? []).map(normalizeTag).filter(Boolean);
  if (lifestyle.length > 0) {
    let hits = 0;
    for (const feature of lifestyle) {
      const aliases = LIFESTYLE_ALIASES[feature] ?? [feature];
      if (aliases.some((a) => haystack.includes(a))) hits += 1;
    }
    const ratio = hits / lifestyle.length;
    parts.push(ratio);
    if (hits > 0) reasons.push("lifestyle");
  }

  const sites = soft.siteConstraints ?? [];
  if (sites.length > 0) {
    let siteScore = 0;
    for (const site of sites) {
      if (site === "narrow-lot" || site === "small-footprint") {
        const narrow =
          listing.style === "small" ||
          listing.collection === "small" ||
          haystack.includes("narrow") ||
          haystack.includes("small") ||
          haystack.includes("หน้าแคบ") ||
          haystack.includes("ขนาดเล็ก") ||
          (listing.widthMeters != null && listing.widthMeters <= 8);
        siteScore += narrow ? 1 : 0.1;
        if (narrow) reasons.push("narrow-lot");
      }
      if (site === "wide-lot") {
        const wide =
          (listing.widthMeters != null && listing.widthMeters >= 12) ||
          haystack.includes("หน้ากว้าง");
        siteScore += wide ? 1 : 0.1;
        if (wide) reasons.push("wide-lot");
      }
    }
    parts.push(siteScore / sites.length);
  }

  const keywords = (soft.keywords ?? []).map(normalizeTag).filter(Boolean);
  if (keywords.length > 0) {
    const hits = keywords.filter((k) => haystack.includes(k)).length;
    parts.push(hits / keywords.length);
    if (hits > 0) reasons.push("keywords");
  }

  if (parts.length === 0) return { score: 0, reasons: [] };
  const score = parts.reduce((a, b) => a + b, 0) / parts.length;
  return { score: clamp01(score), reasons };
}

/**
 * Part 3 — Ranking boost (0..1 additive prior).
 * Bestsellers → high engagement → new arrivals.
 */
export function computeRankBoost(listing: StoreListing): number {
  const sales = listing.salesCount ?? 0;
  const likes = listing.likesCount ?? 0;
  const views = listing.viewsCount ?? 0;
  const ranking = listing.rankingScore ?? 0;

  const salesNorm = clamp01(sales / 20);
  const engagementNorm = clamp01((likes * 2 + views) / 200);
  const rankingNorm = clamp01(ranking / 100);

  let newArrival = 0;
  const created = Date.parse(listing.createdAt);
  if (Number.isFinite(created)) {
    const age = Date.now() - created;
    if (age >= 0 && age <= NEW_ARRIVAL_MS) {
      newArrival = 0.25 * (1 - age / NEW_ARRIVAL_MS);
    }
  }

  const verifiedBoost = listing.creator?.isVerified ? 0.08 : 0;

  // Weight: bestsellers > ranking cache > engagement > new > verified draftsman
  return clamp01(
    salesNorm * 0.4 + rankingNorm * 0.25 + engagementNorm * 0.15 + newArrival + verifiedBoost,
  );
}

/**
 * Run the full Hard → Soft → Rank → Fallback pipeline over an in-memory catalogue.
 */
export function searchHousePlans(
  listings: StoreListing[],
  query: HouseSearchQuery = {},
): HouseSearchResult {
  const hard = query.hard ?? {};
  const soft = query.soft ?? {};
  const limit = Math.min(Math.max(query.limit ?? 12, 1), 48);
  const gate = { includeUnapproved: query.includeUnapproved };

  const exactPool = listings.filter((l) => passesHardConstraints(l, hard, gate));
  const scoredExact = scoreAndRank(exactPool, soft, false);

  if (scoredExact.length > 0) {
    return {
      hits: scoredExact.slice(0, limit),
      exactCount: scoredExact.length,
      usedFallback: false,
      fallbackMessage: null,
    };
  }

  // Part 3 — Fallback: never silent; surface near matches with explanation.
  const hasHard = Object.values(hard).some((v) => v != null && Number(v) > 0);
  if (!hasHard && !hasSoft(soft)) {
    const popular = scoreAndRank(
      listings.filter((l) => passesStatusGate(l) || gate.includeUnapproved),
      soft,
      true,
    ).slice(0, limit);
    return {
      hits: popular,
      exactCount: 0,
      usedFallback: popular.length > 0,
      fallbackMessage: popular.length
        ? {
            th: "ยังไม่มีเงื่อนไขค้นหาชัดเจน — นี่คือแบบบ้านยอดนิยมที่แนะนำให้เริ่มดูครับ",
            en: "No clear filters yet — here are popular plans to get you started.",
          }
        : null,
    };
  }

  const relaxed = relaxHardConstraints(hard);
  let nearPool = listings.filter((l) => passesHardConstraints(l, relaxed, gate));
  if (nearPool.length === 0) {
    // Last resort: status-ok catalogue ranked by soft + popularity.
    nearPool = listings.filter((l) => passesStatusGate(l) || gate.includeUnapproved);
  }

  const nearHits = scoreAndRank(nearPool, soft, true).slice(0, limit);
  return {
    hits: nearHits,
    exactCount: 0,
    usedFallback: nearHits.length > 0,
    fallbackMessage: buildFallbackMessage(hard, relaxed),
  };
}

function scoreAndRank(
  pool: StoreListing[],
  soft: SoftConstraints,
  isFallback: boolean,
): HouseSearchHit[] {
  const hits: HouseSearchHit[] = [];
  for (const listing of pool) {
    const softResult = scoreSoftConstraints(listing, soft);
    const rankBoost = computeRankBoost(listing);
    // Blend: soft intent 55% + business ranking 45% (exact hard already applied).
    const softWeight = hasSoft(soft) ? 0.55 : 0;
    const rankWeight = hasSoft(soft) ? 0.45 : 1;
    const blended = softResult.score * softWeight + rankBoost * rankWeight;
    const matchScore = Math.min(100, Math.round(blended * 100));
    hits.push({
      listing,
      matchScore,
      softScore: softResult.score,
      rankBoost,
      reasons: softResult.reasons,
      isFallback,
    });
  }
  hits.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return (b.listing.salesCount ?? 0) - (a.listing.salesCount ?? 0);
  });
  return hits;
}

function buildFallbackMessage(
  original: HardConstraints,
  relaxed: HardConstraints,
): { th: string; en: string } {
  const bitsTh: string[] = [];
  const bitsEn: string[] = [];

  if (
    original.priceMax &&
    relaxed.priceMax &&
    relaxed.priceMax > original.priceMax
  ) {
    bitsTh.push(
      `ขยายงบประมาณเป็นไม่เกิน ฿${relaxed.priceMax.toLocaleString("th-TH")}`,
    );
    bitsEn.push(
      `widened budget up to ฿${relaxed.priceMax.toLocaleString("en-US")}`,
    );
  }
  if (
    original.minBeds &&
    relaxed.minBeds &&
    relaxed.minBeds < original.minBeds
  ) {
    bitsTh.push(`เสนอแบบที่มีอย่างน้อย ${relaxed.minBeds} ห้องนอน`);
    bitsEn.push(`suggesting plans with at least ${relaxed.minBeds} bedrooms`);
  }
  if (
    original.minBaths &&
    relaxed.minBaths &&
    relaxed.minBaths < original.minBaths
  ) {
    bitsTh.push(`อย่างน้อย ${relaxed.minBaths} ห้องน้ำ`);
    bitsEn.push(`at least ${relaxed.minBaths} bathrooms`);
  }

  const detailTh = bitsTh.length ? ` (${bitsTh.join(" · ")})` : "";
  const detailEn = bitsEn.length ? ` (${bitsEn.join("; ")})` : "";

  return {
    th: `ยังไม่พบแบบที่ตรงทุกเงื่อนไขเป๊ะ — แนะนำแบบบ้านที่ใกล้เคียงที่สุดให้แทน${detailTh} ลองปรับงบหรือจำนวนห้องได้นะครับ`,
    en: `No exact match for every constraint — here are the closest plans instead${detailEn}. You can also loosen budget or room counts.`,
  };
}

function hasSoft(soft: SoftConstraints): boolean {
  return Boolean(
    (soft.styleTags && soft.styleTags.length) ||
      (soft.lifestyleFeatures && soft.lifestyleFeatures.length) ||
      (soft.siteConstraints && soft.siteConstraints.length) ||
      (soft.keywords && soft.keywords.length),
  );
}

function buildListingHaystack(listing: StoreListing): string {
  return [
    listing.name,
    listing.description,
    listing.tagline,
    listing.pitch,
    listing.style,
    listing.collection,
    ...(listing.highlights ?? []),
    listing.livingRooms != null && listing.livingRooms > 0
      ? `${listing.livingRooms} ห้องรับแขก living room`
      : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizeTag(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

const STYLE_ALIASES: Record<string, string[]> = {
  modern: ["modern", "โมเดิร์น"],
  minimal: ["minimal", "มินิมอล", "minima"],
  tropical: ["tropical", "ทรอปิคอล"],
  classic: ["classic", "คลาสสิก"],
  contemporary: ["contemporary", "ร่วมสมัย", "คอนเทมโพรารี"],
  scandinavian: ["scandinavian", "nordic", "นอร์ดิก", "สแกนดิ"],
  "warm/cozy": ["อบอุ่น", "cozy", "warm", "อบอุ่น"],
  warm: ["อบอุ่น", "cozy", "warm"],
  cozy: ["อบอุ่น", "cozy", "warm"],
};

const LIFESTYLE_ALIASES: Record<string, string[]> = {
  "home office": ["home office", "wfh", "ทำงาน", "ออฟฟิศ", "working space", "มุมทำงาน"],
  "elderly bedroom on 1st floor": [
    "ผู้สูงอายุ",
    "elderly",
    "ห้องนอนชั้นล่าง",
    "bedroom downstairs",
    "ชั้นล่าง",
  ],
  "garden": ["สวน", "garden", "yard"],
  "pool": ["สระ", "pool"],
  "parking": ["จอดรถ", "parking", "โรงรถ"],
  "living room": ["ห้องรับแขก", "ห้องนั่งเล่น", "living room", "living", "salon"],
};
