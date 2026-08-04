import Stripe from "stripe";
import { getCountryByCode, PRICING } from "@/lib/geo/countries";
import type { ProjectInput } from "@/lib/ai/types";
import {
  convertFromThb,
  currencyForCountry,
  isCurrency,
  toGatewayMinorUnits,
  type Currency,
} from "@/lib/currency";
import { availablePaymentMethods, type PaymentMethodId } from "@/lib/payments/methods";
export {
  isStripeConfigured,
  isStripeWebhookConfigured,
  isMockPaymentsAllowed,
  getStripeCheckoutReadiness,
  getStripeWebhookReadiness,
  getStripePaymentIntentReadiness,
  getStripeStackStatus,
  getStripePublishableKey,
  isStripePublishableConfigured,
} from "@/lib/payments/config";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!stripeClient) {
    // Pin API version only when set — otherwise use the SDK default.
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function computePrice(
  format: "pdf" | "cad",
  project: ProjectInput,
  countryCode: string,
): { amount: number; currency: string } {
  const country = getCountryByCode(countryCode);
  const floorKey = project.floors === 1 ? "1" : "2";
  const pdfPrice = PRICING.custom.pdf[floorKey];
  const cadPrice = PRICING.custom.cad;
  return {
    amount: format === "pdf" ? pdfPrice : cadPrice,
    currency: country.currency.toLowerCase(),
  };
}

export async function createCheckoutSession(params: {
  format: "pdf" | "cad";
  method: "stripe" | "promptpay" | PaymentMethodId;
  planId: string;
  /** Internal listing id — needed so the webhook can credit the draftsman. */
  listingId?: string;
  /** Sale price in THB (what the draftsman set). Falls back to workspace pricing. */
  amountThb?: number;
  project: ProjectInput;
  countryCode: string;
  /** Buyer-selected Gemini market country for translate + units. */
  targetCountry?: string;
  /** Display / charge currency (defaults from country when omitted). */
  currency?: Currency;
  userId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  documentLanguage?: string;
  cartOrderId?: string;
  /** Extra THB line items (language surcharge, BOQ, …). Base plan uses amountThb − extras. */
  lineItemExtras?: { name: string; amount: number }[];
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const chargeCurrency: Currency = isCurrency(params.currency)
    ? params.currency
    : currencyForCountry(params.countryCode);
  const chargeThb = Math.max(
    1,
    Math.round(params.amountThb ?? computePrice(params.format, params.project, params.countryCode).amount),
  );
  const listingId = params.listingId ?? params.planId;
  const isStoreListing = Boolean(params.listingId);
  const extras = (params.lineItemExtras ?? []).filter((e) => e.amount > 0);
  const extrasTotal = extras.reduce((s, e) => s + e.amount, 0);
  const basePlanThb = Math.max(1, chargeThb - extrasTotal);

  const requested: PaymentMethodId =
    params.method === "promptpay" ? "promptpay" : "card";
  const allowed = availablePaymentMethods(chargeCurrency, params.countryCode);
  const chosen =
    allowed.find((m) => m.id === requested && m.available) ??
    allowed.find((m) => m.available);
  if (!chosen) return null;

  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
    chosen.stripeType,
  ];

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: chargeCurrency.toLowerCase(),
        unit_amount: toGatewayMinorUnits(basePlanThb, chargeCurrency),
        product_data: {
          name: `${params.project.projectName || "House Plan"} (${params.planId})`,
          description: `Planasia ${params.format.toUpperCase()} — รหัส ${params.planId}`,
        },
      },
      quantity: 1,
    },
    ...extras.map((e) => ({
      price_data: {
        currency: chargeCurrency.toLowerCase(),
        unit_amount: toGatewayMinorUnits(e.amount, chargeCurrency),
        product_data: { name: e.name },
      },
      quantity: 1,
    })),
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethodTypes,
    mode: "payment",
    line_items,
    customer_email: params.buyerEmail || undefined,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      // When a cart order exists, stamp store_cart so webhook/confirm mark it paid.
      type: params.cartOrderId
        ? "store_cart"
        : isStoreListing
          ? "store_listing"
          : "workspace_export",
      planId: params.planId,
      listingId,
      format: params.format,
      userId: params.userId ?? "",
      amountThb: String(chargeThb),
      currency: chargeCurrency,
      planIds: params.planId,
      cartOrderId: params.cartOrderId ?? "",
      buyerName: (params.buyerName ?? "").slice(0, 200),
      buyerEmail: (params.buyerEmail ?? "").slice(0, 200),
      buyerPhone: (params.buyerPhone ?? "").slice(0, 32),
      documentLanguage: params.documentLanguage ?? "th",
      target_country: (params.targetCountry ?? params.countryCode ?? "TH").slice(0, 8),
    },
  });

  if (!session.url) return null;
  return { sessionId: session.id, url: session.url };
}

export interface CartCheckoutLineItem {
  name: string;
  amount: number;
  quantity?: number;
}

/**
 * Create a Stripe Checkout session for a store cart.
 *
 * `lineItems[].amount` is always in **base THB**. The gateway converts to the
 * visitor's local charge currency (from geo-IP) before charging.
 * PromptPay is only offered for THB + Thailand.
 */
export async function createCartCheckoutSession(params: {
  cartOrderId: string;
  /** Public plan codes (MOD-001, …) — stamped into Stripe metadata for the webhook. */
  planIds: string[];
  /** Line amounts in base THB. */
  lineItems: CartCheckoutLineItem[];
  /** Display / charge currency. */
  currency: Currency;
  method: PaymentMethodId | "stripe" | "promptpay";
  countryCode: string;
  /** Buyer-selected Gemini market country for translate + units. */
  targetCountry?: string;
  userId?: string;
  /** Selected UI language — stamped into metadata for post-pay PDF. */
  uiLocale?: string;
  documentLanguage?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string; currency: Currency; totalDisplay: number } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const currency: Currency = isCurrency(params.currency)
    ? params.currency
    : currencyForCountry(params.countryCode);
  const method: PaymentMethodId =
    params.method === "promptpay" ? "promptpay" : params.method === "card" ? "card" : "card";

  const allowed = availablePaymentMethods(currency, params.countryCode);
  const chosen = allowed.find((m) => m.id === method && m.available) ?? allowed.find((m) => m.available);
  if (!chosen) return null;

  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
    chosen.stripeType,
  ];

  const totalThb = params.lineItems.reduce(
    (sum, item) => sum + item.amount * (item.quantity ?? 1),
    0,
  );

  const planIdsCsv = params.planIds.filter(Boolean).join(",");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethodTypes,
    mode: "payment",
    line_items: params.lineItems.map((item) => ({
      price_data: {
        currency: currency.toLowerCase(),
        unit_amount: toGatewayMinorUnits(item.amount, currency),
        product_data: { name: item.name },
      },
      quantity: item.quantity ?? 1,
    })),
    customer_email: params.buyerEmail || undefined,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      cartOrderId: params.cartOrderId,
      userId: params.userId ?? "",
      type: "store_cart",
      currency,
      totalThb: String(totalThb),
      uiLocale: params.uiLocale ?? "th",
      documentLanguage: params.documentLanguage ?? "th",
      target_country: (params.targetCountry ?? params.countryCode ?? "TH").slice(0, 8),
      buyerName: (params.buyerName ?? "").slice(0, 200),
      buyerEmail: (params.buyerEmail ?? "").slice(0, 200),
      buyerPhone: (params.buyerPhone ?? "").slice(0, 32),
      // Stripe metadata values max 500 chars — enough for ~40 plan codes.
      planIds: planIdsCsv.slice(0, 500),
    },
  });

  if (!session.url) return null;
  return {
    sessionId: session.id,
    url: session.url,
    currency,
    totalDisplay: convertFromThb(totalThb, currency),
  };
}
