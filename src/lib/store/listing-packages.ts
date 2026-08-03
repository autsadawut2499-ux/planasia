import {
  BOQ_BUNDLE_PRICE,
  CAD_DWG_SURCHARGE,
  CALC_SHEET_PRICE,
  type UpsellAddonId,
} from "@/lib/store/cart-pricing";
import type { StoreListing } from "@/lib/store/listing-types";

/** Primary file / delivery package on the listing detail purchase panel. */
export type ListingPackageId = "pdf" | "cad" | "hardcopy-3sets";

/** Optional extras under “ตัวเลือกเพิ่มเติม”. */
export type ListingExtraId = "" | "boq-bundle" | "calc-sheet";

/** Customer-facing title — format shown so buyers know the download type. */
export function boqDocumentLabel(thai: boolean): string {
  return thai
    ? "เอกสารปริมาณราคาและวัสดุ (ไฟล์ PDF)"
    : "Quantity & materials document (PDF file)";
}

/** Customer-facing title — format shown so buyers know the download type. */
export function calcDocumentLabel(thai: boolean): string {
  return thai
    ? "เอกสารรายการคำนวณโครงสร้าง (ไฟล์ PDF)"
    : "Structural calculation document (PDF file)";
}

/** True when the seller uploaded structural calc deliverables (server truth). */
export function listingHasCalcSheet(listing: StoreListing): boolean {
  return Boolean(listing.hasCalcSheets);
}

/** True when the seller uploaded BOQ deliverables. */
export function listingHasBoq(listing: StoreListing): boolean {
  return Boolean(listing.hasBoqFiles);
}

/** Designer-set BOQ price, else platform default. */
export function resolveBoqPrice(listing: StoreListing): number {
  if (listing.boqPrice != null && Number.isFinite(listing.boqPrice)) {
    return Math.max(0, Math.round(listing.boqPrice));
  }
  return BOQ_BUNDLE_PRICE;
}

/** Designer-set calc-sheet price, else platform default. */
export function resolveCalcPrice(listing: StoreListing): number {
  if (listing.calcPrice != null && Number.isFinite(listing.calcPrice)) {
    return Math.max(0, Math.round(listing.calcPrice));
  }
  return CALC_SHEET_PRICE;
}

export function resolvePurchaseFormat(pkg: ListingPackageId): "pdf" | "cad" {
  return pkg === "cad" ? "cad" : "pdf";
}

/** Cart / checkout add-ons derived from package + extra dropdowns. */
export function resolvePurchaseAddons(
  pkg: ListingPackageId,
  extra: ListingExtraId,
): UpsellAddonId[] {
  const addons: UpsellAddonId[] = [];
  if (pkg === "hardcopy-3sets") addons.push("hardcopy-3sets");
  if (extra === "boq-bundle") addons.push("boq-bundle");
  if (extra === "calc-sheet") addons.push("calc-sheet");
  return addons;
}

/**
 * Line price for the cart / order item.
 * Hardcopy & extras are charged via addons (not double-counted on the line).
 * CAD surcharge is baked into the line price (format = cad).
 */
export function resolveCartLinePrice(
  listing: StoreListing,
  pkg: ListingPackageId,
): number {
  const base = Math.max(0, listing.price);
  if (pkg === "cad") return base + CAD_DWG_SURCHARGE;
  return base;
}
