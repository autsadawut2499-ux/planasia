import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_KEYS,
  type SiteSettingsBundle,
} from "@/lib/admin/defaults";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

interface SettingsRow {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}

function mergeSettings(partial: Partial<SiteSettingsBundle>): SiteSettingsBundle {
  return {
    brand: { ...DEFAULT_SITE_SETTINGS.brand, ...partial.brand },
    header: { ...DEFAULT_SITE_SETTINGS.header, ...partial.header },
    footer: { ...DEFAULT_SITE_SETTINGS.footer, ...partial.footer },
    hero: { ...DEFAULT_SITE_SETTINGS.hero, ...partial.hero },
  };
}

export async function loadSiteSettings(): Promise<SiteSettingsBundle> {
  if (!isSupabaseConfigured()) return DEFAULT_SITE_SETTINGS;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("key, value")
      .in("key", [...SITE_SETTINGS_KEYS]);

    if (error || !data?.length) return DEFAULT_SITE_SETTINGS;

    const partial: Partial<SiteSettingsBundle> = {};
    for (const row of data as SettingsRow[]) {
      if (row.key === "brand") partial.brand = row.value as unknown as SiteSettingsBundle["brand"];
      if (row.key === "header") partial.header = row.value as unknown as SiteSettingsBundle["header"];
      if (row.key === "footer") partial.footer = row.value as unknown as SiteSettingsBundle["footer"];
      if (row.key === "hero") partial.hero = row.value as unknown as SiteSettingsBundle["hero"];
    }
    return mergeSettings(partial);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettingsSection<K extends keyof SiteSettingsBundle>(
  section: K,
  value: SiteSettingsBundle[K],
  updatedBy: string,
): Promise<SiteSettingsBundle[K]> {
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: section,
        value,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw error;
  return value;
}

export async function saveSiteSettingsBundle(
  bundle: Partial<SiteSettingsBundle>,
  updatedBy: string,
): Promise<SiteSettingsBundle> {
  const entries = Object.entries(bundle) as [keyof SiteSettingsBundle, SiteSettingsBundle[keyof SiteSettingsBundle]][];
  for (const [key, value] of entries) {
    if (value) await saveSiteSettingsSection(key, value, updatedBy);
  }
  return loadSiteSettings();
}
