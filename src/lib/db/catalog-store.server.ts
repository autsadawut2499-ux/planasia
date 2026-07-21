import { loadCatalogSync } from "@/lib/db/catalog-store";
import {
  CATALOG_SCHEMA_VERSION,
  SEED_COST_BENCHMARKS,
  SEED_PERMIT_RULES,
  SEED_PROJECT_TYPES,
} from "@/lib/db/seed/catalog-data";
import { readJsonBlob, useMemoryPersistence, writeJsonBlob } from "@/lib/storage/runtime";

/** Persist seed catalog to disk locally; on Vercel uses bundled seed data only. */
export async function ensureCatalogSeeded(): Promise<void> {
  if (useMemoryPersistence()) return;

  const meta = await readJsonBlob<{ schemaVersion: number } | null>("catalog/schema-meta.json", null);
  if (meta?.schemaVersion === CATALOG_SCHEMA_VERSION) return;

  await Promise.all([
    writeJsonBlob("catalog/project-types.json", SEED_PROJECT_TYPES),
    writeJsonBlob("catalog/cost-benchmarks.json", SEED_COST_BENCHMARKS),
    writeJsonBlob("catalog/permit-rules.json", SEED_PERMIT_RULES),
    writeJsonBlob("catalog/schema-meta.json", {
      schemaVersion: CATALOG_SCHEMA_VERSION,
      seededAt: new Date().toISOString(),
      tables: ["project_types", "building_specifications", "cost_benchmarks", "permit_rules"],
    }),
  ]);
}

/** Load catalog — memory seed on serverless, JSON files locally. */
export async function loadCatalogFromDisk() {
  if (useMemoryPersistence()) {
    return loadCatalogSync();
  }

  await ensureCatalogSeeded();
  const [projectTypes, costBenchmarks, permitRules] = await Promise.all([
    readJsonBlob("catalog/project-types.json", SEED_PROJECT_TYPES),
    readJsonBlob("catalog/cost-benchmarks.json", SEED_COST_BENCHMARKS),
    readJsonBlob("catalog/permit-rules.json", SEED_PERMIT_RULES),
  ]);

  return {
    projectTypes,
    costBenchmarks,
    permitRules,
    schemaVersion: CATALOG_SCHEMA_VERSION,
    loadedAt: new Date().toISOString(),
  };
}

export async function loadCatalog() {
  try {
    return await loadCatalogFromDisk();
  } catch {
    return loadCatalogSync();
  }
}
