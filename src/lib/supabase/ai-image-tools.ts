import {
  AI_IMAGE_TOOLS,
  normalizeAiImageTools,
  type AiImageTool,
} from "@/lib/vendor/ai-image-tools";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export const AI_IMAGE_TOOLS_SETTINGS_KEY = "ai_image_tools";

export async function loadAiImageTools(): Promise<AiImageTool[]> {
  if (!isSupabaseConfigured()) {
    return AI_IMAGE_TOOLS.map((c) => ({ ...c }));
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", AI_IMAGE_TOOLS_SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return AI_IMAGE_TOOLS.map((c) => ({ ...c }));
    }
    return normalizeAiImageTools(data.value);
  } catch {
    return AI_IMAGE_TOOLS.map((c) => ({ ...c }));
  }
}

export async function saveAiImageTools(
  items: AiImageTool[],
  updatedBy: string,
): Promise<AiImageTool[]> {
  const normalized = normalizeAiImageTools(items);
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: AI_IMAGE_TOOLS_SETTINGS_KEY,
        value: normalized,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw error;
  return normalized;
}
