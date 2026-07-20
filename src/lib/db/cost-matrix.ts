import type { BuildingSpecifications } from "@/lib/db/schema/building-specifications";
import type { ProjectTypeCode } from "@/lib/db/schema/project-types";
import type { CostTier } from "@/lib/design/cost-reference";
import { lookupCostBenchmark } from "@/lib/db/catalog-store";
import { getTierBenchmark } from "@/lib/design/cost-reference";

export interface ResolvedCostRate {
  constructionPerSqm: number;
  structuralMultiplier: number;
  mepMultiplier: number;
  finishesMultiplier: number;
  source: string;
  projectTypeCode: ProjectTypeCode;
  costTier: CostTier;
  fromMatrix: boolean;
}

/** Resolve cost rate from `cost_benchmarks` table with residential REA fallback. */
export function resolveCostRate(
  projectTypeCode: ProjectTypeCode,
  costTier: CostTier,
  region: "TH" | "INTL" = "TH",
): ResolvedCostRate {
  const row = lookupCostBenchmark({ projectTypeCode, costTier, region });
  if (row) {
    return {
      constructionPerSqm: row.constructionPerSqm,
      structuralMultiplier: row.structuralMultiplier,
      mepMultiplier: row.mepMultiplier,
      finishesMultiplier: row.finishesMultiplier,
      source: row.source,
      projectTypeCode,
      costTier,
      fromMatrix: true,
    };
  }

  const fallback = getTierBenchmark(costTier);
  return {
    constructionPerSqm: fallback.thConstructionPerSqm,
    structuralMultiplier: 1,
    mepMultiplier: 1,
    finishesMultiplier: 1,
    source: "REA-fallback",
    projectTypeCode,
    costTier,
    fromMatrix: false,
  };
}

/** Total construction estimate using dynamic matrix + spec multipliers. */
export function estimateConstructionCost(
  spec: BuildingSpecifications,
  costTier: CostTier,
  materialGradeFactor: number,
  finishSubtotalThb: number,
  contingencyPct = 0.1,
) {
  const rate = resolveCostRate(spec.projectTypeCode, costTier);
  const area = spec.grossFloorAreaSqm;

  const constructionBaseThb = Math.round(area * rate.constructionPerSqm);
  const structuralAllowanceThb = Math.round(
    constructionBaseThb * (rate.structuralMultiplier - 1) * 0.4,
  );
  const mepAllowanceThb = Math.round(constructionBaseThb * (rate.mepMultiplier - 1) * 0.35);
  const finishesThb = Math.round(finishSubtotalThb * rate.finishesMultiplier * materialGradeFactor);

  const subtotal = constructionBaseThb + structuralAllowanceThb + mepAllowanceThb + finishesThb;
  const contingencyThb = Math.round(subtotal * contingencyPct);
  const totalThb = subtotal + contingencyThb;

  return {
    constructionBaseThb,
    structuralAllowanceThb,
    mepAllowanceThb,
    finishesThb,
    contingencyThb,
    totalThb,
    costPerSqm: area > 0 ? Math.round(totalThb / area) : 0,
    rate,
  };
}
