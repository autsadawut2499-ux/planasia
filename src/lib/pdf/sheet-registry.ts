import { getGoldenStandardCategories } from "@/lib/plans/golden-standard";
import { DPT_DRAWING_PHASES, DPT_SCALES } from "@/lib/pdf/dpt-standards";
import { scopeSectionForSheet } from "@/lib/pdf/drawing-scope";
import type { VectorImplementationStatus } from "@/lib/pdf/types";
import type { DrawingIndexEntry } from "@/lib/plans/schema";
import type { ScopeSectionId } from "@/lib/pdf/drawing-scope";

export interface SheetRegistryEntry {
  sheetCode: string;
  categoryId: string;
  discipline: DrawingIndexEntry["category"];
  title: string;
  titleTh: string;
  required: boolean;
  smartAFile: string | null;
  scopeSectionId: ScopeSectionId;
  phaseId: ScopeSectionId;
  rendererId: string;
  /** Delegation status — external agent generates geometry per sheet-vector-specs.json */
  vectorStatus: VectorImplementationStatus;
  defaultScale: string;
}

function phaseForSheet(sheetCode: string): ScopeSectionId {
  const scoped = scopeSectionForSheet(sheetCode);
  if (scoped) return scoped;
  for (const phase of DPT_DRAWING_PHASES) {
    if (phase.sheetPatterns.some((p) => sheetCode.startsWith(p) || sheetCode === p)) {
      return phase.id;
    }
  }
  return "floor-layouts";
}

function rendererIdFor(categoryId: string, sheetCode: string): string {
  if (sheetCode === "TB") return "title-block-meta";
  if (sheetCode === "A0.00") return "a0-index";
  if (sheetCode === "A1.00") return "a1-site-plan";
  if (sheetCode.startsWith("A2.")) return "a2-floor-plan";
  if (sheetCode === "A3.00") return "a3-roof-plan";
  if (sheetCode === "A4.00") return "a4-elevations";
  if (sheetCode === "A5.00") return "a5-sections";
  if (["A6.00", "A7.00", "A8.00", "A9.00"].includes(sheetCode)) return "a6-a9-details";
  if (sheetCode.startsWith("S")) return "s-structural";
  if (sheetCode.startsWith("SN")) return "sn-sanitary";
  if (sheetCode.startsWith("E")) return "e-electrical";
  if (sheetCode.startsWith("ME")) return "me-mechanical";
  if (sheetCode.startsWith("AC")) return "ac-hvac";
  return `unknown-${categoryId}`;
}

/** Vector status per renderer — updated when external agent completes a sheet type. */
const RENDERER_VECTOR_STATUS: Record<string, VectorImplementationStatus> = {
  "a0-index": "vector-partial",
  "a1-site-plan": "data-placeholder",
  "a2-floor-plan": "vector-partial",
  "a3-roof-plan": "data-placeholder",
  "a4-elevations": "vector-partial",
  "a5-sections": "data-placeholder",
  "a6-a9-details": "data-placeholder",
  "s-structural": "data-placeholder",
  "sn-sanitary": "data-placeholder",
  "e-electrical": "data-placeholder",
  "me-mechanical": "data-placeholder",
  "ac-hvac": "data-placeholder",
  "title-block-meta": "vector-complete",
};

function defaultScaleFor(categoryId: string, discipline: string): string {
  if (categoryId === "site-plan") return DPT_SCALES.sitePlan;
  if (categoryId.includes("detail")) return DPT_SCALES.detail;
  if (discipline === "S") return DPT_SCALES.structural;
  if (discipline === "A") return DPT_SCALES.floorPlan;
  return DPT_SCALES.mep;
}

/** Canonical DPT / Golden Standard sheet registry — single source for renderer dispatch. */
export function buildSheetRegistry(): SheetRegistryEntry[] {
  return getGoldenStandardCategories().map((cat) => {
    const rendererId = rendererIdFor(cat.id, cat.sheetCode);
    return {
      sheetCode: cat.sheetCode,
      categoryId: cat.id,
      discipline: cat.discipline as DrawingIndexEntry["category"],
      title: cat.title,
      titleTh: cat.titleTh,
      required: cat.required,
      smartAFile: cat.smartAFile,
      scopeSectionId: phaseForSheet(cat.sheetCode),
      phaseId: phaseForSheet(cat.sheetCode),
      rendererId,
      vectorStatus: RENDERER_VECTOR_STATUS[rendererId] ?? "pending",
      defaultScale: defaultScaleFor(cat.id, cat.discipline),
    };
  });
}

export const DPT_SHEET_REGISTRY = buildSheetRegistry();

export function lookupRegistryEntry(sheetNo: string): SheetRegistryEntry | undefined {
  if (sheetNo.startsWith("A2.")) {
    return DPT_SHEET_REGISTRY.find((e) => e.sheetCode.startsWith("A2"));
  }
  return DPT_SHEET_REGISTRY.find((e) => e.sheetCode === sheetNo);
}

export function registryEntryForIndex(entry: DrawingIndexEntry): SheetRegistryEntry {
  return (
    lookupRegistryEntry(entry.sheetNo) ?? {
      sheetCode: entry.sheetNo,
      categoryId: entry.sheetNo.toLowerCase(),
      discipline: entry.category,
      title: entry.title,
      titleTh: entry.titleTh,
      required: false,
      smartAFile: null,
      scopeSectionId: phaseForSheet(entry.sheetNo),
      phaseId: phaseForSheet(entry.sheetNo),
      rendererId: rendererIdFor("custom", entry.sheetNo),
      vectorStatus: "pending",
      defaultScale: entry.scale,
    }
  );
}

export function sheetsByPhase(phaseId: ScopeSectionId): SheetRegistryEntry[] {
  return DPT_SHEET_REGISTRY.filter((e) => e.phaseId === phaseId && e.sheetCode !== "TB");
}

export function vectorStatusSummary(): Record<VectorImplementationStatus, number> {
  const summary: Record<VectorImplementationStatus, number> = {
    "vector-complete": 0,
    "vector-partial": 0,
    "data-placeholder": 0,
    pending: 0,
  };
  for (const entry of DPT_SHEET_REGISTRY) {
    if (entry.sheetCode === "TB") continue;
    summary[entry.vectorStatus]++;
  }
  return summary;
}
