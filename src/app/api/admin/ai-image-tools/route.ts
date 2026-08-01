import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { AiImageTool } from "@/lib/vendor/ai-image-tools";
import { loadAiImageTools, saveAiImageTools } from "@/lib/supabase/ai-image-tools";

export async function GET() {
  try {
    await requireAdminSession();
    const cards = await loadAiImageTools();
    return NextResponse.json({ cards });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const cards = body.cards as AiImageTool[] | undefined;

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "cards array is required" }, { status: 400 });
    }

    const saved = await saveAiImageTools(cards, admin.email);
    return NextResponse.json({ cards: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save AI image tools";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
