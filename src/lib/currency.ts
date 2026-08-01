/**
 * Multi-currency support.
 *
 * All prices in the database and pricing logic are stored in the base currency
 * THB. Display and checkout convert into the visitor's local currency from
 * geo-IP countryCode (JPY for Japan, EUR for eurozone, USD for US, THB for
 * Thailand / unknown default).
 *
 * Fixed reference rates keep pricing predictable (no live FX feed).
 */

export const CURRENCIES = [
  "THB",
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "MYR",
  "IDR",
  "VND",
  "INR",
  "PHP",
  "KRW",
  "CNY",
  "HKD",
  "TWD",
  "CHF",
  "NZD",
  "AED",
] as const;

export type Currency = (typeof CURRENCIES)[number];

/** Fixed reference rate: 1 USD = 35 THB. */
export const USD_THB_RATE = 35;

export const BASE_CURRENCY: Currency = "THB";

/**
 * How many THB equal 1 unit of the given currency (reference mid rates).
 * THB → 1. Other rates are approximate and intentionally static.
 */
export const THB_PER_UNIT: Record<Currency, number> = {
  THB: 1,
  USD: USD_THB_RATE,
  EUR: 38,
  JPY: 0.23,
  GBP: 44,
  AUD: 23,
  CAD: 25,
  SGD: 26,
  MYR: 7.5,
  IDR: 0.0022,
  VND: 0.0014,
  INR: 0.42,
  PHP: 0.62,
  KRW: 0.025,
  CNY: 4.8,
  HKD: 4.5,
  TWD: 1.1,
  CHF: 40,
  NZD: 21,
  AED: 9.5,
};

export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  label: string;
  /** BCP-47 locale used for Intl number formatting. */
  numberLocale: string;
  /** Decimal places shown (and charged for standard Stripe currencies). */
  fractionDigits: number;
  /** Stripe zero-decimal currencies — amount is already in minor units. */
  zeroDecimal: boolean;
}

export const CURRENCY_META: Record<Currency, CurrencyMeta> = {
  THB: { code: "THB", symbol: "฿", label: "Thai Baht", numberLocale: "th-TH", fractionDigits: 0, zeroDecimal: false },
  USD: { code: "USD", symbol: "$", label: "US Dollar", numberLocale: "en-US", fractionDigits: 2, zeroDecimal: false },
  EUR: { code: "EUR", symbol: "€", label: "Euro", numberLocale: "de-DE", fractionDigits: 2, zeroDecimal: false },
  JPY: { code: "JPY", symbol: "¥", label: "Japanese Yen", numberLocale: "ja-JP", fractionDigits: 0, zeroDecimal: true },
  GBP: { code: "GBP", symbol: "£", label: "British Pound", numberLocale: "en-GB", fractionDigits: 2, zeroDecimal: false },
  AUD: { code: "AUD", symbol: "A$", label: "Australian Dollar", numberLocale: "en-AU", fractionDigits: 2, zeroDecimal: false },
  CAD: { code: "CAD", symbol: "C$", label: "Canadian Dollar", numberLocale: "en-CA", fractionDigits: 2, zeroDecimal: false },
  SGD: { code: "SGD", symbol: "S$", label: "Singapore Dollar", numberLocale: "en-SG", fractionDigits: 2, zeroDecimal: false },
  MYR: { code: "MYR", symbol: "RM", label: "Malaysian Ringgit", numberLocale: "ms-MY", fractionDigits: 2, zeroDecimal: false },
  IDR: { code: "IDR", symbol: "Rp", label: "Indonesian Rupiah", numberLocale: "id-ID", fractionDigits: 0, zeroDecimal: true },
  VND: { code: "VND", symbol: "₫", label: "Vietnamese Dong", numberLocale: "vi-VN", fractionDigits: 0, zeroDecimal: true },
  INR: { code: "INR", symbol: "₹", label: "Indian Rupee", numberLocale: "en-IN", fractionDigits: 2, zeroDecimal: false },
  PHP: { code: "PHP", symbol: "₱", label: "Philippine Peso", numberLocale: "en-PH", fractionDigits: 2, zeroDecimal: false },
  KRW: { code: "KRW", symbol: "₩", label: "South Korean Won", numberLocale: "ko-KR", fractionDigits: 0, zeroDecimal: true },
  CNY: { code: "CNY", symbol: "¥", label: "Chinese Yuan", numberLocale: "zh-CN", fractionDigits: 2, zeroDecimal: false },
  HKD: { code: "HKD", symbol: "HK$", label: "Hong Kong Dollar", numberLocale: "zh-HK", fractionDigits: 2, zeroDecimal: false },
  TWD: { code: "TWD", symbol: "NT$", label: "New Taiwan Dollar", numberLocale: "zh-TW", fractionDigits: 0, zeroDecimal: true },
  CHF: { code: "CHF", symbol: "CHF", label: "Swiss Franc", numberLocale: "de-CH", fractionDigits: 2, zeroDecimal: false },
  NZD: { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar", numberLocale: "en-NZ", fractionDigits: 2, zeroDecimal: false },
  AED: { code: "AED", symbol: "د.إ", label: "UAE Dirham", numberLocale: "ar-AE", fractionDigits: 2, zeroDecimal: false },
};

/** Eurozone (+ a few EUR-using countries). */
const EUR_COUNTRIES = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT",
  "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
  "AD", "MC", "SM", "VA", "ME", "XK",
]);

/**
 * Explicit ISO country → currency. Unlisted countries fall back to THB
 * (marketplace default), except eurozone → EUR.
 */
const COUNTRY_CURRENCY: Record<string, Currency> = {
  TH: "THB",
  US: "USD",
  JP: "JPY",
  GB: "GBP",
  UK: "GBP",
  AU: "AUD",
  CA: "CAD",
  SG: "SGD",
  MY: "MYR",
  ID: "IDR",
  VN: "VND",
  IN: "INR",
  PH: "PHP",
  KR: "KRW",
  CN: "CNY",
  HK: "HKD",
  TW: "TWD",
  CH: "CHF",
  NZ: "NZD",
  AE: "AED",
  SA: "AED",
  QA: "AED",
  KW: "AED",
  BH: "AED",
  OM: "AED",
  BN: "SGD",
  LA: "THB",
  KH: "THB",
  MM: "THB",
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

/** Display / charge currency for a visitor country (THB default). */
export function currencyForCountry(code: string | undefined | null): Currency {
  const upper = (code ?? "").toUpperCase();
  if (!upper) return "THB";
  if (COUNTRY_CURRENCY[upper]) return COUNTRY_CURRENCY[upper];
  if (EUR_COUNTRIES.has(upper)) return "EUR";
  return "THB";
}

/**
 * Checkout charge currency follows the visitor's geo origin.
 * Target market (translation/units) does not override display currency.
 */
export function checkoutCurrencyFor(
  _targetCountry?: string | null,
  visitorCountry?: string | null,
): Currency {
  return currencyForCountry(visitorCountry);
}

function roundMoney(value: number, fractionDigits: number): number {
  const factor = 10 ** fractionDigits;
  return Math.round(value * factor) / factor;
}

/** Convert a base (THB) amount into the target display currency. */
export function convertFromThb(amountThb: number, currency: Currency): number {
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.THB;
  const rate = THB_PER_UNIT[currency] ?? 1;
  return roundMoney(amountThb / rate, meta.fractionDigits);
}

/** Convert a display-currency amount back into the base currency (THB). */
export function convertToThb(amount: number, currency: Currency): number {
  const rate = THB_PER_UNIT[currency] ?? 1;
  return amount * rate;
}

/** Format a base (THB) amount in the requested display currency. */
export function formatMoney(amountThb: number, currency: Currency): string {
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.THB;
  const value = convertFromThb(amountThb, currency);
  return new Intl.NumberFormat(meta.numberLocale, {
    style: "currency",
    currency: meta.code,
    maximumFractionDigits: meta.fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Smallest-unit amount for a payment gateway, from a THB base amount.
 * Zero-decimal currencies (JPY, KRW, …) are not multiplied by 100.
 */
export function toGatewayMinorUnits(amountThb: number, currency: Currency): number {
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.THB;
  const value = convertFromThb(amountThb, currency);
  if (meta.zeroDecimal) return Math.max(1, Math.round(value));
  return Math.max(1, Math.round(value * 100));
}

/** Human-readable FX note for checkout UI. */
export function exchangeRateNote(currency: Currency): string {
  if (currency === "THB") return "ราคาแสดงเป็นบาทไทย (THB)";
  const rate = THB_PER_UNIT[currency];
  return `Fixed reference rate: 1 ${currency} ≈ ${rate} THB`;
}
