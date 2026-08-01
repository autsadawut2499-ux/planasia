import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { listingFromAdminBody, markListingApproved } from "@/lib/admin/listing-mutate";
import {
  supabaseDeleteListingById,
  supabaseGetListingById,
  supabaseUpsertListing,
} from "@/lib/supabase/store-listings";
import { revalidateStoreSurfaces } from "@/lib/store/revalidate-store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdminSession();
    const { id } = await ctx.params;
    const listing = await supabaseGetListingById(decodeURIComponent(id));
    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ listing });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdminSession();
    const { id } = await ctx.params;
    const existing = await supabaseGetListingById(decodeURIComponent(id));
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = (await request.json()) as Record<string, unknown>;
    const listing = await listingFromAdminBody(body, admin.email, existing);
    const saved = await supabaseUpsertListing(listing);
    await markListingApproved(saved.id);
    revalidateStoreSurfaces({ slug: saved.slug, listingId: saved.id });
    return NextResponse.json({ listing: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdminSession();
    const { id } = await ctx.params;
    const ok = await supabaseDeleteListingById(decodeURIComponent(id));
    if (!ok) return NextResponse.json({ error: "Not found or already deleted" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
