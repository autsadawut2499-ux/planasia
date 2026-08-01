import type { Metadata } from "next";
import { buildHomeMetadata } from "@/lib/seo/metadata";
import { loadSiteSettings } from "@/lib/supabase/site-settings";
import { DEFAULT_SITE_SETTINGS } from "@/lib/admin/defaults";
import HomePageClient from "./HomePageClient";

export async function generateMetadata(): Promise<Metadata> {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await loadSiteSettings();
  } catch {
    // Fall back to defaults when Supabase is unavailable at build/runtime.
  }

  return buildHomeMetadata({
    brandName: settings.brand.name,
    tagline: settings.brand.tagline || settings.hero.badgeText,
    heroImageUrl: settings.hero.backgroundImageUrl,
    logoUrl: settings.brand.logoUrl,
  });
}

export default function HomePage() {
  return <HomePageClient />;
}
