/**
 * Marketplace listing price rules (THB):
 * - Free: 0 (or explicit free flag)
 * - Paid: minimum 1,000 THB
 */

export const MIN_PAID_LISTING_PRICE_THB = 1000;

export type ListingPriceValidation =
  | { ok: true; price: number; isFree: boolean }
  | { ok: false; error: string; errorTh: string; price: number };

function isFreeFlag(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;
  const v = raw.is_free ?? raw.isFree ?? raw.free;
  if (v === true || v === 1 || v === "1") return true;
  if (typeof v === "string" && ["true", "free", "yes"].includes(v.trim().toLowerCase())) {
    return true;
  }
  return false;
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
 * Accepts free (0 / free flag) or paid ≥ MIN_PAID_LISTING_PRICE_THB.
 */
export function validateListingPrice(
  value: unknown,
  opts?: { freeFlag?: boolean; rawBody?: Record<string, unknown> },
): ListingPriceValidation {
  const free =
    opts?.freeFlag === true ||
    isFreeFlag(opts?.rawBody) ||
    (typeof value === "string" && value.trim().toLowerCase() === "free");

  if (free) {
    return { ok: true, price: 0, isFree: true };
  }

  const price = parseListingPriceThb(value);
  if (!Number.isFinite(price)) {
    return {
      ok: false,
      price: 0,
      error: "Price is required (0 for free, or at least 1,000 THB)",
      errorTh: "กรุณากำหนดราคา — ใส่ 0 หากแจกฟรี หรืออย่างน้อย 1,000 บาท",
    };
  }

  if (price === 0) {
    return { ok: true, price: 0, isFree: true };
  }

  if (price < MIN_PAID_LISTING_PRICE_THB) {
    return {
      ok: false,
      price,
      error: `Paid plans must be at least ${MIN_PAID_LISTING_PRICE_THB.toLocaleString("en-US")} THB (or 0 for free)`,
      errorTh: `แบบบ้านที่คิดเงินต้องตั้งราคาอย่างน้อย ${MIN_PAID_LISTING_PRICE_THB.toLocaleString("th-TH")} บาท (หรือใส่ 0 หากแจกฟรี)`,
    };
  }

  return { ok: true, price, isFree: false };
}

export function isFreeListingPrice(price: number): boolean {
  return Number.isFinite(price) && price <= 0;
}

/** Client helper: Thai error message or null when valid. */
export function listingPriceErrorTh(value: unknown, freeFlag = false): string | null {
  const result = validateListingPrice(value, { freeFlag });
  return result.ok ? null : result.errorTh;
}
