import {
  DEFAULT_MEGA_MENU_STYLES,
  normalizeMegaMenuStyles,
  type MegaMenuStyleCard,
} from "@/lib/admin/mega-menu-styles";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export const MEGA_MENU_STYLES_SETTINGS_KEY = "mega_menu_styles";

export async function loadMegaMenuStyles(): Promise<MegaMenuStyleCard[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_MEGA_MENU_STYLES.map((c) => ({ ...c }));
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", MEGA_MENU_STYLES_SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return DEFAULT_MEGA_MENU_STYLES.map((c) => ({ ...c }));
    }
    return normalizeMegaMenuStyles(data.value as MegaMenuStyleCard[]);
  } catch {
    return DEFAULT_MEGA_MENU_STYLES.map((c) => ({ ...c }));
  }
}

export async function saveMegaMenuStyles(
  items: MegaMenuStyleCard[],
  updatedBy: string,
): Promise<MegaMenuStyleCard[]> {
  const normalized = normalizeMegaMenuStyles(items);
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: MEGA_MENU_STYLES_SETTINGS_KEY,
        value: normalized,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw error;
  return normalized;
}
