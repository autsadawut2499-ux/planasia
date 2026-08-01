import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export interface PushSubscriptionRecord {
  id: string;
  ownerKey: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

interface PushRow {
  id: string;
  owner_key: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
}

function rowToSub(row: PushRow): PushSubscriptionRecord {
  return {
    id: row.id,
    ownerKey: row.owner_key,
    endpoint: row.endpoint,
    p256dh: row.p256dh,
    auth: row.auth,
    userAgent: row.user_agent ?? undefined,
  };
}

export async function upsertPushSubscription(input: {
  ownerKey: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}): Promise<PushSubscriptionRecord | null> {
  if (!isSupabaseConfigured() || !input.ownerKey || !input.endpoint) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("push_subscriptions")
    .upsert(
      {
        owner_key: input.ownerKey,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        user_agent: input.userAgent ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    )
    .select("*")
    .single();

  if (error) {
    console.error("[push] upsert failed", error);
    return null;
  }
  return rowToSub(data as PushRow);
}

export async function deletePushSubscription(endpoint: string, ownerKey?: string): Promise<void> {
  if (!isSupabaseConfigured() || !endpoint) return;
  let q = getSupabaseAdmin().from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (ownerKey) q = q.eq("owner_key", ownerKey);
  const { error } = await q;
  if (error) console.error("[push] delete failed", error);
}

export async function listPushSubscriptions(ownerKey: string): Promise<PushSubscriptionRecord[]> {
  if (!isSupabaseConfigured() || !ownerKey) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("push_subscriptions")
    .select("*")
    .eq("owner_key", ownerKey);
  if (error) {
    console.error("[push] list failed", error);
    return [];
  }
  return ((data as PushRow[]) ?? []).map(rowToSub);
}
