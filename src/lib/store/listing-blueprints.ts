import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Server-only: load vendor-uploaded blueprint PDF URLs for a listing.
 * These columns are intentionally omitted from public StoreListing reads.
 */
export async function getListingBlueprintUrls(
  listingId: string,
): Promise<string[]> {
  if (!listingId || !isSupabaseConfigured()) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select("blueprint_pdf_urls, blueprint_pdf_url")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !data) return [];

  const list = Array.isArray(data.blueprint_pdf_urls)
    ? data.blueprint_pdf_urls.filter((u): u is string => typeof u === "string" && u.length > 0)
    : [];
  if (list.length > 0) return list;

  const legacy =
    typeof data.blueprint_pdf_url === "string" ? data.blueprint_pdf_url.trim() : "";
  return legacy ? [legacy] : [];
}

/** Lookup listing id by marketplace plan code when grant lacks listing_id. */
export async function findListingIdByPlanCode(planCode: string): Promise<string | null> {
  if (!planCode || !isSupabaseConfigured()) return null;
  const code = planCode.trim();
  if (!code) return null;

  const byCode = await getSupabaseAdmin()
    .from("store_listings")
    .select("id")
    .eq("plan_code", code)
    .limit(1)
    .maybeSingle();
  if (!byCode.error && byCode.data?.id) return String(byCode.data.id);

  const byPlanId = await getSupabaseAdmin()
    .from("store_listings")
    .select("id")
    .eq("plan_id", code)
    .limit(1)
    .maybeSingle();
  if (!byPlanId.error && byPlanId.data?.id) return String(byPlanId.data.id);

  return null;
}

export function filenameFromUrl(url: string, fallback: string): string {
  try {
    const path = new URL(url).pathname;
    const base = path.split("/").pop() || fallback;
    return decodeURIComponent(base).replace(/[^\w.\-()+ ]+/g, "_") || fallback;
  } catch {
    return fallback;
  }
}
