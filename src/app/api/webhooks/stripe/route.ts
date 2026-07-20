import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";
import { createDownloadToken, findGrantByStripeSession, storeDownloadGrant } from "@/lib/payments/tokens";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const existing = await findGrantByStripeSession(session.id);
    if (!existing) {
      const planId = session.metadata?.planId;
      const format = session.metadata?.format as "pdf" | "cad" | undefined;
      const userId = session.metadata?.userId || undefined;

      if (planId && (format === "pdf" || format === "cad")) {
        const grant = createDownloadToken(planId, format, userId, session.id);
        await storeDownloadGrant(grant);
      }
    }
  }

  return NextResponse.json({ received: true });
}
