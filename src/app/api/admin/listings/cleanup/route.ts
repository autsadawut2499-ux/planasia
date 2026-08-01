import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { supabaseDeleteDummyListings } from "@/lib/supabase/store-listings";

export const dynamic = "force-dynamic";

/** Delete seed-demo / community-ai placeholder listings. */
export async function POST() {
  try {
    await requireAdminSession();
    const deleted = await supabaseDeleteDummyListings();
    return NextResponse.json({ ok: true, deleted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cleanup failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
