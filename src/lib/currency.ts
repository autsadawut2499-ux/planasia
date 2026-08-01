/**
 * Multi-currency support.
 *
 * All prices in the database and pricing logic are stored in the base currency
 * THB. For display and checkout we show:
 *   - Thailand (TH)         → Thai Baht (THB)
 *   - Everywhere else       → US Dollar (USD)
 *
 * A fixed reference rate is used for simple, predictable pricing across Asia.
 */

export type Currency = "THB" | "USD";

/** Fixed reference rate: 1 USD = 35 THB. */
export const USD_THB_RATE = 35;

export const BASE_CURRENCY: Currency = "THB";

export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  label: string;
  /** BCP-47 locale used for Intl number formatting. */
  numberLocale: string;
  /** Decimal places shown (and charged). */
  fractionDigits: number;
}

export const CURRENCY_META: Record<Currency, CurrencyMeta> = {
  THB: { code: "THB", symbol: "฿", label: "Thai Baht", numberLocale: "th-TH", fractionDigits: 0 },
  USD: { code: "USD", symbol: "$", label: "US Dollar", numberLocale: "en-US", fractionDigits: 2 },
};

/** Default display currency for a country: THB for Thailand, USD elsewhere. */
export function currencyForCountry(code: string | undefined | null): Currency {
  return (code ?? "").toUpperCase() === "TH" ? "THB" : "USD";
}

/**
 * Checkout charge / display currency:
 * - Thailand target + Thai visitor → THB
 * - Foreign target country (dropdown) OR international visitor (geo) → USD
 */
export function checkoutCurrencyFor(
  targetCountry?: string | null,
  visitorCountry?: string | null,
): Currency {
  const target = (targetCountry ?? "TH").toUpperCase();
  const visitor = (visitorCountry ?? "TH").toUpperCase();
  if (target !== "TH" || visitor !== "TH") return "USD";
  return "THB";
}

/** Convert a base (THB) amount into the target display currency. */
export function convertFromThb(amountThb: number, currency: Currency): number {
  if (currency === "USD") {
    return roundMoney(amountThb / USD_THB_RATE, CURRENCY_META.USD.fractionDigits);
  }
  return roundMoney(amountThb, CURRENCY_META.THB.fractionDigits);
}

/** Convert a display-currency amount back into the base currency (THB). */
export function convertToThb(amount: number, currency: Currency): number {
  return currency === "USD" ? amount * USD_THB_RATE : amount;
}

function roundMoney(value: number, fractionDigits: number): number {
  const factor = 10 ** fractionDigits;
  return Math.round(value * factor) / factor;
}

/** Format a base (THB) amount in the requested display currency. */
export function formatMoney(amountThb: number, currency: Currency): string {
  const meta = CURRENCY_META[currency];
  const value = convertFromThb(amountThb, currency);
  return new Intl.NumberFormat(meta.numberLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: meta.fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Smallest-unit amount (satang / cents) for a payment gateway, from a THB base amount. */
export function toGatewayMinorUnits(amountThb: number, currency: Currency): number {
  const value = convertFromThb(amountThb, currency);
  return Math.round(value * 100);
}
