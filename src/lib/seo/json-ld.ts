import type { StoreListing } from "@/lib/store/db";
import { getSiteUrl } from "@/lib/seo/site-url";
import { listingStorePath } from "@/lib/seo/slug";

export function buildListingProductJsonLd(listing: StoreListing): Record<string, unknown> {
  const currency = listing.priceBreakdown?.currency ?? "THB";
  const base = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.name,
    description: listing.description,
    image: [listing.image, ...listing.floorPlanUrls].filter(Boolean),
    sku: listing.planId,
    brand: {
      "@type": "Brand",
      name: "Planasia",
    },
    offers: {
      "@type": "Offer",
      url: `${base}${listingStorePath(listing.slug)}`,
      priceCurrency: currency,
      price: listing.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Bedrooms", value: listing.beds },
      { "@type": "PropertyValue", name: "Bathrooms", value: listing.baths },
      { "@type": "PropertyValue", name: "Floors", value: listing.floors },
      { "@type": "PropertyValue", name: "Style", value: listing.style },
      { "@type": "PropertyValue", name: "Area", value: listing.area },
    ],
  };
}
