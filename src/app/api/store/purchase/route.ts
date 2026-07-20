import { NextRequest, NextResponse } from "next/server";
import {
  createCheckoutSession,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import { createDownloadToken, storeDownloadGrant } from "@/lib/payments/tokens";
import { getListingById, getListings } from "@/lib/store/db";
import { getViewerFromRequest } from "@/lib/user/identity";
import { loadPlanDocument } from "@/lib/plans/store";
import { DEFAULT_PROJECT } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const listingId = body.listingId as string;
  const format = (body.format as "pdf" | "cad") ?? "pdf";
  const method = (body.method as "stripe" | "promptpay") ?? "promptpay";
  const countryCode = (body.countryCode as string) ?? "TH";
  const buyerUserId = body.userId as string | undefined;

  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }

  const viewer = getViewerFromRequest(request);
  const visible = await getListings(viewer);
  const listing = await getListingById(listingId);

  if (!listing || !visible.some((l) => l.id === listing.id)) {
    return NextResponse.json({ error: "Listing not available" }, { status: 404 });
  }

  const planId = listing.planId;
  const planDoc = await loadPlanDocument(planId);
  if (!planDoc) {
    return NextResponse.json({ error: "Plan files not ready" }, { status: 422 });
  }

  const project = listing.projectSnapshot ?? DEFAULT_PROJECT;
  const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;

  if (isStripeConfigured()) {
    const stripe = await import("@/lib/payments/stripe");
    const checkout = await stripe.createCheckoutSession({
      format,
      method,
      planId,
      project,
      countryCode,
      userId: buyerUserId,
      successUrl: `${baseUrl}/store?payment=success&listingId=${listingId}&planId=${planId}&format=${format}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/store?payment=cancelled`,
    });

    if (checkout) {
      return NextResponse.json({
        requiresCheckout: true,
        checkoutUrl: checkout.url,
        sessionId: checkout.sessionId,
        amount: listing.price,
        currency: listing.priceBreakdown?.currency ?? "THB",
      });
    }
  }

  await new Promise((r) => setTimeout(r, 500));
  const grant = createDownloadToken(planId, format, buyerUserId);
  await storeDownloadGrant(grant);

  return NextResponse.json({
    success: true,
    format,
    amount: listing.price,
    downloadToken: grant.token,
    planId,
    message: "Purchase confirmed — download unlocked",
  });
}
