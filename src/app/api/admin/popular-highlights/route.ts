import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { PopularHighlightCard } from "@/lib/admin/popular-highlights";
import { loadPopularHighlights, savePopularHighlights } from "@/lib/supabase/popular-highlights";
import { revalidateSiteSurfaces } from "@/lib/site/revalidate-site";

export async function GET() {
  try {
    await requireAdminSession();
    const cards = await loadPopularHighlights();
    return NextResponse.json({ cards });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const cards = body.cards as PopularHighlightCard[] | undefined;

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "cards array is required" }, { status: 400 });
    }

    const saved = await savePopularHighlights(cards, admin.email);
    console.info("[admin/popular-highlights] saved", {
      count: saved.length,
      by: admin.email,
      images: saved.map((c) => ({ id: c.id, imageUrl: c.imageUrl?.slice(0, 80) })),
    });
    revalidateSiteSurfaces();
    return NextResponse.json({ cards: saved, ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save popular highlights";
    console.error("[admin/popular-highlights] PUT failed", message);
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
