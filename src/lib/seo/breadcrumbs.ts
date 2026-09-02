import type { StoreListing } from "@/lib/store/listing-types";
import { listingStorePath } from "@/lib/seo/slug";
import { ALL_STYLES, findTaxonomyItem } from "@/lib/store/taxonomy";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

function styleLabel(id: string): string {
  return findTaxonomyItem(ALL_STYLES, id)?.th ?? id;
}

/** Home > Style > Plan name. Legacy collection is folded into style. */
export function listingBreadcrumbItems(listing: StoreListing): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: "หน้าแรก", path: "/" }];

  const styleId = (listing.style || listing.collection || "").trim();
  if (styleId) {
    items.push({
      name: styleLabel(styleId),
      path: `/store?style=${encodeURIComponent(styleId)}`,
    });
  }

  items.push({ name: listing.name, path: listingStorePath(listing.slug) });
  return items;
}
