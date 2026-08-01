import { NextResponse } from "next/server";
import { getVapidConfig } from "@/lib/push/vapid";

/** Public VAPID key for the browser PushManager.subscribe() call. */
export async function GET() {
  const vapid = getVapidConfig();
  if (!vapid) {
    return NextResponse.json(
      { configured: false, error: "Web Push not configured" },
      { status: 503 },
    );
  }
  return NextResponse.json({ configured: true, publicKey: vapid.publicKey });
}
