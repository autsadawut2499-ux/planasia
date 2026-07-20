import type { Metadata } from "next";
import type { StoreListing } from "@/lib/store/db";
import { getSiteUrl } from "@/lib/seo/site-url";
import { listingStorePath } from "@/lib/seo/slug";

const SITE_NAME = "Planasia";
const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=630&fit=crop&q=80";

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function formatPriceForSeo(listing: StoreListing): string {
  const currency = listing.priceBreakdown?.currency ?? "THB";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(listing.price);
}

function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function ogImages(listing: StoreListing) {
  return [
    {
      url: listing.image,
      width: 1200,
      height: 630,
      alt: `${listing.name} — 3D house plan preview`,
    },
  ];
}

/** Product / listing detail page metadata + Open Graph. */
export function buildListingMetadata(listing: StoreListing): Metadata {
  const title = `${listing.name} | ${SITE_NAME} House Plans`;
  const priceLabel = formatPriceForSeo(listing);
  const description = truncate(
    `${listing.description} ${listing.beds} bed · ${listing.baths} bath · ${listing.floors} floor(s) · from ${priceLabel}. AI co-created permit-ready house plan.`,
  );
  const canonical = absoluteUrl(listingStorePath(listing.slug));

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: listing.name,
      description,
      images: ogImages(listing),
    },
    twitter: {
      card: "summary_large_image",
      title: listing.name,
      description,
      images: [listing.image],
    },
    other: {
      "product:price:amount": String(listing.price),
      "product:price:currency": listing.priceBreakdown?.currency ?? "THB",
    },
  };
}

export function buildStoreIndexMetadata(): Metadata {
  const title = `House Plan Store | ${SITE_NAME}`;
  const description =
    "Browse AI co-created house plans for Asia. Modern, tropical, and minimalist designs with 3D previews. Instant PDF/CAD download.";
  const canonical = absoluteUrl("/store");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildHomeMetadata(): Metadata {
  const title = `${SITE_NAME} — AI Architectural Design Platform`;
  const description =
    "Design and buy permit-ready house plans with world-class AI. Compliant with local building codes across Thailand, India, Vietnam, and Asia.";
  const canonical = getSiteUrl();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildWorkspaceMetadata(): Metadata {
  return {
    title: `AI Design Studio | ${SITE_NAME}`,
    description: "Create custom house plans with AI. Upload inspiration, generate 3D renders and floor plans.",
    robots: { index: false, follow: true },
  };
}
