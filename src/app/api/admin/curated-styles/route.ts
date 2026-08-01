import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { CuratedStyleItem } from "@/lib/admin/curated-styles";
import { loadCuratedStyles, saveCuratedStyles } from "@/lib/supabase/curated-styles";

export async function GET() {
  try {
    await requireAdminSession();
    const styles = await loadCuratedStyles();
    return NextResponse.json({ styles });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const styles = body.styles as CuratedStyleItem[] | undefined;

    if (!styles || !Array.isArray(styles)) {
      return NextResponse.json({ error: "styles array is required" }, { status: 400 });
    }

    const saved = await saveCuratedStyles(styles, admin.email);
    return NextResponse.json({ styles: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save curated styles";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
