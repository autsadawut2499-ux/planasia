import type { DesignDraftRecord } from "@/lib/design/draft-store";
import { getSupabaseAdmin } from "@/lib/supabase/client";

function ownerDocId(ownerKey: string): string {
  return ownerKey.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function saveDesignDraft(record: DesignDraftRecord): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("design_drafts")
    .upsert(
      {
        owner_key: ownerDocId(record.ownerKey),
        record,
        updated_at: record.updatedAt,
      },
      { onConflict: "owner_key" },
    );
  if (error) throw error;
}

export async function loadDesignDraft(ownerKey: string): Promise<DesignDraftRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("design_drafts")
    .select("record")
    .eq("owner_key", ownerDocId(ownerKey))
    .maybeSingle();
  if (error) throw error;
  return data ? (data.record as DesignDraftRecord) : null;
}

export async function deleteDesignDraft(ownerKey: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("design_drafts")
    .delete()
    .eq("owner_key", ownerDocId(ownerKey));
  if (error) throw error;
}
