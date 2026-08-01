import {
  DEFAULT_PLAN_INCLUDES,
  normalizePlanIncludes,
  PLAN_INCLUDES_SETTINGS_KEY,
  type PlanIncludesContent,
} from "@/lib/content/plan-includes";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export async function loadPlanIncludes(): Promise<PlanIncludesContent> {
  if (!isSupabaseConfigured()) return DEFAULT_PLAN_INCLUDES;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", PLAN_INCLUDES_SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) return DEFAULT_PLAN_INCLUDES;
    return normalizePlanIncludes(data.value as Partial<PlanIncludesContent>);
  } catch {
    return DEFAULT_PLAN_INCLUDES;
  }
}

export async function savePlanIncludes(
  content: PlanIncludesContent,
  updatedBy: string,
): Promise<PlanIncludesContent> {
  const normalized = normalizePlanIncludes(content);
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: PLAN_INCLUDES_SETTINGS_KEY,
        value: normalized,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw error;
  return normalized;
}
