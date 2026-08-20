import "server-only";

import { generateOrderSummaryPdf } from "@/lib/payments/order-summary-pdf";
import type { CartOrder } from "@/lib/store/cart-orders";
import { getListingById } from "@/lib/store/db";
import { listingSupplierName } from "@/lib/store/listing-supplier";
import { uploadPrivateBytes } from "@/lib/supabase/private-assets";
import { updateCartOrderSummaryPdf } from "@/lib/store/cart-orders";

/**
 * Build + store private order-summary PDF after payment is verified.
 * Returns the storage path (or null on failure — never blocks fulfilment).
 */
export async function createAndStoreOrderSummaryPdf(
  order: CartOrder,
): Promise<string | null> {
  try {
    const lines = await Promise.all(
      order.items.map(async (item) => {
        const listing = await getListingById(item.listingId);
        return {
          housePlanId: item.planId || listing?.planId || item.listingId,
          supplierName:
            listingSupplierName(listing) ||
            listing?.supplierName ||
            "—",
          planName: item.name || listing?.name,
        };
      }),
    );

    const bytes = await generateOrderSummaryPdf({
      orderId: order.id,
      customerName: order.buyerName?.trim() || "—",
      customerPhone: order.buyerPhone?.trim() || "—",
      customerEmail: order.buyerEmail?.trim(),
      lines,
      totalThb: order.total,
      paidAt: new Date().toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      sitePlanInfo: order.sitePlanInfo
        ? {
            provinceName: order.sitePlanInfo.provinceName,
            districtName: order.sitePlanInfo.districtName,
            landTitleDeedNumber: order.sitePlanInfo.landTitleDeedNumber,
          }
        : null,
    });

    const storagePath = `order-summaries/${order.id}.pdf`;
    const uploaded = await uploadPrivateBytes({
      path: storagePath,
      bytes: Buffer.from(bytes),
      contentType: "application/pdf",
      upsert: true,
    });
    if (!uploaded) {
      console.error("[order-summary-pdf] upload failed", order.id);
      return null;
    }

    await updateCartOrderSummaryPdf(order.id, storagePath);
    console.info("[order-summary-pdf] saved", {
      orderId: order.id,
      customerName: order.buyerName,
      customerPhone: order.buyerPhone,
      lines,
      pdfPath: storagePath,
      pdfAdminUrl: `/api/admin/orders/pdf?id=${encodeURIComponent(order.id)}`,
    });
    return storagePath;
  } catch (err) {
    console.error("[order-summary-pdf] generate failed", err);
    return null;
  }
}
