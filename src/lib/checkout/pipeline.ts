/**
 * Pre-checkout pipeline (BEFORE payment — no Gemini):
 *
 *   [Frontend: target country / language / currency]
 *          │
 *          ▼
 *   [Backend: listing + programmatic unit preview for selected country]
 *          ▼
 *   [JSON for PreCheckoutReview UI]
 *          │  user verifies plan details + units preview
 *          ▼
 *   [Payment Gateway]
 *          │
 *          ▼
 *   [After paid] Gemini: document + target_country + system instruction
 */

import "server-only";
import {
  checkoutCurrencyFor,
  convertFromThb,
  exchangeRateNote,
  formatMoney,
  isCurrency,
  type Currency,
  THB_PER_UNIT,
  USD_THB_RATE,
} from "@/lib/currency";
import {
  getCountryByCode,
  type UiLocale,
  type UnitSystem,
} from "@/lib/geo/countries";
import { getListingById } from "@/lib/store/db";
import type { StoreListing } from "@/lib/store/listing-types";
import { computeCartTotal, type CartLineItem, type UpsellAddonId } from "@/lib/store/cart-pricing";
import { isTranslationConfigured } from "@/lib/translation/service";
import {
  availablePaymentMethods,
  defaultPaymentMethod,
  type PaymentMethodId,
  type PaymentMethodOption,
} from "@/lib/payments/methods";
import { publicBankDetails } from "@/lib/payments/settings";
import { loadPaymentSettings } from "@/lib/supabase/payment-settings";
import {
  formatArea,
  formatDimension,
  formatSizePair,
  resolveUnitSystem,
} from "@/lib/units/format";
import { parseAreaSqm } from "@/lib/format";
import type { CheckoutPreview, LocalizedListingView, LocalizedSpecLine } from "@/lib/checkout/preview-types";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";
import { createGeminiRegionalContext } from "@/lib/gemini/core-config";
import {
  getCountryUnitProfile,
  resolveGeminiMarketCountry,
  type GeminiMarketCountryCode,
} from "@/lib/gemini/regional-units";

export type { PaymentMethodId, PaymentMethodOption, CheckoutPreview, LocalizedListingView };

function specLabels(uiLocale: UiLocale): Record<string, string> {
  const th = uiLocale === "th";
  return {
    beds: th ? "ห้องนอน" : "Bedrooms",
    baths: th ? "ห้องน้ำ" : "Bathrooms",
    floors: th ? "จำนวนชั้น" : "Storeys",
    area: th ? "พื้นที่ใช้สอย" : "Usable area",
    plot: th ? "ที่ดินขั้นต่ำ" : "Min. plot size",
    width: th ? "หน้ากว้าง" : "Width",
    depth: th ? "ความลึก" : "Depth",
    style: th ? "สไตล์" : "Style",
    buildingCode: th ? "มาตรฐานอาคารอ้างอิง" : "Reference building code",
  };
}

/** Convert metric source specs into the visitor's unit system (programmatic). */
export function buildLocalizedSpecs(
  listing: StoreListing,
  unitSystem: UnitSystem,
  uiLocale: UiLocale,
  buildingCode: string,
): { specs: LocalizedSpecLine[]; areaDisplay: string; unitsConverted: boolean } {
  const labels = specLabels(uiLocale);
  const opts = {
    unitSystem,
    metricDecimals: 1,
    locale: uiLocale === "th" ? "th" : "en",
  };
  const areaSqm = parseAreaSqm(listing.area);
  const areaDisplay =
    areaSqm != null ? formatArea(areaSqm, opts) : listing.area || "—";

  const specs: LocalizedSpecLine[] = [
    { key: "beds", label: labels.beds, value: String(listing.beds) },
    { key: "baths", label: labels.baths, value: String(listing.baths) },
    { key: "floors", label: labels.floors, value: String(listing.floors) },
    { key: "area", label: labels.area, value: areaDisplay },
  ];

  if (listing.widthMeters != null && listing.lengthMeters != null) {
    specs.push({
      key: "plot",
      label: labels.plot,
      value: formatSizePair(listing.widthMeters, listing.lengthMeters, opts),
    });
  } else {
    if (listing.widthMeters != null) {
      specs.push({
        key: "width",
        label: labels.width,
        value: formatDimension(listing.widthMeters, opts),
      });
    }
    if (listing.lengthMeters != null) {
      specs.push({
        key: "depth",
        label: labels.depth,
        value: formatDimension(listing.lengthMeters, opts),
      });
    }
  }

  if (listing.style) {
    specs.push({ key: "style", label: labels.style, value: listing.style });
  }
  if (buildingCode) {
    specs.push({ key: "buildingCode", label: labels.buildingCode, value: buildingCode });
  }

  return {
    specs,
    areaDisplay,
    // Only flag when we actually leave metric (Thai buyers stay on ม. / ตร.ม.).
    unitsConverted: unitSystem === "imperial",
  };
}

/**
 * Pre-checkout listing copy — NO translation API call.
 * Cloud Document Translation runs only after payment succeeds
 * (see `runPostPaymentTranslation`).
 *
 * Preview shows original listing prose; units are converted programmatically
 * via {@link buildLocalizedSpecs} using the selected target country.
 */
export async function localizeListingCopy(
  listing: StoreListing,
  _uiLocale: UiLocale,
  _targetCountry: GeminiMarketCountryCode,
): Promise<{ name: string; description: string; tagline?: string; translated: boolean }> {
  return {
    name: listing.name,
    description: listing.description,
    tagline: listing.tagline,
    translated: false,
  };
}

/** Pre-checkout localization: original copy + programmatic unit preview. */
export async function localizeListingForCheckout(
  listing: StoreListing,
  uiLocale: UiLocale,
  unitSystem: UnitSystem,
  buildingCode: string,
  targetCountry: GeminiMarketCountryCode,
): Promise<Omit<LocalizedListingView, "priceThb" | "priceDisplay" | "priceFormatted">> {
  const [copy, units] = await Promise.all([
    localizeListingCopy(listing, uiLocale, targetCountry),
    Promise.resolve(buildLocalizedSpecs(listing, unitSystem, uiLocale, buildingCode)),
  ]);

  return {
    listingId: listing.id,
    planId: listing.planCode || listing.planId,
    name: copy.name,
    description: copy.description,
    tagline: copy.tagline,
    area: units.areaDisplay,
    beds: listing.beds,
    baths: listing.baths,
    floors: listing.floors,
    image: listing.image,
    specs: units.specs,
    translated: copy.translated,
    unitsConverted: units.unitsConverted,
  };
}

export function resolveCheckoutCurrency(opts: {
  /** Visitor geo / storefront country — drives local charge currency. */
  countryCode?: string;
  /** Buyer-selected target market (units/translation) — does not set currency. */
  targetCountry?: string;
  currencyOverride?: Currency;
}): Currency {
  if (isCurrency(opts.currencyOverride)) {
    return opts.currencyOverride;
  }
  // Charge in the visitor's local currency from geo-IP country.
  return checkoutCurrencyFor(opts.targetCountry, opts.countryCode);
}

/**
 * Build the pre-checkout review payload (no Gemini).
 * Gemini translate + unit conversion runs only after payment succeeds.
 */
export async function buildCheckoutPreview(input: {
  listingIds: string[];
  uiLocale: UiLocale;
  countryCode: string;
  /** Buyer-selected Gemini market country (post-payment translation target). */
  target_country?: string;
  currency?: Currency;
  unitSystem?: UnitSystem;
  addons?: UpsellAddonId[];
}): Promise<CheckoutPreview> {
  const country = getCountryByCode(THAI_DOMESTIC_MARKET ? "TH" : input.countryCode);
  const targetCountry = resolveGeminiMarketCountry(
    input.target_country ?? input.countryCode,
  );
  const regional = createGeminiRegionalContext(targetCountry);
  const unitProfile = getCountryUnitProfile(targetCountry);

  const currency = resolveCheckoutCurrency({
    countryCode: input.countryCode,
    targetCountry,
    currencyOverride: input.currency,
  });
  // Prefer the Gemini market unit rule for the selected target country.
  const unitSystem = resolveUnitSystem(
    input.unitSystem ?? regional.unit_conversion_rule.display,
    targetCountry,
  );
  const addons = input.addons ?? [];

  const listings: LocalizedListingView[] = [];
  const cartLines: CartLineItem[] = [];

  for (const id of input.listingIds) {
    const row = await getListingById(id);
    if (!row) continue;

    const localized = await localizeListingForCheckout(
      row,
      input.uiLocale,
      unitSystem,
      country.buildingCode,
      targetCountry,
    );

    listings.push({
      ...localized,
      priceThb: row.price,
      priceDisplay: convertFromThb(row.price, currency),
      priceFormatted: formatMoney(row.price, currency),
    });

    cartLines.push({
      listingId: row.id,
      planId: row.planId,
      name: row.name,
      price: row.price,
      image: row.image,
      style: row.style,
      floors: row.floors,
    });
  }

  const pricingThb = computeCartTotal(cartLines, addons);
  const paymentMethods = availablePaymentMethods(currency, input.countryCode);
  const paymentSettings = await loadPaymentSettings();
  const bank = publicBankDetails(paymentSettings);

  return {
    uiLocale: input.uiLocale,
    countryCode: country.code,
    targetCountry,
    designatedUnits: [...unitProfile.units],
    unitSystem,
    buildingCode: country.buildingCode,
    currency,
    exchangeRate: {
      usdThb: USD_THB_RATE,
      thbPerUnit: THB_PER_UNIT[currency],
      note: exchangeRateNote(currency),
    },
    listings,
    pricing: {
      subtotalThb: pricingThb.subtotal,
      discountThb: pricingThb.discount,
      addonTotalThb: pricingThb.addonTotal,
      totalThb: pricingThb.total,
      subtotalDisplay: convertFromThb(pricingThb.subtotal, currency),
      discountDisplay: convertFromThb(pricingThb.discount, currency),
      addonTotalDisplay: convertFromThb(pricingThb.addonTotal, currency),
      totalDisplay: convertFromThb(pricingThb.total, currency),
      totalFormatted: formatMoney(pricingThb.total, currency),
    },
    paymentMethods,
    defaultPaymentMethod: defaultPaymentMethod(currency, input.countryCode),
    /** Bank account configured for transfer checkout (Stripe removed). */
    stripeConfigured: bank.configured,
    paymentConfigured: bank.configured,
    translationConfigured: isTranslationConfigured(),
    // Pipeline completed for every found listing — UI gates payment on this flag.
    readyForCheckout: listings.length > 0,
  };
}
