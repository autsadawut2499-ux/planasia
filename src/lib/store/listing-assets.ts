import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export type ListingFileKind = "blueprint" | "cad" | "boq" | "calc";

function asUrlList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
}

/**
 * Server-only: load vendor private attachment URLs for a listing.
 * These columns are intentionally omitted from public StoreListing reads.
 */
export async function getListingAssetUrls(
  listingId: string,
  kind: ListingFileKind,
): Promise<string[]> {
  if (!listingId || !isSupabaseConfigured()) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select(
      "blueprint_pdf_urls, blueprint_pdf_url, boq_file_urls, boq_file_url, cad_file_urls, calc_sheet_urls",
    )
    .eq("id", listingId)
    .maybeSingle();

  if (error || !data) return [];

  if (kind === "blueprint") {
    const list = asUrlList(data.blueprint_pdf_urls);
    if (list.length > 0) return list;
    const legacy =
      typeof data.blueprint_pdf_url === "string" ? data.blueprint_pdf_url.trim() : "";
    return legacy ? [legacy] : [];
  }

  if (kind === "boq") {
    const list = asUrlList(data.boq_file_urls);
    if (list.length > 0) return list;
    const legacy =
      typeof data.boq_file_url === "string" ? data.boq_file_url.trim() : "";
    return legacy ? [legacy] : [];
  }

  if (kind === "cad") return asUrlList(data.cad_file_urls);
  return asUrlList(data.calc_sheet_urls);
}

/** @deprecated Prefer getListingAssetUrls(id, "blueprint"). */
export async function getListingBlueprintUrls(listingId: string): Promise<string[]> {
  return getListingAssetUrls(listingId, "blueprint");
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
