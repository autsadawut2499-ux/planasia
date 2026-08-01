import "server-only";

import type Stripe from "stripe";
import {
  finalizePaidCartSale,
  finalizePaidListingSale,
} from "@/lib/commerce/finalize-sale";
import {
  createDownloadToken,
  findGrantByStripeSession,
  storeDownloadGrant,
  type DownloadGrant,
} from "@/lib/payments/tokens";
import type { CartOrder } from "@/lib/store/cart-orders";
import type { PostPaymentTranslationResult } from "@/lib/gemini/post-payment-translation";

export type FulfillCheckoutResult =
  | {
      kind: "cart";
      cartOrderId: string;
      order: CartOrder;
      planIds: string[];
      grants: DownloadGrant[];
      translation?: PostPaymentTranslationResult;
      emailSent?: boolean;
    }
  | {
      kind: "listing";
      planIds: string[];
      grants: DownloadGrant[];
    }
  | {
      kind: "workspace";
      planIds: string[];
      grants: DownloadGrant[];
    }
  | {
      kind: "ignored";
      reason: string;
      planIds: string[];
    };

/**
 * Idempotent post-payment fulfillment from a paid Stripe Checkout session.
 * Shared by the signed webhook and the browser return-URL confirm endpoint.
 */
export async function fulfillPaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<FulfillCheckoutResult> {
  const meta = session.metadata ?? {};
  const planIdsFromMeta = (meta.planIds ?? meta.planId ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const userId = meta.userId || undefined;
  const stripeSessionId = session.id;

  // Prefer cart fulfillment whenever a cart order was stamped — covers
  // /api/store/purchase (single item saved as cart) and multi-item carts.
  if (meta.cartOrderId) {
    const result = await finalizePaidCartSale({
      cartOrderId: meta.cartOrderId,
      stripeSessionId,
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

  if (meta.type === "store_listing" && meta.planId && meta.listingId) {
    const format = meta.format === "cad" ? "cad" : "pdf";
    const amountThb = Math.max(
      1,
      Math.round(Number(meta.amountThb) || (session.amount_total ?? 0) / 100),
    );
    const result = await finalizePaidListingSale({
      listingId: meta.listingId,
      planId: meta.planId,
      format,
      amountThb,
      stripeSessionId,
      buyerUserId: userId,
    });
    return {
      kind: "listing",
      planIds: result.planIds,
      grants: result.grants,
    };
  }

  // Legacy workspace export — unlock files only, no vendor commission.
  if (meta.planId && (meta.format === "pdf" || meta.format === "cad")) {
    const existing = await findGrantByStripeSession(stripeSessionId);
    if (existing) {
      return {
        kind: "workspace",
        planIds: [meta.planId],
        grants: [existing],
      };
    }
    const grant = createDownloadToken(
      meta.planId,
      meta.format,
      userId,
      stripeSessionId,
    );
    await storeDownloadGrant(grant);
    return {
      kind: "workspace",
      planIds: [meta.planId],
      grants: [grant],
    };
  }

  return {
    kind: "ignored",
    reason: "unrecognized_checkout_metadata",
    planIds: planIdsFromMeta,
  };
}

export function isCheckoutSessionPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === "paid";
}
