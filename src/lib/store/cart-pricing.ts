import { PRICING } from "@/lib/geo/countries";
import type { StoreListing } from "@/lib/store/db";

export const CAD_BUNDLE_PRICE = PRICING.custom.cad;
export const BUNDLE_DISCOUNT_2 = 0.05;
export const BUNDLE_DISCOUNT_3_PLUS = 0.1;

export interface CartLineItem {
  listingId: string;
  planId: string;
  name: string;
  price: number;
  image: string;
  style: string;
  floors: 1 | 2;
}

export type UpsellAddonId = "cad-bundle";

export function listingToCartItem(listing: StoreListing): CartLineItem {
  return {
    listingId: listing.id,
    planId: listing.planId,
    name: listing.name,
    price: listing.price,
    image: listing.image,
    style: listing.style,
    floors: listing.floors,
  };
}

export function computeBundleDiscount(subtotal: number, itemCount: number): number {
  if (itemCount >= 3) return Math.round(subtotal * BUNDLE_DISCOUNT_3_PLUS);
  if (itemCount >= 2) return Math.round(subtotal * BUNDLE_DISCOUNT_2);
  return 0;
}

export function computeCartTotal(
  items: CartLineItem[],
  addons: UpsellAddonId[],
): { subtotal: number; discount: number; addonTotal: number; total: number } {
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const discount = computeBundleDiscount(subtotal, items.length);
  const addonTotal = addons.includes("cad-bundle") ? CAD_BUNDLE_PRICE : 0;
  const total = Math.max(0, subtotal - discount + addonTotal);
  return { subtotal, discount, addonTotal, total };
}

/** Similar-style recommendations excluding items already in cart. */
export function getSimilarListings(
  all: StoreListing[],
  cartItems: CartLineItem[],
  anchor?: StoreListing | null,
  limit = 4,
): StoreListing[] {
  const inCart = new Set(cartItems.map((i) => i.listingId));
  const style = anchor?.style ?? cartItems[0]?.style;
  if (!style) {
    return all.filter((l) => !inCart.has(l.id)).slice(0, limit);
  }
  return all
    .filter((l) => !inCart.has(l.id) && l.style === style)
    .slice(0, limit);
}

export function getUpsellSuggestions(
  all: StoreListing[],
  cartItems: CartLineItem[],
): StoreListing[] {
  if (cartItems.length === 0) return all.slice(0, 4);
  const styles = new Set(cartItems.map((i) => i.style));
  const inCart = new Set(cartItems.map((i) => i.listingId));
  return all
    .filter((l) => !inCart.has(l.id) && !styles.has(l.style))
    .slice(0, 3);
}
