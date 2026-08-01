import type { ProjectInput } from "@/lib/ai/types";
import type { DesignEditorState } from "./editor-types";
import type { CostTier } from "./cost-reference";
import { DEFAULT_COST_TIER } from "./cost-reference";

export interface BudgetTargets {
  maxBudgetThb: number;
  targetAreaSqm: number;
  costTier: CostTier;
}

const BUDGET_PARSE = /[\d,]+/g;

/** Parse free-text budget like "2.5M", "2500000", "2,500,000" → THB. */
export function parseBudgetThb(raw: string): number {
  if (!raw.trim()) return 0;
  const lower = raw.toLowerCase().replace(/,/g, "");
  const mMatch = lower.match(/([\d.]+)\s*m/);
  if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1_000_000);
  const kMatch = lower.match(/([\d.]+)\s*k/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1_000);
  const nums = raw.match(BUDGET_PARSE);
  if (!nums?.length) return 0;
  const joined = nums.join("").replace(/,/g, "");
  const n = parseInt(joined, 10);
  return Number.isFinite(n) ? n : 0;
}

export function formatBudgetThb(amount: number): string {
  if (amount >= 1_000_000) return `฿${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `฿${(amount / 1_000).toFixed(0)}K`;
  return `฿${amount.toLocaleString()}`;
}

/** Default target area from bedroom/floor count when not set. */
export function defaultTargetAreaSqm(project: ProjectInput): number {
  const base = project.floors === 2 ? 120 : 75;
  const bedBonus = Math.max(0, project.bedrooms - 2) * 12;
  return base + bedBonus;
}

export function budgetTargetsFromProject(project: ProjectInput): BudgetTargets {
  const parsed = parseBudgetThb(project.budget);
  return {
    maxBudgetThb: project.maxBudgetThb ?? parsed,
    targetAreaSqm: project.targetAreaSqm ?? defaultTargetAreaSqm(project),
    costTier: project.costTier ?? DEFAULT_COST_TIER,
  };
}

export function syncProjectBudgetFields(
  project: ProjectInput,
  targets: BudgetTargets,
): ProjectInput {
  return {
    ...project,
    maxBudgetThb: targets.maxBudgetThb,
    targetAreaSqm: targets.targetAreaSqm,
    costTier: targets.costTier,
    budget: targets.maxBudgetThb > 0 ? String(targets.maxBudgetThb) : project.budget,
  };
}

export function grossAreaFromEditor(editor: DesignEditorState): number {
  return Math.round(editor.rooms.reduce((a, r) => a + r.width * r.depth, 0) * 10) / 10;
}
