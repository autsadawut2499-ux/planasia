import "server-only";

import type { CartOrderItem } from "@/lib/store/cart-orders";
import { getListingById } from "@/lib/store/db";
import { listingSupplierName } from "@/lib/store/listing-supplier";
import type { StoreListing } from "@/lib/store/listing-types";

/** Always show a visible value — never omit the field. */
export function displayOrDash(value: string | null | undefined): string {
  const text = String(value ?? "").trim();
  return text || "—";
}

export function listingSaleNote(listing: StoreListing | null | undefined): string {
  const text =
    listing?.tagline?.trim() ||
    listing?.pitch?.trim() ||
    listing?.description?.trim() ||
    "";
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

export type OrderItemFulfilment = {
  housePlanId: string;
  planName: string;
  salePrice: number;
  supplierName: string;
  /** store_listings.source_plan_code — always present (`—` if empty). */
  originalHouseCode: string;
  /** Sale/order note — always present (`—` if empty). */
  note: string;
  costPrice: number | null;
};

function composeNote(listingNote: string, orderNote: string): string {
  const parts: string[] = [];
  if (listingNote) parts.push(listingNote.slice(0, 400));
  if (orderNote) parts.push(`ออเดอร์: ${orderNote.slice(0, 200)}`);
  return displayOrDash(parts.join(" · "));
}

/** Load supplier fulfilment fields for one paid cart line. */
export async function loadOrderItemFulfilment(
  item: CartOrderItem,
  orderNote = "",
): Promise<OrderItemFulfilment> {
  const listing = await getListingById(item.listingId).catch(() => null);
  return {
    housePlanId: item.planId || listing?.planId || item.listingId,
    planName: item.name || listing?.name || item.planId,
    salePrice: item.price,
    supplierName: displayOrDash(
      listingSupplierName(listing) || listing?.supplierName,
    ),
    originalHouseCode: displayOrDash(listing?.sourcePlanCode),
    note: composeNote(listingSaleNote(listing), orderNote.trim()),
    costPrice:
      listing?.costPrice != null && Number.isFinite(listing.costPrice)
        ? listing.costPrice
        : null,
  };
}
