import { NextRequest, NextResponse } from "next/server";
import { isProductionRuntime } from "@/lib/payments/config";
import { recomputeRankingNow } from "@/lib/ranking/popular";

export const dynamic = "force-dynamic";

/**
 * Daily Smart Ranking recompute. Wired to Vercel Cron (see vercel.json).
 * Requires `Authorization: Bearer <CRON_SECRET>` in production.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (isProductionRuntime() && !secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is required in production" },
      { status: 503 },
    );
  }
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const updated = await recomputeRankingNow();
    return NextResponse.json({ ok: true, updated, at: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/ranking] recompute failed", err);
    return NextResponse.json({ error: "Recompute failed" }, { status: 500 });
  }
}
