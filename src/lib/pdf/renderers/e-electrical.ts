import type { HousePlanDocument } from "@/lib/plans/schema";
import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";

function electricalSlice(sheetNo: string, doc: HousePlanDocument) {
  const num = parseInt(sheetNo.replace(/^E-?/, "").split(/[\s-]/)[0] ?? "1", 10);
  if (!doc.electrical.length) return null;
  return doc.electrical[(num - 1) % doc.electrical.length]!;
}

export const eElectricalRenderer = createRenderer({
  id: "e-electrical",
  label: "Electrical (E-series)",
  status: "data-placeholder",
  matches: (e) => e.category === "E",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    if (!doc.planOptions.includeElectrical) return false;

    const { sheetNo } = entry;

    if (sheetNo.startsWith("E-03") || entry.title.toLowerCase().includes("single line")) {
      await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
        const sld = doc.electrical[0]?.singleLineDiagram ?? [];
        drawTextLines(
          ctx.page,
          ctx.font,
          ["[Pending vector single-line diagram]", ...sld.map((l) => `${l.from} → ${l.to}  |  Cable: ${l.cableSize}  |  Breaker: ${l.breaker}`)],
          area.x,
          area.y + area.height,
          9,
          16,
        );
      });
      return true;
    }

    const el = electricalSlice(sheetNo, doc);
    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      if (!el) {
        drawTextLines(ctx.page, ctx.font, ["[Pending vector electrical plan]"], area.x, area.y + area.height, 9, 16);
        return;
      }
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          `[Pending vector electrical layout] — Floor ${el.floor}`,
          "Lighting:",
          ...el.lighting.map((l) => `  ${l.room}: ${l.count}× ${l.wattage}`),
          "",
          "Power:",
          ...el.powerLoads.map((p) => `  ${p.appliance} @ ${p.location}: ${p.amperage}`),
          "",
          `Consumer unit: ${el.consumerUnit.mainBreaker}, ${el.consumerUnit.circuits} circuits`,
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
