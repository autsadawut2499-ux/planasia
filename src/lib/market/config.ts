import { UI_LOCALES, type UiLocale } from "@/lib/geo/countries";

/**
 * Thailand-only marketplace.
 * When `true`, forces Thai domestic mode (THB, TH country, TH/EN UI toggle only).
 * No foreign localization, OCR translation, or multi-country checkout.
 */
export const THAI_DOMESTIC_MARKET = true;

/** Languages offered in the chrome language toggle. */
export const STOREFRONT_UI_LOCALES: readonly UiLocale[] = THAI_DOMESTIC_MARKET
  ? (["th", "en"] as const)
  : UI_LOCALES;
