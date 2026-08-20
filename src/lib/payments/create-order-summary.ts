import "server-only";

import { generateOrderSummaryPdf } from "@/lib/payments/order-summary-pdf";
import { loadOrderItemFulfilment } from "@/lib/payments/order-item-fulfilment";
import type { CartOrder } from "@/lib/store/cart-orders";
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
    const orderNote = order.shippingAddress?.notes?.trim() || "";
    const lines = await Promise.all(
      order.items.map(async (item) => {
        const row = await loadOrderItemFulfilment(item, orderNote);
        return {
          housePlanId: row.housePlanId,
          supplierName: row.supplierName,
          planName: row.planName,
          originalHouseCode: row.originalHouseCode,
          note: row.note,
          costPrice:
            row.costPrice != null
              ? `฿${Math.round(row.costPrice).toLocaleString("th-TH")}`
              : undefined,
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
      orderNote: orderNote || undefined,
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
