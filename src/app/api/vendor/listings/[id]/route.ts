import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession } from "@/lib/vendor/auth";
import {
  supabaseDeleteListing,
  supabaseSetListingPublished,
} from "@/lib/supabase/store-listings";
import { revalidateStoreSurfaces } from "@/lib/store/revalidate-store";

export const dynamic = "force-dynamic";

/** Hide / unpublish (or republish) without deleting the listing. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireVendorSession(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as {
      isPublished?: unknown;
      published?: unknown;
    } | null;

    const raw =
      typeof body?.isPublished === "boolean"
        ? body.isPublished
        : typeof body?.published === "boolean"
          ? body.published
          : null;
    if (raw === null) {
      return NextResponse.json(
        { error: "isPublished (boolean) is required" },
        { status: 400 },
      );
    }

    const listing = await supabaseSetListingPublished(id, auth.ownerKey, raw);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    revalidateStoreSurfaces({ slug: listing.slug, listingId: listing.id });
    return NextResponse.json({
      ok: true,
      listing,
      isPublished: listing.isPublished !== false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireVendorSession(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const deleted = await supabaseDeleteListing(id, auth.ownerKey);
    if (!deleted) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
