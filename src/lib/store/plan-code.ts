/**
 * Human-readable plan codes allocated per architectural style, e.g. MOD-001.
 * Internal listing `id` stays a UUID; `planCode` is this public running number.
 * Generative downloads use optional `planDocumentId` → house_plans.id.
 */

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { STYLES } from "@/lib/store/taxonomy";
import { stripBanBaanPrefix } from "@/lib/store/style-label";
import { createRandomId } from "@/lib/random-id";

/** Short codes shown on cards, search, and invoices. */
export const STYLE_PLAN_PREFIX: Record<string, string> = {
  modern: "MOD",
  contemporary: "CON",
  minimal: "MIN",
  tropical: "TRO",
  nordic: "NOR",
  loft: "LFT",
  classic: "CLS",
  muji: "MUJ",
  industrial: "IND",
  custom: "CUS",
};

export function planPrefixForStyle(style: string | null | undefined): string {
  const key = (style ?? "custom").trim().toLowerCase();
  if (STYLE_PLAN_PREFIX[key]) return STYLE_PLAN_PREFIX[key];
  // Unknown style → first 3 letters of a known taxonomy id, else CUS.
  const known = STYLES.find((s) => s.id === key);
  if (known) return known.id.slice(0, 3).toUpperCase();
  const cleaned = key.replace(/[^a-z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, 3) || "CUS";
}

/** English style label used in auto house names (e.g. Modern, Minimal). */
export function styleLabelForListingName(style: string | null | undefined): string {
  const key = (style ?? "custom").trim().toLowerCase();
  const known = STYLES.find((s) => s.id === key);
  const en = stripBanBaanPrefix(known?.en ?? "Custom");
  // Prefer the short head before a slash (e.g. "Nordic / Scandinavian" → "Nordic").
  return en.split(" / ")[0]?.trim() || "Custom";
}

/**
 * Uniform storefront title: "{PlanCode} {Style}" e.g. "MOD-001 Modern".
 * English only — designers do not enter a manual name; the server assigns this on save.
 */
export function buildAutoListingName(
  style: string | null | undefined,
  planCode: string | null | undefined,
): string {
  const label = styleLabelForListingName(style);
  const code = (planCode ?? "").trim().toUpperCase();
  return code ? `${code} ${label}` : label;
}

/** Resolve the canonical English display name for a listing. */
export function listingDisplayName(listing: {
  name?: string | null;
  style?: string | null;
  planCode?: string | null;
  planId?: string | null;
}): string {
  const code = (listing.planCode || listing.planId || "").trim();
  if (code) return buildAutoListingName(listing.style, code);
  const fallback = (listing.name ?? "").trim();
  return fallback || styleLabelForListingName(listing.style);
}

/**
 * Atomically allocate the next code for a style (MOD-001, MOD-002, …).
 * Falls back to a UUID-shaped token only if Supabase is unavailable — never
 * invents a colliding sequential number in memory.
 */
export async function allocatePlanCode(style: string): Promise<string> {
  const prefix = planPrefixForStyle(style);
  if (!isSupabaseConfigured()) {
    return `${prefix}-${createRandomId().slice(0, 8).toUpperCase()}`;
  }

  const { data, error } = await getSupabaseAdmin().rpc("allocate_plan_code", {
    p_prefix: prefix,
  });

  if (error || typeof data !== "string" || !data.trim()) {
    throw new Error(error?.message ?? "ไม่สามารถสร้างรหัสแบบบ้านได้");
  }
  return data.trim().toUpperCase();
}
