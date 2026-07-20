import type { CatalogBundle } from "@/lib/db/schema";
import type { ProjectType, ProjectTypeCode } from "@/lib/db/schema/project-types";
import type { CostBenchmark } from "@/lib/db/schema/cost-benchmarks";
import type { PermitRule } from "@/lib/db/schema/permit-rules";
import type { CostLookupParams } from "@/lib/db/schema/cost-benchmarks";
import type { CostTier } from "@/lib/design/cost-reference";
import {
  CATALOG_SCHEMA_VERSION,
  SEED_COST_BENCHMARKS,
  SEED_PERMIT_RULES,
  SEED_PROJECT_TYPES,
} from "@/lib/db/seed/catalog-data";

/** In-memory catalog — safe for client and server bundles. */
let cached: CatalogBundle | null = null;

export function loadCatalogSync(): CatalogBundle {
  if (cached) return cached;
  cached = {
    projectTypes: SEED_PROJECT_TYPES,
    costBenchmarks: SEED_COST_BENCHMARKS,
    permitRules: SEED_PERMIT_RULES,
    schemaVersion: CATALOG_SCHEMA_VERSION,
    loadedAt: new Date().toISOString(),
  };
  return cached;
}

export function getProjectType(code: ProjectTypeCode): ProjectType | undefined {
  return loadCatalogSync().projectTypes.find((t) => t.code === code && t.active);
}

export function listProjectTypes(): ProjectType[] {
  return loadCatalogSync()
    .projectTypes.filter((t) => t.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function lookupCostBenchmark(params: CostLookupParams): CostBenchmark | undefined {
  const region = params.region ?? "TH";
  return loadCatalogSync().costBenchmarks.find(
    (b) =>
      b.active &&
      b.projectTypeCode === params.projectTypeCode &&
      b.costTier === params.costTier &&
      b.region === region,
  );
}

export function listCostBenchmarks(filters?: {
  projectTypeCode?: ProjectTypeCode;
  costTier?: CostTier;
}): CostBenchmark[] {
  return loadCatalogSync().costBenchmarks.filter(
    (b) =>
      b.active &&
      (!filters?.projectTypeCode || b.projectTypeCode === filters.projectTypeCode) &&
      (!filters?.costTier || b.costTier === filters.costTier),
  );
}

export function listPermitRules(projectTypeCode: ProjectTypeCode): PermitRule[] {
  return loadCatalogSync()
    .permitRules.filter((r) => r.active && r.projectTypeCode === projectTypeCode)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function invalidateCatalogCache() {
  cached = null;
}
