import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";
import { listingStorePath } from "@/lib/seo/slug";
import { getAllListingsForSitemap } from "@/lib/store/db";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  let listings: Awaited<ReturnType<typeof getAllListingsForSitemap>> = [];
  if (isSupabaseConfigured()) {
    try {
      listings = await getAllListingsForSitemap();
    } catch {
      listings = [];
    }
  }

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/store`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...listings.map((listing) => ({
      url: `${base}${listingStorePath(listing.slug)}`,
      lastModified: new Date(listing.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
