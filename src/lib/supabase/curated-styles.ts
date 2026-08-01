import {
  DEFAULT_CURATED_STYLES,
  mergeCuratedStyles,
  type CuratedStyleItem,
} from "@/lib/admin/curated-styles";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

const SETTINGS_KEY = "curated_styles";

export async function loadCuratedStyles(): Promise<CuratedStyleItem[]> {
  if (!isSupabaseConfigured()) return DEFAULT_CURATED_STYLES;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) return DEFAULT_CURATED_STYLES;
    const stored = data.value as CuratedStyleItem[];
    if (!Array.isArray(stored)) return DEFAULT_CURATED_STYLES;
    return mergeCuratedStyles(stored);
  } catch {
    return DEFAULT_CURATED_STYLES;
  }
}

export async function saveCuratedStyles(
  items: CuratedStyleItem[],
  updatedBy: string,
): Promise<CuratedStyleItem[]> {
  const merged = mergeCuratedStyles(items);
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: SETTINGS_KEY,
        value: merged,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw error;
  return merged;
}
