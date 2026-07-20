import { NextRequest, NextResponse } from "next/server";
import {
  computePrice,
  createCheckoutSession,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import { createDownloadToken, storeDownloadGrant } from "@/lib/payments/tokens";
import type { ProjectInput } from "@/lib/ai/types";

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
      successUrl: `${baseUrl}/workspace?payment=success&planId=${planId}&format=${format}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/workspace?payment=cancelled`,
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
  }

  // Dev/mock path when Stripe not configured
  await new Promise((r) => setTimeout(r, 600));
  const grant = createDownloadToken(planId, format, userId);
  await storeDownloadGrant(grant);

  return NextResponse.json({
    success: true,
    format,
    method,
    amount,
    currency: currency.toUpperCase(),
    downloadToken: grant.token,
    message: isStripeConfigured()
      ? "Payment confirmed"
      : "Mock payment confirmed (set STRIPE_SECRET_KEY for live payments)",
  });
}
