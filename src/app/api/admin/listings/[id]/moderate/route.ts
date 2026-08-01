import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  supabaseGetListingById,
  supabaseSetListingModerationStatus,
} from "@/lib/supabase/store-listings";
import { revalidateStoreSurfaces } from "@/lib/store/revalidate-store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Admin Approve / Reject — unlocks Buy/Checkout when status = approved.
 * Pending listings stay visible on the store but cannot be purchased.
 */
export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdminSession();
    const { id } = await ctx.params;
    const listingId = decodeURIComponent(id);
    const listing = await supabaseGetListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: "ไม่พบแบบบ้าน" }, { status: 404 });
    }

    const body = (await request.json()) as { status?: string };
    const status = String(body.status ?? "").trim();
    if (status !== "pending" && status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { error: "status ต้องเป็น pending | approved | rejected" },
        { status: 400 },
      );
    }

    await supabaseSetListingModerationStatus(listingId, status);
    revalidateStoreSurfaces({ slug: listing.slug, listingId });

    return NextResponse.json({
      ok: true,
      id: listingId,
      moderationStatus: status,
      is_approved: status === "approved",
      isApproved: status === "approved",
      purchasable: status === "approved",
      purchase_locked: status !== "approved",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
