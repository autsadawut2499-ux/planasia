import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { normalizePlanIncludes, type PlanIncludesContent } from "@/lib/content/plan-includes";
import { loadPlanIncludes, savePlanIncludes } from "@/lib/supabase/plan-includes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const content = await loadPlanIncludes();
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const content = normalizePlanIncludes(body.content as Partial<PlanIncludesContent>);
    const saved = await savePlanIncludes(content, admin.email);
    return NextResponse.json({ content: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
