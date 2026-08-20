import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";
import { listingStorePath } from "@/lib/seo/slug";
import { getAllPlanPresets } from "@/lib/seo/programmatic";
import { getAllListingsForSitemap } from "@/lib/store/db";
import { COLLECTIONS, STYLES } from "@/lib/store/taxonomy";
import { ABOUT_PAGES } from "@/lib/content/about";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isListingPubliclyVisible } from "@/lib/store/listing-purchase";
import { listArticles } from "@/lib/supabase/articles";

/** Rebuild sitemap often so new auto-published plans appear for crawlers quickly.
 *  Also busted on-demand via `revalidateStoreSurfaces` → `/sitemap.xml`. */
export const revalidate = 900;

function storeCategoryUrl(base: string, key: "style" | "collection", id: string): string {
  const params = new URLSearchParams({ [key]: id });
  return `${base}/store?${params.toString()}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  let listings: Awaited<ReturnType<typeof getAllListingsForSitemap>> = [];
  let articles: Awaited<ReturnType<typeof listArticles>> = [];
  if (isSupabaseConfigured()) {
    try {
      listings = (await getAllListingsForSitemap()).filter(isListingPubliclyVisible);
    } catch {
      listings = [];
    }
    try {
      articles = await listArticles({ publishedOnly: true });
    } catch {
      articles = [];
    }
  }

  const styleCategories = STYLES.filter((s) => !s.comingSoon).map((style) => ({
    url: storeCategoryUrl(base, "style", style.id),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const collectionCategories = COLLECTIONS.filter((c) => !c.comingSoon).map((collection) => ({
    url: storeCategoryUrl(base, "collection", collection.id),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const productPages = listings.map((listing) => ({
    url: `${base}${listingStorePath(listing.slug)}`,
    lastModified: new Date(listing.seoGeneratedAt || listing.createdAt || Date.now()),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/store`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...styleCategories,
    ...collectionCategories,
    { url: `${base}/home-building`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/whats-included`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/loan-consultation`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...articles.map((a) => ({
      url: `${base}/articles/${encodeURIComponent(a.slug)}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.55,
    })),
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
    { url: `${base}/construction`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/shipping`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    ...getAllPlanPresets().map((preset) => ({
      url: `${base}/plans/${preset.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...productPages,
  ];
}
