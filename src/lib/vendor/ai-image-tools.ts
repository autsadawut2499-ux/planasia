/**
 * External AI image tools recommended to vendors for producing the 3D renders
 * required by a listing. Links open in a new tab — Planasia does not proxy or
 * resell these services.
 *
 * Preview images are admin-managed via /admin/ai-image-tools (site_settings).
 */

export interface AiImageTool {
  id: string;
  name: string;
  /** One-line Thai description of what this tool is best at. */
  purpose: string;
  href: string;
  /** Full-bleed preview image shown behind the card copy. */
  previewImage: string;
  /** Soft accent used for hover ring / focus. */
  accent: string;
}

export const AI_IMAGE_TOOLS: AiImageTool[] = [
  {
    id: "google-flow",
    name: "Google Flow",
    purpose: "สร้างภาพและคลิปคอนเซปต์บ้านแบบซินีมาติกจากคำสั่งข้อความ",
    href: "https://labs.google/fx/th/tools/flow",
    previewImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
    accent: "#4285F4",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    purpose: "ภาพเปอร์สเปคทีฟภายนอกเสมือนจริงระดับงานนำเสนอ",
    href: "https://www.midjourney.com/",
    previewImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80",
    accent: "#a78bfa",
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    purpose: "ขยายภาพ ลบวัตถุ และจัดฉากรอบตัวบ้านแบบใช้เชิงพาณิชย์ได้",
    href: "https://firefly.adobe.com/",
    previewImage:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80",
    accent: "#E67E22",
  },
];

/** Merge saved admin overrides (by id) onto the fixed three-card catalog. */
export function normalizeAiImageTools(input: unknown): AiImageTool[] {
  const byId = new Map<string, Partial<AiImageTool>>();
  if (Array.isArray(input)) {
    for (const raw of input) {
      if (!raw || typeof raw !== "object") continue;
      const row = raw as Partial<AiImageTool>;
      if (!row.id || typeof row.id !== "string") continue;
      byId.set(row.id, row);
    }
  }

  return AI_IMAGE_TOOLS.map((base) => {
    const patch = byId.get(base.id);
    if (!patch) return { ...base };
    return {
      ...base,
      name: typeof patch.name === "string" && patch.name.trim() ? patch.name.trim() : base.name,
      purpose:
        typeof patch.purpose === "string" && patch.purpose.trim()
          ? patch.purpose.trim()
          : base.purpose,
      href: typeof patch.href === "string" && patch.href.trim() ? patch.href.trim() : base.href,
      previewImage:
        typeof patch.previewImage === "string" && patch.previewImage.trim()
          ? patch.previewImage.trim()
          : base.previewImage,
      accent:
        typeof patch.accent === "string" && patch.accent.trim() ? patch.accent.trim() : base.accent,
    };
  });
}
