import {
  DEFAULT_POPULAR_HIGHLIGHTS,
  normalizePopularHighlights,
  type PopularHighlightCard,
} from "@/lib/admin/popular-highlights";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

const SETTINGS_KEY = "popular_highlights";

export async function loadPopularHighlights(): Promise<PopularHighlightCard[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_POPULAR_HIGHLIGHTS.map((c) => ({ ...c }));
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return DEFAULT_POPULAR_HIGHLIGHTS.map((c) => ({ ...c }));
    }
    return normalizePopularHighlights(data.value as PopularHighlightCard[]);
  } catch {
    return DEFAULT_POPULAR_HIGHLIGHTS.map((c) => ({ ...c }));
  }
}

export async function savePopularHighlights(
  items: PopularHighlightCard[],
  updatedBy: string,
): Promise<PopularHighlightCard[]> {
  const normalized = normalizePopularHighlights(items);
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: SETTINGS_KEY,
        value: normalized,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw error;
  return normalized;
}
