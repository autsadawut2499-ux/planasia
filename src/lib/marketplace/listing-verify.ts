/**
 * AI auto-verification for vendor blueprint listings.
 *
 * Runs immediately on upload: completeness + security + file suitability.
 * Pass → listing stays pending (visible, Buy locked until admin Approve).
 * Fail → rejected (hidden from store).
 */

import { getTextModel, isGeminiConfigured } from "@/lib/ai/gemini";
import type { ListingAiScreening, VendorListing } from "@/lib/store/listing-types";

export type { ListingAiScreening };

type ListingVerifyInput = Pick<
  VendorListing,
  | "name"
  | "description"
  | "image"
  | "floorPlanUrls"
  | "renderUrls"
  | "blueprintPdfUrls"
  | "boqFileUrls"
  | "price"
  | "beds"
  | "baths"
  | "floors"
  | "area"
  | "style"
  | "widthMeters"
  | "lengthMeters"
  | "permitReady"
  | "boqComplete"
  | "contractConsent"
>;

const SUSPICIOUS_URL =
  /^(javascript:|data:text\/html|vbscript:)/i;

function isHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  if (value.startsWith("planasia-private://")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function checkCompleteness(input: ListingVerifyInput): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!input.name?.trim()) missing.push("name");
  if (!input.image?.trim()) missing.push("render_image");
  if (!input.floorPlanUrls?.length) missing.push("floor_plan");
  if (!input.blueprintPdfUrls?.length) missing.push("blueprint_pdf");
  // Free (0) or paid ≥ 1,000 THB — detailed range checked in create-listing.
  if (!(Number.isFinite(input.price) && input.price >= 0)) missing.push("price");
  if (!(input.beds >= 0)) missing.push("beds");
  if (!(input.baths >= 0)) missing.push("baths");
  if (!input.area?.trim()) missing.push("area");
  if (!input.contractConsent) missing.push("contract_consent");
  return { ok: missing.length === 0, missing };
}

function checkSecurity(input: ListingVerifyInput): { ok: boolean; flags: string[] } {
  const flags: string[] = [];
  const urls = [
    input.image,
    ...(input.floorPlanUrls ?? []),
    ...(input.renderUrls ?? []),
    ...(input.blueprintPdfUrls ?? []),
    ...(input.boqFileUrls ?? []),
  ].filter(Boolean) as string[];

  for (const url of urls) {
    if (SUSPICIOUS_URL.test(url)) flags.push(`blocked_scheme:${url.slice(0, 32)}`);
    else if (!isHttpUrl(url)) flags.push(`invalid_url:${url.slice(0, 48)}`);
  }

  const blob = `${input.name}\n${input.description ?? ""}`.toLowerCase();
  if (/(<script|onerror=|javascript:)/i.test(blob)) flags.push("xss_pattern_in_copy");

  return { ok: flags.length === 0, flags };
}

async function aiSuitability(
  input: ListingVerifyInput,
): Promise<{ ok: boolean; score: number; notes: string[]; provider: "gemini" | "rules" }> {
  if (!isGeminiConfigured()) {
    // Rules fallback when Gemini is offline — still auto-decide for speed.
    const notes = ["Gemini unavailable; completeness + security rules applied"];
    return { ok: true, score: 0.75, notes, provider: "rules" };
  }

  const model = getTextModel();
  if (!model) {
    return { ok: true, score: 0.75, notes: ["Text model unavailable; rules fallback"], provider: "rules" };
  }

  const prompt = `You are the marketplace compliance AI for an Asian house-plan store.
Decide if this vendor blueprint listing is suitable to publish automatically.

Return ONLY JSON:
{
  "ok": boolean,
  "score": number,   // 0..1 confidence it is a real architectural house plan listing
  "notes": string[]  // short English reasons (max 5)
}

Reject (ok=false) if: spam, adult content, clearly not architecture, empty/gibberish copy,
obvious scam pricing, or missing critical plan files in the payload.

Listing payload:
${JSON.stringify(
  {
    name: input.name,
    description: (input.description ?? "").slice(0, 800),
    style: input.style,
    floors: input.floors,
    beds: input.beds,
    baths: input.baths,
    area: input.area,
    widthMeters: input.widthMeters,
    lengthMeters: input.lengthMeters,
    priceThb: input.price,
    hasRender: Boolean(input.image),
    floorPlanCount: input.floorPlanUrls?.length ?? 0,
    blueprintPdfCount: input.blueprintPdfUrls?.length ?? 0,
    boqFileCount: input.boqFileUrls?.length ?? 0,
    permitReady: input.permitReady,
    boqComplete: input.boqComplete,
    contractConsent: input.contractConsent,
  },
  null,
  2,
)}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text) as { ok?: boolean; score?: number; notes?: unknown };
    const notes = Array.isArray(parsed.notes)
      ? parsed.notes.map((n) => String(n)).filter(Boolean).slice(0, 5)
      : [];
    const score = typeof parsed.score === "number" ? Math.min(1, Math.max(0, parsed.score)) : 0.5;
    const ok = Boolean(parsed.ok) && score >= 0.45;
    return { ok, score, notes: notes.length ? notes : [ok ? "AI approved" : "AI rejected"], provider: "gemini" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI error";
    // Fail-open on transient AI errors only when structural checks already passed later.
    return {
      ok: true,
      score: 0.6,
      notes: [`AI transient failure; rules fallback (${msg.slice(0, 120)})`],
      provider: "rules",
    };
  }
}

/** Real-time AI + rules verification. Auto-approve when all gates pass. */
export async function verifyVendorListing(input: ListingVerifyInput): Promise<ListingAiScreening> {
  const completeness = checkCompleteness(input);
  const security = checkSecurity(input);
  const suitability = await aiSuitability(input);

  const reasons: string[] = [];
  if (!completeness.ok) reasons.push(`Incomplete: missing ${completeness.missing.join(", ")}`);
  if (!security.ok) reasons.push(`Security: ${security.flags.join("; ")}`);
  if (!suitability.ok) reasons.push(`Suitability: ${suitability.notes.join("; ")}`);

  const approved = completeness.ok && security.ok && suitability.ok;

  return {
    approved,
    provider: suitability.provider,
    checkedAt: new Date().toISOString(),
    completeness,
    security,
    suitability: {
      ok: suitability.ok,
      score: suitability.score,
      notes: suitability.notes,
    },
    reasons,
  };
}
