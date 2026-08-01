import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getRankingConfig, saveRankingConfig } from "@/lib/ranking/config";
import { recomputeRankingNow } from "@/lib/ranking/popular";
import { supabaseGetListingsForAdmin } from "@/lib/supabase/store-listings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const [config, listings] = await Promise.all([
      getRankingConfig(),
      supabaseGetListingsForAdmin(200),
    ]);
    return NextResponse.json({ config, listings });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const config = await saveRankingConfig(body.config ?? body, admin.email);
    // Re-score immediately so the change is visible right away.
    await recomputeRankingNow();
    return NextResponse.json({ config });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ error: message }, { status: message.includes("Unauthorized") ? 401 : 500 });
  }
}

export async function POST() {
  try {
    await requireAdminSession();
    const count = await recomputeRankingNow();
    return NextResponse.json({ ok: true, updated: count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to recompute";
    return NextResponse.json({ error: message }, { status: message.includes("Unauthorized") ? 401 : 500 });
  }
}
