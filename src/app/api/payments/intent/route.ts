import { NextRequest, NextResponse } from "next/server";
import {
  googleLoginRequiredResponse,
  requireBuyerSession,
} from "@/lib/auth/buyer-session";
import { isCurrency, type Currency } from "@/lib/currency";
import {
  getStripePaymentIntentReadiness,
  getStripePublishableKey,
} from "@/lib/payments/config";
import { createCartPaymentIntent } from "@/lib/payments/payment-intent";
import { defaultPaymentMethod, type PaymentMethodId } from "@/lib/payments/methods";
import { getCartOrder } from "@/lib/store/cart-orders";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

export const runtime = "nodejs";

/**
 * POST /api/payments/intent
 *
 * Create a Stripe PaymentIntent for an existing pending cart order.
 * Body: { cartOrderId, method?: "card"|"promptpay", currency?: Currency }
 *
 * Returns clientSecret + publishableKey for Stripe.js / Payment Element.
 * Prefer hosted Checkout (`/api/store/cart/checkout`) unless you need embedded UI.
 */
export async function POST(request: NextRequest) {
  const readiness = getStripePaymentIntentReadiness();
  if (!readiness.ok) {
    return NextResponse.json(
      { error: readiness.error, missing: readiness.missing },
      { status: readiness.status },
    );
  }

  const buyerSession = await requireBuyerSession();
  if (!buyerSession) {
    return NextResponse.json(googleLoginRequiredResponse(), { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const cartOrderId = String(body.cartOrderId ?? "").trim();
  if (!cartOrderId) {
    return NextResponse.json({ error: "cartOrderId required" }, { status: 400 });
  }

  const order = await getCartOrder(cartOrderId);
  if (!order) {
    return NextResponse.json({ error: "Cart order not found" }, { status: 404 });
  }
  if (order.status === "paid") {
    return NextResponse.json(
      { error: "Order already paid", orderId: cartOrderId, status: order.status },
      { status: 409 },
    );
  }
  if (order.buyerUserId && order.buyerUserId !== buyerSession.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const amountThb = Math.max(0, Math.round(order.total ?? 0));
  if (amountThb <= 0) {
    return NextResponse.json(
      {
        error: "Order total is zero — use free checkout path instead of PaymentIntent",
        orderId: cartOrderId,
      },
      { status: 400 },
    );
  }

  const countryCode = THAI_DOMESTIC_MARKET
    ? "TH"
    : String(order.targetCountry ?? body.countryCode ?? "TH").toUpperCase();
  const currency: Currency = isCurrency(order.currency)
    ? order.currency
    : isCurrency(body.currency)
      ? body.currency
      : "THB";
  const method: PaymentMethodId =
    body.method === "promptpay" || body.method === "card"
      ? body.method
      : defaultPaymentMethod(currency, countryCode);

  const intent = await createCartPaymentIntent({
    cartOrderId,
    planIds: order.items.map((i) => i.planId),
    amountThb,
    currency,
    method,
    countryCode,
    targetCountry: order.targetCountry ?? countryCode,
    userId: buyerSession.userId,
    documentLanguage: order.documentLanguage,
    buyerName: order.buyerName,
    buyerEmail: order.buyerEmail,
    buyerPhone: order.buyerPhone,
  });

  if (!intent) {
    return NextResponse.json(
      {
        error:
          "Failed to create PaymentIntent. Check STRIPE_SECRET_KEY and payment method availability for this currency.",
        orderId: cartOrderId,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    mode: "payment_intent",
    orderId: cartOrderId,
    paymentIntentId: intent.paymentIntentId,
    clientSecret: intent.clientSecret,
    publishableKey: getStripePublishableKey(),
    amountThb: intent.amountThb,
    amountDisplay: intent.amountDisplay,
    currency: intent.currency,
    method,
    paymentMethodTypes: intent.stripePaymentMethodTypes,
  });
}
