import { NextRequest, NextResponse } from "next/server";
import {
  createCartCheckoutSession,
  getStripeCheckoutReadiness,
  isMockPaymentsAllowed,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import {
  computeCheckoutTotal,
  type CartLineItem,
  type UpsellAddonId,
  BOQ_BUNDLE_PRICE,
  HARDCOPY_3SETS_PRICE,
  isUpsellAddonId,
} from "@/lib/store/cart-pricing";
import {
  createCartOrderId,
  saveCartOrder,
} from "@/lib/store/cart-orders";
import { finalizePaidCartSale } from "@/lib/commerce/finalize-sale";
import { getListingById, getListings } from "@/lib/store/db";
import { isListingPurchasable } from "@/lib/store/listing-purchase";
import { getViewerFromRequest } from "@/lib/user/identity";
import { loadPlanDocument } from "@/lib/plans/store";
import { resolveCheckoutCurrency } from "@/lib/checkout/pipeline";
import { defaultPaymentMethod, type PaymentMethodId } from "@/lib/payments/methods";
import { convertFromThb, formatMoney, type Currency } from "@/lib/currency";
import { isUiLocale, type UiLocale } from "@/lib/geo/countries";
import { resolvePlanDocumentId } from "@/lib/store/plan-identity";
import { getListingBlueprintUrls } from "@/lib/store/listing-blueprints";
import {
  documentLanguageToStampLocale,
  localizationSurchargeThb,
  resolveCheckoutDocumentLanguage,
} from "@/lib/store/document-languages";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";
import {
  isShippingAddressComplete,
  normalizeShippingAddress,
} from "@/lib/store/shipping-address";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = (body.items as CartLineItem[]) ?? [];
  const addons = ((body.addons as UpsellAddonId[]) ?? []).filter(isUpsellAddonId);
  const countryCode = THAI_DOMESTIC_MARKET
    ? "TH"
    : String(body.countryCode ?? "TH").toUpperCase();
  const buyerUserId = body.userId as string | undefined;
  const buyerName = String(body.buyerName ?? "").trim();
  const buyerEmail = String(body.buyerEmail ?? "").trim().toLowerCase();
  const locale = typeof body.locale === "string" ? body.locale : body.uiLocale;
  const uiLocale: UiLocale = isUiLocale(locale) ? locale : "en";
  const targetCountry = THAI_DOMESTIC_MARKET
    ? "TH"
    : String(body.target_country ?? body.targetCountry ?? countryCode)
        .toUpperCase()
        .slice(0, 8);
  const currency: Currency = THAI_DOMESTIC_MARKET
    ? "THB"
    : resolveCheckoutCurrency({
        countryCode,
        targetCountry,
        currencyOverride:
          body.currency === "THB" || body.currency === "USD" ? body.currency : undefined,
      });
  const method: PaymentMethodId =
    body.method === "promptpay" || body.method === "card"
      ? body.method
      : defaultPaymentMethod(currency, currency === "THB" ? "TH" : targetCountry);
  const documentLanguage = THAI_DOMESTIC_MARKET
    ? "th"
    : resolveCheckoutDocumentLanguage(body.documentLanguage, targetCountry);
  const wantsHardcopy = addons.includes("hardcopy-3sets");
  const shippingAddress = wantsHardcopy
    ? normalizeShippingAddress(body.shippingAddress)
    : undefined;

  if (!items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
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
  const visibleIds = new Set(visible.map((l) => l.id));

  const orderItems: {
    listingId: string;
    planId: string;
    planDocumentId?: string;
    name: string;
    price: number;
  }[] = [];

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
    if (!isListingPurchasable(listing)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          code: "PURCHASE_LOCKED",
          is_approved: false,
          listingId: listing.id,
          message: `แบบบ้าน “${listing.name}” ยังไม่เปิดให้ซื้อ — รอแอดมินอนุมัติ (is_approved=false)`,
        },
        { status: 403 },
      );
    }
    const planCode = listing.planCode || listing.planId;
    const planDocumentId = resolvePlanDocumentId(listing);
    const blueprintUrls = await getListingBlueprintUrls(listing.id);
    // Marketplace delivery is vendor-uploaded PDFs. Generative docs are legacy only.
    if (blueprintUrls.length === 0) {
      if (!planDocumentId) {
        return NextResponse.json(
          { error: `Plan files not ready for ${listing.name} — seller must upload blueprint PDFs` },
          { status: 422 },
        );
      }
      const planDoc = await loadPlanDocument(planDocumentId);
      if (!planDoc) {
        return NextResponse.json(
          { error: `Plan files not ready for ${listing.name}` },
          { status: 422 },
        );
      }
    }
    orderItems.push({
      listingId: listing.id,
      planId: planCode,
      planDocumentId,
      name: listing.name,
      price: listing.price,
    });
  }

  const languageSurcharge = localizationSurchargeThb(targetCountry);
  const pricing = computeCheckoutTotal(
    orderItems.map((o) => ({
      listingId: o.listingId,
      planId: o.planId,
      planDocumentId: o.planDocumentId,
      name: o.name,
      price: o.price,
      image: "",
      style: "",
      floors: 1 as const,
    })),
    addons,
    languageSurcharge,
  );

  // Orders store base THB totals; `currency` is the charge/display currency.
  const orderId = createCartOrderId();
  const stampLocale = documentLanguageToStampLocale(documentLanguage);
  const order = {
    id: orderId,
    items: orderItems,
    addons,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    addonTotal: pricing.addonTotal,
    languageSurcharge: pricing.languageSurcharge,
    total: pricing.total,
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

  const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;

  // All free plans + no paid add-ons — grant without Stripe.
  if (pricing.total === 0) {
    const result = await finalizePaidCartSale({
      cartOrderId: orderId,
      buyerUserId,
    });
    return NextResponse.json({
      success: true,
      free: true,
      orderId,
      amountThb: 0,
      currency,
      documentLanguage,
      grants: result?.grants ?? [],
      downloadToken: result?.grants[0]?.token,
    });
  }

  if (isStripeConfigured()) {
    const plansTotal = pricing.subtotal - pricing.discount;
    const lineItems = [
      {
        name:
          orderItems.length === 1
            ? `${orderItems[0].name} (${orderItems[0].planId})`
            : `House plans (${orderItems.length}): ${orderItems.map((o) => o.planId).join(", ")}`.slice(
                0,
                120,
              ),
        amount: plansTotal, // THB base — gateway converts
      },
    ];

    if (pricing.languageSurcharge > 0) {
      lineItems.push({
        name: `Localization & units (${targetCountry})`,
        amount: pricing.languageSurcharge,
      });
    }

    if (addons.includes("boq-bundle")) {
      lineItems.push({
        name: "แพ็ค BOQ เสริม (รายการคำนวณราคาก่อสร้างและประมาณการวัสดุ)",
        amount: BOQ_BUNDLE_PRICE,
      });
    }

    if (addons.includes("hardcopy-3sets")) {
      lineItems.push({
        name: "รับเอกสารรูปเล่ม 3 ชุด (Physical Hard Copy Documents)",
        amount: HARDCOPY_3SETS_PRICE,
      });
    }

    const checkout = await createCartCheckoutSession({
      cartOrderId: orderId,
      planIds: orderItems.map((o) => o.planId),
      lineItems,
      currency,
      method,
      countryCode,
      targetCountry,
      userId: buyerUserId,
      uiLocale,
      documentLanguage,
      buyerName,
      buyerEmail,
      successUrl: `${baseUrl}/store?payment=success&cartOrderId=${orderId}&session_id={CHECKOUT_SESSION_ID}&locale=${stampLocale}&docLang=${documentLanguage}`,
      cancelUrl: `${baseUrl}/store?payment=cancelled`,
    });

    if (checkout) {
      return NextResponse.json({
        requiresCheckout: true,
        checkoutUrl: checkout.url,
        sessionId: checkout.sessionId,
        orderId,
        amountThb: pricing.total,
        amountDisplay: checkout.totalDisplay,
        amountFormatted: formatMoney(pricing.total, currency),
        currency,
        uiLocale,
        method,
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

  // Explicit opt-in mock only — never auto-unlock when Stripe keys are missing.
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
    "[cart-checkout] ALLOW_MOCK_PAYMENTS=true — unlocking without Stripe (dev only)",
  );
  await new Promise((r) => setTimeout(r, 500));
  const result = await finalizePaidCartSale({
    cartOrderId: orderId,
    buyerUserId,
  });
  const grants = result?.grants ?? [];

  return NextResponse.json({
    success: true,
    mock: true,
    orderId,
    amountThb: pricing.total,
    amountDisplay: convertFromThb(pricing.total, currency),
    amountFormatted: formatMoney(pricing.total, currency),
    currency,
    uiLocale,
    documentLanguage,
    targetCountry,
    translation: result?.translation
      ? {
          status: result.translation.status,
          target_country: result.translation.target_country,
        }
      : undefined,
    downloads: grants.map((g) => ({
      token: g.token,
      planId: g.planId,
      format: g.format,
      docLang: documentLanguage,
      targetCountry,
      downloadUrl: `/api/download?token=${g.token}&format=${g.format}&locale=${stampLocale}&buyer=${encodeURIComponent(buyerName)}&docLang=${documentLanguage}`,
    })),
    message:
      "Mock cart purchase confirmed (ALLOW_MOCK_PAYMENTS) — set STRIPE_SECRET_KEY for live payments",
  });
}
