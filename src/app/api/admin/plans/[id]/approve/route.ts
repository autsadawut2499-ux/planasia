import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  supabaseGetListingById,
  supabaseSetListingModerationStatus,
} from "@/lib/supabase/store-listings";
import { revalidateStoreSurfaces } from "@/lib/store/revalidate-store";
import { withApprovalFlags } from "@/lib/store/plan-api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/plans/{id}/approve
 * Sets is_approved=true (moderation_status=approved) and unlocks Buy/Checkout.
 */
export async function PUT(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdminSession();
    const { id } = await ctx.params;
    const listingId = decodeURIComponent(id);
    const listing = await supabaseGetListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: "Plan not found", message: "ไม่พบแบบบ้าน" }, { status: 404 });
    }

    await supabaseSetListingModerationStatus(listingId, "approved");
    revalidateStoreSurfaces({ slug: listing.slug, listingId });

    const updated = withApprovalFlags({ ...listing, moderationStatus: "approved" });
    return NextResponse.json({
      ok: true,
      id: listingId,
      is_approved: true,
      isApproved: true,
      purchase_locked: false,
      moderationStatus: "approved",
      plan: updated,
      message: "Plan approved — purchase unlocked",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Approve failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST alias for clients that cannot send PUT. */
export async function POST(request: NextRequest, ctx: Ctx) {
  return PUT(request, ctx);
}
