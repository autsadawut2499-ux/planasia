import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { loadAiRenderGuide, saveAiRenderGuide } from "@/lib/supabase/ai-render-guide";
import type { AiRenderGuide } from "@/lib/vendor/ai-render-guide";

export async function GET() {
  try {
    await requireAdminSession();
    const guide = await loadAiRenderGuide();
    return NextResponse.json({ guide });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const guide = body.guide as AiRenderGuide | undefined;

    if (!guide || typeof guide !== "object") {
      return NextResponse.json({ error: "guide object is required" }, { status: 400 });
    }

    const saved = await saveAiRenderGuide(guide);
    return NextResponse.json({ guide: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save AI render guide";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
