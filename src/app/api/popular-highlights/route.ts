import { NextResponse } from "next/server";
import { visiblePopularHighlights } from "@/lib/admin/popular-highlights";
import { loadPopularHighlights } from "@/lib/supabase/popular-highlights";

/** Public: enabled popular topic cards for the homepage (max 4). */
export async function GET() {
  try {
    const all = await loadPopularHighlights();
    return NextResponse.json(
      { cards: visiblePopularHighlights(all) },
      {
        headers: {
          // Admin can change images at any time — avoid stale CDN/browser caches.
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load popular highlights";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
