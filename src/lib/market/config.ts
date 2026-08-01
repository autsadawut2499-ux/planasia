import { UI_LOCALES, type UiLocale } from "@/lib/geo/countries";

/**
 * Thailand-only marketplace.
 * When `true`, forces Thai domestic mode (TH country catalog, TH/EN UI toggle).
 * Display/checkout currency still follows geo-IP local currency.
 * No foreign localization, OCR translation, or multi-country checkout.
 */
export const THAI_DOMESTIC_MARKET = true;

/** Languages offered in the chrome language toggle. */
export const STOREFRONT_UI_LOCALES: readonly UiLocale[] = THAI_DOMESTIC_MARKET
  ? (["th", "en"] as const)
  : UI_LOCALES;
