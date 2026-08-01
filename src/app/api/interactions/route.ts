import { NextRequest, NextResponse } from "next/server";
import { getViewerFromRequest, resolvePrimaryUserId } from "@/lib/user/identity";
import { recordInteraction, type InteractionEvent } from "@/lib/supabase/interactions";
import { supabaseIncrementCounter } from "@/lib/supabase/store-listings";

export const dynamic = "force-dynamic";

const VALID_EVENTS: InteractionEvent[] = ["view", "cart", "wishlist", "purchase", "chat"];

// Which engagement counter a raw event bumps for the Smart Ranking score.
const COUNTER_FIELD: Partial<Record<InteractionEvent, "likes" | "views" | "sales">> = {
  view: "views",
  wishlist: "likes",
  purchase: "sales",
};

export async function POST(request: NextRequest) {
  const viewer = getViewerFromRequest(request);

  let body: {
    listingId?: string;
    eventType?: string;
    metadata?: Record<string, unknown>;
    browserId?: string;
    sessionUserId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Identity from headers, falling back to the body so navigator.sendBeacon
  // (which cannot set custom headers) can still attribute dwell-time events.
  const browserId = request.headers.get("x-browser-id") ?? viewer.browserId ?? body.browserId;
  const sessionUserId =
    request.headers.get("x-session-user-id") ?? viewer.sessionUserId ?? body.sessionUserId;
  const viewerKey = resolvePrimaryUserId(sessionUserId, browserId ?? viewer.primaryId);

  if (!viewerKey) {
    return NextResponse.json({ error: "viewer identity required" }, { status: 401 });
  }

  const { listingId, eventType, metadata } = body;
  if (!listingId || !eventType || !VALID_EVENTS.includes(eventType as InteractionEvent)) {
    return NextResponse.json({ error: "listingId and valid eventType required" }, { status: 400 });
  }

  try {
    await recordInteraction({
      listingId,
      viewerKey,
      sessionUserId: sessionUserId ?? undefined,
      browserId: browserId ?? undefined,
      eventType: eventType as InteractionEvent,
      metadata,
    });

    // Bump the Smart Ranking engagement counter (best-effort — never fail the request).
    const field = COUNTER_FIELD[eventType as InteractionEvent];
    if (field) {
      void supabaseIncrementCounter(listingId, field).catch((e) =>
        console.error("[interactions] counter bump failed", e),
      );
    }
  } catch (error) {
    console.error("[interactions] failed to record", error);
    return NextResponse.json({ error: "failed to record interaction" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
