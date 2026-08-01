/**
 * Curated "Popular House Plans" topic cards on the homepage (max 4).
 * Stored in site_settings under key `popular_highlights`.
 */

export const MAX_POPULAR_HIGHLIGHTS = 4;

export interface PopularHighlightCard {
  id: string;
  imageUrl: string;
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  /** Internal path or absolute URL */
  href: string;
  /** When false, card is hidden on the storefront but kept in admin. */
  enabled: boolean;
}

export const DEFAULT_POPULAR_HIGHLIGHTS: PopularHighlightCard[] = [
  {
    id: "ph-1",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    titleEn: "Single-Storey Favorites",
    titleTh: "บ้านชั้นเดียวยอดนิยม",
    descriptionEn: "Practical one-level plans for everyday living.",
    descriptionTh: "แบบบ้านชั้นเดียวใช้งานง่าย เหมาะกับชีวิตประจำวัน",
    href: "/store?collection=single-storey",
    enabled: true,
  },
  {
    id: "ph-2",
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    titleEn: "Modern Two-Storey",
    titleTh: "บ้านสองชั้นโมเดิร์น",
    descriptionEn: "Contemporary homes with flexible upper floors.",
    descriptionTh: "บ้านสองชั้นร่วมสมัย พื้นที่ใช้สอยยืดหยุ่น",
    href: "/store?collection=two-storey",
    enabled: true,
  },
  {
    id: "ph-3",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    titleEn: "Small & Narrow Lots",
    titleTh: "บ้านเล็ก / ที่ดินหน้าแคบ",
    descriptionEn: "Smart layouts for compact or narrow plots.",
    descriptionTh: "แปลนฉลาดสำหรับที่ดินเล็กหรือหน้าแคบ",
    href: "/store?collection=small",
    enabled: true,
  },
  {
    id: "ph-4",
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    titleEn: "Tropical Living",
    titleTh: "บ้านสไตล์ทรอปิคอล",
    descriptionEn: "Breezy designs made for Thailand’s climate.",
    descriptionTh: "ดีไซน์โปร่งโล่ง เหมาะกับอากาศไทย",
    href: "/store?style=tropical",
    enabled: true,
  },
];

function newId(): string {
  return `ph-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Normalize admin payload: max 4 cards, sane field defaults. Empty array is allowed. */
export function normalizePopularHighlights(
  input: PopularHighlightCard[] | null | undefined,
): PopularHighlightCard[] {
  if (!Array.isArray(input)) {
    return DEFAULT_POPULAR_HIGHLIGHTS.map((c) => ({ ...c }));
  }

  return input.slice(0, MAX_POPULAR_HIGHLIGHTS).map((raw, index) => {
    const fallback = DEFAULT_POPULAR_HIGHLIGHTS[index] ?? DEFAULT_POPULAR_HIGHLIGHTS[0];
    return {
      id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : newId(),
      // Prefer explicit imageUrl (including freshly uploaded Supabase URLs).
      // Only fall back to defaults when the field is missing/blank.
      imageUrl: (() => {
        const url = typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : "";
        if (url) return url;
        return fallback?.imageUrl ?? "";
      })(),
      titleEn: (raw.titleEn ?? "").trim() || "Untitled",
      titleTh: (raw.titleTh ?? "").trim() || "ไม่มีชื่อ",
      descriptionEn: (raw.descriptionEn ?? "").trim(),
      descriptionTh: (raw.descriptionTh ?? "").trim(),
      href: (raw.href ?? "").trim() || "/store",
      enabled: raw.enabled !== false,
    };
  });
}

/** Cards shown on the homepage (enabled only, max 4). */
export function visiblePopularHighlights(cards: PopularHighlightCard[]): PopularHighlightCard[] {
  return cards.filter((c) => c.enabled).slice(0, MAX_POPULAR_HIGHLIGHTS);
}

export function createEmptyPopularHighlight(): PopularHighlightCard {
  return {
    id: newId(),
    imageUrl: "",
    titleEn: "New topic",
    titleTh: "หัวข้อใหม่",
    descriptionEn: "",
    descriptionTh: "",
    href: "/store",
    enabled: true,
  };
}
