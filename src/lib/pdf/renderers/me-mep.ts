import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";

export const meMechanicalRenderer = createRenderer({
  id: "me-mechanical",
  label: "Mechanical (ME-series)",
  status: "data-placeholder",
  matches: (e) => e.category === "ME",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    if (!doc.planOptions.includeElectrical) return false;

    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          "[Pending vector mechanical plan]",
          "Mechanical ventilation, plumbing stacks, and electrical routing",
          "Refer to SN and E series for discipline details",
          `${entry.sheetNo} — ${entry.title}`,
        ],
        area.x,
        area.y + area.height,
        9,
        16,
      );
    });
    return true;
  },
});

export const acHvacRenderer = createRenderer({
  id: "ac-hvac",
  label: "Air Conditioning (AC-series)",
  status: "data-placeholder",
  matches: (e) => e.category === "AC",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    if (!doc.planOptions.includeElectrical) return false;

    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          "[Pending vector AC layout]",
          "Split-type / ducted zones per floor plan",
          "Condenser locations on roof plan (A3.00)",
          `${entry.sheetNo} — ${entry.title}`,
        ],
        area.x,
        area.y + area.height,
        9,
        16,
      );
    });
    return true;
  },
});
