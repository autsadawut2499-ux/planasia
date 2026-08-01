import { ensureCatalogInSupabase } from "@/lib/supabase/catalog";

/** Load catalog from Supabase (seeded on first access). */
export async function ensureCatalogSeeded(): Promise<void> {
  await ensureCatalogInSupabase();
}

export async function loadCatalogFromDisk() {
  return ensureCatalogInSupabase();
}

export async function loadCatalog() {
  return ensureCatalogInSupabase();
}
