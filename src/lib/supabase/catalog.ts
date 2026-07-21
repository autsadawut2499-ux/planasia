import type { CatalogBundle } from "@/lib/db/schema";
import {
  CATALOG_SCHEMA_VERSION,
  SEED_COST_BENCHMARKS,
  SEED_PERMIT_RULES,
  SEED_PROJECT_TYPES,
} from "@/lib/db/seed/catalog-data";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface CatalogRow {
  id: string;
  schema_version: number;
  project_types: CatalogBundle["projectTypes"];
  cost_benchmarks: CatalogBundle["costBenchmarks"];
  permit_rules: CatalogBundle["permitRules"];
  loaded_at: string;
}

function rowToBundle(row: CatalogRow): CatalogBundle {
  return {
    projectTypes: row.project_types,
    costBenchmarks: row.cost_benchmarks,
    permitRules: row.permit_rules,
    schemaVersion: row.schema_version,
    loadedAt: row.loaded_at,
  };
}

export async function loadCatalogFromSupabase(): Promise<CatalogBundle | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("catalog_bundle")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if ((data as CatalogRow).schema_version !== CATALOG_SCHEMA_VERSION) return null;
  return rowToBundle(data as CatalogRow);
}

export async function seedCatalogToSupabase(): Promise<CatalogBundle> {
  const bundle: CatalogRow = {
    id: "default",
    schema_version: CATALOG_SCHEMA_VERSION,
    project_types: SEED_PROJECT_TYPES,
    cost_benchmarks: SEED_COST_BENCHMARKS,
    permit_rules: SEED_PERMIT_RULES,
    loaded_at: new Date().toISOString(),
  };

  const { error } = await getSupabaseAdmin()
    .from("catalog_bundle")
    .upsert(bundle, { onConflict: "id" });
  if (error) throw error;

  return rowToBundle(bundle);
}

export async function ensureCatalogInSupabase(): Promise<CatalogBundle> {
  const existing = await loadCatalogFromSupabase();
  if (existing) return existing;
  return seedCatalogToSupabase();
}
