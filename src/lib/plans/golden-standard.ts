/**
 * Golden Standard — Smart A complete house drawing set guideline.
 * Audits completeness and auto-fills missing required sheets.
 */
import goldenSpec from "../../../templates/cad/golden-standard.json";
import type { DrawingIndexEntry, HousePlanDocument } from "@/lib/plans/schema";
import type { PlanOptions, ProjectInput } from "@/lib/ai/types";

export type SheetStatus = "present" | "auto-fill" | "missing";

export interface RequiredCategory {
  id: string;
  discipline: string;
  sheetCode: string;
  title: string;
  titleTh: string;
  required: boolean;
  smartAFile: string | null;
  status: SheetStatus;
  autoFillNote?: string;
}

export interface CompletenessReport {
  standardId: string;
  complete: boolean;
  totalRequired: number;
  present: number;
  autoFilled: number;
  missing: number;
  categories: RequiredCategory[];
  gaps: RequiredCategory[];
}

export const GOLDEN_STANDARD_ID = goldenSpec.id;

export function getGoldenStandardCategories(): RequiredCategory[] {
  return goldenSpec.requiredCategories as RequiredCategory[];
}

export function getGoldenCadIds(): string[] {
  return goldenSpec.goldenCadIds as string[];
}

/** Audit Smart A golden standard — returns gaps that need auto-fill */
export function auditGoldenCompleteness(
  planOptions?: PlanOptions,
): CompletenessReport {
  const categories = getGoldenStandardCategories().filter((c) => {
    if (c.discipline === "S" && planOptions && !planOptions.includeStructural) return false;
    if (c.discipline === "SN" && planOptions && !planOptions.includePlumbing) return false;
    if ((c.discipline === "E" || c.discipline === "ME") && planOptions && !planOptions.includeElectrical)
      return false;
    if (c.discipline === "AC" && planOptions && !planOptions.includeElectrical) return false;
    return c.required;
  });

  const present = categories.filter((c) => c.status === "present");
  const autoFilled = categories.filter((c) => c.status === "auto-fill");
  const missing = categories.filter((c) => c.status === "missing");

  return {
    standardId: GOLDEN_STANDARD_ID,
    complete: missing.length === 0,
    totalRequired: categories.length,
    present: present.length,
    autoFilled: autoFilled.length,
    missing: missing.length,
    categories,
    gaps: [...autoFilled, ...missing],
  };
}

/** Build drawing index aligned with Smart A golden standard sheet codes */
export function buildGoldenStandardIndex(
  doc: Partial<HousePlanDocument>,
  planOptions: PlanOptions,
): DrawingIndexEntry[] {
  const report = auditGoldenCompleteness(planOptions);
  const entries: DrawingIndexEntry[] = [];

  for (const cat of report.categories) {
    const isAutoFill = cat.status === "auto-fill";
    entries.push({
      sheetNo: cat.sheetCode,
      title: cat.title + (isAutoFill ? " (auto-generated)" : ""),
      titleTh: cat.titleTh + (isAutoFill ? " (สร้างอัตโนมัติ)" : ""),
      category: cat.discipline as DrawingIndexEntry["category"],
      scale: cat.discipline === "A" && cat.id.includes("detail") ? "1:20" : cat.id === "site-plan" ? "1:500" : "1:100",
    });
  }

  doc.floorPlans?.forEach((fp, i) => {
    const existing = entries.findIndex((e) => e.sheetNo.startsWith("A2"));
    if (existing >= 0 && i === 0) {
      entries[existing] = {
        sheetNo: "A2.00",
        title: fp.label,
        titleTh: fp.labelTh,
        category: "A",
        scale: fp.scale,
      };
    } else if (i > 0) {
      entries.splice(2 + i, 0, {
        sheetNo: `A2.${String(i).padStart(2, "0")}`,
        title: fp.label,
        titleTh: fp.labelTh,
        category: "A",
        scale: fp.scale,
      });
    }
  });

  return entries;
}

/** Apply golden standard auto-fill to a plan document */
export function applyGoldenStandard(
  doc: HousePlanDocument,
  planOptions: PlanOptions,
): HousePlanDocument {
  const report = auditGoldenCompleteness(planOptions);
  const index = buildGoldenStandardIndex(doc, planOptions);

  for (const gap of report.gaps) {
    switch (gap.id) {
      case "roof-plan":
        if (!doc.roofPlan.slope) doc.roofPlan.slope = "30°";
        if (!doc.roofPlan.drainage.length) {
          doc.roofPlan.drainage = [
            "PVC gutter 100mm per Smart A TYPE E",
            "4 downpipes to SN-08 rainwater system",
          ];
        }
        break;
      case "roof-structure":
        doc.structural.elements.push({
          id: "RS-AUTO",
          type: "beam",
          label: "Roof truss / rafter",
          size: "100×200 mm timber or RC per span",
          location: "Roof plan grid — TYPE E Smart A",
          reinforcement: "Per structural detail S2.00",
        });
        break;
      case "structural-calc":
        if (!doc.structural.calculationSummary.some((s) => s.includes("Smart A"))) {
          doc.structural.calculationSummary.push(
            "Calculation basis: Smart A TYPE E golden standard loads",
            "Live load 200 kg/m², Dead load 500 kg/m² (150mm RC slab)",
            "Footing/column per Detail Footing&Column TYPE E = SMART A",
            "NOTE: Licensed structural engineer stamp required for permit",
          );
        }
        break;
    }
  }

  if (planOptions.includeElectrical && !doc.electrical.some((e) => e.singleLineDiagram.length > 2)) {
    for (const el of doc.electrical) {
      if (el.singleLineDiagram.length < 3) {
        el.singleLineDiagram.push(
          { from: "Meter", to: "Main MCB 63A", cableSize: "10 sq.mm", breaker: "63A" },
          { from: "MCB", to: "Lighting DB", cableSize: "4 sq.mm", breaker: "16A" },
          { from: "MCB", to: "Power DB", cableSize: "6 sq.mm", breaker: "32A" },
        );
      }
    }
  }

  return {
    ...doc,
    index,
    cadPatternIds: [...new Set([...(doc.cadPatternIds ?? []), ...getGoldenCadIds()])],
  };
}

export function buildGoldenStandardContext(): string {
  const report = auditGoldenCompleteness({
    wallMaterial: "concrete-block",
    floorMaterial: "ceramic-tile",
    roofMaterial: "concrete-flat",
    includeElectrical: true,
    includePlumbing: true,
    includeStructural: true,
    evCharger: false,
  });

  return `GOLDEN STANDARD (Smart A TYPE E) — primary completeness guideline:
- ${report.present}/${report.totalRequired} sheets present in reference CAD
- ${report.autoFilled} sheets auto-generated when missing (roof plan, roof structure, calc report)
- Disciplines: A, S, SN, E, ME, AC
All user+AI outputs must match this sheet structure for permit readiness.`;
}
