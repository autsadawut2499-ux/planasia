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
  HARDCOPY_3SETS_PRICE,
  isUpsellAddonId,
  resolveAddonBoqPrice,
  resolveAddonCalcPrice,
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
import { convertFromThb, formatMoney, isCurrency, type Currency } from "@/lib/currency";
import { isUiLocale, type UiLocale } from "@/lib/geo/countries";
import { resolvePlanDocumentId } from "@/lib/store/plan-identity";
import { getListingBlueprintUrls } from "@/lib/store/listing-assets";
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
import {
  googleLoginRequiredResponse,
  requireBuyerSession,
  resolveBuyerCheckoutIdentity,
  validateBuyerCheckoutIdentity,
} from "@/lib/auth/buyer-session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items = (body.items as CartLineItem[]) ?? [];
  const addons = ((body.addons as UpsellAddonId[]) ?? []).filter(isUpsellAddonId);
  const countryCode = THAI_DOMESTIC_MARKET
    ? "TH"
    : String(body.countryCode ?? "TH").toUpperCase();
  const buyerSession = await requireBuyerSession();
  if (!buyerSession) {
    return NextResponse.json(googleLoginRequiredResponse(), { status: 401 });
  }
  const buyer = resolveBuyerCheckoutIdentity(buyerSession, body);
  const buyerUserId = buyer.userId;
  const buyerName = buyer.name;
  const buyerEmail = buyer.email;
  const buyerPhone = buyer.phone;
  const locale = typeof body.locale === "string" ? body.locale : body.uiLocale;
  const uiLocale: UiLocale = isUiLocale(locale) ? locale : "en";
  const targetCountry = THAI_DOMESTIC_MARKET
    ? "TH"
    : String(body.target_country ?? body.targetCountry ?? countryCode)
        .toUpperCase()
        .slice(0, 8);
  const visitorCountryCode = String(
    body.visitorCountryCode ?? body.countryCode ?? countryCode,
  ).toUpperCase();
  const currency: Currency = resolveCheckoutCurrency({
    countryCode: visitorCountryCode,
    targetCountry,
    currencyOverride: isCurrency(body.currency) ? body.currency : undefined,
  });
  const method: PaymentMethodId =
    body.method === "promptpay" || body.method === "card"
      ? body.method
      : defaultPaymentMethod(currency, visitorCountryCode);
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
  const buyerError = validateBuyerCheckoutIdentity(buyer);
  if (buyerError) return buyerError;
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
    format?: "pdf" | "cad";
  }[] = [];
  let addonBoqPrice: number | null = null;
  let addonCalcPrice: number | null = null;
  let cartHasBoq = false;
  let cartHasCalc = false;

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
    if (listing.hasBoqFiles) {
      cartHasBoq = true;
      if (addonBoqPrice == null && listing.boqPrice != null) {
        addonBoqPrice = listing.boqPrice;
      }
    }
    if (listing.hasCalcSheets) {
      cartHasCalc = true;
      if (addonCalcPrice == null && listing.calcPrice != null) {
        addonCalcPrice = listing.calcPrice;
      }
    }
    const planCode = listing.planCode || listing.planId;
    const planDocumentId = resolvePlanDocumentId(listing);
    const blueprintUrls = await getListingBlueprintUrls(listing.id);
    const format = item.format === "cad" ? "cad" : "pdf";
    // Marketplace delivery is vendor-uploaded PDFs (+ optional CAD package).
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
    if (format === "cad" && !listing.hasCadFiles && !planDocumentId) {
      return NextResponse.json(
        { error: `CAD files are not available for ${listing.name}` },
        { status: 422 },
      );
    }
    const linePrice =
      typeof item.price === "number" && Number.isFinite(item.price) && item.price > 0
        ? Math.round(item.price)
        : listing.price;
    orderItems.push({
      listingId: listing.id,
      planId: planCode,
      planDocumentId,
      name: listing.name,
      price: linePrice,
      format,
    });
  }

  if (addons.includes("boq-bundle") && !cartHasBoq) {
    return NextResponse.json(
      { error: "BOQ documents are not available for items in this cart" },
      { status: 422 },
    );
  }
  if (addons.includes("calc-sheet") && !cartHasCalc) {
    return NextResponse.json(
      { error: "Calculation sheets are not available for items in this cart" },
      { status: 422 },
    );
  }

  const addonPrices = {
    boqPrice: addonBoqPrice,
    calcPrice: addonCalcPrice,
  };
  const languageSurcharge = localizationSurchargeThb(targetCountry);
  const pricing = computeCheckoutTotal(
    orderItems.map((o) => ({
      listingId: o.listingId,
      planId: o.planId,
      planDocumentId: o.planDocumentId,
      name: o.name,
      price: o.price,
      format: o.format,
      image: "",
      style: "",
      floors: 1 as const,
    })),
    addons,
    languageSurcharge,
    addonPrices,
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
    buyerEmail: buyerEmail || undefined,
    buyerPhone,
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
        name: "เอกสารปริมาณราคาและวัสดุ (ไฟล์ PDF)",
        amount: resolveAddonBoqPrice(addonPrices),
      });
    }

    if (addons.includes("calc-sheet")) {
      lineItems.push({
        name: "เอกสารรายการคำนวณโครงสร้าง (ไฟล์ PDF)",
        amount: resolveAddonCalcPrice(addonPrices),
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
      countryCode: visitorCountryCode,
      targetCountry,
      userId: buyerUserId,
      uiLocale,
      documentLanguage,
      buyerName,
      buyerEmail: buyerEmail || undefined,
      buyerPhone,
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
