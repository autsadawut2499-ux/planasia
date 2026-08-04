import "server-only";

import type Stripe from "stripe";
import { finalizePaidCartSale } from "@/lib/commerce/finalize-sale";
import type { FulfillCheckoutResult } from "@/lib/payments/fulfill-checkout";
import { isPaymentIntentPaid } from "@/lib/payments/payment-intent";

/**
 * Idempotent fulfillment from a succeeded PaymentIntent.
 * Reuses cart sale finalization; `stripeSessionId` stores the PaymentIntent id
 * for grant/order idempotency (same column as Checkout session ids).
 */
export async function fulfillPaidPaymentIntent(
  intent: Stripe.PaymentIntent,
): Promise<FulfillCheckoutResult> {
  const meta = intent.metadata ?? {};
  const planIdsFromMeta = (meta.planIds ?? meta.planId ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const userId = meta.userId || undefined;

  if (!isPaymentIntentPaid(intent)) {
    return {
      kind: "ignored",
      reason: `payment_intent_not_succeeded status=${intent.status}`,
      planIds: planIdsFromMeta,
    };
  }

  if (!meta.cartOrderId) {
    return {
      kind: "ignored",
      reason: "payment_intent_missing_cartOrderId",
      planIds: planIdsFromMeta,
    };
  }

  const result = await finalizePaidCartSale({
    cartOrderId: meta.cartOrderId,
    stripeSessionId: intent.id,
    buyerUserId: userId,
  });

  if (!result) {
    return {
      kind: "ignored",
      reason: "cart_order_not_found",
      planIds: planIdsFromMeta,
    };
  }

  return {
    kind: "cart",
    cartOrderId: meta.cartOrderId,
    order: result.order,
    planIds: result.planIds,
    grants: result.grants,
    translation: result.translation,
    emailSent: result.emailSent,
  };
}
