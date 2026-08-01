import type { HousePlanDocument } from "@/lib/plans/schema";
import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";

function sanitarySlice(sheetNo: string, doc: HousePlanDocument) {
  const num = parseInt(sheetNo.replace(/^SN-?/, "").split(/[\s-]/)[0] ?? "1", 10);
  if (!doc.sanitary.length) return null;
  return doc.sanitary[(num - 1) % doc.sanitary.length]!;
}

export const snSanitaryRenderer = createRenderer({
  id: "sn-sanitary",
  label: "Sanitary / Plumbing (SN-series)",
  status: "data-placeholder",
  matches: (e) => e.category === "SN",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    if (!doc.planOptions.includePlumbing) return false;

    const sn = sanitarySlice(entry.sheetNo, doc);
    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      if (!sn) {
        drawTextLines(ctx.page, ctx.font, ["[Pending vector sanitary plan]"], area.x, area.y + area.height, 9, 16);
        return;
      }
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          `[Pending vector sanitary layout] — ${entry.sheetNo}`,
          `Floor ${sn.floor}`,
          "Fixtures:",
          ...sn.fixtures.map((f) => `  ${f.room}: ${f.type} (${f.pipeSize})`),
          "",
          `Septic: ${sn.septicTank.capacity} @ ${sn.septicTank.location}`,
          `Rainwater: ${sn.rainwater.downpipes} downpipes → ${sn.rainwater.outlet}`,
        ],
        area.x,
        area.y + area.height,
        8,
        14,
      );
    });
    return true;
  },
});
