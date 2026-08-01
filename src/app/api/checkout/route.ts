import { NextRequest, NextResponse } from "next/server";
import { getListingById, getListings } from "@/lib/store/db";
import { isListingPurchasable } from "@/lib/store/listing-purchase";
import { listingIsApproved } from "@/lib/store/plan-api";
import { getViewerFromRequest } from "@/lib/user/identity";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout — test-facing purchase gate.
 *
 * Returns 403 Forbidden when `is_approved` is false (pending admin Approve).
 * When approved, forwards to the store purchase handler implementation via
 * internal rewrite of the request body to `/api/store/purchase`.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const listingId = String(body.listingId ?? body.plan_id ?? body.planId ?? "").trim();
  if (!listingId) {
    return NextResponse.json(
      { error: "listingId required", message: "ต้องระบุ listingId ของแบบบ้าน" },
      { status: 400 },
    );
  }

  const viewer = getViewerFromRequest(request);
  const visible = await getListings(viewer);
  const listing = await getListingById(listingId);

  if (!listing || !visible.some((l) => l.id === listing.id)) {
    return NextResponse.json({ error: "Listing not available" }, { status: 404 });
  }

  if (!isListingPurchasable(listing) || !listingIsApproved(listing)) {
    return NextResponse.json(
      {
        error: "Forbidden",
        code: "PURCHASE_LOCKED",
        is_approved: false,
        message:
          "แบบบ้านนี้ยังไม่เปิดให้ซื้อ — รอแอดมินอนุมัติ (is_approved=false)",
      },
      { status: 403 },
    );
  }

  // Delegate to the full Stripe / mock purchase pipeline.
  const origin = request.nextUrl.origin;
  const forward = await fetch(`${origin}/api/store/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") ?? "",
      "x-browser-id": request.headers.get("x-browser-id") ?? "",
      "x-session-user-id": request.headers.get("x-session-user-id") ?? "",
    },
    body: JSON.stringify({ ...body, listingId: listing.id }),
  });

  const data = await forward.json().catch(() => ({}));
  return NextResponse.json(data, { status: forward.status });
}
