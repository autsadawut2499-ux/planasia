import type { ViewerIdentity } from "@/lib/user/identity";
import { filterListingsForViewer } from "@/lib/store/visibility";
import { attachCreator, attachCreators } from "@/lib/store/creators";
import type { StoreListing } from "@/lib/store/listing-types";
import { resolvePlanIdentity } from "@/lib/store/plan-identity";
import {
  supabaseGetAllListings,
  supabaseGetListingById,
  supabaseGetListingByPlanDocumentId,
  supabaseGetListingByPlanId,
  supabaseGetListingBySlug,
  supabaseUpsertListing,
} from "@/lib/supabase/store-listings";

export type { StoreListing } from "@/lib/store/listing-types";

/**
 * Store listings are loaded from Supabase only.
 * Demo/AI seed rows are no longer auto-inserted — manage content via Admin → แบบบ้าน.
 */
async function loadListings(): Promise<StoreListing[]> {
  return attachCreators(await supabaseGetAllListings());
}

export async function getListings(viewer?: ViewerIdentity): Promise<StoreListing[]> {
  const all = await loadListings();
  if (!viewer) return all;
  return filterListingsForViewer(all, viewer);
}

export async function getListingById(id: string): Promise<StoreListing | null> {
  return attachCreator(await supabaseGetListingById(id));
}

export async function getListingBySlug(slug: string): Promise<StoreListing | null> {
  return attachCreator(await supabaseGetListingBySlug(slug));
}

/** All listings for sitemap generation (no privacy filter — public SEO URLs). */
export async function getAllListingsForSitemap(): Promise<StoreListing[]> {
  return loadListings();
}

/** Lookup by marketplace plan code (or legacy plan_id). */
export async function getListingByPlanId(planId: string): Promise<StoreListing | null> {
  return attachCreator(await supabaseGetListingByPlanId(planId));
}

export async function getListingByPlanCode(planCode: string): Promise<StoreListing | null> {
  return getListingByPlanId(planCode);
}

export async function getListingByPlanDocumentId(
  planDocumentId: string,
): Promise<StoreListing | null> {
  return attachCreator(await supabaseGetListingByPlanDocumentId(planDocumentId));
}

export async function addListing(listing: StoreListing): Promise<StoreListing> {
  const identity = resolvePlanIdentity({
    planId: listing.planId,
    planCode: listing.planCode,
    planDocumentId: listing.planDocumentId,
  });
  return supabaseUpsertListing({
    ...listing,
    planCode: identity.planCode,
    planDocumentId: identity.planDocumentId,
    planId: identity.planId,
    creatorBrowserId: listing.creatorBrowserId ?? listing.ownerId,
    description: listing.description ?? listing.name,
    floorPlanUrls: listing.floorPlanUrls ?? [],
    slug: listing.slug ?? "",
  });
}
