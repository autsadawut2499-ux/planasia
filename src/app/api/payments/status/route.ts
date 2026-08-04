import { NextResponse } from "next/server";
import { getStripeStackStatus } from "@/lib/payments/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/payments/status
 * Ops diagnostic — which Stripe keys/routes are ready (no secrets returned).
 */
export async function GET() {
  const status = getStripeStackStatus();
  return NextResponse.json({
    ok: status.checkoutReady || status.paymentIntentReady,
    ...status,
    hint: status.webhookReady
      ? "Stripe stack looks ready. Register webhook events in Dashboard if not already."
      : "Set STRIPE_WEBHOOK_SECRET and point Dashboard webhook to /api/webhooks/stripe",
  });
}
