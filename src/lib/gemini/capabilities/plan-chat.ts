/**
 * Plan-finder chat: Gemini extracts search filters from natural language,
 * then the Hard/Soft/Guardrails house-search pipeline returns real plans.
 */

import { getTextModel, isGeminiConfigured } from "@/lib/ai/gemini";
import { isGeminiFeatureEnabled } from "@/lib/gemini/config";
import type { RecommendationFilters } from "@/lib/recommend/types";
import {
  extractSoftIntentFromText,
  filtersToHardConstraints,
  intentToSoftConstraints,
} from "@/lib/search/intent";
import { searchHousePlans } from "@/lib/search/house-search";
import { getListings } from "@/lib/store/db";
import { listingStorePath } from "@/lib/seo/slug";
import type { UiLocale } from "@/lib/geo/countries";

export interface PlanChatHistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export interface PlanChatListingCard {
  id: string;
  slug: string;
  name: string;
  beds: number;
  baths: number;
  floors: number;
  area: string;
  price: number;
  style: string;
  image: string;
  tagline?: string;
  href: string;
  matchScore: number;
  reasons: string[];
}

export interface PlanChatResult {
  reply: string;
  filters: RecommendationFilters;
  keywords: string[];
  listings: PlanChatListingCard[];
  provider: "gemini" | "heuristic";
  usedFallback?: boolean;
}

interface GeminiPlanIntent {
  reply?: string;
  filters?: RecommendationFilters;
  keywords?: string[];
  styleTags?: string[];
  lifestyleFeatures?: string[];
  siteConstraints?: Array<"narrow-lot" | "wide-lot" | "small-footprint">;
  needsClarification?: boolean;
}

const SYSTEM_PROMPT = `You are Planasia's house-plan shopping assistant for Thailand.
Help buyers find real house plans from our marketplace.

Split intent into HARD numeric filters (exact) and SOFT lifestyle/style tags (semantic).
Reply in the same language as the user (Thai or English).

Return ONLY valid JSON:
{
  "reply": "short helpful message (2-4 sentences). Mention that you searched the catalog when filters are clear.",
  "filters": {
    "beds": number | omit,
    "baths": number | omit,
    "floors": number | omit,
    "areaMin": number | omit,
    "areaMax": number | omit,
    "widthMeters": number | omit,
    "lengthMeters": number | omit,
    "budgetMin": number | omit,
    "budgetMax": number | omit,
    "priceMin": number | omit,
    "priceMax": number | omit,
    "style": string | omit,
    "collection": string | omit
  },
  "styleTags": ["Modern", "Warm/Cozy"],
  "lifestyleFeatures": ["Home Office", "Elderly Bedroom on 1st Floor"],
  "siteConstraints": ["narrow-lot"],
  "keywords": ["optional", "search", "terms"],
  "needsClarification": boolean
}

Rules:
- HARD: beds/baths are minimums; areaMin/areaMax in m²; priceMin/priceMax = plan sale price in THB when user talks about ราคาแบบ/ราคาไฟล์.
- Construction budget (งบสร้าง 2 ล้าน) → budgetMax: 2000000 (soft financial context, not always sale price).
- Land "หน้าแคบ แต่ลึก" → siteConstraints: ["narrow-lot"] and/or collection "small".
- "มุมทำงาน WFH" → lifestyleFeatures: ["Home Office"].
- "ห้องนอนผู้สูงอายุชั้นล่าง" → lifestyleFeatures: ["Elderly Bedroom on 1st Floor"].
- Warm/modern vibe → styleTags like ["Modern","Warm/Cozy"] (soft); also set filters.style when clear.
- Usable area "ไม่เกิน 200 ตร.ม." → areaMax: 200.
- If greeting only, needsClarification true; leave filters empty.
- Keep reply concise. Never invent listing names or prices.
- If constraints look impossible together, still search — the system will suggest near matches.`;

function positiveNumber(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

function cleanFilters(raw: RecommendationFilters | undefined): RecommendationFilters {
  if (!raw || typeof raw !== "object") return {};
  const out: RecommendationFilters = {};
  const beds = positiveNumber(raw.beds);
  const baths = positiveNumber(raw.baths);
  const floors = positiveNumber(raw.floors);
  const areaMin = positiveNumber(raw.areaMin);
  const areaMax = positiveNumber(raw.areaMax);
  const widthMeters = positiveNumber(raw.widthMeters);
  const lengthMeters = positiveNumber(raw.lengthMeters);
  const budgetMin = positiveNumber(raw.budgetMin);
  const budgetMax = positiveNumber(raw.budgetMax);
  const priceMin = positiveNumber(raw.priceMin);
  const priceMax = positiveNumber(raw.priceMax);
  if (beds) out.beds = Math.round(beds);
  if (baths) out.baths = Math.round(baths);
  if (floors) out.floors = Math.round(floors);
  if (areaMin) out.areaMin = areaMin;
  if (areaMax) out.areaMax = areaMax;
  if (widthMeters) out.widthMeters = widthMeters;
  if (lengthMeters) out.lengthMeters = lengthMeters;
  if (budgetMin) out.budgetMin = budgetMin;
  if (budgetMax) out.budgetMax = budgetMax;
  if (priceMin) out.priceMin = priceMin;
  if (priceMax) out.priceMax = priceMax;
  if (typeof raw.style === "string" && raw.style.trim()) {
    out.style = raw.style.trim();
  }
  if (typeof raw.collection === "string" && raw.collection.trim()) {
    out.collection = raw.collection.trim();
  }
  return out;
}

function hasAnyFilter(filters: RecommendationFilters): boolean {
  return Object.keys(filters).length > 0;
}

function parseJsonObject(text: string): GeminiPlanIntent | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as GeminiPlanIntent;
  } catch {
    return null;
  }
}

/** Lightweight Thai/English intent parser when Gemini is offline. */
export function heuristicPlanIntent(
  message: string,
  uiLocale: UiLocale,
): GeminiPlanIntent {
  const text = message.trim();
  const lower = text.toLowerCase();
  const filters: RecommendationFilters = {};
  const keywords: string[] = [];

  const beds =
    text.match(/(\d+)\s*(?:ห้องนอน|bed(?:room)?s?)/i) ||
    lower.match(/(\d+)\s*bed/);
  if (beds) filters.beds = Number(beds[1]);

  const baths =
    text.match(/(\d+)\s*(?:ห้องน้ำ|bath(?:room)?s?)/i) ||
    lower.match(/(\d+)\s*bath/);
  if (baths) filters.baths = Number(baths[1]);

  const floors =
    text.match(/(\d+)\s*(?:ชั้น|floor|stor(?:y|ies))/i) ||
    lower.match(/(\d+)\s*-?\s*stor/);
  if (floors) filters.floors = Number(floors[1]);

  const million = text.match(/(\d+(?:\.\d+)?)\s*(?:ล้าน|million|m\b)/i);
  if (million) {
    filters.budgetMax = Math.round(Number(million[1]) * 1_000_000);
  } else {
    const thb = text.match(/(?:งบ|budget|ไม่เกิน|under)\s*[^\d]*(\d{5,})/i);
    if (thb) filters.budgetMax = Number(thb[1]);
  }

  const area = text.match(/(\d+(?:\.\d+)?)\s*(?:ตร\.?\s*ม\.?|sqm|sq\.?\s*m)/i);
  if (area) {
    const a = Number(area[1]);
    filters.areaMin = Math.round(a * 0.85);
    filters.areaMax = Math.round(a * 1.15);
  }

  const width = text.match(/(?:กว้าง|width)\s*(\d+(?:\.\d+)?)/i);
  const depth = text.match(/(?:ลึก|ยาว|depth|length)\s*(\d+(?:\.\d+)?)/i);
  if (width) filters.widthMeters = Number(width[1]);
  if (depth) filters.lengthMeters = Number(depth[1]);

  const soft = extractSoftIntentFromText(text);
  if (soft.styleTags[0]) {
    filters.style = soft.styleTags.find((t) =>
      /modern|minimal|tropical|classic|scandinavian|contemporary|loft|muji/i.test(t),
    ) || soft.styleTags[0];
  }
  if (soft.siteConstraints.includes("narrow-lot")) {
    filters.collection = "small";
  }
  keywords.push(...soft.keywords, ...soft.styleTags.map((t) => t.toLowerCase()));

  const needsClarification = !hasAnyFilter(filters) && soft.styleTags.length === 0;
  const th = uiLocale === "th";
  let reply: string;
  if (needsClarification) {
    reply = th
      ? "บอกงบประมาณ จำนวนห้องนอน สไตล์ หรือขนาดที่ดินได้เลย เดี๋ยวช่วยหาแบบบ้านที่ตรงความต้องการให้ครับ"
      : "Tell me your budget, bedrooms, style, or land size — I’ll find matching house plans for you.";
  } else {
    reply = th
      ? "รับทราบความต้องการแล้ว กำลังค้นหาแบบบ้านในแคตตาล็อกให้ครับ"
      : "Got it — searching our catalog for plans that match.";
  }

  return {
    reply,
    filters,
    keywords,
    styleTags: soft.styleTags,
    lifestyleFeatures: soft.lifestyleFeatures,
    siteConstraints: soft.siteConstraints,
    needsClarification,
  };
}

async function extractIntentWithGemini(
  message: string,
  history: PlanChatHistoryTurn[],
  uiLocale: UiLocale,
): Promise<GeminiPlanIntent | null> {
  if (!isGeminiFeatureEnabled() || !isGeminiConfigured()) return null;
  const model = getTextModel();
  if (!model) return null;

  const historyBlock = history
    .slice(-6)
    .map((t) => `${t.role === "user" ? "User" : "Assistant"}: ${t.content}`)
    .join("\n");

  const prompt = `${SYSTEM_PROMPT}

UI locale preference: ${uiLocale}

Conversation so far:
${historyBlock || "(none)"}

Latest user message:
${message}`;

  try {
    const result = await model.generateContent(prompt);
    return parseJsonObject(result.response.text());
  } catch (err) {
    console.error("[plan-chat] Gemini intent failed", err);
    return null;
  }
}

async function fetchMatchingListings(
  filters: RecommendationFilters,
  softExtras: {
    keywords?: string[];
    styleTags?: string[];
    lifestyleFeatures?: string[];
    siteConstraints?: RecommendationFilters["siteConstraints"];
  },
  limit = 5,
): Promise<{
  cards: PlanChatListingCard[];
  usedFallback: boolean;
  fallbackMessage: { th: string; en: string } | null;
}> {
  const listings = await getListings();
  const hard = filtersToHardConstraints(filters);
  const soft = intentToSoftConstraints({
    filters,
    keywords: softExtras.keywords,
    styleTags: softExtras.styleTags ?? filters.styleTags,
    lifestyleFeatures: softExtras.lifestyleFeatures ?? filters.lifestyleFeatures,
    siteConstraints: softExtras.siteConstraints ?? filters.siteConstraints,
  });

  const result = searchHousePlans(listings, { hard, soft, limit });

  const cards = result.hits.map((row) => ({
    id: row.listing.id,
    slug: row.listing.slug,
    name: row.listing.name,
    beds: row.listing.beds,
    baths: row.listing.baths,
    floors: row.listing.floors,
    area: row.listing.area,
    price: row.listing.price,
    style: row.listing.style,
    image: row.listing.image,
    tagline: row.listing.tagline,
    href: listingStorePath(row.listing.slug),
    matchScore: row.matchScore,
    reasons: row.reasons,
  }));

  return {
    cards,
    usedFallback: result.usedFallback,
    fallbackMessage: result.fallbackMessage,
  };
}

function enrichReplyWithResults(
  reply: string,
  listings: PlanChatListingCard[],
  uiLocale: UiLocale,
  opts?: {
    needsClarification?: boolean;
    usedFallback?: boolean;
    fallbackMessage?: { th: string; en: string } | null;
  },
): string {
  if (opts?.needsClarification && listings.length === 0) return reply;
  const th = uiLocale === "th";

  if (opts?.usedFallback && opts.fallbackMessage) {
    const note = th ? opts.fallbackMessage.th : opts.fallbackMessage.en;
    return `${reply} ${note}`.trim();
  }

  if (listings.length === 0) {
    return (
      reply +
      (th
        ? " ตอนนี้ยังไม่พบแบบที่ตรงเป๊ะ — ลองปรับงบ ห้องนอน หรือสไตล์ได้นะครับ"
        : " I couldn’t find a close match yet — try adjusting budget, bedrooms, or style.")
    );
  }
  if (listings.length === 1) {
    return (
      reply +
      (th
        ? ` พบ ${listings.length} แบบที่น่าสนใจด้านล่างครับ`
        : ` Here’s ${listings.length} plan that looks like a good fit:`)
    );
  }
  return (
    reply +
    (th
      ? ` พบ ${listings.length} แบบที่ตรงความต้องการด้านล่างครับ`
      : ` Here are ${listings.length} plans that match:`)
  );
}

/**
 * Full plan-finder turn: NLU → catalog recommend → chat-ready cards.
 */
export async function runPlanFinderChat(input: {
  message: string;
  history?: PlanChatHistoryTurn[];
  uiLocale?: UiLocale;
  viewerKey?: string;
  limit?: number;
}): Promise<PlanChatResult> {
  const message = input.message.trim().slice(0, 2000);
  const uiLocale: UiLocale = input.uiLocale === "en" ? "en" : "th";
  const history = (input.history ?? []).slice(-8);

  let provider: "gemini" | "heuristic" = "heuristic";
  const heuristic = heuristicPlanIntent(message, uiLocale);
  let intent = await extractIntentWithGemini(message, history, uiLocale);
  if (intent) {
    provider = "gemini";
    // Fill gaps Gemini sometimes skips (budget / land size from Thai phrasing).
    intent = {
      ...intent,
      filters: { ...cleanFilters(heuristic.filters), ...cleanFilters(intent.filters) },
      keywords: [
        ...(Array.isArray(intent.keywords) ? intent.keywords : []),
        ...(heuristic.keywords ?? []),
      ],
      needsClarification:
        intent.needsClarification &&
        !hasAnyFilter(cleanFilters(intent.filters)) &&
        !hasAnyFilter(cleanFilters(heuristic.filters)),
    };
  } else {
    intent = heuristic;
  }

  const filters = cleanFilters(intent.filters);
  const heuristicSoft = extractSoftIntentFromText(message);
  const styleTags = uniqueStrings([
    ...(Array.isArray(intent.styleTags) ? intent.styleTags : []),
    ...heuristicSoft.styleTags,
    ...(filters.styleTags ?? []),
  ]);
  const lifestyleFeatures = uniqueStrings([
    ...(Array.isArray(intent.lifestyleFeatures) ? intent.lifestyleFeatures : []),
    ...heuristicSoft.lifestyleFeatures,
    ...(filters.lifestyleFeatures ?? []),
  ]);
  const siteConstraints = uniqueStrings([
    ...(Array.isArray(intent.siteConstraints) ? intent.siteConstraints : []),
    ...heuristicSoft.siteConstraints,
    ...(filters.siteConstraints ?? []),
  ]) as NonNullable<RecommendationFilters["siteConstraints"]>;

  const keywords = uniqueStrings([
    ...(Array.isArray(intent.keywords) ? intent.keywords : []),
    ...heuristicSoft.keywords,
  ]).slice(0, 10);

  filters.styleTags = styleTags;
  filters.lifestyleFeatures = lifestyleFeatures;
  filters.siteConstraints = siteConstraints;

  const hasSoftIntent =
    styleTags.length > 0 || lifestyleFeatures.length > 0 || siteConstraints.length > 0;
  const shouldSearch =
    hasAnyFilter(filters) || hasSoftIntent || !intent.needsClarification;

  const matched = shouldSearch
    ? await fetchMatchingListings(
        filters,
        { keywords, styleTags, lifestyleFeatures, siteConstraints },
        input.limit ?? 5,
      )
    : { cards: [], usedFallback: false, fallbackMessage: null };

  // Greeting / clarify path: still surface a few popular plans as inspiration.
  const inspiration =
    matched.cards.length === 0 && intent.needsClarification
      ? await fetchMatchingListings({}, {}, 3)
      : matched;

  const baseReply =
    (intent.reply && String(intent.reply).trim()) ||
    heuristicPlanIntent(message, uiLocale).reply ||
    "";

  return {
    reply: enrichReplyWithResults(baseReply, inspiration.cards, uiLocale, {
      needsClarification: intent.needsClarification && !hasAnyFilter(filters) && !hasSoftIntent,
      usedFallback: inspiration.usedFallback,
      fallbackMessage: inspiration.fallbackMessage,
    }),
    filters,
    keywords,
    listings: inspiration.cards,
    provider,
    usedFallback: inspiration.usedFallback,
  };
}

function uniqueStrings(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of values) {
    const v = String(raw).trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

export function isPlanChatReady(): boolean {
  return isGeminiFeatureEnabled() && isGeminiConfigured();
}
