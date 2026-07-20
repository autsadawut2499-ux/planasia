import { NextRequest, NextResponse } from "next/server";
import {
  createCartCheckoutSession,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import { fulfillCartDownloads } from "@/lib/payments/tokens";
import { computeCartTotal, type CartLineItem, type UpsellAddonId, CAD_BUNDLE_PRICE } from "@/lib/store/cart-pricing";
import {
  createCartOrderId,
  markCartOrderPaid,
  saveCartOrder,
} from "@/lib/store/cart-orders";
import { getListingById, getListings } from "@/lib/store/db";
import { getViewerFromRequest } from "@/lib/user/identity";
import { loadPlanDocument } from "@/lib/plans/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = (body.items as CartLineItem[]) ?? [];
  const addons = (body.addons as UpsellAddonId[]) ?? [];
  const method = (body.method as "stripe" | "promptpay") ?? "promptpay";
  const countryCode = (body.countryCode as string) ?? "TH";
  const buyerUserId = body.userId as string | undefined;

  if (!items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const viewer = getViewerFromRequest(request);
  const visible = await getListings(viewer);
  const visibleIds = new Set(visible.map((l) => l.id));

  const orderItems: { listingId: string; planId: string; name: string; price: number }[] = [];

  for (const item of items) {
    if (!visibleIds.has(item.listingId)) {
      return NextResponse.json(
        { error: `Listing ${item.name} is not available` },
        { status: 404 },
      );
    }
    const listing = await getListingById(item.listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    const planDoc = await loadPlanDocument(listing.planId);
    if (!planDoc) {
      return NextResponse.json(
        { error: `Plan files not ready for ${listing.name}` },
        { status: 422 },
      );
    }
    orderItems.push({
      listingId: listing.id,
      planId: listing.planId,
      name: listing.name,
      price: listing.price,
    });
  }

  const pricing = computeCartTotal(
    orderItems.map((o) => ({
      listingId: o.listingId,
      planId: o.planId,
      name: o.name,
      price: o.price,
      image: "",
      style: "",
      floors: 1 as const,
    })),
    addons,
  );

  const currency =
    (await getListingById(orderItems[0].listingId))?.priceBreakdown?.currency ?? "THB";

  const orderId = createCartOrderId();
  const order = {
    id: orderId,
    items: orderItems,
    addons,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    addonTotal: pricing.addonTotal,
    total: pricing.total,
    currency,
    buyerUserId,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };

  await saveCartOrder(order);

  const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;

  if (isStripeConfigured()) {
    const plansTotal = pricing.subtotal - pricing.discount;
    const lineItems = [
      {
        name:
          orderItems.length === 1
            ? orderItems[0].name
            : `House plans (${orderItems.length})`,
        amount: plansTotal,
      },
    ];

    if (addons.includes("cad-bundle")) {
      lineItems.push({
        name: "CAD bundle add-on",
        amount: CAD_BUNDLE_PRICE,
      });
    }

    const checkout = await createCartCheckoutSession({
      cartOrderId: orderId,
      lineItems,
      currency,
      method,
      countryCode,
      userId: buyerUserId,
      successUrl: `${baseUrl}/store?payment=success&cartOrderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/store?payment=cancelled`,
    });

    if (checkout) {
      return NextResponse.json({
        requiresCheckout: true,
        checkoutUrl: checkout.url,
        sessionId: checkout.sessionId,
        orderId,
        amount: pricing.total,
        currency,
      });
    }
  }

  await new Promise((r) => setTimeout(r, 500));
  await markCartOrderPaid(orderId);
  const grants = await fulfillCartDownloads(
    orderItems,
    addons.includes("cad-bundle"),
    buyerUserId,
  );

  return NextResponse.json({
    success: true,
    orderId,
    amount: pricing.total,
    currency,
    downloads: grants.map((g) => ({
      token: g.token,
      planId: g.planId,
      format: g.format,
    })),
    message: "Cart purchase confirmed — downloads unlocked",
  });
}
