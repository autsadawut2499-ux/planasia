import type { StoreListing } from "@/lib/store/listing-types";
import { listingStorePath } from "@/lib/seo/slug";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

const COLLECTION_LABELS: Record<string, string> = {
  commercial: "อาคารพาณิชย์",
  shophouse: "ตึกแถว",
  warehouse: "โกดังสินค้า",
  factory: "โรงงาน",
  resort: "รีสอร์ท / บังกะโล",
};

/** Home > (Collection|Style) > Plan name. */
export function listingBreadcrumbItems(listing: StoreListing): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: "หน้าแรก", path: "/" }];

  if (listing.collection) {
    items.push({
      name: COLLECTION_LABELS[listing.collection] ?? listing.collection,
      path: `/store?collection=${encodeURIComponent(listing.collection)}`,
    });
  } else if (listing.style) {
    items.push({
      name: listing.style,
      path: `/store?style=${encodeURIComponent(listing.style)}`,
    });
  }

  items.push({ name: listing.name, path: listingStorePath(listing.slug) });
  return items;
}
