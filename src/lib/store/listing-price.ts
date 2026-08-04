/**
 * Marketplace listing price rules (THB):
 * - Free: 0 (or explicit free flag)
 * - Paid (vendors / public): minimum 1,000 THB
 * - Paid (admin test): minimum 10 THB — for live Stripe smoke tests only
 */

export const MIN_PAID_LISTING_PRICE_THB = 1000;

/** Admin-only floor for real payment testing (matches Stripe THB minimum). */
export const MIN_ADMIN_TEST_LISTING_PRICE_THB = 10;

export type ListingPriceValidation =
  | { ok: true; price: number; isFree: boolean }
  | { ok: false; error: string; errorTh: string; price: number };

export type ListingPriceOptions = {
  freeFlag?: boolean;
  rawBody?: Record<string, unknown>;
  /**
   * When true (admin listings API / admin UI), paid listings may be as low as
   * {@link MIN_ADMIN_TEST_LISTING_PRICE_THB} so live Checkout can be smoke-tested.
   */
  allowAdminTestPricing?: boolean;
};

function isFreeFlag(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;
  const v = raw.is_free ?? raw.isFree ?? raw.free;
  if (v === true || v === 1 || v === "1") return true;
  if (typeof v === "string" && ["true", "free", "yes"].includes(v.trim().toLowerCase())) {
    return true;
  }
  return false;
}

export function minPaidListingPriceThb(allowAdminTestPricing = false): number {
  return allowAdminTestPricing
    ? MIN_ADMIN_TEST_LISTING_PRICE_THB
    : MIN_PAID_LISTING_PRICE_THB;
}

/** Normalize a listing price input to a non-negative integer THB amount. */
export function parseListingPriceThb(value: unknown): number {
  if (value === "" || value == null) return Number.NaN;
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(n)) return Number.NaN;
  return Math.max(0, Math.round(n));
}

/**
 * Validate seller/admin listing price.
 * Accepts free (0 / free flag) or paid ≥ the applicable minimum.
 */
export function validateListingPrice(
  value: unknown,
  opts?: ListingPriceOptions,
): ListingPriceValidation {
  const free =
    opts?.freeFlag === true ||
    isFreeFlag(opts?.rawBody) ||
    (typeof value === "string" && value.trim().toLowerCase() === "free");

  if (free) {
    return { ok: true, price: 0, isFree: true };
  }

  const minPaid = minPaidListingPriceThb(Boolean(opts?.allowAdminTestPricing));
  const price = parseListingPriceThb(value);
  if (!Number.isFinite(price)) {
    return {
      ok: false,
      price: 0,
      error: `Price is required (0 for free, or at least ${minPaid.toLocaleString("en-US")} THB)`,
      errorTh: `กรุณากำหนดราคา — ใส่ 0 หากแจกฟรี หรืออย่างน้อย ${minPaid.toLocaleString("th-TH")} บาท`,
    };
  }

  if (price === 0) {
    return { ok: true, price: 0, isFree: true };
  }

  if (price < minPaid) {
    const testNote = opts?.allowAdminTestPricing
      ? " (admin test pricing)"
      : "";
    const testNoteTh = opts?.allowAdminTestPricing
      ? " (โหมดทดสอบแอดมิน)"
      : "";
    return {
      ok: false,
      price,
      error: `Paid plans must be at least ${minPaid.toLocaleString("en-US")} THB (or 0 for free)${testNote}`,
      errorTh: `แบบบ้านที่คิดเงินต้องตั้งราคาอย่างน้อย ${minPaid.toLocaleString("th-TH")} บาท (หรือใส่ 0 หากแจกฟรี)${testNoteTh}`,
    };
  }

  return { ok: true, price, isFree: false };
}

export function isFreeListingPrice(price: number): boolean {
  return Number.isFinite(price) && price <= 0;
}

/** Client helper: Thai error message or null when valid. */
export function listingPriceErrorTh(
  value: unknown,
  opts?: boolean | ListingPriceOptions,
): string | null {
  const normalized: ListingPriceOptions =
    typeof opts === "boolean" ? { freeFlag: opts } : opts ?? {};
  const result = validateListingPrice(value, normalized);
  return result.ok ? null : result.errorTh;
}
