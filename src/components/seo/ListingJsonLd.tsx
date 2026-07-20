import { buildListingProductJsonLd } from "@/lib/seo/json-ld";
import type { StoreListing } from "@/lib/store/db";

export function ListingJsonLd({ listing }: { listing: StoreListing }) {
  const json = buildListingProductJsonLd(listing);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
