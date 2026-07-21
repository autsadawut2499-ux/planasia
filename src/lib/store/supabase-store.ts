import type { StoreListing } from "@/lib/store/db";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface StoreListingRow {
  id: string;
  slug: string;
  plan_id: string;
  owner_id: string;
  creator_browser_id: string;
  creator_session_user_id: string | null;
  creator_ip: string | null;
  creator_workspace_session_id: string | null;
  name: string;
  description: string;
  beds: number;
  baths: number;
  floors: number;
  area: string;
  style: string;
  image: string;
  floor_plan_urls: string[];
  price: number;
  price_breakdown: StoreListing["priceBreakdown"] | null;
  project_snapshot: StoreListing["projectSnapshot"] | null;
  source: StoreListing["source"];
  created_at: string;
}

function rowToListing(row: StoreListingRow): StoreListing {
  return {
    id: row.id,
    slug: row.slug,
    planId: row.plan_id,
    ownerId: row.owner_id,
    creatorBrowserId: row.creator_browser_id,
    creatorSessionUserId: row.creator_session_user_id ?? undefined,
    creatorIp: row.creator_ip ?? undefined,
    creatorWorkspaceSessionId: row.creator_workspace_session_id ?? undefined,
    name: row.name,
    description: row.description,
    beds: row.beds,
    baths: row.baths,
    floors: row.floors as 1 | 2,
    area: row.area,
    style: row.style,
    image: row.image,
    floorPlanUrls: row.floor_plan_urls ?? [],
    price: Number(row.price),
    priceBreakdown: row.price_breakdown ?? undefined,
    projectSnapshot: row.project_snapshot ?? undefined,
    source: row.source,
    createdAt: row.created_at,
  };
}

function listingToRow(listing: StoreListing): StoreListingRow {
  return {
    id: listing.id,
    slug: listing.slug,
    plan_id: listing.planId,
    owner_id: listing.ownerId,
    creator_browser_id: listing.creatorBrowserId,
    creator_session_user_id: listing.creatorSessionUserId ?? null,
    creator_ip: listing.creatorIp ?? null,
    creator_workspace_session_id: listing.creatorWorkspaceSessionId ?? null,
    name: listing.name,
    description: listing.description,
    beds: listing.beds,
    baths: listing.baths,
    floors: listing.floors,
    area: listing.area,
    style: listing.style,
    image: listing.image,
    floor_plan_urls: listing.floorPlanUrls,
    price: listing.price,
    price_breakdown: listing.priceBreakdown ?? null,
    project_snapshot: listing.projectSnapshot ?? null,
    source: listing.source,
    created_at: listing.createdAt,
  };
}

export async function supabaseGetAllListings(): Promise<StoreListing[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as StoreListingRow[]).map(rowToListing);
}

export async function supabaseGetListingById(id: string): Promise<StoreListing | null> {
  const byId = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (byId.data) return rowToListing(byId.data as StoreListingRow);
  if (byId.error) throw byId.error;

  const byPlan = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("plan_id", id)
    .maybeSingle();
  if (byPlan.error) throw byPlan.error;
  return byPlan.data ? rowToListing(byPlan.data as StoreListingRow) : null;
}

export async function supabaseGetListingBySlug(slug: string): Promise<StoreListing | null> {
  for (const column of ["slug", "id", "plan_id"] as const) {
    const { data, error } = await getSupabaseAdmin()
      .from("store_listings")
      .select("*")
      .eq(column, slug)
      .maybeSingle();
    if (error) throw error;
    if (data) return rowToListing(data as StoreListingRow);
  }
  return null;
}

export async function supabaseGetListingByPlanId(planId: string): Promise<StoreListing | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("plan_id", planId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToListing(data as StoreListingRow) : null;
}

export async function supabaseUpsertListing(listing: StoreListing): Promise<StoreListing> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .upsert(listingToRow(listing), { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return rowToListing(data as StoreListingRow);
}

export async function supabaseSeedIfEmpty(seed: StoreListing[]): Promise<void> {
  const { count, error: countError } = await getSupabaseAdmin()
    .from("store_listings")
    .select("*", { count: "exact", head: true });

  if (countError) throw countError;
  if ((count ?? 0) > 0) return;

  const { error } = await getSupabaseAdmin()
    .from("store_listings")
    .insert(seed.map(listingToRow));

  if (error) throw error;
}
