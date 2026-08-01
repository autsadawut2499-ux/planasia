/**
 * Admin-managed AI Rendering Guide for draftsmen:
 * 5 prompt packs + 5 before/after house image pairs.
 */

export const AI_RENDER_GUIDE_SLOT_COUNT = 5;

export interface AiRenderGuidePrompt {
  id: string;
  sortOrder: number;
  title: string;
  content: string;
}

export interface AiRenderGuideImageSet {
  id: string;
  sortOrder: number;
  title: string;
  beforeUrl: string;
  afterUrl: string;
}

export interface AiRenderGuide {
  prompts: AiRenderGuidePrompt[];
  images: AiRenderGuideImageSet[];
}

export function defaultAiRenderGuide(): AiRenderGuide {
  const prompts: AiRenderGuidePrompt[] = Array.from({ length: AI_RENDER_GUIDE_SLOT_COUNT }, (_, i) => ({
    id: `prompt-${i + 1}`,
    sortOrder: i + 1,
    title: `ชุดคำสั่ง ${i + 1}`,
    content: "",
  }));
  const images: AiRenderGuideImageSet[] = Array.from({ length: AI_RENDER_GUIDE_SLOT_COUNT }, (_, i) => ({
    id: `image-${i + 1}`,
    sortOrder: i + 1,
    title: `ตัวอย่างเรนเดอร์ชุดที่ ${i + 1}`,
    beforeUrl: "",
    afterUrl: "",
  }));
  return { prompts, images };
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Fix legacy auto-translated titles ("พร้อมพ์ต" / "พร้อมพัด") → ชุดคำสั่ง. */
export function rewriteGuideSetTitle(title: string, sortOrder: number): string {
  const trimmed = title.trim();
  if (!trimmed) return `ชุดคำสั่ง ${sortOrder}`;

  const rewritten = trimmed
    .replace(/พร้อมพัด\s*ชุดที่\s*/g, "ชุดคำสั่ง ")
    .replace(/พร้อมพ์ต\s*ชุดที่\s*/g, "ชุดคำสั่ง ")
    .replace(/^พร้อมพัด\s*/g, "ชุดคำสั่ง ")
    .replace(/^พร้อมพ์ต\s*/g, "ชุดคำสั่ง ")
    .replace(/^Prompt\s*Set\s*/i, "ชุดคำสั่ง ")
    .replace(/\s+/g, " ")
    .trim();

  // "ชุดคำสั่ง" alone → include number
  if (rewritten === "ชุดคำสั่ง") return `ชุดคำสั่ง ${sortOrder}`;
  // "ชุดคำสั่ง 1" already fine; also accept bare number after rewrite
  if (/^\d+$/.test(rewritten)) return `ชุดคำสั่ง ${rewritten}`;
  return rewritten;
}

export function normalizeAiRenderGuide(input: unknown): AiRenderGuide {
  const base = defaultAiRenderGuide();
  if (!input || typeof input !== "object") return base;

  const raw = input as { prompts?: unknown; images?: unknown };
  const promptById = new Map<string, Partial<AiRenderGuidePrompt>>();
  const imageById = new Map<string, Partial<AiRenderGuideImageSet>>();

  if (Array.isArray(raw.prompts)) {
    for (const row of raw.prompts) {
      if (!row || typeof row !== "object") continue;
      const p = row as Partial<AiRenderGuidePrompt> & { sort_order?: number };
      const id = asString(p.id);
      if (!id) continue;
      promptById.set(id, {
        id,
        sortOrder: typeof p.sortOrder === "number" ? p.sortOrder : p.sort_order,
        title: asString(p.title),
        content: asString(p.content),
      });
    }
  }

  if (Array.isArray(raw.images)) {
    for (const row of raw.images) {
      if (!row || typeof row !== "object") continue;
      const img = row as Partial<AiRenderGuideImageSet> & {
        sort_order?: number;
        before_url?: string;
        after_url?: string;
      };
      const id = asString(img.id);
      if (!id) continue;
      imageById.set(id, {
        id,
        sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : img.sort_order,
        title: asString(img.title),
        beforeUrl: asString(img.beforeUrl ?? img.before_url),
        afterUrl: asString(img.afterUrl ?? img.after_url),
      });
    }
  }

  return {
    prompts: base.prompts.map((slot) => {
      const patch = promptById.get(slot.id);
      if (!patch) return slot;
      return {
        ...slot,
        title: patch.title?.trim()
          ? rewriteGuideSetTitle(patch.title.trim(), slot.sortOrder)
          : slot.title,
        content: typeof patch.content === "string" ? patch.content : slot.content,
        sortOrder:
          typeof patch.sortOrder === "number" && patch.sortOrder > 0
            ? patch.sortOrder
            : slot.sortOrder,
      };
    }),
    images: base.images.map((slot) => {
      const patch = imageById.get(slot.id);
      if (!patch) return slot;
      return {
        ...slot,
        title: patch.title?.trim()
          ? rewriteGuideSetTitle(patch.title.trim(), slot.sortOrder)
          : slot.title,
        beforeUrl: typeof patch.beforeUrl === "string" ? patch.beforeUrl.trim() : slot.beforeUrl,
        afterUrl: typeof patch.afterUrl === "string" ? patch.afterUrl.trim() : slot.afterUrl,
        sortOrder:
          typeof patch.sortOrder === "number" && patch.sortOrder > 0
            ? patch.sortOrder
            : slot.sortOrder,
      };
    }),
  };
}
