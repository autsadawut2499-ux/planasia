import type { Metadata } from "next";
import type { StoreListing } from "@/lib/store/db";
import type { AboutPage } from "@/lib/content/about";
import { DEFAULT_SITE_SETTINGS } from "@/lib/admin/defaults";
import {
  asiaPositioningKeywords,
  asiaPositioningMetaOther,
} from "@/lib/seo/multilingual-positioning";
import { getSiteUrl } from "@/lib/seo/site-url";
import { listingStorePath } from "@/lib/seo/slug";
import {
  SITE_VALUE_PROPOSITION,
  SITE_VALUE_PROPOSITION_SHORT,
} from "@/lib/seo/site-copy";

const SITE_NAME = "Planasia";
/** Fallback when admin hero cover is unset — keep in sync with DEFAULT_SITE_SETTINGS.hero. */
const DEFAULT_OG_IMAGE = DEFAULT_SITE_SETTINGS.hero.backgroundImageUrl;

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function formatPriceForSeo(listing: StoreListing): string {
  const currency = listing.priceBreakdown?.currency ?? "THB";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(listing.price);
}

function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * hreflang map. The marketplace is Thai-first; English is served on the same
 * URL via the in-app language toggle (?lang=en) so we point en-US there and
 * keep x-default on the canonical Thai URL. Ready for future ASEAN locales.
 */
function hreflang(canonical: string): Record<string, string> {
  return {
    "th-TH": canonical,
    "en-US": `${canonical}${canonical.includes("?") ? "&" : "?"}lang=en`,
    "x-default": canonical,
  };
}

function absoluteImageUrl(url: string | undefined | null): string {
  const raw = (url ?? "").trim();
  if (!raw) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(raw)) return raw;
  return absoluteUrl(raw);
}

/** Spec summary always included for social scrapers (beds / baths / area). */
function listingSpecSummary(listing: StoreListing): string {
  const area = listing.area?.trim() || "—";
  return `${listing.beds} ห้องนอน · ${listing.baths} ห้องน้ำ · ${listing.floors} ชั้น · ${area}`;
}

/** Plain-text blurb for OG / Twitter (tagline or description + specs). */
function listingShortDescription(listing: StoreListing): string {
  const specs = listingSpecSummary(listing);
  const tagline = listing.tagline?.trim();
  if (tagline) return truncate(`${tagline} — ${specs}`, 160);
  const plain = listing.description
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const priceLabel = formatPriceForSeo(listing);
  if (plain) return truncate(`${plain} — ${specs}`, 160);
  return truncate(`${specs} · เริ่มต้น ${priceLabel}`, 160);
}

/** Primary cover for OG — main image, then first 3D render. */
export function listingCoverImageUrl(listing: StoreListing): string {
  const primary =
    listing.image?.trim() ||
    listing.renderUrls?.find((u) => Boolean(u?.trim()))?.trim() ||
    "";
  return absoluteImageUrl(primary);
}

function ogImages(listing: StoreListing) {
  const image = listingCoverImageUrl(listing);
  return [
    {
      url: image,
      secureUrl: image.startsWith("https://") ? image : undefined,
      width: 1200,
      height: 630,
      alt: `${listing.name} — ${SITE_NAME}`,
      type: "image/jpeg",
    },
  ];
}

/** Canonical absolute URL for /store/[slug] (slug or id path segment). */
export function listingCanonicalUrl(listing: Pick<StoreListing, "slug" | "id">): string {
  const segment = listing.slug?.trim() || listing.id;
  return absoluteUrl(listingStorePath(segment));
}

/** Product / listing detail page metadata + Open Graph (Facebook, LINE, X, TikTok). */
export function buildListingMetadata(listing: StoreListing): Metadata {
  // Prefer AI-generated SEO persisted on create/update; fall back to deterministic helpers.
  const pageTitle = (listing.seoTitle?.trim() || `${listing.name} | ${SITE_NAME}`).trim();
  const description = listing.seoDescription?.trim() || listingShortDescription(listing);
  const canonical = listingCanonicalUrl(listing);
  const coverImage = listingCoverImageUrl(listing);

  return {
    // absolute: avoid root layout template ("%s | Planasia") doubling the brand.
    title: { absolute: pageTitle },
    description,
    alternates: { canonical, languages: hreflang(canonical) },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: canonical,
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      images: ogImages(listing),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [coverImage],
    },
    other: {
      "product:price:amount": String(listing.price),
      "product:price:currency": listing.priceBreakdown?.currency ?? "THB",
      // Explicit OG aliases some scrapers (incl. TikTok) prefer.
      "og:image:secure_url": coverImage,
      "og:image:alt": `${listing.name} — ${SITE_NAME}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function buildStoreIndexMetadata(opts?: {
  style?: string | null;
  collection?: string | null;
  search?: string | null;
}): Metadata {
  const style = opts?.style?.trim() || "";
  const collection = opts?.collection?.trim() || "";
  const search = opts?.search?.trim() || "";

  const params = new URLSearchParams();
  if (style) params.set("style", style);
  if (collection) params.set("collection", collection);
  // Search queries are personalised filters — keep canonical on clean /store to avoid thin URLs.
  const query = params.toString();
  const canonical = absoluteUrl(query ? `/store?${query}` : "/store");

  const title = style
    ? `แบบบ้านสไตล์ ${style} | ${SITE_NAME}`
    : collection
      ? `คอลเลกชัน ${collection} | ${SITE_NAME}`
      : search
        ? `ค้นหาแบบบ้าน | ${SITE_NAME}`
        : `ร้านแบบบ้าน | ${SITE_NAME}`;
  const description = style
    ? `เลือกชมแบบบ้านสไตล์ ${style} บน Planasia — ภาพ 3D แปลน และดาวน์โหลดไอเดียดีไซน์`
    : collection
      ? `คอลเลกชันแบบบ้าน ${collection} บน Planasia — คัดสรรสำหรับสร้างบ้านจริง`
      : "เลือกชมคอนเซปต์บ้านที่สร้างร่วมกับ AI สไตล์โมเดิร์น ทรอปิคอล และมินิมอล พร้อมภาพ 3D และดาวน์โหลดไอเดียดีไซน์";

  return {
    title,
    description,
    alternates: { canonical, languages: hreflang(canonical) },
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

export type HomeMetadataInput = {
  /** Brand display name (defaults to Planasia). */
  brandName?: string | null;
  /** Short site tagline used as OG description when provided. */
  tagline?: string | null;
  /** Homepage hero cover image URL (admin-managed). */
  heroImageUrl?: string | null;
  /** Optional brand logo URL (used as OG image alt context / secondary). */
  logoUrl?: string | null;
};

/**
 * Homepage Open Graph / Twitter cards.
 * Prefer the live admin Hero cover so shared links match what visitors see.
 * Primary value prop is the AI-powered marketplace slogan (not admin tagline).
 */
export function buildHomeMetadata(input: HomeMetadataInput = {}): Metadata {
  const brandName = (input.brandName ?? "").trim() || SITE_NAME;
  const title = `${brandName} — ${SITE_VALUE_PROPOSITION_SHORT}`;
  const description = truncate(
    `${SITE_VALUE_PROPOSITION}. Asia's largest prefab & modular house-plan collection — สร้างแนวคิดแปลนบ้านและนำเสนอไอเดียดีไซน์ด้วย AI`,
    200,
  );
  const canonical = getSiteUrl();
  const heroImage = absoluteImageUrl(
    input.heroImageUrl?.trim() || DEFAULT_SITE_SETTINGS.hero.backgroundImageUrl,
  );
  const logoImage = absoluteImageUrl(
    input.logoUrl?.trim() || DEFAULT_SITE_SETTINGS.brand.logoUrl || "/brand/planasia-lockup.png",
  );

  return {
    title,
    description,
    keywords: asiaPositioningKeywords(),
    alternates: { canonical, languages: hreflang(canonical) },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: canonical,
      siteName: brandName,
      title,
      description,
      images: [
        {
          url: heroImage,
          secureUrl: heroImage,
          width: 1200,
          height: 630,
          alt: `${brandName} — ${SITE_VALUE_PROPOSITION_SHORT}`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage],
    },
    other: {
      "og:image:secure_url": heroImage,
      "og:image:alt": `${brandName} — ${SITE_VALUE_PROPOSITION_SHORT}`,
      "og:logo": logoImage,
      ...asiaPositioningMetaOther(),
    },
  };
}

export function buildAboutMetadata(page: AboutPage): Metadata {
  const title = `${page.title.th} | ${SITE_NAME}`;
  const description = truncate(page.summary.th);
  const canonical = absoluteUrl(`/about/${page.slug}`);
  return {
    title,
    description,
    alternates: { canonical, languages: hreflang(canonical) },
    openGraph: { type: "article", url: canonical, siteName: SITE_NAME, title, description },
  };
}

export function buildAboutIndexMetadata(): Metadata {
  const title = `บริการลูกค้า | ${SITE_NAME}`;
  const description = "ติดต่อทีมงาน คำถามที่พบบ่อย การสั่งซื้อ การจัดส่งชุดเอกสาร และนโยบายการคืนเงิน";
  const canonical = absoluteUrl("/about");
  return {
    title,
    description,
    alternates: { canonical, languages: hreflang(canonical) },
    openGraph: { type: "website", url: canonical, siteName: SITE_NAME, title, description },
  };
}

export function buildWorkspaceMetadata(): Metadata {
  return {
    title: `สตูดิโอออกแบบ AI | ${SITE_NAME}`,
    description:
      "สร้างคอนเซปต์บ้านด้วย AI อัปโหลดแรงบันดาลใจ สร้างภาพ 3D จัดโซนห้อง และส่งออกไอเดียดีไซน์",
    robots: { index: false, follow: true },
  };
}
