/**
 * Revenue split for marketplace sales.
 *
 * Vendors set listing prices freely (base THB). On each paid sale the platform
 * automatically splits the gross listing price:
 *   - Vendor (draftsman / architect): 70%
 *   - Platform:                       30%
 *
 * Bundle discounts / add-ons are platform-side; the vendor share is computed
 * from the listing's sold price (the amount attributed to that listing line).
 */

export const VENDOR_SHARE = 0.7;
export const PLATFORM_SHARE = 0.3;

export interface CommissionSplit {
  grossThb: number;
  vendorAmountThb: number;
  platformAmountThb: number;
  vendorShare: number;
  platformShare: number;
}

/** Split a gross THB sale amount into vendor / platform shares. */
export function splitSale(grossThb: number): CommissionSplit {
  const gross = Math.max(0, Math.round(grossThb));
  const vendorAmountThb = Math.round(gross * VENDOR_SHARE);
  const platformAmountThb = gross - vendorAmountThb;
  return {
    grossThb: gross,
    vendorAmountThb,
    platformAmountThb,
    vendorShare: VENDOR_SHARE,
    platformShare: PLATFORM_SHARE,
  };
}

/** Preview helper for the vendor form: "you'll receive ฿X of ฿Y". */
export function vendorNetPreview(priceThb: number): number {
  return splitSale(priceThb).vendorAmountThb;
}
