/**
 * Human-readable plan codes allocated per architectural style, e.g. MOD-001.
 * Internal listing `id` stays a UUID; `planCode` is this public running number.
 * Generative downloads use optional `planDocumentId` → house_plans.id.
 */

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { STYLES } from "@/lib/store/taxonomy";
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
