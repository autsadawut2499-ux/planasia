import "server-only";
import {
  markCartOrderPaid,
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
import { createAndStoreOrderSummaryPdf } from "@/lib/payments/create-order-summary";
import {
  notifyAfterOrderPaid,
  type OrderNotifyResult,
} from "@/lib/payments/order-notify";
import {
  runPostPaymentTranslation,
  type PostPaymentTranslationResult,
} from "@/lib/gemini/post-payment-translation";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

/**
 * Buyer SMS + admin LINE + designer SMS/push.
 * Start this immediately after marking paid — do not wait for PDF.
 */
export async function dispatchPostPaymentNotifications(
  order: CartOrder,
): Promise<OrderNotifyResult> {
  const saleNotifyItems = order.items.map((i) => ({
    listingId: i.listingId,
    planId: i.planId,
    name: i.name,
    priceThb: i.price,
  }));

  const [, notify] = await Promise.all([
    notifyVendorsOfSale(saleNotifyItems, { cartOrderId: order.id }).catch((err) => {
      console.error("[finalize-sale] designer notify failed", err);
    }),
    notifyAfterOrderPaid(order),
  ]);

  console.info("[finalize-sale] order notifications", {
    orderId: order.id,
    ...notify,
  });
  return notify;
}

/**
 * After a cart payment succeeds:
 *  1. Mark the order paid
 *  2. LINE admin + SMS buyer immediately
 *  3. Issue download grants
 *  4. Generate admin order-summary PDF
 *  Email is disabled — SMS + LINE only.
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

  // LINE + buyer SMS first so PDF generation cannot drop alerts.
  const notifyDone = dispatchPostPaymentNotifications(order).catch((err) => {
    console.error("[finalize-sale] order notifications failed", err);
  });

  if (opts.stripeSessionId) {
    const existing = await findGrantsByStripeSession(opts.stripeSessionId);
    if (existing.length > 0) {
      grants = existing;
      const translation = await runPostPayTranslationSafe(order);
      const enriched = applyTranslationToOrder(order, translation);
      let orderSummaryPdfPath = enriched.orderSummaryPdfPath ?? null;
      if (!orderSummaryPdfPath) {
        try {
          orderSummaryPdfPath = await createAndStoreOrderSummaryPdf(enriched);
        } catch (err) {
          console.error("[finalize-sale] order summary PDF failed", err);
        }
      }
      await notifyDone;
      return {
        order: enriched,
        grants,
        planIds: Array.from(new Set(existing.map((g) => g.planId))),
        translation,
        emailSent: false,
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

  const translation = await runPostPayTranslationSafe(order);
  const enriched = applyTranslationToOrder(order, translation);

  let orderSummaryPdfPath: string | null = null;
  try {
    orderSummaryPdfPath = await createAndStoreOrderSummaryPdf(enriched);
  } catch (err) {
    console.error("[finalize-sale] order summary PDF failed", err);
  }

  await notifyDone;

  return {
    order: enriched,
    grants,
    planIds: Array.from(new Set(order.items.map((i) => i.planId))),
    translation,
    emailSent: false,
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
