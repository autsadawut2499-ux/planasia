import type { DownloadGrant } from "@/lib/payments/tokens";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface DownloadGrantRow {
  token: string;
  plan_id: string;
  format: DownloadGrant["format"];
  user_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  expires_at: string;
}

function rowToGrant(row: DownloadGrantRow): DownloadGrant {
  return {
    token: row.token,
    planId: row.plan_id,
    format: row.format,
    userId: row.user_id ?? undefined,
    stripeSessionId: row.stripe_session_id ?? undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

function grantToRow(grant: DownloadGrant): DownloadGrantRow {
  return {
    token: grant.token,
    plan_id: grant.planId,
    format: grant.format,
    user_id: grant.userId ?? null,
    stripe_session_id: grant.stripeSessionId ?? null,
    created_at: grant.createdAt,
    expires_at: grant.expiresAt,
  };
}

export async function storeDownloadGrant(grant: DownloadGrant): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("download_grants")
    .upsert(grantToRow(grant), { onConflict: "token" });
  if (error) throw error;
}

export async function findValidGrant(token: string): Promise<DownloadGrant | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("download_grants")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const grant = rowToGrant(data as DownloadGrantRow);
  if (new Date(grant.expiresAt) < new Date()) return null;
  return grant;
}

export async function findGrantByStripeSession(
  sessionId: string,
): Promise<DownloadGrant | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("download_grants")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToGrant(data as DownloadGrantRow) : null;
}

export async function findGrantsByStripeSession(sessionId: string): Promise<DownloadGrant[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("download_grants")
    .select("*")
    .eq("stripe_session_id", sessionId);
  if (error) throw error;
  return (data as DownloadGrantRow[]).map(rowToGrant);
}
