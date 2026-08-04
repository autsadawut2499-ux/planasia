/**
 * Resolves the draftsman byline shown under every listing image.
 *
 * Listings only store `ownerId`, so the public profile (portrait + name) is
 * joined in at read time with a single batched query per request.
 */

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ListingCreator, StoreListing } from "@/lib/store/listing-types";

/** Seeded demo content has no real author and must not get a byline. */
const SYNTHETIC_OWNERS = new Set(["seed-demo", ""]);

interface VendorBylineRow {
  owner_key: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
}

function fallbackName(ownerKey: string): string {
  const tail = ownerKey.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "0000";
  return `สถาปนิกและนักออกแบบ #${tail}`;
}

async function loadCreators(ownerKeys: string[]): Promise<Map<string, ListingCreator>> {
  const map = new Map<string, ListingCreator>();
  if (ownerKeys.length === 0 || !isSupabaseConfigured()) return map;

  const { data, error } = await getSupabaseAdmin()
    .from("vendor_profiles")
    .select("owner_key, display_name, avatar_url, is_verified")
    .in("owner_key", ownerKeys);

  // A byline is decorative — never fail a store page over it.
  if (error) return map;

  for (const row of (data as VendorBylineRow[]) ?? []) {
    map.set(row.owner_key, {
      ownerKey: row.owner_key,
      displayName: row.display_name?.trim() || fallbackName(row.owner_key),
      avatarUrl: row.avatar_url ?? undefined,
      isVerified: row.is_verified ?? false,
      hasProfile: true,
    });
  }
  return map;
}

/** Attach `creator` to each listing, batching the vendor lookup. */
export async function attachCreators<T extends StoreListing>(listings: T[]): Promise<T[]> {
  const ownerKeys = Array.from(
    new Set(listings.map((l) => l.ownerId).filter((id) => id && !SYNTHETIC_OWNERS.has(id))),
  );
  if (ownerKeys.length === 0) return listings;

  const creators = await loadCreators(ownerKeys);

  return listings.map((listing) => {
    if (!listing.ownerId || SYNTHETIC_OWNERS.has(listing.ownerId)) return listing;
    const creator = creators.get(listing.ownerId) ?? {
      ownerKey: listing.ownerId,
      displayName: fallbackName(listing.ownerId),
      isVerified: false,
      hasProfile: false,
    };
    return { ...listing, creator };
  });
}

export async function attachCreator<T extends StoreListing>(listing: T | null): Promise<T | null> {
  if (!listing) return null;
  const [withCreator] = await attachCreators([listing]);
  return withCreator ?? listing;
}
