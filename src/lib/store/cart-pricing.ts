import type { StoreListing } from "@/lib/store/db";

/** Shared fields for in-cart lines and persisted order lines. */
export interface CartItemBase {
  listingId: string;
  /** Marketplace plan code (MOD-001). Field name kept for order JSON compat. */
  planId: string;
  /** Optional house_plans id for generative downloads. */
  planDocumentId?: string;
  name: string;
  price: number;
  /** Selected download package format (persisted on the order line). */
  format?: "pdf" | "cad";
}

/** BOQ (Bill of Quantities) cart add-on — THB. */
export const BOQ_BUNDLE_PRICE = 490;
/** Physical hard-copy documents — 3 sets — THB. */
export const HARDCOPY_3SETS_PRICE = 500;
/** Structural calculation sheet add-on — THB. */
export const CALC_SHEET_PRICE = 390;
/** AutoCAD (DWG) surcharge on top of the listing PDF price — THB. */
export const CAD_DWG_SURCHARGE = 900;
export const BUNDLE_DISCOUNT_2 = 0.05;
export const BUNDLE_DISCOUNT_3_PLUS = 0.1;

export interface CartLineItem extends CartItemBase {
  image: string;
  style: string;
  floors: 1 | 2;
  /** Selected download format when added from the detail package picker. */
  format?: "pdf" | "cad";
}

export const UPSELL_ADDON_IDS = ["boq-bundle", "hardcopy-3sets", "calc-sheet"] as const;
export type UpsellAddonId = (typeof UPSELL_ADDON_IDS)[number];

export function isUpsellAddonId(value: unknown): value is UpsellAddonId {
  return (
    value === "boq-bundle" || value === "hardcopy-3sets" || value === "calc-sheet"
  );
}

export type AddonPriceOpts = {
  boqPrice?: number | null;
  calcPrice?: number | null;
};

export function resolveAddonBoqPrice(opts?: AddonPriceOpts): number {
  if (opts?.boqPrice != null && Number.isFinite(opts.boqPrice)) {
    return Math.max(0, Math.round(opts.boqPrice));
  }
  return BOQ_BUNDLE_PRICE;
}

export function resolveAddonCalcPrice(opts?: AddonPriceOpts): number {
  if (opts?.calcPrice != null && Number.isFinite(opts.calcPrice)) {
    return Math.max(0, Math.round(opts.calcPrice));
  }
  return CALC_SHEET_PRICE;
}

export function computeAddonTotal(
  addons: readonly UpsellAddonId[],
  opts?: AddonPriceOpts,
): number {
  let total = 0;
  if (addons.includes("boq-bundle")) total += resolveAddonBoqPrice(opts);
  if (addons.includes("hardcopy-3sets")) total += HARDCOPY_3SETS_PRICE;
  if (addons.includes("calc-sheet")) total += resolveAddonCalcPrice(opts);
  return total;
}

export function listingToCartItem(
  listing: StoreListing,
  opts?: { price?: number; format?: "pdf" | "cad" },
): CartLineItem {
  return {
    listingId: listing.id,
    planId: listing.planCode || listing.planId,
    planDocumentId: listing.planDocumentId,
    name: listing.name,
    price: opts?.price ?? listing.price,
    image: listing.image,
    style: listing.style,
    floors: listing.floors,
    format: opts?.format ?? "pdf",
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
  addonPrices?: AddonPriceOpts,
): { subtotal: number; discount: number; addonTotal: number; total: number } {
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const discount = computeBundleDiscount(subtotal, items.length);
  const addonTotal = computeAddonTotal(addons, addonPrices);
  const total = Math.max(0, subtotal - discount + addonTotal);
  return { subtotal, discount, addonTotal, total };
}

/** Cart total + optional document-language localization surcharge. */
export function computeCheckoutTotal(
  items: CartLineItem[],
  addons: UpsellAddonId[],
  languageSurchargeThb = 0,
  addonPrices?: AddonPriceOpts,
): {
  subtotal: number;
  discount: number;
  addonTotal: number;
  languageSurcharge: number;
  total: number;
} {
  const base = computeCartTotal(items, addons, addonPrices);
  const languageSurcharge = Math.max(0, Math.round(languageSurchargeThb));
  return {
    ...base,
    languageSurcharge,
    total: Math.max(0, base.total + languageSurcharge),
  };
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
