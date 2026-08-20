import "server-only";
import {
  claimCartOrderConfirmationEmail,
  markCartOrderPaid,
  releaseCartOrderConfirmationEmail,
  type CartOrder,
} from "@/lib/store/cart-orders";
import {
  findGrantsByStripeSession,
  fulfillCartDownloads,
  type DownloadGrant,
} from "@/lib/payments/tokens";
import { recordSaleCommissions } from "@/lib/supabase/vendor-earnings";
import { getListingById } from "@/lib/store/db";
import { createRandomId } from "@/lib/random-id";
import { splitSale } from "@/lib/commerce/commission";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { notifyVendorsOfSale } from "@/lib/push/notify-sale";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import { createAndStoreOrderSummaryPdf } from "@/lib/payments/create-order-summary";
import { notifyAfterOrderPaid } from "@/lib/payments/order-notify";
import {
  runPostPaymentTranslation,
  type PostPaymentTranslationResult,
} from "@/lib/gemini/post-payment-translation";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

/** Claim → send Resend receipt+PDFs (+ localized pack) → release claim if send fails. */
async function deliverBuyerConfirmationEmail(
  order: CartOrder,
  grants: DownloadGrant[],
  translation?: PostPaymentTranslationResult,
): Promise<boolean> {
  if (!order.buyerEmail?.trim()) return false;
  const claimed = await claimCartOrderConfirmationEmail(order.id);
  if (!claimed) {
    // Already claimed/sent on a prior fulfillment attempt.
    return true;
  }
  const ok = await sendOrderConfirmationEmail(order, grants, translation);
  if (!ok) {
    await releaseCartOrderConfirmationEmail(order.id);
    return false;
  }
  return true;
}

/**
 * After a cart payment succeeds:
 *  1. Mark the order paid
 *  2. Split each vendor listing 70/30 into the earnings ledger
 *  3. Issue download grants (idempotent when stripeSessionId is present)
 *  4. Notify each listing's designer (SMS / Web Push / email) via contact_phone mapping
 *  5. (International only) OCR → translation — skipped in Thai domestic mode
 *  6. Email buyer confirmation with blueprint PDFs
 */
export async function finalizePaidCartSale(opts: {
  cartOrderId: string;
  stripeSessionId?: string;
  buyerUserId?: string;
}): Promise<{
  order: CartOrder;
  grants: DownloadGrant[];
  planIds: string[];
  translation?: PostPaymentTranslationResult;
  emailSent?: boolean;
  orderSummaryPdfPath?: string;
} | null> {
  const order = await markCartOrderPaid(opts.cartOrderId, opts.stripeSessionId);
  if (!order) return null;

  // Best-effort commission ledger — never block delivery. Idempotent per order line.
  try {
    await recordSaleCommissions(order);
  } catch (err) {
    console.error("[finalize-sale] commission recording failed", err);
  }

  let grants: DownloadGrant[];

  const paidOrderId = order.id;
  const saleNotifyItems = order.items.map((i) => ({
    listingId: i.listingId,
    planId: i.planId,
    name: i.name,
    priceThb: i.price,
  }));

  /** Fire-and-forget: SMS / Web Push / email to each listing's designer. Idempotent per order. */
  function wakeDesigners() {
    void notifyVendorsOfSale(saleNotifyItems, { cartOrderId: paidOrderId }).catch((err) =>
      console.error("[finalize-sale] designer notify failed", err),
    );
  }

  if (opts.stripeSessionId) {
    const existing = await findGrantsByStripeSession(opts.stripeSessionId);
    if (existing.length > 0) {
      grants = existing;
      // Retry path: still attempt designer notify (deduped by vendor_sale_notifications).
      wakeDesigners();
      const translation = await runPostPayTranslationSafe(order);
      const enriched = applyTranslationToOrder(order, translation);
      let emailSent = false;
      try {
        emailSent = await deliverBuyerConfirmationEmail(enriched, grants, translation);
      } catch (err) {
        console.error("[finalize-sale] buyer email failed", err);
      }
      let orderSummaryPdfPath = enriched.orderSummaryPdfPath ?? null;
      if (!orderSummaryPdfPath) {
        try {
          orderSummaryPdfPath = await createAndStoreOrderSummaryPdf(enriched);
        } catch (err) {
          console.error("[finalize-sale] order summary PDF failed", err);
        }
      }
      try {
        const notify = await notifyAfterOrderPaid({
          ...enriched,
          orderSummaryPdfPath: orderSummaryPdfPath ?? undefined,
        });
        console.info("[finalize-sale] order notifications (retry path)", {
          orderId: enriched.id,
          ...notify,
        });
      } catch (err) {
        console.error("[finalize-sale] order notifications failed", err);
      }
      return {
        order: enriched,
        grants,
        planIds: Array.from(new Set(existing.map((g) => g.planId))),
        translation,
        emailSent,
        orderSummaryPdfPath: orderSummaryPdfPath ?? undefined,
      };
    }
  }

  // Unlock blueprints always; CAD / BOQ / calc follow line format + order addons.
  grants = await fulfillCartDownloads(
    order.items.map((item) => ({
      planId: item.planId,
      planDocumentId: item.planDocumentId,
      listingId: item.listingId,
      format: item.format,
    })),
    order.items.some((item) => item.format === "cad"),
    opts.buyerUserId,
    opts.stripeSessionId,
    order.addons,
  );

  wakeDesigners();

  // Auto pipeline: text-layer check → Vision OCR if scanned → Translation → email.
  const translation = await runPostPayTranslationSafe(order);
  const enriched = applyTranslationToOrder(order, translation);

  let emailSent = false;
  try {
    emailSent = await deliverBuyerConfirmationEmail(enriched, grants, translation);
  } catch (err) {
    console.error("[finalize-sale] buyer email failed", err);
  }

  // Admin fulfilment PDF: Customer Name, Phone, House Plan ID, Supplier Name.
  let orderSummaryPdfPath: string | null = null;
  try {
    orderSummaryPdfPath = await createAndStoreOrderSummaryPdf(enriched);
  } catch (err) {
    console.error("[finalize-sale] order summary PDF failed", err);
  }

  // Buyer SMS + admin LINE OA push (never block fulfilment).
  try {
    const notify = await notifyAfterOrderPaid({
      ...enriched,
      orderSummaryPdfPath: orderSummaryPdfPath ?? enriched.orderSummaryPdfPath,
    });
    console.info("[finalize-sale] order notifications", {
      orderId: enriched.id,
      ...notify,
    });
  } catch (err) {
    console.error("[finalize-sale] order notifications failed", err);
  }

  return {
    order: enriched,
    grants,
    planIds: Array.from(new Set(order.items.map((i) => i.planId))),
    translation,
    emailSent,
    orderSummaryPdfPath: orderSummaryPdfPath ?? undefined,
  };
}

async function runPostPayTranslationSafe(
  order: CartOrder,
): Promise<PostPaymentTranslationResult | undefined> {
  // Thai-only market: no OCR / Cloud Translation pipeline.
  if (THAI_DOMESTIC_MARKET) return undefined;
  try {
    return await runPostPaymentTranslation(order);
  } catch (err) {
    console.error("[finalize-sale] post-payment translation failed", err);
    return undefined;
  }
}

function applyTranslationToOrder(
  order: CartOrder,
  translation?: PostPaymentTranslationResult,
): CartOrder {
  if (!translation) return order;
  return {
    ...order,
    translationStatus: translation.status,
    translationResult: translation as unknown as Record<string, unknown>,
  };
}

/**
 * Single-listing purchase (Quick View / Buy Now). Same outcomes as cart:
 * unlock download + credit the draftsman 70%.
 */
export async function finalizePaidListingSale(opts: {
  listingId: string;
  planId: string;
  planDocumentId?: string;
  format: "pdf" | "cad";
  amountThb: number;
  stripeSessionId?: string;
  buyerUserId?: string;
}): Promise<{ grants: DownloadGrant[]; planIds: string[] }> {
  if (opts.stripeSessionId) {
    const existing = await findGrantsByStripeSession(opts.stripeSessionId);
    if (existing.length > 0) {
      return {
        grants: existing,
        planIds: Array.from(new Set(existing.map((g) => g.planId))),
      };
    }
  }

  // Synthetic one-line order id so the earnings unique key still works.
  const cartOrderId = opts.stripeSessionId
    ? `single_${opts.stripeSessionId}`
    : `single_${createRandomId()}`;

  try {
    await recordSingleListingCommission({
      cartOrderId,
      listingId: opts.listingId,
      amountThb: opts.amountThb,
    });
  } catch (err) {
    console.error("[finalize-sale] single commission failed", err);
  }

  // Prefer vendor asset grants (blueprints + optional CAD package).
  const grants = await fulfillCartDownloads(
    [
      {
        planId: opts.planId,
        planDocumentId: opts.planDocumentId,
        listingId: opts.listingId,
        format: opts.format,
      },
    ],
    opts.format === "cad",
    opts.buyerUserId,
    opts.stripeSessionId,
  );

  void notifyVendorsOfSale(
    [
      {
        listingId: opts.listingId,
        planId: opts.planId,
        name: opts.planId,
        priceThb: opts.amountThb,
      },
    ],
    { cartOrderId },
  ).catch((err) => console.error("[finalize-sale] designer notify failed", err));

  return { grants, planIds: [opts.planId] };
}

async function recordSingleListingCommission(opts: {
  cartOrderId: string;
  listingId: string;
  amountThb: number;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const listing = await getListingById(opts.listingId);
  const owner = listing?.ownerId?.trim();
  if (!owner || owner === "seed-demo") return;

  const split = splitSale(opts.amountThb);
  const row = {
    id: createRandomId(),
    owner_key: owner,
    listing_id: opts.listingId,
    cart_order_id: opts.cartOrderId,
    gross_thb: split.grossThb,
    vendor_amount_thb: split.vendorAmountThb,
    platform_amount_thb: split.platformAmountThb,
    vendor_share: split.vendorShare,
    platform_share: split.platformShare,
    currency: "THB",
    status: "available" as const,
    created_at: new Date().toISOString(),
  };

  const { error } = await getSupabaseAdmin()
    .from("vendor_earnings")
    .upsert(row, { onConflict: "cart_order_id,listing_id", ignoreDuplicates: true });
  if (error) console.error("[finalize-sale] single earning upsert", error);
}
