import type { CmsSectionContent, CmsSectionKey, SiteSettingsBundle } from "@/lib/admin/defaults";
import type { CuratedStyleItem } from "@/lib/admin/curated-styles";
import type { MegaMenuCollectionCard } from "@/lib/admin/mega-menu-collections";
import type { MegaMenuStyleCard } from "@/lib/admin/mega-menu-styles";
import type { Locale } from "@/lib/geo/countries";
import type { AiImageTool } from "@/lib/vendor/ai-image-tools";
import type { AiRenderGuide } from "@/lib/vendor/ai-render-guide";

/** Shared site config bag — safe for client + server. */
export interface SiteConfigPayload {
  settings: SiteSettingsBundle;
  cms: Record<CmsSectionKey, CmsSectionContent>;
  curatedStyles: CuratedStyleItem[];
  megaMenuStyles: MegaMenuStyleCard[];
  megaMenuCollections: MegaMenuCollectionCard[];
  aiImageTools: AiImageTool[];
  aiRenderGuide: AiRenderGuide;
  locale: Locale;
}
