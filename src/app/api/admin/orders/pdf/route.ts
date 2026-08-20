import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getCartOrder } from "@/lib/store/cart-orders";
import {
  createPrivateSignedReadUrl,
  fetchAssetBytes,
  VENDOR_PRIVATE_BUCKET,
  toPrivateAssetRef,
} from "@/lib/supabase/private-assets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Stream the order summary PDF for admin. */
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const order = await getCartOrder(id);
    if (!order?.orderSummaryPdfPath) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const ref = toPrivateAssetRef(VENDOR_PRIVATE_BUCKET, order.orderSummaryPdfPath);
    const asset = await fetchAssetBytes(ref);
    if (!asset) {
      const signed = await createPrivateSignedReadUrl(order.orderSummaryPdfPath, 120);
      if (signed) return NextResponse.redirect(signed);
      return NextResponse.json({ error: "PDF unavailable" }, { status: 404 });
    }

    const filename = `order-summary-${id}.pdf`;
    return new NextResponse(new Uint8Array(asset.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Download failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
