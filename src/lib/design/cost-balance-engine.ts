import type { ProjectInput } from "@/lib/ai/types";
import { DEFAULT_PROJECT } from "@/lib/ai/types";
import { buildBuildingSpec } from "@/lib/db/building-spec-factory";
import { resolveCostRate, estimateConstructionCost } from "@/lib/db/cost-matrix";
import { validatePermitCompliance } from "@/lib/db/permit-validator";
import type { ProjectTypeCode } from "@/lib/db/schema/project-types";
import type { DesignEditorState } from "./editor-types";
import type { CostTier } from "./cost-reference";
import { MATERIAL_GRADE_FACTORS } from "./cost-reference";
import { estimateMaterials } from "./material-estimate";
import type { BudgetTargets } from "./budget-targets";
import { grossAreaFromEditor } from "./budget-targets";
import { setGlobalMaterials } from "./editor-state";

export type BalanceStatus = "under" | "on_target" | "over";

export interface BudgetRecommendation {
  id: string;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  estimatedSavingsThb: number;
  action: "downgrade_materials" | "reduce_area" | "change_tier" | "remove_openings";
  apply: (editor: DesignEditorState, targets: BudgetTargets) => DesignEditorState | BudgetTargets;
}

export interface CostBalanceResult {
  grossAreaSqm: number;
  targetAreaSqm: number;
  areaDeltaSqm: number;
  areaStatus: BalanceStatus;
  areaUtilizationPct: number;

  materialCostThb: number;
  constructionBaseThb: number;
  materialGradeFactor: number;
  totalEstimatedThb: number;
  costPerSqm: number;
  tierBenchmarkPerSqm: number;

  maxBudgetThb: number;
  budgetDeltaThb: number;
  budgetStatus: BalanceStatus;
  budgetUtilizationPct: number;

  costTier: CostTier;
  projectTypeCode: ProjectTypeCode;
  costSource: string;
  isOverBudget: boolean;
  isOverArea: boolean;
  permitCompliant: boolean;
  bankReady: boolean;

  recommendations: BudgetRecommendation[];
}

const AREA_TOLERANCE = 0.08;
const BUDGET_TOLERANCE = 0.05;

function materialGradeFactor(editor: DesignEditorState): number {
  if (!editor.rooms.length) return 1;
  let sum = 0;
  let n = 0;
  for (const room of editor.rooms) {
    sum += MATERIAL_GRADE_FACTORS[room.wallMaterial] ?? 1;
    sum += MATERIAL_GRADE_FACTORS[room.floorMaterial] ?? 1;
    n += 2;
  }
  sum += MATERIAL_GRADE_FACTORS[editor.roofMaterial] ?? 1;
  n += 1;
  return Math.round((sum / n) * 100) / 100;
}

function balanceStatus(actual: number, target: number, tolerance: number): BalanceStatus {
  if (target <= 0) return "on_target";
  const ratio = actual / target;
  if (ratio <= 1 - tolerance) return "under";
  if (ratio <= 1 + tolerance) return "on_target";
  return "over";
}

function largestShrinkableRoom(editor: DesignEditorState) {
  return [...editor.rooms]
    .filter((r) => !/bath|kitchen|garage|carport/i.test(r.name))
    .sort((a, b) => b.width * b.depth - a.width * a.depth)[0];
}

function buildRecommendations(
  editor: DesignEditorState,
  targets: BudgetTargets,
  overshoot: number,
  areaOvershoot: number,
): BudgetRecommendation[] {
  const recs: BudgetRecommendation[] = [];
  const wall = editor.rooms[0]?.wallMaterial;
  const floor = editor.rooms[0]?.floorMaterial;
  const roof = editor.roofMaterial;

  if (wall === "precast") {
    recs.push({
      id: "wall-brick",
      messageKey: "cost.rec.downgradeWall",
      messageParams: { from: "precast", to: "brick" },
      estimatedSavingsThb: Math.round(overshoot * 0.12),
      action: "downgrade_materials",
      apply: (e) => setGlobalMaterials(e, { wallMaterial: "brick" }),
    });
  } else if (wall === "brick") {
    recs.push({
      id: "wall-block",
      messageKey: "cost.rec.downgradeWall",
      messageParams: { from: "brick", to: "concrete-block" },
      estimatedSavingsThb: Math.round(overshoot * 0.08),
      action: "downgrade_materials",
      apply: (e) => setGlobalMaterials(e, { wallMaterial: "concrete-block" }),
    });
  }

  if (floor === "granite") {
    recs.push({
      id: "floor-ceramic",
      messageKey: "cost.rec.downgradeFloor",
      messageParams: { from: "granite", to: "ceramic-tile" },
      estimatedSavingsThb: Math.round(overshoot * 0.1),
      action: "downgrade_materials",
      apply: (e) => setGlobalMaterials(e, { floorMaterial: "ceramic-tile" }),
    });
  }

  if (roof === "clay-tile") {
    recs.push({
      id: "roof-metal",
      messageKey: "cost.rec.downgradeRoof",
      messageParams: { from: "clay-tile", to: "metal-sheet" },
      estimatedSavingsThb: Math.round(overshoot * 0.06),
      action: "downgrade_materials",
      apply: (e) => setGlobalMaterials(e, { roofMaterial: "metal-sheet" }),
    });
  }

  if (targets.costTier === "premium") {
    recs.push({
      id: "tier-standard",
      messageKey: "cost.rec.changeTier",
      messageParams: { from: "premium", to: "standard" },
      estimatedSavingsThb: Math.round(overshoot * 0.25),
      action: "change_tier",
      apply: (_e, t) => ({ ...t, costTier: "standard" }),
    });
  } else if (targets.costTier === "standard") {
    recs.push({
      id: "tier-economy",
      messageKey: "cost.rec.changeTier",
      messageParams: { from: "standard", to: "economy" },
      estimatedSavingsThb: Math.round(overshoot * 0.18),
      action: "change_tier",
      apply: (_e, t) => ({ ...t, costTier: "economy" }),
    });
  }

  const bigRoom = largestShrinkableRoom(editor);
  if (bigRoom && areaOvershoot > 0) {
    recs.push({
      id: "shrink-room",
      messageKey: "cost.rec.shrinkRoom",
      messageParams: { room: bigRoom.name, pct: 10 },
      estimatedSavingsThb: Math.round(overshoot * 0.15),
      action: "reduce_area",
      apply: (e) => ({
        ...e,
        rooms: e.rooms.map((r) =>
          r.id === bigRoom.id
            ? {
                ...r,
                width: Math.max(2.5, Math.round(r.width * 0.9 * 10) / 10),
                depth: Math.max(2.5, Math.round(r.depth * 0.9 * 10) / 10),
              }
            : r,
        ),
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  const extraWindows = editor.openings.filter((o) => o.type === "window");
  if (extraWindows.length > 2) {
    const last = extraWindows[extraWindows.length - 1];
    recs.push({
      id: "remove-window",
      messageKey: "cost.rec.removeOpening",
      messageParams: { type: "window" },
      estimatedSavingsThb: 15_000,
      action: "remove_openings",
      apply: (e) => ({
        ...e,
        openings: e.openings.filter((o) => o.id !== last.id),
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  return recs.slice(0, 4);
}

/** Real-time cost & area balance for the 3D editor. */
export function computeCostBalance(
  editor: DesignEditorState,
  targets: BudgetTargets,
  project?: ProjectInput,
): CostBalanceResult {
  const grossAreaSqm = grossAreaFromEditor(editor);
  const material = estimateMaterials(editor);
  const gradeFactor = materialGradeFactor(editor);
  const projectTypeCode = project?.projectTypeCode ?? "residential";

  const spec = buildBuildingSpec(project ?? { ...DEFAULT_PROJECT, targetAreaSqm: targets.targetAreaSqm }, {
    grossFloorAreaSqm: grossAreaSqm,
  });

  const costEstimate = estimateConstructionCost(
    spec,
    targets.costTier,
    gradeFactor,
    material.subtotalThb,
  );

  const rate = resolveCostRate(projectTypeCode, targets.costTier);
  const totalEstimatedThb = costEstimate.totalThb;

  const maxBudget = targets.maxBudgetThb;
  const targetArea = targets.targetAreaSqm;

  const budgetDelta = maxBudget > 0 ? totalEstimatedThb - maxBudget : 0;
  const areaDelta = targetArea > 0 ? grossAreaSqm - targetArea : 0;

  const budgetStatus = balanceStatus(totalEstimatedThb, maxBudget, BUDGET_TOLERANCE);
  const areaStatus = balanceStatus(grossAreaSqm, targetArea, AREA_TOLERANCE);

  const isOverBudget = maxBudget > 0 && totalEstimatedThb > maxBudget * (1 + BUDGET_TOLERANCE);
  const isOverArea = targetArea > 0 && grossAreaSqm > targetArea * (1 + AREA_TOLERANCE);
  const permitCompliant = validatePermitCompliance(spec).passed;

  const overshoot = Math.max(0, budgetDelta);
  const areaOvershoot = Math.max(0, areaDelta);

  const recommendations =
    isOverBudget || isOverArea
      ? buildRecommendations(editor, targets, overshoot || 100_000, areaOvershoot)
      : [];

  return {
    grossAreaSqm,
    targetAreaSqm: targetArea,
    areaDeltaSqm: Math.round(areaDelta * 10) / 10,
    areaStatus,
    areaUtilizationPct: targetArea > 0 ? Math.round((grossAreaSqm / targetArea) * 100) : 0,

    materialCostThb: material.totalThb,
    constructionBaseThb: costEstimate.constructionBaseThb,
    materialGradeFactor: gradeFactor,
    totalEstimatedThb,
    costPerSqm: costEstimate.costPerSqm,
    tierBenchmarkPerSqm: rate.constructionPerSqm,

    maxBudgetThb: maxBudget,
    budgetDeltaThb: Math.round(budgetDelta),
    budgetStatus,
    budgetUtilizationPct: maxBudget > 0 ? Math.round((totalEstimatedThb / maxBudget) * 100) : 0,

    costTier: targets.costTier,
    projectTypeCode,
    costSource: rate.source,
    isOverBudget,
    isOverArea,
    permitCompliant,
    bankReady:
      !isOverBudget && !isOverArea && permitCompliant && maxBudget > 0 && targetArea > 0,

    recommendations,
  };
}
