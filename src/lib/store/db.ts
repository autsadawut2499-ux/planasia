import { promises as fs } from "fs";
import path from "path";

import type { StoreListingSource } from "@/lib/templates/policy";
import type { ProjectInput } from "@/lib/ai/types";
import type { StorePriceBreakdown } from "@/lib/store/pricing";
import type { ViewerIdentity } from "@/lib/user/identity";
import { filterListingsForViewer } from "@/lib/store/visibility";
import { buildListingSlug, ensureUniqueSlug } from "@/lib/seo/slug";

export interface StoreListing {
  id: string;
  slug: string;
  planId: string;
  ownerId: string;
  creatorBrowserId: string;
  creatorSessionUserId?: string;
  creatorIp?: string;
  creatorWorkspaceSessionId?: string;
  name: string;
  description: string;
  beds: number;
  baths: number;
  floors: 1 | 2;
  area: string;
  style: string;
  image: string;
  floorPlanUrls: string[];
  price: number;
  priceBreakdown?: StorePriceBreakdown;
  projectSnapshot?: ProjectInput;
  source: StoreListingSource;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store-listings.json");

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

async function ensureFile(): Promise<StoreListing[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return assignSlugs((JSON.parse(raw) as StoreListing[]).map(normalizeListing));
  } catch {
    const seeded = assignSlugs(SEED.map(normalizeListing));
    await fs.writeFile(DATA_FILE, JSON.stringify(seeded, null, 2), "utf-8");
    return seeded;
  }
}

async function writeAll(listings: StoreListing[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(listings, null, 2), "utf-8");
}

export async function getListings(viewer?: ViewerIdentity): Promise<StoreListing[]> {
  const all = await ensureFile();
  if (!viewer) return all;
  return filterListingsForViewer(all, viewer);
}

export async function getListingById(id: string): Promise<StoreListing | null> {
  const all = await ensureFile();
  return all.find((item) => item.id === id || item.planId === id) ?? null;
}

export async function getListingBySlug(slug: string): Promise<StoreListing | null> {
  const all = await ensureFile();
  return (
    all.find((item) => item.slug === slug || item.id === slug || item.planId === slug) ?? null
  );
}

/** All listings for sitemap generation (no privacy filter — public SEO URLs). */
export async function getAllListingsForSitemap(): Promise<StoreListing[]> {
  return ensureFile();
}

export async function getListingByPlanId(planId: string): Promise<StoreListing | null> {
  const all = await ensureFile();
  return all.find((item) => item.planId === planId) ?? null;
}

export async function addListing(listing: StoreListing): Promise<StoreListing> {
  const all = await ensureFile();
  const normalized = normalizeListing(listing);
  const idx = all.findIndex((item) => item.id === normalized.id || item.planId === normalized.planId);
  if (idx >= 0) {
    all[idx] = normalized;
  } else {
    all.unshift(normalized);
  }
  await writeAll(all);
  return normalized;
}
