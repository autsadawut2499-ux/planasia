import "server-only";

import {
  defaultAiRenderGuide,
  normalizeAiRenderGuide,
  type AiRenderGuide,
  type AiRenderGuideImageSet,
  type AiRenderGuidePrompt,
} from "@/lib/vendor/ai-render-guide";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

interface PromptRow {
  id: string;
  sort_order: number;
  title: string;
  content: string;
}

interface ImageRow {
  id: string;
  sort_order: number;
  title: string;
  before_url: string;
  after_url: string;
}

function promptFromRow(row: PromptRow): AiRenderGuidePrompt {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    title: row.title ?? "",
    content: row.content ?? "",
  };
}

function imageFromRow(row: ImageRow): AiRenderGuideImageSet {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    title: row.title ?? "",
    beforeUrl: row.before_url ?? "",
    afterUrl: row.after_url ?? "",
  };
}

export async function loadAiRenderGuide(): Promise<AiRenderGuide> {
  if (!isSupabaseConfigured()) return defaultAiRenderGuide();

  try {
    const admin = getSupabaseAdmin();
    const [promptsRes, imagesRes] = await Promise.all([
      admin.from("ai_render_guide_prompts").select("id,sort_order,title,content").order("sort_order"),
      admin
        .from("ai_render_guide_images")
        .select("id,sort_order,title,before_url,after_url")
        .order("sort_order"),
    ]);

    if (promptsRes.error || imagesRes.error) {
      // Tables may not exist yet — fall back to defaults.
      return defaultAiRenderGuide();
    }

    return normalizeAiRenderGuide({
      prompts: (promptsRes.data as PromptRow[] | null)?.map(promptFromRow) ?? [],
      images: (imagesRes.data as ImageRow[] | null)?.map(imageFromRow) ?? [],
    });
  } catch {
    return defaultAiRenderGuide();
  }
}

export async function saveAiRenderGuide(guide: AiRenderGuide): Promise<AiRenderGuide> {
  const normalized = normalizeAiRenderGuide(guide);
  const now = new Date().toISOString();
  const admin = getSupabaseAdmin();

  const promptRows = normalized.prompts.map((p) => ({
    id: p.id,
    sort_order: p.sortOrder,
    title: p.title,
    content: p.content,
    updated_at: now,
  }));

  const imageRows = normalized.images.map((img) => ({
    id: img.id,
    sort_order: img.sortOrder,
    title: img.title,
    before_url: img.beforeUrl,
    after_url: img.afterUrl,
    updated_at: now,
  }));

  const [pRes, iRes] = await Promise.all([
    admin.from("ai_render_guide_prompts").upsert(promptRows, { onConflict: "id" }),
    admin.from("ai_render_guide_images").upsert(imageRows, { onConflict: "id" }),
  ]);

  if (pRes.error) throw pRes.error;
  if (iRes.error) throw iRes.error;

  return normalized;
}
