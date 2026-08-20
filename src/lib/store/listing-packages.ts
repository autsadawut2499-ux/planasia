import {
  BOQ_BUNDLE_PRICE,
  CALC_SHEET_PRICE,
  SITE_PLAN_ADDON_PRICE,
  type UpsellAddonId,
} from "@/lib/store/cart-pricing";
import type { StoreListing } from "@/lib/store/listing-types";

/**
 * Primary purchase package on the listing detail panel.
 * Digital PDF / CAD downloads are no longer sold — main = printed plan set + docs.
 */
export type ListingPackageId = "main";

/** Optional extras under “ตัวเลือกเพิ่มเติม”. */
export type ListingExtraId = "" | "site-plan";

/** Main package inclusions shown on the product purchase card / popup. */
export const MAIN_PACKAGE_INCLUDES = {
  th: "เอกสารรูปเล่ม ฉบับเต็ม 3 ชุด ขนาด A3, ใบ BOQ สำหรับยื่นกู้ธนาคาร, และใบประมาณราคา",
  en: "Full printed document set × 3 (A3), BOQ for bank loan applications, and a cost estimate sheet",
} as const;

/** Customer-facing name for the sole primary package. */
export const MAIN_PACKAGE_LABEL = {
  th: "แพ็คเกจหลัก",
  en: "Main package",
} as const;

export const MAIN_PACKAGE_INCLUDE_ITEMS: Array<{ th: string; en: string }> = [
  {
    th: "เอกสารรูปเล่ม ฉบับเต็ม 3 ชุด ขนาด A3",
    en: "Full printed document set × 3 (A3)",
  },
  {
    th: "ใบ BOQ สำหรับยื่นกู้ธนาคาร",
    en: "BOQ for bank loan applications",
  },
  {
    th: "ใบประมาณราคา",
    en: "Cost estimate sheet",
  },
];

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

/** Site-plan drafting add-on label. */
export function sitePlanDocumentLabel(thai: boolean): string {
  return thai ? "เขียนแผนผังบริเวณ" : "Site plan drafting";
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

/**
 * Site-plan add-on price: listing override, else platform default (฿1,000).
 * Always offered on the storefront (middleman orders from supplier after sale).
 */
export function resolveSitePlanPrice(listing: StoreListing): number {
  if (listing.sitePlanAddonPrice != null && Number.isFinite(listing.sitePlanAddonPrice)) {
    return Math.max(0, Math.round(listing.sitePlanAddonPrice));
  }
  return SITE_PLAN_ADDON_PRICE;
}

/** Download format for order JSON — main package is print-first; keep pdf for compat. */
export function resolvePurchaseFormat(_pkg: ListingPackageId): "pdf" | "cad" {
  return "pdf";
}

/** Cart / checkout add-ons derived from package + extra dropdowns. */
export function resolvePurchaseAddons(
  pkg: ListingPackageId,
  extra: ListingExtraId,
): UpsellAddonId[] {
  const addons: UpsellAddonId[] = [];
  // Main package includes A3 printed sets → physical shipping required.
  if (pkg === "main") addons.push("hardcopy-3sets");
  if (extra === "site-plan") addons.push("site-plan");
  return addons;
}

/**
 * Line price for the cart / order item.
 * Extras (BOQ / calc / site-plan) are charged via addons — not on the line.
 * Printed sets are included in the listing price (no separate hardcopy fee).
 */
export function resolveCartLinePrice(
  listing: StoreListing,
  _pkg: ListingPackageId,
): number {
  return Math.max(0, listing.price);
}
