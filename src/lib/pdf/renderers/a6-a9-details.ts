import type { HousePlanDocument } from "@/lib/plans/schema";
import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";

function detailBySheet(sheetNo: string, doc: HousePlanDocument) {
  const map: Record<string, string> = {
    "A6.00": "bath",
    "A7.00": "stair",
    "A8.00": "openings",
  };
  const id = map[sheetNo];
  return id ? doc.architecturalDetails.find((d) => d.id === id) : undefined;
}

export const a6A9DetailsRenderer = createRenderer({
  id: "a6-a9-details",
  label: "Architectural Details (A6–A9)",
  status: "data-placeholder",
  matches: (e) => ["A6.00", "A7.00", "A8.00", "A9.00"].includes(e.sheetNo),
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    const detail = detailBySheet(entry.sheetNo, doc) ?? doc.architecturalDetails[0];
    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      if (detail) {
        drawTextLines(
          ctx.page,
          ctx.font,
          ["[Pending vector detail drawing]", ...detail.items.map((it) => `${it.label}: ${it.value}`)],
          area.x,
          area.y + area.height,
          9,
          16,
        );
      } else {
        drawTextLines(
          ctx.page,
          ctx.font,
          ["[Pending vector detail] — per Smart A TYPE E reference."],
          area.x,
          area.y + area.height,
          9,
          16,
        );
      }
    });
    return true;
  },
});
