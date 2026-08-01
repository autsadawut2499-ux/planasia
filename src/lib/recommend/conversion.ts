import type { StoreInteraction } from "@/lib/supabase/interactions";

const RECENCY_HALF_LIFE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Exponential recency decay so fresh conversions weigh more than stale ones. */
function recencyWeight(createdAt: string, now: number): number {
  const ageDays = Math.max(0, (now - new Date(createdAt).getTime()) / DAY_MS);
  return Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
}

/**
 * Sales velocity per listing — a recency-decayed conversion frequency score
 * derived from real purchase/cart signals. Feeds the conversion booster
 * (`conversionWeight = 1 + salesVelocity * 0.05`).
 */
export function computeSalesVelocity(interactions: StoreInteraction[]): Map<string, number> {
  const now = Date.now();
  const raw = new Map<string, number>();
  for (const it of interactions) {
    if (it.eventType !== "purchase" && it.eventType !== "cart") continue;
    const conversionValue = it.eventType === "purchase" ? 1 : 0.4;
    const contribution = conversionValue * recencyWeight(it.createdAt, now);
    raw.set(it.listingId, (raw.get(it.listingId) ?? 0) + contribution);
  }
  return raw;
}

/** Per-plan dwell time (seconds) from a single viewer's view events. */
export function computeDwellSeconds(history: StoreInteraction[]): Map<string, number> {
  const dwell = new Map<string, number>();
  for (const it of history) {
    if (it.eventType !== "view") continue;
    const ms = Number((it.metadata as { durationMs?: number })?.durationMs ?? 0);
    if (Number.isFinite(ms) && ms > 0) {
      dwell.set(it.listingId, (dwell.get(it.listingId) ?? 0) + ms / 1000);
    }
  }
  return dwell;
}

/** Distinct keywords a viewer expressed through chat, for intent matching. */
export function collectChatKeywords(history: StoreInteraction[]): string[] {
  const keywords = new Set<string>();
  for (const it of history) {
    if (it.eventType !== "chat") continue;
    const meta = it.metadata as { keywords?: unknown; query?: unknown };
    if (Array.isArray(meta?.keywords)) {
      for (const k of meta.keywords) if (typeof k === "string") keywords.add(k.toLowerCase());
    }
    if (typeof meta?.query === "string") {
      for (const token of meta.query.toLowerCase().split(/\s+/)) {
        if (token.length >= 3) keywords.add(token);
      }
    }
  }
  return [...keywords];
}
