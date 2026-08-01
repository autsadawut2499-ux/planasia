import { NextResponse } from "next/server";
import { getDraftsmanDirectory } from "@/lib/vendors/directory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const draftsmen = await getDraftsmanDirectory();
    return NextResponse.json({ draftsmen });
  } catch (error) {
    console.error("[draftsmen] failed", error);
    return NextResponse.json({ draftsmen: [], error: "failed" }, { status: 500 });
  }
}
