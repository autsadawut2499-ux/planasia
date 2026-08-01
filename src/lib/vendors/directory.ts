import { getListings } from "@/lib/store/db";
import type { StoreListing } from "@/lib/store/listing-types";
import { getPublishedVendors, getVendorByOwnerKey } from "@/lib/supabase/vendors";

export interface DraftsmanCard {
  ownerKey: string;
  displayName: string;
  headline?: string;
  avatarUrl?: string;
  /** Square brand logo uploaded by the vendor. */
  brandImageUrl?: string;
  coverUrl?: string;
  /** Vendor-curated showcase images (separate from listing renders). */
  galleryUrls: string[];
  /** Province slug (or legacy free text) — shown on the public profile. */
  location?: string;
  /** Public contact number, shown so buyers can reach the draftsman directly. */
  contactPhone?: string;
  contactEmail?: string;
  lineId?: string;
  specialties: string[];
  planCount: number;
  sampleImages: string[];
  rating?: number;
  reviewCount: number;
  isVerified: boolean;
  website?: string;
  /** External profile URLs (schema.org sameAs). */
  socials: string[];
  /** True when backed by a real vendor_profiles row (vs derived from listings). */
  hasProfile: boolean;
}

function shortHandle(ownerKey: string): string {
  const tail = ownerKey.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "0000";
  return `ช่างเขียนแบบ #${tail}`;
}

/**
 * Directory of draftsmen/architects. Published vendor_profiles are authoritative;
 * additional creators who have listings but no profile yet are surfaced as
 * lightweight derived cards so the directory reflects real marketplace activity.
 */
export async function getDraftsmanDirectory(): Promise<DraftsmanCard[]> {
  const [vendors, listings] = await Promise.all([getPublishedVendors(), getListings()]);

  // Aggregate real listing activity per creator.
  const activity = new Map<string, { count: number; images: string[]; styles: Set<string> }>();
  for (const listing of listings) {
    if (!listing.ownerId || listing.ownerId === "seed-demo") continue;
    let entry = activity.get(listing.ownerId);
    if (!entry) {
      entry = { count: 0, images: [], styles: new Set() };
      activity.set(listing.ownerId, entry);
    }
    entry.count += 1;
    if (listing.image && entry.images.length < 3) entry.images.push(listing.image);
    if (listing.style) entry.styles.add(listing.style);
  }

  const cards: DraftsmanCard[] = [];
  const covered = new Set<string>();

  for (const vendor of vendors) {
    const act = activity.get(vendor.ownerKey);
    covered.add(vendor.ownerKey);
    cards.push({
      ownerKey: vendor.ownerKey,
      displayName: vendor.displayName,
      headline: vendor.headline,
      avatarUrl: vendor.avatarUrl,
      brandImageUrl: vendor.brandImageUrl,
      coverUrl: vendor.coverUrl,
      galleryUrls: vendor.galleryUrls,
      location: vendor.location,
      contactPhone: vendor.contactPhone,
      contactEmail: vendor.contactEmail,
      lineId: vendor.lineId,
      specialties: vendor.specialties.length ? vendor.specialties : [...(act?.styles ?? [])],
      planCount: act?.count ?? 0,
      sampleImages: act?.images ?? [],
      rating: vendor.rating,
      reviewCount: vendor.reviewCount,
      isVerified: vendor.isVerified,
      website: vendor.website,
      socials: vendor.socials,
      hasProfile: true,
    });
  }

  for (const [ownerKey, act] of activity) {
    if (covered.has(ownerKey)) continue;
    cards.push({
      ownerKey,
      displayName: shortHandle(ownerKey),
      galleryUrls: [],
      specialties: [...act.styles],
      planCount: act.count,
      sampleImages: act.images,
      reviewCount: 0,
      isVerified: false,
      socials: [],
      hasProfile: false,
    });
  }

  // Profiles first, then most-active creators.
  cards.sort((a, b) => {
    if (a.hasProfile !== b.hasProfile) return a.hasProfile ? -1 : 1;
    return b.planCount - a.planCount;
  });

  return cards;
}

/** A single draftsman profile card + their published listings (profile page). */
export async function getDraftsmanByKey(
  ownerKey: string,
): Promise<{ card: DraftsmanCard; listings: StoreListing[] } | null> {
  const [vendor, allListings] = await Promise.all([
    getVendorByOwnerKey(ownerKey),
    getListings(),
  ]);
  const listings = allListings.filter((l) => l.ownerId === ownerKey && l.ownerId !== "seed-demo");
  if (!vendor && listings.length === 0) return null;

  const styles = new Set<string>();
  for (const l of listings) if (l.style) styles.add(l.style);

  const card: DraftsmanCard = vendor
    ? {
        ownerKey: vendor.ownerKey,
        displayName: vendor.displayName,
        headline: vendor.headline,
        avatarUrl: vendor.avatarUrl,
        brandImageUrl: vendor.brandImageUrl,
        coverUrl: vendor.coverUrl,
        galleryUrls: vendor.galleryUrls,
        location: vendor.location,
        contactPhone: vendor.contactPhone,
        contactEmail: vendor.contactEmail,
        lineId: vendor.lineId,
        specialties: vendor.specialties.length ? vendor.specialties : [...styles],
        planCount: listings.length,
        sampleImages: listings.slice(0, 6).map((l) => l.image),
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        isVerified: vendor.isVerified,
        website: vendor.website,
        socials: vendor.socials,
        hasProfile: true,
      }
    : {
        ownerKey,
        displayName: shortHandle(ownerKey),
        galleryUrls: [],
        specialties: [...styles],
        planCount: listings.length,
        sampleImages: listings.slice(0, 6).map((l) => l.image),
        reviewCount: 0,
        isVerified: false,
        socials: [],
        hasProfile: false,
      };

  return { card, listings };
}
