import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";
import { listingStorePath } from "@/lib/seo/slug";
import { getAllPlanPresets } from "@/lib/seo/programmatic";
import { getAllListingsForSitemap } from "@/lib/store/db";
import { getDraftsmanDirectory } from "@/lib/vendors/directory";
import { ABOUT_PAGES } from "@/lib/content/about";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  let listings: Awaited<ReturnType<typeof getAllListingsForSitemap>> = [];
  let draftsmen: Awaited<ReturnType<typeof getDraftsmanDirectory>> = [];
  if (isSupabaseConfigured()) {
    try {
      listings = await getAllListingsForSitemap();
    } catch {
      listings = [];
    }
    try {
      draftsmen = await getDraftsmanDirectory();
    } catch {
      draftsmen = [];
    }
  }

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/store`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/draftsmen`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/home-building`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/whats-included`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/plan-includes`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...ABOUT_PAGES.map((p) => ({
      url: `${base}/about/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/shipping`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    // Programmatic keyword landing pages.
    ...getAllPlanPresets().map((preset) => ({
      url: `${base}/plans/${preset.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // Product detail pages.
    ...listings.map((listing) => ({
      url: `${base}${listingStorePath(listing.slug)}`,
      lastModified: new Date(listing.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // Draftsman profiles (E-E-A-T).
    ...draftsmen.map((d) => ({
      url: `${base}/draftsmen/${encodeURIComponent(d.ownerKey)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
