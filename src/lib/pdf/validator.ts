import type { HousePlanDocument } from "@/lib/plans/schema";
import type { DrawingSetValidation } from "@/lib/pdf/types";
import { resolveRenderer } from "@/lib/pdf/renderers";
import { registryEntryForIndex } from "@/lib/pdf/sheet-registry";
import { drawingStandardsComplianceReport } from "@/lib/standards/drawing-standards";

function disciplineEnabled(doc: HousePlanDocument, category: string): boolean {
  if (category === "S") return doc.planOptions.includeStructural;
  if (category === "SN") return doc.planOptions.includePlumbing;
  if (category === "E" || category === "ME" || category === "AC") return doc.planOptions.includeElectrical;
  return true;
}

function hasRequiredData(doc: HousePlanDocument, sheetNo: string): boolean {
  if (sheetNo.startsWith("A2.")) {
    const idx = parseInt(/^A2\.(\d+)$/.exec(sheetNo)?.[1] ?? "0", 10);
    return Boolean(doc.floorPlans[idx]);
  }
  return true;
}

/** Pre-export validation — checks index coverage and renderer availability. */
export function validateDrawingSet(doc: HousePlanDocument): DrawingSetValidation {
  const index = doc.index.filter((e) => e.sheetNo !== "TB");
  const pendingVectorSheets: string[] = [];
  const missingDataSheets: string[] = [];
  const skippedSheets: string[] = [];
  let renderableSheets = 0;

  const byDiscipline: DrawingSetValidation["byDiscipline"] = {
    A: { total: 0, renderable: 0 },
    S: { total: 0, renderable: 0 },
    SN: { total: 0, renderable: 0 },
    E: { total: 0, renderable: 0 },
    ME: { total: 0, renderable: 0 },
    AC: { total: 0, renderable: 0 },
  };

  for (const entry of index) {
    const cat = entry.category;
    byDiscipline[cat].total++;

    if (!disciplineEnabled(doc, cat)) {
      skippedSheets.push(entry.sheetNo);
      continue;
    }

    if (!hasRequiredData(doc, entry.sheetNo)) {
      missingDataSheets.push(entry.sheetNo);
      continue;
    }

    const renderer = resolveRenderer(entry);
    if (!renderer) {
      skippedSheets.push(entry.sheetNo);
      continue;
    }

    renderableSheets++;
    byDiscipline[cat].renderable++;

    const reg = registryEntryForIndex(entry);
    if (reg.vectorStatus === "pending" || reg.vectorStatus === "data-placeholder") {
      pendingVectorSheets.push(entry.sheetNo);
    }
  }

  const standards = drawingStandardsComplianceReport();
  const standardsIssues = standards.titleBlock.references
    .filter((r) => !r.registered)
    .map((r) => `Missing title block reference: ${r.filename}`);

  return {
    valid: renderableSheets > 0 && missingDataSheets.length === 0 && standards.compliant,
    totalSheets: index.length,
    renderableSheets,
    pendingVectorSheets,
    missingDataSheets,
    skippedSheets,
    byDiscipline,
    standardsCompliant: standards.compliant,
    standardsIssues,
  };
}
