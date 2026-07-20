import { NextRequest, NextResponse } from "next/server";
import {
  createDownloadToken,
  findGrantByStripeSession,
  findGrantsByStripeSession,
  fulfillCartDownloads,
  storeDownloadGrant,
} from "@/lib/payments/tokens";
import { getStripe } from "@/lib/payments/stripe";
import { getCartOrder, markCartOrderPaid } from "@/lib/store/cart-orders";

/** Poll/confirm Stripe checkout and return download token(s) */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  const existingGrants = await findGrantsByStripeSession(sessionId);
  if (existingGrants.length > 0) {
    if (existingGrants.length === 1) {
      const g = existingGrants[0];
      return NextResponse.json({
        success: true,
        downloadToken: g.token,
        format: g.format,
        planId: g.planId,
      });
    }
    return NextResponse.json({
      success: true,
      cart: true,
      downloads: existingGrants.map((g) => ({
        token: g.token,
        planId: g.planId,
        format: g.format,
      })),
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ success: false, status: session.payment_status });
  }

  const cartOrderId = session.metadata?.cartOrderId;
  const userId = session.metadata?.userId || undefined;

  if (cartOrderId && session.metadata?.type === "store_cart") {
    const order = await getCartOrder(cartOrderId);
    if (!order) {
      return NextResponse.json({ error: "Cart order not found" }, { status: 404 });
    }

    await markCartOrderPaid(cartOrderId, sessionId);
    const grants = await fulfillCartDownloads(
      order.items,
      order.addons.includes("cad-bundle"),
      userId,
      sessionId,
    );

    return NextResponse.json({
      success: true,
      cart: true,
      orderId: cartOrderId,
      downloads: grants.map((g) => ({
        token: g.token,
        planId: g.planId,
        format: g.format,
      })),
    });
  }

  const planId = session.metadata?.planId;
  const format = session.metadata?.format as "pdf" | "cad" | undefined;

  if (planId && (format === "pdf" || format === "cad")) {
    const existing = await findGrantByStripeSession(sessionId);
    if (existing) {
      return NextResponse.json({
        success: true,
        downloadToken: existing.token,
        format: existing.format,
        planId: existing.planId,
      });
    }

    const grant = createDownloadToken(planId, format, userId, sessionId);
    await storeDownloadGrant(grant);
    return NextResponse.json({
      success: true,
      downloadToken: grant.token,
      format: grant.format,
      planId: grant.planId,
    });
  }

  return NextResponse.json({
    success: false,
    pending: true,
    message: "Payment received but order metadata missing",
  });
}
