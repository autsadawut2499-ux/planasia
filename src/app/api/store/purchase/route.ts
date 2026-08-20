import { NextRequest, NextResponse } from "next/server";
import { finalizePaidCartSale } from "@/lib/commerce/finalize-sale";
import { bankTransferCheckoutResponse } from "@/lib/payments/bank-transfer-checkout";
import { getListingById, getListings } from "@/lib/store/db";
import { isListingPurchasable } from "@/lib/store/listing-purchase";
import { getViewerFromRequest } from "@/lib/user/identity";
import { loadPlanDocument } from "@/lib/plans/store";
import { resolvePlanDocumentId } from "@/lib/store/plan-identity";
import { getListingBlueprintUrls } from "@/lib/store/listing-assets";
import {
  localizationSurchargeThb,
  resolveCheckoutDocumentLanguage,
} from "@/lib/store/document-languages";
import {
  CAD_DWG_SURCHARGE,
  computeAddonTotal,
  isUpsellAddonId,
  type UpsellAddonId,
} from "@/lib/store/cart-pricing";
import { createCartOrderId, saveCartOrder } from "@/lib/store/cart-orders";
import { resolveCheckoutCurrency } from "@/lib/checkout/pipeline";
import { isCurrency, type Currency } from "@/lib/currency";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";
import { defaultPaymentMethod } from "@/lib/payments/methods";
import {
  isShippingAddressComplete,
  normalizeShippingAddress,
} from "@/lib/store/shipping-address";
import {
  isSitePlanInfoComplete,
  normalizeSitePlanInfo,
} from "@/lib/store/site-plan-info";
import {
  requireBuyerSession,
  resolveBuyerCheckoutIdentity,
  validateBuyerCheckoutIdentity,
} from "@/lib/auth/buyer-session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const listingId = body.listingId as string;
  const format = (body.format as "pdf" | "cad") ?? "pdf";
  const countryCode = THAI_DOMESTIC_MARKET
    ? "TH"
    : String(body.countryCode ?? "TH").toUpperCase();
  const viewerEarly = getViewerFromRequest(request);
  const buyerSession = await requireBuyerSession();
  const buyer = resolveBuyerCheckoutIdentity(
    buyerSession,
    body,
    viewerEarly.sessionUserId || viewerEarly.browserId || viewerEarly.primaryId || "",
  );
  // Persist account id only for signed-in buyers; guests use contact fields + orderId.
  const buyerUserId = buyerSession?.userId || undefined;
  const buyerName = buyer.name;
  const buyerEmail = buyer.email;
  const buyerPhone = buyer.phone;
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
  const wantsSitePlan = addons.includes("site-plan");
  const shippingAddress = wantsHardcopy
    ? normalizeShippingAddress(body.shippingAddress)
    : undefined;
  const sitePlanInfo = wantsSitePlan
    ? normalizeSitePlanInfo(body.sitePlanInfo)
    : undefined;
  const visitorCountryCode = String(
    body.visitorCountryCode ?? body.countryCode ?? countryCode,
  ).toUpperCase();
  const currency: Currency = resolveCheckoutCurrency({
    countryCode: visitorCountryCode,
    targetCountry,
    currencyOverride: isCurrency(body.currency) ? body.currency : undefined,
  });
  void defaultPaymentMethod(currency, visitorCountryCode);

  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
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

  const viewer = viewerEarly;
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
        message: "แบบบ้านนี้ยังไม่เปิดให้ซื้อในขณะนี้",
      },
      { status: 403 },
    );
  }

  const planCode = listing.planCode || listing.planId;
  const planDocumentId = resolvePlanDocumentId(listing);
  const blueprintUrls = await getListingBlueprintUrls(listing.id);
  if (blueprintUrls.length === 0 && planDocumentId) {
    const planDoc = await loadPlanDocument(planDocumentId);
    if (!planDoc) {
      return NextResponse.json({ error: "Plan files not ready" }, { status: 422 });
    }
  }
  if (format === "cad" && !listing.hasCadFiles && !planDocumentId) {
    return NextResponse.json(
      { error: "CAD files are not available for this listing" },
      { status: 422 },
    );
  }
  if (addons.includes("calc-sheet") && !listing.hasCalcSheets) {
    return NextResponse.json(
      { error: "Calculation sheets are not available for this listing" },
      { status: 422 },
    );
  }

  const languageSurcharge = localizationSurchargeThb(targetCountry);
  const addonTotal = computeAddonTotal(addons, {
    boqPrice: listing.boqPrice,
    calcPrice: listing.calcPrice,
    sitePlanPrice: listing.sitePlanAddonPrice,
  });
  const cadSurcharge = format === "cad" ? CAD_DWG_SURCHARGE : 0;
  const amountThb = Math.max(
    0,
    Math.round(listing.price + cadSurcharge + languageSurcharge + addonTotal),
  );

  const orderId = createCartOrderId();
  await saveCartOrder({
    id: orderId,
    items: [
      {
        listingId: listing.id,
        planId: planCode,
        planDocumentId,
        name: listing.name,
        price: Math.max(0, Math.round(listing.price + cadSurcharge)),
        format,
      },
    ],
    addons,
    subtotal: Math.max(0, Math.round(listing.price + cadSurcharge)),
    discount: 0,
    addonTotal,
    languageSurcharge,
    total: amountThb,
    currency,
    buyerUserId,
    buyerName,
    buyerEmail: buyerEmail || undefined,
    buyerPhone,
    documentLanguage,
    targetCountry,
    translationStatus: "pending",
    shippingAddress,
    sitePlanInfo,
    paymentMethod: "bank_transfer",
    status: "awaiting_payment",
    createdAt: new Date().toISOString(),
  });

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

  const bank = await bankTransferCheckoutResponse({
    orderId,
    amountThb,
    currency,
    documentLanguage,
    planId: planCode,
    planDocumentId,
  });
  if (bank.error) {
    return NextResponse.json(bank.body, { status: bank.status });
  }
  return NextResponse.json({
    ...bank.body,
    format,
    method: "bank_transfer",
  });
}
