/**
 * Gemini-powered SEO for house-plan listings.
 * Generates meta title/description + Schema.org RealEstateListing JSON-LD
 * on create/update. Fail-open with deterministic rules if Gemini is offline.
 */

import { getTextModel, isGeminiConfigured } from "@/lib/ai/gemini";
import { getSiteUrl } from "@/lib/seo/site-url";
import { listingStorePath } from "@/lib/seo/slug";
import type { StoreListing } from "@/lib/store/listing-types";

export type SeoProvider = "gemini" | "rules";

export interface ListingSeoFields {
  seoTitle: string;
  seoDescription: string;
  /** Schema.org RealEstateListing node (no @context; merged into page graph). */
  seoJsonLd: Record<string, unknown>;
  seoGeneratedAt: string;
  seoProvider: SeoProvider;
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getSiteUrl();
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function listingUrl(listing: Pick<StoreListing, "slug" | "id">): string {
  return absolute(listingStorePath(listing.slug?.trim() || listing.id));
}

function formatPriceThb(price: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Deterministic SEO when Gemini is unavailable. */
export function buildRulesListingSeo(
  listing: Pick<
    StoreListing,
    | "id"
    | "slug"
    | "name"
    | "description"
    | "tagline"
    | "beds"
    | "baths"
    | "floors"
    | "area"
    | "style"
    | "image"
    | "renderUrls"
    | "floorPlanUrls"
    | "price"
    | "priceBreakdown"
    | "planId"
    | "planCode"
    | "widthMeters"
    | "lengthMeters"
    | "collection"
    | "province"
    | "createdAt"
  >,
): ListingSeoFields {
  const specs = `${listing.beds} ห้องนอน · ${listing.baths} ห้องน้ำ · ${listing.floors} ชั้น · ${listing.area || "—"}`;
  const seoTitle = truncate(`${listing.name} | Planasia`, 60);
  const blurb =
    listing.tagline?.trim() ||
    plainText(listing.description) ||
    `${listing.style} house plan`;
  const seoDescription = truncate(
    `${blurb} — ${specs}. แบบบ้าน PDF บน Planasia ราคาเริ่ม ${formatPriceThb(listing.price)}`,
    160,
  );

  return {
    seoTitle,
    seoDescription,
    seoJsonLd: buildRealEstateListingJsonLd(listing, seoTitle, seoDescription),
    seoGeneratedAt: new Date().toISOString(),
    seoProvider: "rules",
  };
}

/** Schema.org RealEstateListing for the plan detail page. */
export function buildRealEstateListingJsonLd(
  listing: Pick<
    StoreListing,
    | "id"
    | "slug"
    | "name"
    | "description"
    | "beds"
    | "baths"
    | "floors"
    | "area"
    | "style"
    | "image"
    | "renderUrls"
    | "floorPlanUrls"
    | "price"
    | "priceBreakdown"
    | "planId"
    | "planCode"
    | "widthMeters"
    | "lengthMeters"
    | "collection"
    | "province"
    | "createdAt"
  >,
  seoTitle?: string,
  seoDescription?: string,
): Record<string, unknown> {
  const url = listingUrl(listing);
  const currency = listing.priceBreakdown?.currency ?? "THB";
  const images = [
    listing.image,
    ...(listing.renderUrls ?? []),
    ...(listing.floorPlanUrls ?? []),
  ]
    .map((u) => (u ? absolute(u) : ""))
    .filter(Boolean);

  const numberOfRooms = Math.max(0, Number(listing.beds) || 0) + Math.max(0, Number(listing.baths) || 0);

  const schema: Record<string, unknown> = {
    "@type": "RealEstateListing",
    "@id": `${url}#realestate`,
    name: seoTitle?.replace(/\s*\|\s*Planasia\s*$/i, "").trim() || listing.name,
    description:
      seoDescription ||
      plainText(listing.description) ||
      `${listing.beds} bed · ${listing.baths} bath · ${listing.area}`,
    url,
    mainEntityOfPage: url,
    datePosted: listing.createdAt,
    image: images.slice(0, 8),
    sku: listing.planCode || listing.planId,
    category: listing.collection || listing.style || "HousePlan",
    additionalType: "https://schema.org/House",
    numberOfRooms: numberOfRooms || undefined,
    numberOfBedrooms: listing.beds,
    numberOfBathroomsTotal: listing.baths,
    floorSize: listing.area
      ? {
          "@type": "QuantitativeValue",
          value: listing.area,
          unitCode: "MTK",
          unitText: "sqm",
        }
      : undefined,
    address: {
      "@type": "PostalAddress",
      addressCountry: "TH",
      addressRegion: listing.province || "Thailand",
    },
    offers: {
      "@type": "Offer",
      url,
      price: listing.price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      category: "https://schema.org/DigitalDocument",
      seller: {
        "@type": "Organization",
        name: "Planasia",
        url: getSiteUrl(),
      },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Bedrooms", value: listing.beds },
      { "@type": "PropertyValue", name: "Bathrooms", value: listing.baths },
      { "@type": "PropertyValue", name: "Floors", value: listing.floors },
      { "@type": "PropertyValue", name: "Style", value: listing.style },
      { "@type": "PropertyValue", name: "Area", value: listing.area },
      ...(listing.widthMeters != null
        ? [{ "@type": "PropertyValue", name: "Width (m)", value: listing.widthMeters }]
        : []),
      ...(listing.lengthMeters != null
        ? [{ "@type": "PropertyValue", name: "Length (m)", value: listing.lengthMeters }]
        : []),
    ],
  };

  return schema;
}

function parseGeminiSeo(raw: string): {
  seoTitle?: string;
  seoDescription?: string;
  realEstateListing?: Record<string, unknown>;
} | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() || trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as {
      seoTitle?: string;
      seoDescription?: string;
      realEstateListing?: Record<string, unknown>;
    };
  } catch {
    return null;
  }
}

async function generateWithGemini(listing: StoreListing): Promise<ListingSeoFields | null> {
  if (!isGeminiConfigured()) return null;
  const model = getTextModel();
  if (!model) return null;

  const url = listingUrl(listing);
  const fallback = buildRulesListingSeo(listing);

  const prompt = `You are an SEO specialist for Planasia, a Thailand house-plan marketplace (digital PDF blueprints).

Write crawl-friendly Thai-first SEO for Googlebot. Return ONLY JSON:
{
  "seoTitle": "max 60 chars, include house name + key hook + Planasia",
  "seoDescription": "max 155 chars, include beds/baths/area/style and a clear CTA",
  "realEstateListing": {
    "@type": "RealEstateListing",
    "name": "listing display name",
    "description": "rich SEO description 1-2 sentences",
    "numberOfBedrooms": number,
    "numberOfBathroomsTotal": number,
    "additionalProperty": [{"@type":"PropertyValue","name":"...","value":"..."}]
  }
}

Rules:
- Language: Thai preferred; keep Planasia brand Latin.
- Do not invent features not in the data.
- seoTitle must end with "| Planasia" when space allows.
- Focus on house-plan purchase intent (แบบบ้าน / แปลนบ้าน).
- realEstateListing must be Schema.org RealEstateListing fields only (no @context).

Listing data:
${JSON.stringify(
  {
    name: listing.name,
    tagline: listing.tagline,
    description: plainText(listing.description).slice(0, 600),
    beds: listing.beds,
    baths: listing.baths,
    floors: listing.floors,
    area: listing.area,
    style: listing.style,
    collection: listing.collection,
    province: listing.province,
    widthMeters: listing.widthMeters,
    lengthMeters: listing.lengthMeters,
    priceThb: listing.price,
    planCode: listing.planCode || listing.planId,
    url,
  },
  null,
  2,
)}`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = parseGeminiSeo(result.response.text());
    if (!parsed) return null;

    const seoTitle = truncate(
      String(parsed.seoTitle || fallback.seoTitle).trim() || fallback.seoTitle,
      70,
    );
    const seoDescription = truncate(
      String(parsed.seoDescription || fallback.seoDescription).trim() ||
        fallback.seoDescription,
      170,
    );

    const baseLd = buildRealEstateListingJsonLd(listing, seoTitle, seoDescription);
    const aiLd =
      parsed.realEstateListing && typeof parsed.realEstateListing === "object"
        ? parsed.realEstateListing
        : {};

    // Merge AI copy into a safe, crawlable RealEstateListing with live facts.
    const seoJsonLd: Record<string, unknown> = {
      ...baseLd,
      ...aiLd,
      "@type": "RealEstateListing",
      "@id": baseLd["@id"],
      url: baseLd.url,
      mainEntityOfPage: baseLd.mainEntityOfPage,
      datePosted: baseLd.datePosted,
      image: baseLd.image,
      offers: baseLd.offers,
      address: baseLd.address,
      sku: baseLd.sku,
      numberOfBedrooms: listing.beds,
      numberOfBathroomsTotal: listing.baths,
      name: String(aiLd.name || listing.name).trim() || listing.name,
      description: truncate(
        String(aiLd.description || seoDescription).trim() || seoDescription,
        500,
      ),
    };

    return {
      seoTitle,
      seoDescription,
      seoJsonLd,
      seoGeneratedAt: new Date().toISOString(),
      seoProvider: "gemini",
    };
  } catch (err) {
    console.error("[listing-seo] Gemini failed", err);
    return null;
  }
}

/** Generate SEO fields for a listing (Gemini with rules fallback). */
export async function generateListingSeo(listing: StoreListing): Promise<ListingSeoFields> {
  const ai = await generateWithGemini(listing);
  return ai ?? buildRulesListingSeo(listing);
}

/** Attach SEO fields onto any StoreListing-shaped object. */
export async function attachListingSeo<T extends StoreListing>(listing: T): Promise<T> {
  const seo = await generateListingSeo(listing);
  return { ...listing, ...seo };
}
