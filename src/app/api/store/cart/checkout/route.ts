import { NextRequest, NextResponse } from "next/server";
import {
  computeCheckoutTotal,
  type CartLineItem,
  type UpsellAddonId,
  isUpsellAddonId,
} from "@/lib/store/cart-pricing";
import {
  createCartOrderId,
  saveCartOrder,
} from "@/lib/store/cart-orders";
import { finalizePaidCartSale } from "@/lib/commerce/finalize-sale";
import { bankTransferCheckoutResponse } from "@/lib/payments/bank-transfer-checkout";
import { getListingById, getListings } from "@/lib/store/db";
import { isListingPurchasable } from "@/lib/store/listing-purchase";
import { getViewerFromRequest } from "@/lib/user/identity";
import { loadPlanDocument } from "@/lib/plans/store";
import { resolveCheckoutCurrency } from "@/lib/checkout/pipeline";
import { defaultPaymentMethod, type PaymentMethodId } from "@/lib/payments/methods";
import { isCurrency, type Currency } from "@/lib/currency";
import { isUiLocale, type UiLocale } from "@/lib/geo/countries";
import { resolvePlanDocumentId } from "@/lib/store/plan-identity";
import { getListingBlueprintUrls } from "@/lib/store/listing-assets";
import {
  localizationSurchargeThb,
  resolveCheckoutDocumentLanguage,
} from "@/lib/store/document-languages";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";
import {
  isShippingAddressComplete,
  normalizeShippingAddress,
} from "@/lib/store/shipping-address";
import {
  isSitePlanInfoComplete,
  normalizeSitePlanInfo,
} from "@/lib/store/site-plan-info";
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
  const method: PaymentMethodId = defaultPaymentMethod(currency, visitorCountryCode);
  const documentLanguage = THAI_DOMESTIC_MARKET
    ? "th"
    : resolveCheckoutDocumentLanguage(body.documentLanguage, targetCountry);
  const wantsHardcopy = addons.includes("hardcopy-3sets");
  const wantsSitePlan = addons.includes("site-plan");
  const shippingAddress = wantsHardcopy
    ? normalizeShippingAddress(body.shippingAddress)
    : undefined;
  const sitePlanInfo = wantsSitePlan
    ? normalizeSitePlanInfo(body.sitePlanInfo)
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
  if (wantsSitePlan && !isSitePlanInfoComplete(sitePlanInfo)) {
    return NextResponse.json(
      {
        error:
          "กรุณากรอกข้อมูลแผนผังบริเวณให้ครบ (จังหวัด อำเภอ เลขโฉนดที่ดิน)",
      },
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
  let addonSitePlanPrice: number | null = null;
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
          message: `แบบบ้าน “${listing.name}” ยังไม่เปิดให้ซื้อในขณะนี้`,
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
    if (addonSitePlanPrice == null && listing.sitePlanAddonPrice != null) {
      addonSitePlanPrice = listing.sitePlanAddonPrice;
    }
    const planCode = listing.planCode || listing.planId;
    const planDocumentId = resolvePlanDocumentId(listing);
    const blueprintUrls = await getListingBlueprintUrls(listing.id);
    const format = item.format === "cad" ? "cad" : "pdf";
    // Middleman model: plan documents are ordered from the supplier after payment —
    // catalogue listings may have no on-platform blueprint files.
    if (blueprintUrls.length === 0 && planDocumentId) {
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
    sitePlanPrice: addonSitePlanPrice,
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
    sitePlanInfo,
    paymentMethod: "bank_transfer" as const,
    status: "awaiting_payment" as const,
    createdAt: new Date().toISOString(),
  };

  await saveCartOrder(order);

  // Free cart — unlock immediately.
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

  const bank = await bankTransferCheckoutResponse({
    orderId,
    amountThb: pricing.total,
    currency,
    documentLanguage,
  });
  if (bank.error) {
    return NextResponse.json(bank.body, { status: bank.status });
  }
  return NextResponse.json({
    ...bank.body,
    uiLocale,
    method: "bank_transfer",
  });
}
