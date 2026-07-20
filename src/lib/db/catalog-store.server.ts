import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  CATALOG_SCHEMA_VERSION,
  SEED_COST_BENCHMARKS,
  SEED_PERMIT_RULES,
  SEED_PROJECT_TYPES,
} from "@/lib/db/seed/catalog-data";
import { loadCatalogSync } from "@/lib/db/catalog-store";

const CATALOG_DIR = path.join(process.cwd(), "data", "catalog");

async function ensureCatalogDir() {
  await mkdir(CATALOG_DIR, { recursive: true });
}

async function readJsonFile<T>(filename: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(CATALOG_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filename: string, data: unknown) {
  await ensureCatalogDir();
  await writeFile(path.join(CATALOG_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

/** Persist seed catalog to `data/catalog/*.json` (server only). */
export async function ensureCatalogSeeded(): Promise<void> {
  await ensureCatalogDir();
  const meta = await readJsonFile<{ schemaVersion: number }>("schema-meta.json");
  if (meta?.schemaVersion === CATALOG_SCHEMA_VERSION) return;

  await Promise.all([
    writeJsonFile("project-types.json", SEED_PROJECT_TYPES),
    writeJsonFile("cost-benchmarks.json", SEED_COST_BENCHMARKS),
    writeJsonFile("permit-rules.json", SEED_PERMIT_RULES),
    writeJsonFile("schema-meta.json", {
      schemaVersion: CATALOG_SCHEMA_VERSION,
      seededAt: new Date().toISOString(),
      tables: ["project_types", "building_specifications", "cost_benchmarks", "permit_rules"],
    }),
  ]);
}

/** Load catalog — prefers JSON files on disk, falls back to seed. Server only. */
export async function loadCatalogFromDisk() {
  await ensureCatalogSeeded();
  const [projectTypes, costBenchmarks, permitRules] = await Promise.all([
    readJsonFile("project-types.json"),
    readJsonFile("cost-benchmarks.json"),
    readJsonFile("permit-rules.json"),
  ]);

  return {
    projectTypes: projectTypes ?? SEED_PROJECT_TYPES,
    costBenchmarks: costBenchmarks ?? SEED_COST_BENCHMARKS,
    permitRules: permitRules ?? SEED_PERMIT_RULES,
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
