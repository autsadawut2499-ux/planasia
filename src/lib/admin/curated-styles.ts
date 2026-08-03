import { HOUSE_STYLES, type Locale } from "@/lib/geo/countries";
import { withBanBaanPrefix } from "@/lib/store/style-label";

export interface CuratedStyleItem {
  id: string;
  imageUrl: string;
  caption: Partial<Record<Locale, string>>;
}

const DEFAULT_STYLE_IMAGES: Record<string, string> = {
  minimal: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  modern: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
  loft: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
  nordic: "https://images.unsplash.com/photo-1600047509807-ba8f88d438f0?w=600&q=80",
  contemporary: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
  tropical: "https://images.unsplash.com/photo-1605276374101-ec38c14f68d4?w=600&q=80",
  industrial: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
  japanese: "https://images.unsplash.com/photo-1600585154363-7077a5089932?w=600&q=80",
  scandinavian: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
  "tropical-minimal": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80",
};

export const DEFAULT_CURATED_STYLES: CuratedStyleItem[] = HOUSE_STYLES.map((style) => ({
  id: style.id,
  imageUrl: DEFAULT_STYLE_IMAGES[style.id] ?? "",
  caption: {
    en: style.label.en,
    th: style.label.th,
    hi: style.label.hi,
    vi: style.label.vi,
  },
}));

function prefixCaptions(
  caption: Partial<Record<Locale, string>>,
): Partial<Record<Locale, string>> {
  const next: Partial<Record<Locale, string>> = {};
  for (const [locale, value] of Object.entries(caption) as [Locale, string | undefined][]) {
    if (typeof value === "string" && value.trim()) {
      next[locale] = withBanBaanPrefix(value);
    }
  }
  return next;
}

export function mergeCuratedStyles(stored: CuratedStyleItem[] | null | undefined): CuratedStyleItem[] {
  const byId = new Map((stored ?? []).map((item) => [item.id, item]));
  return DEFAULT_CURATED_STYLES.map((defaults) => {
    const saved = byId.get(defaults.id);
    if (!saved) return { ...defaults, caption: prefixCaptions(defaults.caption) };
    return {
      id: defaults.id,
      imageUrl: saved.imageUrl || defaults.imageUrl,
      caption: prefixCaptions({ ...defaults.caption, ...saved.caption }),
    };
  });
}

export function captionForStyle(
  item: CuratedStyleItem,
  locale: Locale,
  fallbackEn?: string,
): string {
  const raw = item.caption[locale] ?? item.caption.en ?? fallbackEn ?? item.id;
  return withBanBaanPrefix(raw);
}
