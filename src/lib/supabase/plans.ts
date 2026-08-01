import type { HousePlanDocument } from "@/lib/plans/schema";
import { getSupabaseAdmin } from "@/lib/supabase/client";

export async function savePlanDocument(doc: HousePlanDocument): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("house_plans")
    .upsert(
      { id: doc.id, document: doc, created_at: doc.createdAt },
      { onConflict: "id" },
    );
  if (error) throw error;
}

export async function loadPlanDocument(id: string): Promise<HousePlanDocument | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("house_plans")
    .select("document")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? (data.document as HousePlanDocument) : null;
}
