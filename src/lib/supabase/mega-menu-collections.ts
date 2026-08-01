import {
  DEFAULT_MEGA_MENU_COLLECTIONS,
  normalizeMegaMenuCollections,
  type MegaMenuCollectionCard,
} from "@/lib/admin/mega-menu-collections";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export const MEGA_MENU_COLLECTIONS_SETTINGS_KEY = "mega_menu_collections";

export async function loadMegaMenuCollections(): Promise<MegaMenuCollectionCard[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_MEGA_MENU_COLLECTIONS.map((c) => ({ ...c }));
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", MEGA_MENU_COLLECTIONS_SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return DEFAULT_MEGA_MENU_COLLECTIONS.map((c) => ({ ...c }));
    }
    return normalizeMegaMenuCollections(data.value as MegaMenuCollectionCard[]);
  } catch {
    return DEFAULT_MEGA_MENU_COLLECTIONS.map((c) => ({ ...c }));
  }
}

export async function saveMegaMenuCollections(
  items: MegaMenuCollectionCard[],
  updatedBy: string,
): Promise<MegaMenuCollectionCard[]> {
  const normalized = normalizeMegaMenuCollections(items);
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: MEGA_MENU_COLLECTIONS_SETTINGS_KEY,
        value: normalized,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw error;
  return normalized;
}
