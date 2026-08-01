import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { supabaseSetPinned } from "@/lib/supabase/store-listings";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const listingId = String(body.listingId ?? "");
    if (!listingId) {
      return NextResponse.json({ error: "listingId required" }, { status: 400 });
    }
    await supabaseSetPinned(listingId, Boolean(body.pinned));
    return NextResponse.json({ ok: true, listingId, pinned: Boolean(body.pinned) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to pin";
    return NextResponse.json({ error: message }, { status: message.includes("Unauthorized") ? 401 : 500 });
  }
}
