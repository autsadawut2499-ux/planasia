import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { listingFromAdminBody, markListingApproved } from "@/lib/admin/listing-mutate";
import {
  supabaseGetListingsForAdmin,
  supabaseUpsertVendorListing,
} from "@/lib/supabase/store-listings";
import { revalidateStoreSurfaces } from "@/lib/store/revalidate-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
    const style = (request.nextUrl.searchParams.get("style") ?? "").trim();
    const source = (request.nextUrl.searchParams.get("source") ?? "").trim();
    let listings = await supabaseGetListingsForAdmin(500);

    if (style) listings = listings.filter((l) => l.style === style);
    if (source) listings = listings.filter((l) => l.source === source);
    if (q) {
      listings = listings.filter((l) => {
        const hay = `${l.name} ${l.planId} ${l.id} ${l.style} ${l.collection ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({ listings, total: listings.length });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = (await request.json()) as Record<string, unknown>;
    const listing = await listingFromAdminBody(body, admin.email, null);
    const saved = await supabaseUpsertVendorListing(listing);
    await markListingApproved(saved.id);
    revalidateStoreSurfaces({ slug: saved.slug, listingId: saved.id });
    return NextResponse.json({ listing: saved }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create listing";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
