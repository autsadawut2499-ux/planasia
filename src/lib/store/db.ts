import type { ViewerIdentity } from "@/lib/user/identity";
import { filterListingsForViewer } from "@/lib/store/visibility";
import { buildListingSlug, ensureUniqueSlug } from "@/lib/seo/slug";
import type { StoreListing } from "@/lib/store/listing-types";
import {
  supabaseGetAllListings,
  supabaseGetListingById,
  supabaseGetListingByPlanId,
  supabaseGetListingBySlug,
  supabaseSeedIfEmpty,
  supabaseUpsertListing,
} from "@/lib/supabase/store-listings";

export type { StoreListing } from "@/lib/store/listing-types";

const SEED: StoreListing[] = [
  {
    id: "seed-1",
    slug: "",
    planId: "seed-1",
    ownerId: "seed-demo",
    creatorBrowserId: "seed-demo",
    name: "Modern Minimal 2F (AI Community Demo)",
    description: "Modern 2-storey · 3 bed · 2 bath — AI co-created permit-ready house plan set",
    beds: 3,
    baths: 2,
    floors: 2,
    area: "180 sqm",
    style: "modern",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    floorPlanUrls: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    ],
    price: 1400,
    source: "seed-demo",
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    slug: "",
    planId: "seed-2",
    ownerId: "seed-demo",
    creatorBrowserId: "seed-demo",
    name: "Tropical Single (AI Community Demo)",
    description: "Tropical 1-storey · 2 bed · 2 bath — AI co-created permit-ready house plan set",
    beds: 2,
    baths: 2,
    floors: 1,
    area: "120 sqm",
    style: "tropical",
    image: "https://images.unsplash.com/photo-1605276374101-ec38c14f68d4?w=600&q=80",
    floorPlanUrls: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
    ],
    price: 1000,
    source: "seed-demo",
    createdAt: new Date().toISOString(),
  },
];

function assignSlugs(listings: StoreListing[]): StoreListing[] {
  const used = new Set<string>();
  return listings.map((item) => {
    const base = item.slug || buildListingSlug(item);
    const slug = ensureUniqueSlug(base, used, item.id);
    used.add(slug);
    return { ...item, slug };
  });
}

function normalizeListing(raw: StoreListing): StoreListing {
  return {
    ...raw,
    planId: raw.planId ?? raw.id,
    creatorBrowserId: raw.creatorBrowserId ?? raw.ownerId,
    description: raw.description ?? raw.name,
    floorPlanUrls: raw.floorPlanUrls ?? [],
    slug: raw.slug ?? "",
  };
}

let seeded = false;

function seedListings(): StoreListing[] {
  return assignSlugs(SEED.map(normalizeListing));
}

async function ensureListings(): Promise<StoreListing[]> {
  if (!seeded) {
    seeded = true;
    await supabaseSeedIfEmpty(seedListings());
  }
  return supabaseGetAllListings();
}

export async function getListings(viewer?: ViewerIdentity): Promise<StoreListing[]> {
  const all = await ensureListings();
  if (!viewer) return all;
  return filterListingsForViewer(all, viewer);
}

export async function getListingById(id: string): Promise<StoreListing | null> {
  return supabaseGetListingById(id);
}

export async function getListingBySlug(slug: string): Promise<StoreListing | null> {
  return supabaseGetListingBySlug(slug);
}

/** All listings for sitemap generation (no privacy filter — public SEO URLs). */
export async function getAllListingsForSitemap(): Promise<StoreListing[]> {
  return ensureListings();
}

export async function getListingByPlanId(planId: string): Promise<StoreListing | null> {
  return supabaseGetListingByPlanId(planId);
}

export async function addListing(listing: StoreListing): Promise<StoreListing> {
  return supabaseUpsertListing(normalizeListing(listing));
}
