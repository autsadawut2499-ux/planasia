import { NextRequest, NextResponse } from "next/server";
import { getCartOrder } from "@/lib/store/cart-orders";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

export const dynamic = "force-dynamic";

/**
 * Post-payment localization status (disabled in Thailand-only mode).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  if (THAI_DOMESTIC_MARKET) {
    return NextResponse.json(
      {
        error: "Localization API disabled in Thailand-only mode",
        translationStatus: "skipped",
      },
      { status: 410 },
    );
  }

  const { orderId } = await context.params;
  const email = String(request.nextUrl.searchParams.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!orderId || !email) {
    return NextResponse.json(
      { error: "orderId and email are required" },
      { status: 400 },
    );
  }

  const order = await getCartOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if ((order.buyerEmail ?? "").trim().toLowerCase() !== email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "paid") {
    return NextResponse.json({ error: "Order not paid" }, { status: 409 });
  }

  const result = order.translationResult as
    | {
        blueprints?: unknown[];
        listings?: unknown[];
        target_language?: string;
        status?: string;
      }
    | undefined;

  return NextResponse.json({
    orderId: order.id,
    targetCountry: order.targetCountry ?? null,
    documentLanguage: order.documentLanguage ?? null,
    translationStatus: order.translationStatus ?? null,
    targetLanguage: result?.target_language ?? null,
    blueprintCount: Array.isArray(result?.blueprints) ? result.blueprints.length : 0,
    translationResult: order.translationResult ?? null,
  });
}
