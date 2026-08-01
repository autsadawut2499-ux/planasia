import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Tunable ranking parameters. Stored in site_settings under the `ranking` key so
 * an admin can retune weights / decay without a redeploy.
 */
export interface RankingConfig {
  likeWeight: number;
  viewWeight: number;
  salesWeight: number;
  /** Time-decay exponent — higher = old plans fall off faster. */
  gravity: number;
  /** How often the cached scores are recomputed (minutes). */
  refreshMinutes: number;
  /** Shuffle plans with near-equal scores on each request. */
  randomize: boolean;
  /** Default number of plans shown in the home "popular" section. */
  homeLimit: number;
}

export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  likeWeight: 1,
  viewWeight: 0.1,
  salesWeight: 5,
  gravity: 1.5,
  refreshMinutes: 60,
  randomize: true,
  homeLimit: 12,
};

const SETTINGS_KEY = "ranking";

export async function getRankingConfig(): Promise<RankingConfig> {
  if (!isSupabaseConfigured()) return DEFAULT_RANKING_CONFIG;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    if (error || !data?.value) return DEFAULT_RANKING_CONFIG;
    return { ...DEFAULT_RANKING_CONFIG, ...(data.value as Partial<RankingConfig>) };
  } catch {
    return DEFAULT_RANKING_CONFIG;
  }
}

export async function saveRankingConfig(
  partial: Partial<RankingConfig>,
  updatedBy = "admin",
): Promise<RankingConfig> {
  const merged = { ...(await getRankingConfig()), ...partial };
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      { key: SETTINGS_KEY, value: merged, updated_at: new Date().toISOString(), updated_by: updatedBy },
      { onConflict: "key" },
    );
  if (error) throw error;
  return merged;
}
