import { NextResponse } from "next/server";
import { getDraftsmanByKey } from "@/lib/vendors/directory";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** Fresh public profile card — never cached (cover/avatar must update immediately). */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await getDraftsmanByKey(decodeURIComponent(id));
    if (!data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json(
      { card: data.card },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      },
    );
  } catch (error) {
    console.error("[draftsmen/:id] failed", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
