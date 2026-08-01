/**
 * Client-safe types for the pre-checkout AI translation + unit conversion
 * pipeline. Server builds these via `/api/checkout/preview` before payment.
 */

import type { Currency } from "@/lib/currency";
import type { UiLocale, UnitSystem } from "@/lib/geo/countries";
import type { PaymentMethodId, PaymentMethodOption } from "@/lib/payments/methods";

export interface LocalizedSpecLine {
  key: string;
  label: string;
  /** Value already converted / localized for the visitor's country. */
  value: string;
}

export interface LocalizedListingView {
  listingId: string;
  planId: string;
  name: string;
  description: string;
  tagline?: string;
  /** Area string in the visitor's unit system (e.g. "180 m²" / "1,938 sq ft"). */
  area: string;
  beds: number;
  baths: number;
  floors: 1 | 2;
  image: string;
  /** Converted footprint / plot lines for review. */
  specs: LocalizedSpecLine[];
  priceThb: number;
  priceDisplay: number;
  priceFormatted: string;
  translated: boolean;
  unitsConverted: boolean;
}

export interface CheckoutPreview {
  uiLocale: UiLocale;
  countryCode: string;
  /** Buyer-selected market for Gemini translate + unit conversion. */
  targetCountry: string;
  /** Designated linear units for `targetCountry` (Thai labels). */
  designatedUnits: string[];
  unitSystem: UnitSystem;
  buildingCode: string;
  currency: Currency;
  exchangeRate: { usdThb: number; note: string };
  listings: LocalizedListingView[];
  pricing: {
    subtotalThb: number;
    discountThb: number;
    addonTotalThb: number;
    totalThb: number;
    subtotalDisplay: number;
    discountDisplay: number;
    addonTotalDisplay: number;
    totalDisplay: number;
    totalFormatted: string;
  };
  paymentMethods: PaymentMethodOption[];
  defaultPaymentMethod: PaymentMethodId;
  stripeConfigured: boolean;
  translationConfigured: boolean;
  /** True when AI/unit pipeline finished for every cart line. */
  readyForCheckout: boolean;
}
