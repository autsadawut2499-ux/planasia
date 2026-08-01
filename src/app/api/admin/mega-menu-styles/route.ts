import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { MegaMenuStyleCard } from "@/lib/admin/mega-menu-styles";
import { loadMegaMenuStyles, saveMegaMenuStyles } from "@/lib/supabase/mega-menu-styles";
import { revalidateSiteSurfaces } from "@/lib/site/revalidate-site";

export async function GET() {
  try {
    await requireAdminSession();
    const cards = await loadMegaMenuStyles();
    return NextResponse.json({ cards });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const cards = body.cards as MegaMenuStyleCard[] | undefined;

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "cards array is required" }, { status: 400 });
    }

    const saved = await saveMegaMenuStyles(cards, admin.email);
    revalidateSiteSurfaces();
    return NextResponse.json({ cards: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save mega menu styles";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
