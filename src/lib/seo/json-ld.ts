import type { StoreListing } from "@/lib/store/db";
import type { PlanReview, RatingAggregate } from "@/lib/supabase/reviews";
import { buildRealEstateListingJsonLd } from "@/lib/seo/listing-seo-generate";
import {
  asiaPositioningJsonLdDescriptions,
  asiaPositioningLanguages,
} from "@/lib/seo/multilingual-positioning";
import { getSiteUrl } from "@/lib/seo/site-url";
import { listingStorePath } from "@/lib/seo/slug";
import {
  SITE_VALUE_PROPOSITION,
  SITE_VALUE_PROPOSITION_SHORT,
} from "@/lib/seo/site-copy";

const ORG_NAME = "Planasia";

function absolute(path: string): string {
  const base = getSiteUrl();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function listingSeoName(listing: StoreListing): string {
  return (
    listing.seoTitle?.replace(/\s*\|\s*Planasia\s*$/i, "").trim() ||
    listing.name
  );
}

function listingSeoDescription(listing: StoreListing): string {
  return (
    listing.seoDescription?.trim() ||
    listing.tagline?.trim() ||
    listing.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    listing.name
  );
}

/** Absolute image URLs for Product rich results (relative paths fail Google validation). */
function listingProductImages(listing: StoreListing): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [
    listing.image,
    ...(listing.renderUrls ?? []),
    ...(listing.floorPlanUrls ?? []),
  ]) {
    const u = String(raw ?? "").trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(absolute(u));
  }
  return out.slice(0, 10);
}

/** Product schema with price, availability, and (when present) AggregateRating + reviews. */
export function buildListingProductJsonLd(
  listing: StoreListing,
  options?: { rating?: RatingAggregate | null; reviews?: PlanReview[] },
): Record<string, unknown> {
  const currency = listing.priceBreakdown?.currency ?? "THB";
  const url = absolute(listingStorePath(listing.slug));
  const images = listingProductImages(listing);
  if (images.length === 0) {
    images.push(`${getSiteUrl()}/icon.png`);
  }
  // Google Merchant / Product snippets prefer a far-future priceValidUntil for evergreen digital goods.
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  const additionalProperty = [
    { "@type": "PropertyValue", name: "Bedrooms", value: listing.beds },
    { "@type": "PropertyValue", name: "Bathrooms", value: listing.baths },
    ...(listing.livingRooms != null
      ? [{ "@type": "PropertyValue", name: "LivingRooms", value: listing.livingRooms }]
      : []),
    { "@type": "PropertyValue", name: "Floors", value: listing.floors },
    { "@type": "PropertyValue", name: "Style", value: listing.style },
    { "@type": "PropertyValue", name: "Area", value: listing.area },
  ];
  if (listing.widthMeters != null)
    additionalProperty.push({ "@type": "PropertyValue", name: "Width (m)", value: listing.widthMeters });
  if (listing.lengthMeters != null)
    additionalProperty.push({ "@type": "PropertyValue", name: "Length (m)", value: listing.lengthMeters });

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: listingSeoName(listing),
    description: listingSeoDescription(listing),
    url,
    image: images,
    sku: listing.planId,
    mpn: listing.planId,
    category: listing.collection ?? listing.style,
    brand: { "@type": "Brand", name: ORG_NAME },
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      priceCurrency: currency,
      price: Number(listing.price).toFixed(2),
      priceValidUntil: priceValidUntil.toISOString().slice(0, 10),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      // Digital PDF house-plan delivery (instant download).
      category: "https://schema.org/DigitalDocument",
      seller: { "@type": "Organization", "@id": `${getSiteUrl()}#organization`, name: ORG_NAME, url: getSiteUrl() },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TH",
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TH",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    },
    additionalProperty,
  };

  if (options?.rating && options.rating.count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: options.rating.average,
      reviewCount: options.rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (options?.reviews && options.reviews.length > 0) {
    schema.review = options.reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      author: { "@type": "Person", name: r.authorName },
      datePublished: r.createdAt,
      name: r.title,
      reviewBody: r.body,
    }));
  }

  return schema;
}

/** BreadcrumbList: e.g. Home > Collection > Plan name. */
export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

/** Organization + WebSite with SearchAction (sitelinks searchbox). */
export function buildOrganizationJsonLd(): Record<string, unknown>[] {
  const base = getSiteUrl();
  const multilingualDescriptions = asiaPositioningJsonLdDescriptions();
  const availableLanguages = asiaPositioningLanguages();
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${base}#organization`,
      name: ORG_NAME,
      url: base,
      logo: `${base}/icon.png`,
      description: multilingualDescriptions,
      slogan: SITE_VALUE_PROPOSITION,
      areaServed: { "@type": "Place", name: "Asia" },
      knowsLanguage: availableLanguages,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${base}#website`,
      url: base,
      name: ORG_NAME,
      alternateName: SITE_VALUE_PROPOSITION_SHORT,
      publisher: { "@id": `${base}#organization` },
      description: multilingualDescriptions,
      inLanguage: availableLanguages,
      about: {
        "@type": "Thing",
        name: SITE_VALUE_PROPOSITION_SHORT,
        description: SITE_VALUE_PROPOSITION,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${base}/store?search={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

/** ItemList for programmatic keyword landing pages. */
export function buildItemListJsonLd(
  listings: StoreListing[],
  pagePath: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: absolute(pagePath),
    numberOfItems: listings.length,
    itemListElement: listings.map((listing, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absolute(listingStorePath(listing.slug)),
      name: listing.name,
    })),
  };
}

/** FAQPage schema for programmatic landing / detail pages. */
export function buildFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/**
 * Build / refresh RealEstateListing node — prefers AI-persisted `seoJsonLd`,
 * always overlays live URL, price, and images for crawlers.
 */
export function buildListingRealEstateJsonLd(listing: StoreListing): Record<string, unknown> {
  const url = absolute(listingStorePath(listing.slug));
  const fallback = buildRealEstateListingJsonLd(
    listing,
    listing.seoTitle,
    listing.seoDescription,
  );
  const stored =
    listing.seoJsonLd && typeof listing.seoJsonLd === "object" ? listing.seoJsonLd : {};

  const currency = listing.priceBreakdown?.currency ?? "THB";
  const images = listingProductImages(listing);
  const storedImages = Array.isArray((stored as { image?: unknown }).image)
    ? ((stored as { image: unknown[] }).image as unknown[])
        .map((u) => absolute(String(u ?? "").trim()))
        .filter(Boolean)
    : [];
  return {
    ...fallback,
    ...stored,
    "@type": "RealEstateListing",
    "@id": `${url}#realestate`,
    url,
    mainEntityOfPage: url,
    name: String(stored.name || listingSeoName(listing)),
    description: String(stored.description || listingSeoDescription(listing)),
    image: images.length > 0 ? images : storedImages.length > 0 ? storedImages : fallback.image,
    datePosted: listing.createdAt,
    numberOfBedrooms: listing.beds,
    numberOfBathroomsTotal: listing.baths,
    offers: {
      "@type": "Offer",
      url,
      price: Number(listing.price).toFixed(2),
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      category: "https://schema.org/DigitalDocument",
      seller: { "@type": "Organization", name: ORG_NAME, url: getSiteUrl() },
    },
  };
}

/**
 * Advanced linked @graph for a listing detail page — Product + RealEstateListing
 * ↔ FAQ ↔ Breadcrumb ↔ Organization for Google rich results.
 */
export function buildListingGraph(input: {
  listing: StoreListing;
  rating?: RatingAggregate | null;
  reviews?: PlanReview[];
  breadcrumb: Array<{ name: string; path: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}): Record<string, unknown> {
  const base = getSiteUrl();
  const product = buildListingProductJsonLd(input.listing, {
    rating: input.rating,
    reviews: input.reviews,
  });
  delete (product as Record<string, unknown>)["@context"];

  const realEstate = buildListingRealEstateJsonLd(input.listing);
  delete (realEstate as Record<string, unknown>)["@context"];

  (product as Record<string, unknown>).isRelatedTo = { "@id": `${base}#organization` };
  (realEstate as Record<string, unknown>).isRelatedTo = { "@id": `${base}#organization` };
  (realEstate as Record<string, unknown>).mainEntity = { "@id": product["@id"] };

  const graph: Record<string, unknown>[] = [
    { "@type": "Organization", "@id": `${base}#organization`, name: ORG_NAME, url: base },
    realEstate,
    product,
  ];

  const breadcrumb = buildBreadcrumbJsonLd(input.breadcrumb);
  delete (breadcrumb as Record<string, unknown>)["@context"];
  graph.push(breadcrumb);

  if (input.faqs && input.faqs.length > 0) {
    const faq = buildFaqJsonLd(input.faqs);
    delete (faq as Record<string, unknown>)["@context"];
    graph.push(faq);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
