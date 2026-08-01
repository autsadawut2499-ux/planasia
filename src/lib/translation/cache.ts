import { createHash } from "crypto";
import {
  getCachedTranslations as supabaseGetCachedTranslations,
  setCachedTranslations as supabaseSetCachedTranslations,
} from "@/lib/supabase/translation-cache";

function cacheKey(targetLocale: string, texts: string[]): string {
  const payload = `${targetLocale}::${texts.join("\u0001")}`;
  return createHash("sha256").update(payload).digest("hex");
}

export async function getCachedTranslations(
  targetLocale: string,
  texts: string[],
): Promise<string[] | null> {
  return supabaseGetCachedTranslations(cacheKey(targetLocale, texts));
}

export async function setCachedTranslations(
  targetLocale: string,
  texts: string[],
  translations: string[],
): Promise<void> {
  await supabaseSetCachedTranslations(cacheKey(targetLocale, texts), targetLocale, translations);
}
