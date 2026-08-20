import "server-only";

import { DEFAULT_CMS_BY_LOCALE, DEFAULT_SITE_SETTINGS } from "@/lib/admin/defaults";
import { DEFAULT_CURATED_STYLES } from "@/lib/admin/curated-styles";
import { DEFAULT_MEGA_MENU_COLLECTIONS } from "@/lib/admin/mega-menu-collections";
import { DEFAULT_MEGA_MENU_STYLES } from "@/lib/admin/mega-menu-styles";
import type { Locale } from "@/lib/geo/countries";
import type { SiteConfigPayload } from "@/lib/site/site-config-types";
import { loadAiImageTools } from "@/lib/supabase/ai-image-tools";
import { loadAiRenderGuide } from "@/lib/supabase/ai-render-guide";
import { loadAllCmsForLocale } from "@/lib/supabase/cms-sections";
import { loadCuratedStyles } from "@/lib/supabase/curated-styles";
import { loadMegaMenuCollections } from "@/lib/supabase/mega-menu-collections";
import { loadMegaMenuStyles } from "@/lib/supabase/mega-menu-styles";
import { loadSiteSettings } from "@/lib/supabase/site-settings";
import { AI_IMAGE_TOOLS } from "@/lib/vendor/ai-image-tools";
import { defaultAiRenderGuide } from "@/lib/vendor/ai-render-guide";

export type { SiteConfigPayload } from "@/lib/site/site-config-types";

export function defaultSiteConfig(locale: Locale = "th"): SiteConfigPayload {
  return {
    settings: DEFAULT_SITE_SETTINGS,
    cms: DEFAULT_CMS_BY_LOCALE[locale] ?? DEFAULT_CMS_BY_LOCALE.en,
    curatedStyles: DEFAULT_CURATED_STYLES,
    megaMenuStyles: DEFAULT_MEGA_MENU_STYLES,
    megaMenuCollections: DEFAULT_MEGA_MENU_COLLECTIONS,
    aiImageTools: AI_IMAGE_TOOLS,
    aiRenderGuide: defaultAiRenderGuide(),
    locale,
  };
}

/** Shared loader for RSC root layout and `/api/site/config`. */
export async function loadSiteConfig(locale: Locale = "th"): Promise<SiteConfigPayload> {
  try {
    const [
      settings,
      cms,
      curatedStyles,
      megaMenuStyles,
      megaMenuCollections,
      aiImageTools,
      aiRenderGuide,
    ] = await Promise.all([
      loadSiteSettings(),
      loadAllCmsForLocale(locale),
      loadCuratedStyles(),
      loadMegaMenuStyles(),
      loadMegaMenuCollections(),
      loadAiImageTools(),
      loadAiRenderGuide(),
    ]);

    return {
      settings,
      cms,
      curatedStyles,
      megaMenuStyles,
      megaMenuCollections,
      aiImageTools,
      aiRenderGuide,
      locale,
    };
  } catch {
    return defaultSiteConfig(locale);
  }
}
