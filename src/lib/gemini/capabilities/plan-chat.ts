/**
 * Plan-finder chat: Gemini extracts search filters from natural language,
 * then `recommendListings` returns real storefront plans.
 */

import { getTextModel, isGeminiConfigured } from "@/lib/ai/gemini";
import { isGeminiFeatureEnabled } from "@/lib/gemini/config";
import { recommendListings } from "@/lib/recommend/engine";
import type { RecommendationFilters } from "@/lib/recommend/types";
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
}

interface GeminiPlanIntent {
  reply?: string;
  filters?: RecommendationFilters;
  keywords?: string[];
  needsClarification?: boolean;
}

const SYSTEM_PROMPT = `You are Planasia's house-plan shopping assistant for Thailand.
Help buyers find real house plans from our marketplace.

Extract structured search filters from the user message. Reply in the same language as the user (Thai or English).

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
    "style": string | omit,
    "collection": string | omit
  },
  "keywords": ["optional", "search", "terms"],
  "needsClarification": boolean
}

Rules:
- Budget is construction budget in THB (e.g. 2 ล้าน → budgetMax: 2000000).
- Land size "กว้าง 10 ม. ลึก 15 ม." → widthMeters / lengthMeters.
- Usable area "120 ตร.ม." → areaMin/areaMax (±15% band OK).
- Styles common in catalog: Modern, Minimal, Tropical, Contemporary, Classic, Scandinavian. Omit style if unsure.
- If the user is only greeting or asking how you work, set needsClarification true and ask for beds, budget, style, or land size. Leave filters empty.
- Keep reply concise and friendly. Do not invent listing names or prices.`;

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
  if (beds) out.beds = Math.round(beds);
  if (baths) out.baths = Math.round(baths);
  if (floors) out.floors = Math.round(floors);
  if (areaMin) out.areaMin = areaMin;
  if (areaMax) out.areaMax = areaMax;
  if (widthMeters) out.widthMeters = widthMeters;
  if (lengthMeters) out.lengthMeters = lengthMeters;
  if (budgetMin) out.budgetMin = budgetMin;
  if (budgetMax) out.budgetMax = budgetMax;
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

  const styleMap: Array<[RegExp, string]> = [
    [/โมเดิร์น|modern/i, "Modern"],
    [/มินิมอล|minimal/i, "Minimal"],
    [/ทรอปิคอล|tropical/i, "Tropical"],
    [/คลาสสิก|classic/i, "Classic"],
    [/สแกนดิ|scandinavian/i, "Scandinavian"],
    [/ร่วมสมัย|contemporary/i, "Contemporary"],
  ];
  for (const [re, style] of styleMap) {
    if (re.test(text)) {
      filters.style = style;
      keywords.push(style.toLowerCase());
      break;
    }
  }

  const needsClarification = !hasAnyFilter(filters);
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

  return { reply, filters, keywords, needsClarification };
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
  viewerKey?: string,
  limit = 5,
): Promise<PlanChatListingCard[]> {
  const run = async (f: RecommendationFilters) =>
    recommendListings({
      viewerKey,
      filters: hasAnyFilter(f) ? f : undefined,
      limit,
    });

  let scored = await run(filters);

  // Soften style if it wiped the catalog.
  if (scored.length < 2 && filters.style) {
    const { style: _style, ...rest } = filters;
    scored = await run(rest);
  }

  // Last resort: popular / personalized without hard filters.
  if (scored.length === 0 && hasAnyFilter(filters)) {
    scored = await run({});
  }

  return scored.map((row) => ({
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
}

function enrichReplyWithResults(
  reply: string,
  listings: PlanChatListingCard[],
  uiLocale: UiLocale,
  needsClarification?: boolean,
): string {
  if (needsClarification && listings.length === 0) return reply;
  const th = uiLocale === "th";
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
  const keywords = Array.isArray(intent.keywords)
    ? intent.keywords.map((k) => String(k).trim().toLowerCase()).filter(Boolean).slice(0, 8)
    : [];

  const shouldSearch = hasAnyFilter(filters) || !intent.needsClarification;
  const listings = shouldSearch
    ? await fetchMatchingListings(filters, input.viewerKey, input.limit ?? 5)
    : [];

  // Greeting / clarify path: still surface a few popular plans as inspiration.
  const inspiration =
    listings.length === 0 && intent.needsClarification
      ? await fetchMatchingListings({}, input.viewerKey, 3)
      : listings;

  const baseReply =
    (intent.reply && String(intent.reply).trim()) ||
    heuristicPlanIntent(message, uiLocale).reply ||
    "";

  return {
    reply: enrichReplyWithResults(
      baseReply,
      inspiration,
      uiLocale,
      intent.needsClarification && !hasAnyFilter(filters),
    ),
    filters,
    keywords,
    listings: inspiration,
    provider,
  };
}

export function isPlanChatReady(): boolean {
  return isGeminiFeatureEnabled() && isGeminiConfigured();
}
