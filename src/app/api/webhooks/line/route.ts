import { NextRequest, NextResponse } from "next/server";
import { recordLineUserSightings } from "@/lib/line/sightings";
import {
  getLineChannelSecret,
  type LineWebhookBody,
  verifyLineWebhookSignature,
} from "@/lib/line/webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * LINE Messaging API webhook.
 *
 * Paste this in LINE Developers → Messaging API → Webhook URL (no trailing slash):
 *   https://www.planasia.net/api/webhooks/line
 *
 * Requires env: LINE_CHANNEL_SECRET (and Channel access token elsewhere for push).
 * Enable "Use webhook" and click Verify in the LINE console.
 *
 * When someone adds/follows the OA bot (or messages it), we store their U… userId
 * so you can copy it into Admin → Payment settings → Admin LINE User ID.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/webhooks/line",
    provider: "line-messaging-api",
    purpose:
      "Receive LINE follow/message events; capture admin U… user IDs for order notifications",
    webhookUrlProduction: "https://www.planasia.net/api/webhooks/line",
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!getLineChannelSecret()) {
    console.error("[line-webhook] LINE_CHANNEL_SECRET is not set");
    // Still 200 so LINE verify does not flap endlessly during setup —
    // but signature cannot be checked.
    return NextResponse.json(
      { ok: false, error: "LINE_CHANNEL_SECRET missing" },
      { status: 503 },
    );
  }

  if (!verifyLineWebhookSignature(rawBody, signature)) {
    console.warn("[line-webhook] invalid signature");
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  let body: LineWebhookBody;
  try {
    body = JSON.parse(rawBody) as LineWebhookBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events : [];
  console.info("[line-webhook] events", {
    count: events.length,
    types: events.map((e) => e.type),
    userIds: events.map((e) => e.source?.userId).filter(Boolean),
  });

  if (events.length) {
    await recordLineUserSightings(events);
  }

  // LINE requires a quick 200 OK.
  return NextResponse.json({ ok: true });
}
