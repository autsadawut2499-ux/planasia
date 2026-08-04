import "server-only";

import type Stripe from "stripe";
import {
  convertFromThb,
  currencyForCountry,
  isCurrency,
  toGatewayMinorUnits,
  type Currency,
} from "@/lib/currency";
import { availablePaymentMethods, type PaymentMethodId } from "@/lib/payments/methods";
import { getStripe } from "@/lib/payments/stripe";

export interface CreateCartPaymentIntentParams {
  cartOrderId: string;
  /** Public plan codes — stamped into metadata for fulfillment. */
  planIds: string[];
  /** Total charge in base THB. */
  amountThb: number;
  currency: Currency;
  method: PaymentMethodId | "stripe" | "promptpay";
  countryCode: string;
  targetCountry?: string;
  userId?: string;
  uiLocale?: string;
  documentLanguage?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  description?: string;
}

export type CreateCartPaymentIntentResult = {
  paymentIntentId: string;
  clientSecret: string;
  currency: Currency;
  amountThb: number;
  amountDisplay: number;
  stripePaymentMethodTypes: Array<"card" | "promptpay">;
};

/**
 * Create a Stripe PaymentIntent for an existing pending cart order.
 * Use with Stripe.js Payment Element / confirmCardPayment on the client.
 *
 * Metadata mirrors Checkout Sessions so webhook/confirm can call the same
 * cart fulfillment path (cartOrderId → finalizePaidCartSale).
 */
export async function createCartPaymentIntent(
  params: CreateCartPaymentIntentParams,
): Promise<CreateCartPaymentIntentResult | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const currency: Currency = isCurrency(params.currency)
    ? params.currency
    : currencyForCountry(params.countryCode);
  const amountThb = Math.max(1, Math.round(params.amountThb));
  const method: PaymentMethodId =
    params.method === "promptpay" ? "promptpay" : "card";

  const allowed = availablePaymentMethods(currency, params.countryCode);
  const chosen =
    allowed.find((m) => m.id === method && m.available) ??
    allowed.find((m) => m.available);
  if (!chosen) return null;

  const paymentMethodTypes: Array<"card" | "promptpay"> = [
    chosen.stripeType === "promptpay" ? "promptpay" : "card",
  ];

  const planIdsCsv = params.planIds.filter(Boolean).join(",").slice(0, 500);

  const intent = await stripe.paymentIntents.create({
    amount: toGatewayMinorUnits(amountThb, currency),
    currency: currency.toLowerCase(),
    payment_method_types: paymentMethodTypes,
    receipt_email: params.buyerEmail || undefined,
    description:
      params.description ||
      `Planasia order ${params.cartOrderId} (${planIdsCsv || "plans"})`.slice(0, 500),
    metadata: {
      type: "store_cart",
      cartOrderId: params.cartOrderId,
      userId: params.userId ?? "",
      currency,
      totalThb: String(amountThb),
      amountThb: String(amountThb),
      uiLocale: params.uiLocale ?? "th",
      documentLanguage: params.documentLanguage ?? "th",
      target_country: (params.targetCountry ?? params.countryCode ?? "TH").slice(0, 8),
      buyerName: (params.buyerName ?? "").slice(0, 200),
      buyerEmail: (params.buyerEmail ?? "").slice(0, 200),
      buyerPhone: (params.buyerPhone ?? "").slice(0, 32),
      planIds: planIdsCsv,
    },
  });

  if (!intent.client_secret) return null;

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
    currency,
    amountThb,
    amountDisplay: convertFromThb(amountThb, currency),
    stripePaymentMethodTypes: paymentMethodTypes,
  };
}

export async function retrievePaymentIntent(
  paymentIntentId: string,
): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripe();
  if (!stripe || !paymentIntentId.trim()) return null;
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId.trim());
  } catch {
    return null;
  }
}

export function isPaymentIntentPaid(intent: Stripe.PaymentIntent): boolean {
  return intent.status === "succeeded";
}
