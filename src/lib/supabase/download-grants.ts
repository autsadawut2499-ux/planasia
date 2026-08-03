import type { DownloadGrant } from "@/lib/payments/tokens";
import { getSupabaseAdmin } from "@/lib/supabase/client";

type FileKind = NonNullable<DownloadGrant["fileKind"]>;

interface DownloadGrantRow {
  token: string;
  plan_id: string;
  plan_document_id?: string | null;
  listing_id?: string | null;
  file_index?: number | null;
  file_kind?: FileKind | null;
  format: DownloadGrant["format"];
  user_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  expires_at: string;
}

function resolveFileKind(row: DownloadGrantRow): FileKind {
  if (
    row.file_kind === "blueprint" ||
    row.file_kind === "cad" ||
    row.file_kind === "boq" ||
    row.file_kind === "calc"
  ) {
    return row.file_kind;
  }
  return row.format === "cad" ? "cad" : "blueprint";
}

function rowToGrant(row: DownloadGrantRow): DownloadGrant {
  return {
    token: row.token,
    planId: row.plan_id,
    planDocumentId: row.plan_document_id ?? undefined,
    listingId: row.listing_id ?? undefined,
    fileIndex: row.file_index ?? 0,
    fileKind: resolveFileKind(row),
    format: row.format,
    userId: row.user_id ?? undefined,
    stripeSessionId: row.stripe_session_id ?? undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

function grantToRow(grant: DownloadGrant): DownloadGrantRow {
  const fileKind =
    grant.fileKind ?? (grant.format === "cad" ? "cad" : "blueprint");
  return {
    token: grant.token,
    plan_id: grant.planId,
    plan_document_id: grant.planDocumentId ?? null,
    listing_id: grant.listingId ?? null,
    file_index: grant.fileIndex ?? 0,
    file_kind: fileKind,
    format: grant.format,
    user_id: grant.userId ?? null,
    stripe_session_id: grant.stripeSessionId ?? null,
    created_at: grant.createdAt,
    expires_at: grant.expiresAt,
  };
}

function stripMissingColumns(
  row: DownloadGrantRow,
  errorMessage: string,
): Partial<DownloadGrantRow> {
  const next: Record<string, unknown> = { ...row };
  const msg = errorMessage.toLowerCase();
  if (msg.includes("plan_document_id")) delete next.plan_document_id;
  if (msg.includes("listing_id")) delete next.listing_id;
  if (msg.includes("file_index")) delete next.file_index;
  if (msg.includes("file_kind")) delete next.file_kind;
  return next as Partial<DownloadGrantRow>;
}

export async function storeDownloadGrant(grant: DownloadGrant): Promise<void> {
  let row: Partial<DownloadGrantRow> = grantToRow(grant);

  for (let attempt = 0; attempt < 4; attempt++) {
    const { error } = await getSupabaseAdmin()
      .from("download_grants")
      .upsert(row, { onConflict: "token" });
    if (!error) return;

    const stripped = stripMissingColumns(row as DownloadGrantRow, error.message ?? "");
    if (JSON.stringify(stripped) === JSON.stringify(row)) throw error;
    row = stripped;
  }
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

/** True when the user holds a non-expired download grant for a plan (verified purchase). */
export async function hasDownloadGrant(userId: string, planId: string): Promise<boolean> {
  if (!userId || !planId) return false;
  const { data, error } = await getSupabaseAdmin()
    .from("download_grants")
    .select("token, plan_id, user_id, expires_at")
    .eq("user_id", userId)
    .eq("plan_id", planId)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
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

/** Non-expired download grants for a signed-in buyer (My Purchases). */
export async function listValidGrantsByUserId(
  userId: string,
): Promise<DownloadGrant[]> {
  if (!userId.trim()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("download_grants")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data as DownloadGrantRow[]).map(rowToGrant);
}
