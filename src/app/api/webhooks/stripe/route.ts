import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, getStripeWebhookReadiness } from "@/lib/payments/stripe";
import {
  beginWebhookEvent,
  completeWebhookEvent,
} from "@/lib/payments/webhook-events";
import {
  fulfillPaidCheckoutSession,
  isCheckoutSessionPaid,
} from "@/lib/payments/fulfill-checkout";

/**
 * Stripe payment webhook — signature-verified fulfillment.
 *
 * Stripe Dashboard → Developers → Webhooks → endpoint:
 *   POST https://<domain>/api/webhooks/stripe
 *   events:
 *     - checkout.session.completed
 *     - checkout.session.async_payment_succeeded  (PromptPay / delayed methods)
 *     - checkout.session.async_payment_failed
 *
 * Local:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export const runtime = "nodejs";

const FULFILLABLE_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export async function POST(request: NextRequest) {
  const readiness = getStripeWebhookReadiness();
  if (!readiness.ok) {
    return NextResponse.json(
      { error: readiness.error, missing: readiness.missing },
      { status: readiness.status },
    );
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!.trim();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe client unavailable", missing: ["STRIPE_SECRET_KEY"] },
      { status: 503 },
    );
  }

  // Raw body required for constructEvent — do not use request.json().
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[payment-webhook] signature verification failed", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await beginWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      stripeSessionId: session.id,
      cartOrderId: session.metadata?.cartOrderId,
      status: "ignored",
      payload: {
        id: event.id,
        type: event.type,
        sessionId: session.id,
        paymentStatus: session.payment_status,
      },
      errorMessage: "async_payment_failed",
    });
    return NextResponse.json({ received: true, failed: true });
  }

  if (!FULFILLABLE_EVENTS.has(event.type)) {
    await beginWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      status: "ignored",
      payload: { id: event.id, type: event.type },
    });
    return NextResponse.json({ received: true, ignored: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};
  const planIdsFromMeta = (meta.planIds ?? meta.planId ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { isNew } = await beginWebhookEvent({
    eventId: event.id,
    eventType: event.type,
    stripeSessionId: session.id,
    cartOrderId: meta.cartOrderId,
    planIds: planIdsFromMeta,
    amountTotal: session.amount_total,
    currency: session.currency,
    status: "received",
    payload: {
      id: event.id,
      type: event.type,
      sessionId: session.id,
      paymentStatus: session.payment_status,
      metadata: meta,
    },
  });

  // Idempotent: Stripe retries deliver the same event.id.
  if (!isNew) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Card: completed + paid. PromptPay: often unpaid on completed, then async_payment_succeeded.
  if (event.type === "checkout.session.completed" && !isCheckoutSessionPaid(session)) {
    await completeWebhookEvent(event.id, {
      status: "ignored",
      planIds: planIdsFromMeta,
      errorMessage: `awaiting_async_payment payment_status=${session.payment_status}`,
    });
    return NextResponse.json({ received: true, pending: true });
  }

  if (
    event.type === "checkout.session.async_payment_succeeded" &&
    !isCheckoutSessionPaid(session)
  ) {
    // Extremely rare — still refuse to unlock without paid status.
    await completeWebhookEvent(event.id, {
      status: "ignored",
      planIds: planIdsFromMeta,
      errorMessage: `async_succeeded_but_unpaid payment_status=${session.payment_status}`,
    });
    return NextResponse.json({ received: true, pending: true });
  }

  try {
    const result = await fulfillPaidCheckoutSession(session);

    if (result.kind === "ignored") {
      await completeWebhookEvent(event.id, {
        status: "ignored",
        planIds: result.planIds,
        errorMessage: result.reason,
      });
      return NextResponse.json({ received: true, ignored: true, reason: result.reason });
    }

    console.info(
      `[payment-webhook] ${event.type} → unlocked ${result.planIds.join(", ") || "(none)"} (${result.kind})`,
    );
    await completeWebhookEvent(event.id, {
      status: "fulfilled",
      planIds: result.planIds,
      cartOrderId: result.kind === "cart" ? result.cartOrderId : meta.cartOrderId,
    });
    return NextResponse.json({
      received: true,
      fulfilled: true,
      kind: result.kind,
      planIds: result.planIds,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "fulfillment failed";
    console.error("[payment-webhook] fulfillment error", err);
    await completeWebhookEvent(event.id, {
      status: "failed",
      planIds: planIdsFromMeta,
      cartOrderId: meta.cartOrderId,
      errorMessage: message,
    });
    // 500 so Stripe retries — better than silently losing a paid unlock.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
