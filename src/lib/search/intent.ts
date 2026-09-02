/**
 * Map AI / store filter intent → Hard + Soft constraints for house search.
 */

import type { RecommendationFilters } from "@/lib/recommend/types";
import type { HardConstraints, SoftConstraints } from "@/lib/search/house-search";
import { ALL_STYLES } from "@/lib/store/taxonomy";

export function filtersToHardConstraints(
  filters: RecommendationFilters | undefined,
): HardConstraints {
  if (!filters) return {};
  const hard: HardConstraints = {};

  // Spec: hard budget uses listing sale price (price <= max).
  if (filters.priceMin && filters.priceMin > 0) hard.priceMin = filters.priceMin;
  if (filters.priceMax && filters.priceMax > 0) hard.priceMax = filters.priceMax;
  // AI often extracts construction budget — map to sale-price ceiling when
  // explicit priceMax is absent (marketplace plans are far cheaper than build cost).
  // Prefer price* when set; else treat small budgets (< 500k) as plan price,
  // larger as construction budget → do not hard-filter sale price by millions.
  if (!hard.priceMax && filters.budgetMax && filters.budgetMax > 0) {
    if (filters.budgetMax <= 500_000) {
      hard.priceMax = filters.budgetMax;
    }
  }
  if (!hard.priceMin && filters.budgetMin && filters.budgetMin > 0) {
    if (filters.budgetMin <= 500_000) {
      hard.priceMin = filters.budgetMin;
    }
  }

  if (filters.beds && filters.beds > 0) hard.minBeds = Math.round(filters.beds);
  if (filters.baths && filters.baths > 0) hard.minBaths = Math.round(filters.baths);
  if (filters.livingRooms && filters.livingRooms > 0) {
    hard.minLivingRooms = Math.round(filters.livingRooms);
  }
  if (filters.areaMin && filters.areaMin > 0) hard.areaMin = filters.areaMin;
  if (filters.areaMax && filters.areaMax > 0) hard.areaMax = filters.areaMax;
  if (filters.floors && filters.floors > 0) hard.floors = Math.round(filters.floors);

  return hard;
}

export function intentToSoftConstraints(input: {
  filters?: RecommendationFilters;
  keywords?: string[];
  styleTags?: string[];
  lifestyleFeatures?: string[];
  siteConstraints?: SoftConstraints["siteConstraints"];
}): SoftConstraints {
  const soft: SoftConstraints = {};
  const styleTags = new Set<string>();

  for (const tag of input.styleTags ?? []) {
    if (tag.trim()) styleTags.add(tag.trim());
  }
  // Legacy "collection" filter is folded into the unified style filter.
  for (const filterKey of ["style", "collection"] as const) {
    const raw = input.filters?.[filterKey]?.trim();
    if (!raw) continue;
    styleTags.add(raw);
    const id = raw.toLowerCase();
    const tax = ALL_STYLES.find((s) => s.id === id || s.en.toLowerCase().includes(id));
    if (tax) styleTags.add(tax.id);
  }

  if (styleTags.size) soft.styleTags = [...styleTags];

  const lifestyle = (input.lifestyleFeatures ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  if (lifestyle.length) soft.lifestyleFeatures = lifestyle;

  const sites = input.siteConstraints ?? [];
  const inferredSites = [...sites];
  if (input.filters?.style === "small" || input.filters?.collection === "small") {
    inferredSites.push("narrow-lot", "small-footprint");
  }
  if (input.filters?.widthMeters && input.filters.widthMeters <= 8) {
    inferredSites.push("narrow-lot");
  }
  if (inferredSites.length) {
    soft.siteConstraints = [...new Set(inferredSites)];
  }

  const keywords = (input.keywords ?? []).map((k) => k.trim()).filter(Boolean);
  if (keywords.length) soft.keywords = keywords;

  return soft;
}

/** Heuristic soft extraction from free text (Thai / EN). */
export function extractSoftIntentFromText(message: string): {
  styleTags: string[];
  lifestyleFeatures: string[];
  siteConstraints: NonNullable<SoftConstraints["siteConstraints"]>;
  keywords: string[];
} {
  const text = message.trim();
  const styleTags: string[] = [];
  const lifestyleFeatures: string[] = [];
  const siteConstraints: NonNullable<SoftConstraints["siteConstraints"]> = [];
  const keywords: string[] = [];

  const styleMap: Array<[RegExp, string]> = [
    [/อบอุ่น|cozy|warm/i, "Warm/Cozy"],
    [/โมเดิร์น|modern/i, "Modern"],
    [/มินิมอล|minimal/i, "Minimal"],
    [/ทรอปิคอล|tropical/i, "Tropical"],
    [/คลาสสิก|classic/i, "Classic"],
    [/สแกนดิ|nordic|scandinavian/i, "Scandinavian"],
    [/ร่วมสมัย|contemporary/i, "Contemporary"],
    [/ลอฟท์|loft/i, "Loft"],
    [/มูจิ|muji|ญี่ปุ่น/i, "Muji"],
  ];
  for (const [re, tag] of styleMap) {
    if (re.test(text)) styleTags.push(tag);
  }

  if (/wfh|home\s*office|มุมทำงาน|ทำงานที่บ้าน|ออฟฟิศในบ้าน/i.test(text)) {
    lifestyleFeatures.push("Home Office");
    keywords.push("home office");
  }
  if (/ผู้สูงอายุ|elderly|ห้องนอน.*ชั้นล่าง|ชั้นล่าง.*นอน/i.test(text)) {
    lifestyleFeatures.push("Elderly Bedroom on 1st Floor");
    keywords.push("elderly");
  }
  if (/สวน|garden/i.test(text)) {
    lifestyleFeatures.push("Garden");
  }
  if (/สระ|pool/i.test(text)) {
    lifestyleFeatures.push("Pool");
  }
  if (/ห้องรับแขก|ห้องนั่งเล่น|living\s*room/i.test(text)) {
    lifestyleFeatures.push("Living room");
    keywords.push("living room");
  }

  if (/หน้าแคบ|แคบ.*ลึก|narrow\s*lot|ที่ดินแคบ|หน้าดินแคบ/i.test(text)) {
    siteConstraints.push("narrow-lot", "small-footprint");
    keywords.push("narrow");
  }
  if (/หน้ากว้าง|wide\s*lot/i.test(text)) {
    siteConstraints.push("wide-lot");
  }

  return { styleTags, lifestyleFeatures, siteConstraints, keywords };
}
