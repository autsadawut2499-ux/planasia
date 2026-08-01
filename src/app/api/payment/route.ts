import { NextRequest, NextResponse } from "next/server";
import {
  computePrice,
  createCheckoutSession,
  getStripeCheckoutReadiness,
  isMockPaymentsAllowed,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import { createDownloadToken, storeDownloadGrant } from "@/lib/payments/tokens";
import type { ProjectInput } from "@/lib/ai/types";

/**
 * Legacy workspace-style payment entry.
 * Prefer /api/store/cart/checkout and /api/store/purchase for marketplace sales.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const format = body.format as "pdf" | "cad";
  const method = body.method as "stripe" | "promptpay";
  const project = body.project as ProjectInput;
  const planId = body.planId as string;
  const userId = body.userId as string | undefined;
  const countryCode = (body.countryCode as string) ?? "TH";

  if (!planId || !project) {
    return NextResponse.json({ error: "planId and project required" }, { status: 400 });
  }

  const { amount, currency } = computePrice(format, project, countryCode);
  const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;

  if (isStripeConfigured()) {
    const checkout = await createCheckoutSession({
      format,
      method,
      planId,
      project,
      countryCode,
      userId,
      successUrl: `${baseUrl}/store?payment=success&planId=${planId}&format=${format}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/store?payment=cancelled`,
    });

    if (checkout) {
      return NextResponse.json({
        success: false,
        requiresCheckout: true,
        checkoutUrl: checkout.url,
        sessionId: checkout.sessionId,
        amount,
        currency: currency.toUpperCase(),
      });
    }

    return NextResponse.json(
      {
        error:
          "Failed to create Stripe Checkout session. Check STRIPE_SECRET_KEY and payment method availability.",
      },
      { status: 502 },
    );
  }

  if (!isMockPaymentsAllowed()) {
    const readiness = getStripeCheckoutReadiness();
    return NextResponse.json(
      {
        error: readiness.ok ? "Stripe is not configured" : readiness.error,
        missing: readiness.ok ? ["STRIPE_SECRET_KEY"] : readiness.missing,
      },
      { status: 503 },
    );
  }

  console.warn(
    "[payment] ALLOW_MOCK_PAYMENTS=true — unlocking without Stripe (dev only)",
  );
  await new Promise((r) => setTimeout(r, 600));
  const grant = createDownloadToken(planId, format, userId);
  await storeDownloadGrant(grant);

  return NextResponse.json({
    success: true,
    mock: true,
    format,
    method,
    amount,
    currency: currency.toUpperCase(),
    downloadToken: grant.token,
    message:
      "Mock payment confirmed (ALLOW_MOCK_PAYMENTS) — set STRIPE_SECRET_KEY for live payments",
  });
}
