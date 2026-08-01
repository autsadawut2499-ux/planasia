import type { CostTier } from "@/lib/design/cost-reference";
import type { ProjectTypeCode, LocalizedString } from "./project-types";

export type CostBenchmarkRegion = "TH" | "INTL";

/** Dynamic cost matrix row — `cost_benchmarks` table. */
export interface CostBenchmark {
  id: string;
  projectTypeCode: ProjectTypeCode;
  costTier: CostTier;
  region: CostBenchmarkRegion;
  /** All-in construction cost per gross sqm */
  constructionPerSqm: number;
  currency: "THB" | "USD";
  /** Multiplier applied to structural package */
  structuralMultiplier: number;
  /** MEP (mechanical/electrical/plumbing) multiplier */
  mepMultiplier: number;
  /** Finishes multiplier relative to tier baseline */
  finishesMultiplier: number;
  source: string;
  sourceLabel: LocalizedString;
  effectiveFrom: string;
  effectiveTo?: string;
  notes: LocalizedString;
  active: boolean;
}

export interface CostLookupParams {
  projectTypeCode: ProjectTypeCode;
  costTier: CostTier;
  region?: CostBenchmarkRegion;
}
