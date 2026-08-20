import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { listCartOrders } from "@/lib/store/cart-orders";
import { getListingById } from "@/lib/store/db";
import { listingSupplierName } from "@/lib/store/listing-supplier";
import { normalizeShippingAddress } from "@/lib/store/shipping-address";
import {
  isSitePlanInfoComplete,
  normalizeSitePlanInfo,
} from "@/lib/store/site-plan-info";

export const dynamic = "force-dynamic";

/** Admin: paid order summaries with shipping + site-plan details + PDF links. */
export async function GET() {
  try {
    await requireAdminSession();
    const orders = await listCartOrders({ status: "paid", limit: 200 });

    const summaries = await Promise.all(
      orders.map(async (order) => {
        const lines = await Promise.all(
          order.items.map(async (item) => {
            const listing = await getListingById(item.listingId);
            return {
              housePlanId: item.planId || listing?.planId || item.listingId,
              supplierName: listingSupplierName(listing) || "—",
              planName: item.name,
            };
          }),
        );

        const hasSitePlanAddon = order.addons.includes("site-plan");
        const hasHardcopyAddon = order.addons.includes("hardcopy-3sets");
        const normalized = order.sitePlanInfo
          ? normalizeSitePlanInfo(order.sitePlanInfo)
          : null;
        const sitePlanInfo =
          normalized && isSitePlanInfoComplete(normalized)
            ? {
                provinceId: normalized.provinceId,
                provinceName: normalized.provinceName,
                districtId: normalized.districtId,
                districtName: normalized.districtName,
                landTitleDeedNumber: normalized.landTitleDeedNumber,
              }
            : normalized &&
                (normalized.provinceName ||
                  normalized.districtName ||
                  normalized.landTitleDeedNumber)
              ? {
                  provinceId: normalized.provinceId,
                  provinceName: normalized.provinceName || "—",
                  districtId: normalized.districtId,
                  districtName: normalized.districtName || "—",
                  landTitleDeedNumber:
                    normalized.landTitleDeedNumber || "—",
                }
              : null;

        const shipping = order.shippingAddress
          ? normalizeShippingAddress(order.shippingAddress)
          : null;
        const shippingAddress =
          shipping &&
          (shipping.line1 ||
            shipping.subDistrict ||
            shipping.district ||
            shipping.province)
            ? {
                fullName: shipping.fullName,
                phone: shipping.phone,
                line1: shipping.line1,
                subDistrict: shipping.subDistrict,
                district: shipping.district,
                province: shipping.province,
                postalCode: shipping.postalCode,
                notes: shipping.notes ?? null,
              }
            : null;

        return {
          id: order.id,
          status: order.status,
          createdAt: order.createdAt,
          customerName: order.buyerName ?? null,
          customerPhone: order.buyerPhone ?? null,
          customerEmail: order.buyerEmail ?? null,
          total: order.total,
          currency: order.currency,
          addons: order.addons,
          hasSitePlanAddon,
          hasHardcopyAddon,
          lines,
          housePlanIds: lines.map((l) => l.housePlanId),
          supplierNames: Array.from(
            new Set(lines.map((l) => l.supplierName).filter(Boolean)),
          ),
          shippingAddress,
          sitePlanInfo,
          orderSummaryPdfPath: order.orderSummaryPdfPath ?? null,
          pdfUrl: order.orderSummaryPdfPath
            ? `/api/admin/orders/pdf?id=${encodeURIComponent(order.id)}`
            : null,
          slipVerifiedAt: order.slipVerifiedAt ?? null,
        };
      }),
    );

    return NextResponse.json({ orders: summaries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Load failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
