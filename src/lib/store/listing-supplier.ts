import type { StoreListing } from "@/lib/store/listing-types";

/**
 * Resolve supplier / source name for notifications (LINE OA, SMS, email).
 * Prefers `supplier_name`; falls back to legacy province text if present.
 */
export function listingSupplierName(
  listing: Pick<StoreListing, "supplierName" | "province"> | null | undefined,
): string | undefined {
  const name = listing?.supplierName?.trim() || listing?.province?.trim() || "";
  return name || undefined;
}

export function listingProductUrl(
  listing: Pick<StoreListing, "productUrl"> | null | undefined,
): string | undefined {
  const url = listing?.productUrl?.trim() || "";
  return url || undefined;
}
