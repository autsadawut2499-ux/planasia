import { PDFDocument, StandardFonts } from "pdf-lib";
import type { HousePlanDocument } from "@/lib/plans/schema";
import type {
  RenderSetOptions,
  RenderSetResult,
  SheetRenderResult,
} from "@/lib/pdf/types";
import type { UnitFormatOptions } from "@/lib/units/format";
import { resolveRenderer } from "@/lib/pdf/renderers";
import { renderResult } from "@/lib/pdf/renderers/types";
import { registryEntryForIndex } from "@/lib/pdf/sheet-registry";
import { validateDrawingSet } from "@/lib/pdf/validator";
import { DPT_STANDARD } from "@/lib/pdf/dpt-standards";

function disciplineEnabled(doc: HousePlanDocument, category: string): boolean {
  if (category === "S") return doc.planOptions.includeStructural;
  if (category === "SN") return doc.planOptions.includePlumbing;
  if (category === "E" || category === "ME" || category === "AC") return doc.planOptions.includeElectrical;
  return true;
}

/**
 * Render the complete DPT Golden Standard drawing set as a pure-vector PDF.
 * Each sheet is dispatched through the plugin renderer registry.
 */
export async function renderDrawingSet(
  doc: HousePlanDocument,
  options: RenderSetOptions = {},
): Promise<RenderSetResult> {
  const unitOpts: UnitFormatOptions = {
    unitSystem: options.unitSystem ?? "metric",
    metricDecimals: 1,
  };

  const validation = validateDrawingSet(doc);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${doc.project.projectName || "House Plan"} — Planasia`);
  pdf.setAuthor("Planasia AI");
  pdf.setSubject(
    `Building Permit Drawing Set — ${DPT_STANDARD.modelType} / ${DPT_STANDARD.name}`,
  );

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const index = doc.index?.length
    ? doc.index
    : [
        { sheetNo: "A0.00", title: "Drawing Index", titleTh: "สารบัญแบบ", category: "A" as const, scale: "N/A" },
        { sheetNo: "A1.00", title: "Site Plan", titleTh: "แผนผังบริเวณ", category: "A" as const, scale: "1:500" },
      ];

  const rendered = new Set<string>();
  const sheets: SheetRenderResult[] = [];
  const exportable = index.filter((e) => e.sheetNo !== "TB");
  let sheetCount = 0;

  for (let i = 0; i < exportable.length; i++) {
    const entry = exportable[i]!;
    if (rendered.has(entry.sheetNo)) continue;

    if (!disciplineEnabled(doc, entry.category)) {
      sheets.push({
        sheetNo: entry.sheetNo,
        rendered: false,
        rendererId: registryEntryForIndex(entry).rendererId,
        status: registryEntryForIndex(entry).vectorStatus,
        skippedReason: "discipline disabled",
      });
      continue;
    }

    const renderer = resolveRenderer(entry);
    if (!renderer) {
      if (!options.skipUnmatched) {
        sheets.push({
          sheetNo: entry.sheetNo,
          rendered: false,
          rendererId: "none",
          status: "pending",
          skippedReason: "no renderer",
        });
      }
      continue;
    }

    const ok = await renderer.render({ pdf, font, fontBold, doc, entry, unitOpts });
    sheets.push(renderResult(entry, ok, renderer, ok ? undefined : "render returned false"));

    if (ok) {
      rendered.add(entry.sheetNo);
      sheetCount++;
    }

    if (options.onProgress) {
      const progress = Math.round(10 + ((i + 1) / exportable.length) * 85);
      await options.onProgress({
        sheetNo: entry.sheetNo,
        index: i + 1,
        total: exportable.length,
        progress,
        rendererId: renderer.id,
      });
    }
  }

  if (sheetCount === 0 && exportable[0]) {
    const fallback = resolveRenderer(exportable[0]);
    if (fallback) {
      await fallback.render({ pdf, font, fontBold, doc, entry: exportable[0], unitOpts });
      sheetCount = 1;
    }
  }

  const bytes = await pdf.save();

  if (options.onProgress) {
    await options.onProgress({
      sheetNo: "complete",
      index: exportable.length,
      total: exportable.length,
      progress: 100,
      rendererId: "pipeline",
    });
  }

  return { bytes, sheetCount, sheets, validation };
}
