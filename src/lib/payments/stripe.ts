import Stripe from "stripe";
import { getCountryByCode, PRICING } from "@/lib/geo/countries";
import type { ProjectInput } from "@/lib/ai/types";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
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
  method: "stripe" | "promptpay";
  planId: string;
  project: ProjectInput;
  countryCode: string;
  userId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const { amount, currency } = computePrice(params.format, params.project, params.countryCode);
  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
    params.method === "promptpay" && params.countryCode === "TH"
      ? ["promptpay"]
      : ["card"];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethodTypes,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `Planasia ${params.format.toUpperCase()} Export`,
            description: `${params.project.projectName || "House Plan"} — ${params.project.floors} floor(s)`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      planId: params.planId,
      format: params.format,
      userId: params.userId ?? "",
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

export async function createCartCheckoutSession(params: {
  cartOrderId: string;
  lineItems: CartCheckoutLineItem[];
  currency: string;
  method: "stripe" | "promptpay";
  countryCode: string;
  userId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
    params.method === "promptpay" && params.countryCode === "TH"
      ? ["promptpay"]
      : ["card"];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethodTypes,
    mode: "payment",
    line_items: params.lineItems.map((item) => ({
      price_data: {
        currency: params.currency.toLowerCase(),
        unit_amount: Math.round(item.amount * 100),
        product_data: { name: item.name },
      },
      quantity: item.quantity ?? 1,
    })),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      cartOrderId: params.cartOrderId,
      userId: params.userId ?? "",
      type: "store_cart",
    },
  });

  if (!session.url) return null;
  return { sessionId: session.id, url: session.url };
}
