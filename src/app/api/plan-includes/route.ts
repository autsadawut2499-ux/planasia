import { NextResponse } from "next/server";
import { loadPlanIncludes } from "@/lib/supabase/plan-includes";

export const dynamic = "force-dynamic";

/** Public read — article page “แบบประกอบด้วยอะไรบ้าง”. */
export async function GET() {
  const content = await loadPlanIncludes();
  return NextResponse.json({ content });
}
