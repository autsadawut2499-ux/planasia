import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import type { LineWebhookEvent } from "@/lib/line/webhook";

const KEY = "line_webhook_sightings";
const MAX = 30;

export type LineUserSighting = {
  userId: string;
  eventType: string;
  displayHint?: string;
  seenAt: string;
};

/**
 * Remember recent LINE userIds from webhook follow/message events
 * so admin can copy a real U… id into payment settings.
 */
export async function recordLineUserSightings(
  events: LineWebhookEvent[],
): Promise<LineUserSighting[]> {
  const fresh: LineUserSighting[] = [];
  for (const ev of events) {
    const userId = ev.source?.userId?.trim();
    if (!userId || !userId.startsWith("U")) continue;
    if (ev.type !== "follow" && ev.type !== "message" && ev.type !== "postback") {
      continue;
    }
    fresh.push({
      userId,
      eventType: String(ev.type ?? "unknown"),
      displayHint:
        ev.type === "message" && ev.message?.type === "text"
          ? String(ev.message.text ?? "").slice(0, 80)
          : undefined,
      seenAt: new Date(ev.timestamp ?? Date.now()).toISOString(),
    });
  }
  if (!fresh.length || !isSupabaseConfigured()) return fresh;

  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("site_settings")
      .select("value")
      .eq("key", KEY)
      .maybeSingle();

    const prev = Array.isArray((data?.value as { sightings?: unknown })?.sightings)
      ? ((data!.value as { sightings: LineUserSighting[] }).sightings ?? [])
      : [];

    const byId = new Map<string, LineUserSighting>();
    for (const s of [...fresh, ...prev]) {
      if (!byId.has(s.userId)) byId.set(s.userId, s);
    }
    const sightings = Array.from(byId.values())
      .sort((a, b) => b.seenAt.localeCompare(a.seenAt))
      .slice(0, MAX);

    await sb.from("site_settings").upsert(
      {
        key: KEY,
        value: { sightings },
        updated_at: new Date().toISOString(),
        updated_by: "line-webhook",
      },
      { onConflict: "key" },
    );
    return sightings;
  } catch (err) {
    console.error("[line-webhook] failed to persist sightings", err);
    return fresh;
  }
}

export async function listLineUserSightings(): Promise<LineUserSighting[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", KEY)
      .maybeSingle();
    const sightings = (data?.value as { sightings?: LineUserSighting[] } | null)
      ?.sightings;
    return Array.isArray(sightings) ? sightings : [];
  } catch {
    return [];
  }
}
