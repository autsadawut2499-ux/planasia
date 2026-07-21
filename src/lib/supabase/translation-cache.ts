import { getSupabaseAdmin } from "@/lib/supabase/client";

export async function getCachedTranslations(
  cacheKey: string,
): Promise<string[] | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("translation_cache")
    .select("translations")
    .eq("cache_key", cacheKey)
    .maybeSingle();
  if (error) throw error;
  return data ? (data.translations as string[]) : null;
}

export async function setCachedTranslations(
  cacheKey: string,
  targetLocale: string,
  translations: string[],
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("translation_cache")
    .upsert(
      {
        cache_key: cacheKey,
        target_locale: targetLocale,
        translations,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "cache_key" },
    );
  if (error) throw error;
}
