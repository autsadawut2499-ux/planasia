import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession } from "@/lib/vendor/auth";
import { isWebPushConfigured } from "@/lib/push/vapid";
import {
  deletePushSubscription,
  upsertPushSubscription,
} from "@/lib/push/subscriptions";

/**
 * Register / refresh a draftsman's PWA push subscription.
 * Body: { endpoint, keys: { p256dh, auth } }
 */
export async function POST(request: NextRequest) {
  if (!isWebPushConfigured()) {
    return NextResponse.json({ error: "Web Push not configured" }, { status: 503 });
  }

  const vendor = await requireVendorSession(request);
  if (!vendor.ok) return vendor.response;

  const body = await request.json().catch(() => null);
  const endpoint = String(body?.endpoint ?? "").trim();
  const p256dh = String(body?.keys?.p256dh ?? "").trim();
  const auth = String(body?.keys?.auth ?? "").trim();

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const saved = await upsertPushSubscription({
    ownerKey: vendor.ownerKey,
    endpoint,
    p256dh,
    auth,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  if (!saved) {
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Remove a device subscription (user turned notifications off). */
export async function DELETE(request: NextRequest) {
  const vendor = await requireVendorSession(request);
  if (!vendor.ok) return vendor.response;

  const body = await request.json().catch(() => null);
  const endpoint = String(body?.endpoint ?? "").trim();
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  }

  await deletePushSubscription(endpoint, vendor.ownerKey);
  return NextResponse.json({ ok: true });
}
