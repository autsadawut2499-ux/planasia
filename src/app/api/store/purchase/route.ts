import { NextRequest, NextResponse } from "next/server";
import {
  createCheckoutSession,
  getStripeCheckoutReadiness,
  isMockPaymentsAllowed,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import { finalizePaidCartSale } from "@/lib/commerce/finalize-sale";
import { getListingById, getListings } from "@/lib/store/db";
import { isListingPurchasable } from "@/lib/store/listing-purchase";
import { getViewerFromRequest } from "@/lib/user/identity";
import { loadPlanDocument } from "@/lib/plans/store";
import { DEFAULT_PROJECT } from "@/lib/ai/types";
import { resolvePlanDocumentId } from "@/lib/store/plan-identity";
import { getListingBlueprintUrls } from "@/lib/store/listing-blueprints";
import {
  documentLanguageToStampLocale,
  localizationSurchargeThb,
  resolveCheckoutDocumentLanguage,
} from "@/lib/store/document-languages";
import {
  BOQ_BUNDLE_PRICE,
  HARDCOPY_3SETS_PRICE,
  computeAddonTotal,
  isUpsellAddonId,
  type UpsellAddonId,
} from "@/lib/store/cart-pricing";
import { createCartOrderId, saveCartOrder } from "@/lib/store/cart-orders";
import { resolveCheckoutCurrency } from "@/lib/checkout/pipeline";
import { isCurrency, type Currency } from "@/lib/currency";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";
import { defaultPaymentMethod, type PaymentMethodId } from "@/lib/payments/methods";
import {
  isShippingAddressComplete,
  normalizeShippingAddress,
} from "@/lib/store/shipping-address";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const listingId = body.listingId as string;
  const format = (body.format as "pdf" | "cad") ?? "pdf";
  const countryCode = THAI_DOMESTIC_MARKET
    ? "TH"
    : String(body.countryCode ?? "TH").toUpperCase();
  const buyerUserId = body.userId as string | undefined;
  const buyerName = String(body.buyerName ?? "").trim();
  const buyerEmail = String(body.buyerEmail ?? "").trim().toLowerCase();
  const targetCountry = THAI_DOMESTIC_MARKET
    ? "TH"
    : String(body.target_country ?? body.targetCountry ?? countryCode)
        .toUpperCase()
        .slice(0, 8);
  const documentLanguage = THAI_DOMESTIC_MARKET
    ? "th"
    : resolveCheckoutDocumentLanguage(body.documentLanguage, targetCountry);
  const addons = (Array.isArray(body.addons) ? body.addons : []).filter(
    (a: unknown): a is UpsellAddonId => isUpsellAddonId(a),
  );
  const wantsHardcopy = addons.includes("hardcopy-3sets");
  const shippingAddress = wantsHardcopy
    ? normalizeShippingAddress(body.shippingAddress)
    : undefined;
  const visitorCountryCode = String(
    body.visitorCountryCode ?? body.countryCode ?? countryCode,
  ).toUpperCase();
  const currency: Currency = resolveCheckoutCurrency({
    countryCode: visitorCountryCode,
    targetCountry,
    currencyOverride: isCurrency(body.currency) ? body.currency : undefined,
  });
  const requestedMethod: PaymentMethodId =
    body.method === "promptpay" || body.method === "card"
      ? body.method
      : body.method === "stripe"
        ? "card"
        : defaultPaymentMethod(currency, visitorCountryCode);
  const method = requestedMethod;

  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }
  if (buyerName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
    return NextResponse.json(
      { error: "Valid buyer name and email are required" },
      { status: 400 },
    );
  }
  if (wantsHardcopy && !isShippingAddressComplete(shippingAddress)) {
    return NextResponse.json(
      { error: "Complete shipping address is required for hardcopy delivery" },
      { status: 400 },
    );
  }

  const viewer = getViewerFromRequest(request);
  const visible = await getListings(viewer);
  const listing = await getListingById(listingId);

  if (!listing || !visible.some((l) => l.id === listing.id)) {
    return NextResponse.json({ error: "Listing not available" }, { status: 404 });
  }
  if (!isListingPurchasable(listing)) {
    return NextResponse.json(
      {
        error: "Forbidden",
        code: "PURCHASE_LOCKED",
        is_approved: false,
        message: "แบบบ้านนี้แสดงบนเว็บแล้ว แต่ยังไม่เปิดให้ซื้อ — รอแอดมินอนุมัติ (is_approved=false)",
      },
      { status: 403 },
    );
  }

  const planCode = listing.planCode || listing.planId;
  const planDocumentId = resolvePlanDocumentId(listing);
  const blueprintUrls = await getListingBlueprintUrls(listing.id);
  if (blueprintUrls.length === 0) {
    if (!planDocumentId) {
      return NextResponse.json(
        { error: "Plan files not ready — seller must upload blueprint PDFs" },
        { status: 422 },
      );
    }
    const planDoc = await loadPlanDocument(planDocumentId);
    if (!planDoc) {
      return NextResponse.json({ error: "Plan files not ready" }, { status: 422 });
    }
  }

  const languageSurcharge = localizationSurchargeThb(targetCountry);
  const addonTotal = computeAddonTotal(addons);
  const amountThb = Math.max(0, Math.round(listing.price + languageSurcharge + addonTotal));
  const stampLocale = documentLanguageToStampLocale(documentLanguage);

  // Persist as a one-item cart order so language/buyer survive webhooks.
  const orderId = createCartOrderId();
  const order = {
    id: orderId,
    items: [
      {
        listingId: listing.id,
        planId: planCode,
        planDocumentId,
        name: listing.name,
        price: listing.price,
      },
    ],
    addons,
    subtotal: listing.price,
    discount: 0,
    addonTotal,
    languageSurcharge,
    total: amountThb,
    currency,
    buyerUserId,
    buyerName,
    buyerEmail,
    documentLanguage,
    targetCountry,
    translationStatus: "pending" as const,
    shippingAddress,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
  await saveCartOrder(order);

  const project = {
    ...(listing.projectSnapshot ?? DEFAULT_PROJECT),
    projectName: listing.name || listing.projectSnapshot?.projectName || planCode,
  };
  const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;

  // Free listing (price 0) with no paid add-ons — grant without Stripe.
  if (amountThb === 0) {
    const result = await finalizePaidCartSale({
      cartOrderId: orderId,
      buyerUserId,
    });
    const grant =
      result?.grants.find((g) => g.format === format) ?? result?.grants[0];
    return NextResponse.json({
      success: true,
      free: true,
      downloadToken: grant?.token,
      planId: planCode,
      planDocumentId,
      orderId,
      amount: 0,
      currency,
      documentLanguage,
    });
  }

  if (isStripeConfigured()) {
    const checkout = await createCheckoutSession({
      format,
      method,
      planId: planCode,
      listingId: listing.id,
      amountThb,
      project,
      countryCode: visitorCountryCode,
      targetCountry,
      currency,
      userId: buyerUserId,
      buyerName,
      buyerEmail,
      documentLanguage,
      cartOrderId: orderId,
      lineItemExtras: [
        ...(languageSurcharge > 0
          ? [
              {
                name: `Localization & units (${targetCountry})`,
                amount: languageSurcharge,
              },
            ]
          : []),
        ...(addons.includes("boq-bundle")
          ? [
              {
                name: "แพ็ค BOQ เสริม (รายการคำนวณราคาก่อสร้างและประมาณการวัสดุ)",
                amount: BOQ_BUNDLE_PRICE,
              },
            ]
          : []),
        ...(addons.includes("hardcopy-3sets")
          ? [
              {
                name: "รับเอกสารรูปเล่ม 3 ชุด (Physical Hard Copy Documents)",
                amount: HARDCOPY_3SETS_PRICE,
              },
            ]
          : []),
      ],
      successUrl: `${baseUrl}/store?payment=success&cartOrderId=${orderId}&listingId=${listingId}&planId=${planCode}&format=${format}&session_id={CHECKOUT_SESSION_ID}&locale=${stampLocale}&docLang=${documentLanguage}`,
      cancelUrl: `${baseUrl}/store?payment=cancelled`,
    });

    if (checkout) {
      return NextResponse.json({
        requiresCheckout: true,
        checkoutUrl: checkout.url,
        sessionId: checkout.sessionId,
        amount: amountThb,
        currency,
        planId: planCode,
        planDocumentId,
        orderId,
        documentLanguage,
      });
    }

    return NextResponse.json(
      {
        error: "Failed to create Stripe Checkout session. Check STRIPE_SECRET_KEY and payment method availability.",
        orderId,
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
        orderId,
      },
      { status: 503 },
    );
  }

  console.warn(
    "[store-purchase] ALLOW_MOCK_PAYMENTS=true — unlocking without Stripe (dev only)",
  );
  await new Promise((r) => setTimeout(r, 400));
  const result = await finalizePaidCartSale({
    cartOrderId: orderId,
    buyerUserId,
  });
  const grant =
    result?.grants.find((g) => g.format === format) ?? result?.grants[0];

  return NextResponse.json({
    success: true,
    mock: true,
    format,
    amount: amountThb,
    downloadToken: grant?.token,
    planId: planCode,
    planDocumentId,
    orderId,
    documentLanguage,
    targetCountry,
    translation: result?.translation
      ? {
          status: result.translation.status,
          target_country: result.translation.target_country,
        }
      : undefined,
    message: `Mock purchase confirmed (ALLOW_MOCK_PAYMENTS) — ${planCode} unlocked`,
  });
}
