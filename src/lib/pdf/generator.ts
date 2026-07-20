import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { HousePlanDocument, PlanRoom } from "@/lib/plans/schema";

const A3_LANDSCAPE = { width: 1190.55, height: 841.89 };
const MARGIN = 40;
const TITLE_BLOCK_H = 90;

interface DrawContext {
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  doc: HousePlanDocument;
  sheetNo: string;
  title: string;
  titleTh: string;
  scale: string;
}

function drawTitleBlock(ctx: DrawContext) {
  const { page, font, fontBold, doc, sheetNo, title, titleTh, scale } = ctx;
  const tbY = MARGIN;
  const tbW = A3_LANDSCAPE.width - MARGIN * 2;
  const tbH = TITLE_BLOCK_H;

  page.drawRectangle({
    x: MARGIN,
    y: tbY,
    width: tbW,
    height: tbH,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  page.drawLine({
    start: { x: MARGIN + tbW * 0.55, y: tbY },
    end: { x: MARGIN + tbW * 0.55, y: tbY + tbH },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });

  page.drawText(doc.project.projectName || "Residential House", {
    x: MARGIN + 8,
    y: tbY + tbH - 18,
    size: 11,
    font: fontBold,
  });
  page.drawText(`Owner: ${doc.project.ownerName || "—"}  |  Location: ${doc.project.location || "—"}`, {
    x: MARGIN + 8,
    y: tbY + tbH - 32,
    size: 8,
    font,
  });
  page.drawText(`Code: ${doc.buildingCode}`, {
    x: MARGIN + 8,
    y: tbY + tbH - 46,
    size: 7,
    font,
  });
  page.drawText("Planasia — User+AI Original Design (Gov templates = reference only)", {
    x: MARGIN + 8,
    y: tbY + 8,
    size: 6,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(sheetNo, {
    x: MARGIN + tbW * 0.55 + 8,
    y: tbY + tbH - 18,
    size: 12,
    font: fontBold,
  });
  page.drawText(title, {
    x: MARGIN + tbW * 0.55 + 8,
    y: tbY + tbH - 34,
    size: 9,
    font: fontBold,
  });
  page.drawText(titleTh, {
    x: MARGIN + tbW * 0.55 + 8,
    y: tbY + tbH - 48,
    size: 8,
    font,
  });
  page.drawText(`Scale: ${scale}`, {
    x: MARGIN + tbW * 0.55 + 8,
    y: tbY + 12,
    size: 8,
    font,
  });
}

function contentArea() {
  return {
    x: MARGIN + 10,
    y: MARGIN + TITLE_BLOCK_H + 20,
    width: A3_LANDSCAPE.width - MARGIN * 2 - 20,
    height: A3_LANDSCAPE.height - MARGIN * 2 - TITLE_BLOCK_H - 40,
  };
}

function drawTextLines(
  page: PDFPage,
  font: PDFFont,
  lines: string[],
  x: number,
  y: number,
  size = 9,
  lineHeight = 14,
) {
  lines.forEach((line, i) => {
    page.drawText(line, { x, y: y - i * lineHeight, size, font });
  });
}

function drawFloorPlan(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  rooms: PlanRoom[],
  area: { x: number; y: number; width: number; height: number },
  scaleLabel: string,
) {
  const maxX = Math.max(...rooms.map((r) => r.x + r.width), 1);
  const maxY = Math.max(...rooms.map((r) => r.y + r.depth), 1);
  const scale = Math.min(area.width / maxX, area.height / maxY) * 0.85;

  page.drawText(scaleLabel, { x: area.x, y: area.y + area.height + 8, size: 8, font });

  for (const room of rooms) {
    const rx = area.x + room.x * scale;
    const ry = area.y + (maxY - room.y - room.depth) * scale;
    const rw = room.width * scale;
    const rh = room.depth * scale;

    page.drawRectangle({
      x: rx,
      y: ry,
      width: rw,
      height: rh,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const label = `${room.name}\n${room.width.toFixed(1)}×${room.depth.toFixed(1)}m`;
    label.split("\n").forEach((line, i) => {
      page.drawText(line, {
        x: rx + 4,
        y: ry + rh / 2 - i * 10,
        size: 7,
        font: i === 0 ? fontBold : font,
      });
    });
  }
}

async function addSheet(
  pdf: PDFDocument,
  font: PDFFont,
  fontBold: PDFFont,
  doc: HousePlanDocument,
  sheetNo: string,
  title: string,
  titleTh: string,
  scale: string,
  render: (ctx: DrawContext, area: ReturnType<typeof contentArea>) => void,
) {
  const page = pdf.addPage([A3_LANDSCAPE.width, A3_LANDSCAPE.height]);
  const ctx: DrawContext = { page, font, fontBold, doc, sheetNo, title, titleTh, scale };
  drawTitleBlock(ctx);
  render(ctx, contentArea());
}

/** Generate a complete multi-sheet PDF permit drawing set */
export async function generatePlanPdf(doc: HousePlanDocument): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${doc.project.projectName || "House Plan"} — Planasia`);
  pdf.setAuthor("Planasia AI");
  pdf.setSubject("Building Permit Drawing Set");

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  await addSheet(pdf, font, fontBold, doc, "A0.00", "Drawing Index", "สารบัญแบบ", "N/A", (ctx, area) => {
    const lines = doc.index.map((e) => `${e.sheetNo}  [${e.category}]  ${e.title} / ${e.titleTh}  (${e.scale})`);
    drawTextLines(ctx.page, ctx.font, lines, area.x, area.y + area.height, 8, 12);
  });

  await addSheet(pdf, font, fontBold, doc, "A1.00", "Site Plan", "แผนผังบริเวณ", "1:500", (ctx, area) => {
    const sp = doc.sitePlan;
    const scale = Math.min(area.width / sp.plotWidth, area.height / sp.plotDepth) * 0.8;
    const ox = area.x + 20;
    const oy = area.y + 20;

    ctx.page.drawRectangle({
      x: ox,
      y: oy,
      width: sp.plotWidth * scale,
      height: sp.plotDepth * scale,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1.5,
    });

    ctx.page.drawRectangle({
      x: ox + sp.building.x * scale,
      y: oy + sp.building.y * scale,
      width: sp.building.width * scale,
      height: sp.building.depth * scale,
      color: rgb(0.85, 0.85, 0.85),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const notes = [
      `Plot: ${sp.plotWidth}×${sp.plotDepth} m`,
      `Setbacks — Front: ${sp.setbacks.front}m  Rear: ${sp.setbacks.rear}m  L: ${sp.setbacks.left}m  R: ${sp.setbacks.right}m`,
      `Road: ${sp.roadSide}  |  Entrance: ${sp.entrance}`,
      "N ↑",
    ];
    drawTextLines(ctx.page, ctx.font, notes, ox + sp.plotWidth * scale + 20, area.y + area.height, 8, 14);
  });

  for (let i = 0; i < doc.floorPlans.length; i++) {
    const fp = doc.floorPlans[i];
    const sheetNo = `A2.${String(i).padStart(2, "0")}`;
    await addSheet(pdf, font, fontBold, doc, sheetNo, fp.label, fp.labelTh, fp.scale, (ctx, area) => {
      drawFloorPlan(ctx.page, ctx.font, ctx.fontBold, fp.rooms, area, fp.scale);
      ctx.page.drawText(`Gross area: ${fp.grossArea.toFixed(1)} m²`, {
        x: area.x,
        y: area.y - 10,
        size: 8,
        font: ctx.font,
      });
    });
  }

  await addSheet(pdf, font, fontBold, doc, "A3.00", "Roof Plan", "แปลนหลังคา", "1:100", (ctx, area) => {
    const rp = doc.roofPlan;
    drawTextLines(
      ctx.page,
      ctx.font,
      [
        `Roof type: ${rp.type}`,
        `Slope: ${rp.slope}`,
        `Material: ${rp.material}`,
        "Drainage:",
        ...rp.drainage.map((d) => `  • ${d}`),
      ],
      area.x,
      area.y + area.height,
      9,
      16,
    );
  });

  await addSheet(pdf, font, fontBold, doc, "A4.00", "Elevations", "รูปด้าน", "1:100", (ctx, area) => {
    const colW = area.width / 2 - 10;
    doc.elevations.forEach((el, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = area.x + col * (colW + 20);
      const y = area.y + area.height - row * (area.height / 2) - 20;

      ctx.page.drawRectangle({
        x,
        y: y - 120,
        width: colW,
        height: 100,
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
      });
      ctx.page.drawText(`${el.label} / ${el.labelTh}`, { x, y, size: 9, font: ctx.fontBold });
      ctx.page.drawText(`Height: ${el.height} m`, { x, y: y - 14, size: 8, font: ctx.font });
      el.finishNotes.forEach((n, ni) => {
        ctx.page.drawText(`• ${n}`, { x, y: y - 28 - ni * 12, size: 7, font: ctx.font });
      });
    });
  });

  await addSheet(pdf, font, fontBold, doc, "A5.00", "Sections", "รูปตัด", "1:100", (ctx, area) => {
    doc.sections.forEach((sec, idx) => {
      const y = area.y + area.height - idx * 160;
      ctx.page.drawText(`${sec.label} (${sec.id}) / ${sec.labelTh}`, {
        x: area.x,
        y,
        size: 9,
        font: ctx.fontBold,
      });
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          `Cut: ${sec.cutDirection}`,
          ...sec.floorLevels.map((l) => `  ${l.name}: +${l.elevation.toFixed(2)} m`),
          ...sec.notes.map((n) => `  • ${n}`),
        ],
        area.x,
        y - 16,
        8,
        13,
      );
    });
  });

  for (const detail of doc.architecturalDetails) {
    const sheetMap: Record<string, string> = {
      bath: "A6.00",
      stair: "A7.00",
      openings: "A8.00",
    };
    const sheetNo = sheetMap[detail.id] ?? "A6.00";
    await addSheet(pdf, font, fontBold, doc, sheetNo, detail.title, detail.titleTh, "1:20", (ctx, area) => {
      drawTextLines(
        ctx.page,
        ctx.font,
        detail.items.map((it) => `${it.label}: ${it.value}`),
        area.x,
        area.y + area.height,
        9,
        16,
      );
    });
  }

  if (doc.planOptions.includeStructural) {
    await addSheet(pdf, font, fontBold, doc, "S1.00", "Foundation & Pile Plan", "แปลนฐานรากและเสาเข็ม", "1:100", (ctx, area) => {
      const st = doc.structural;
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          `Foundation type: ${st.foundationType}`,
          "",
          "Elements:",
          ...st.elements.map((e) => `  [${e.type.toUpperCase()}] ${e.label} — ${e.size} @ ${e.location}${e.reinforcement ? ` (${e.reinforcement})` : ""}`),
        ],
        area.x,
        area.y + area.height,
        8,
        14,
      );
    });

    await addSheet(pdf, font, fontBold, doc, "S2.00", "Floor/Beam Plans", "แปลนโครงสร้างพื้น-คาน", "1:100", (ctx, area) => {
      drawTextLines(
        ctx.page,
        ctx.font,
        doc.structural.beamSpans.map((b) => `${b.id}: span ${b.span}m — ${b.size} mm`),
        area.x,
        area.y + area.height,
        9,
        16,
      );
    });

    await addSheet(pdf, font, fontBold, doc, "S3.00", "Roof Structure", "แปลนโครงสร้างหลังคา", "1:100", (ctx, area) => {
      drawTextLines(
        ctx.page,
        ctx.font,
        ["Truss / rafter layout per roof plan", `Roof type: ${doc.roofPlan.type}`, "Purlin spacing: 1.0m", "Ridge beam: RC or timber per span"],
        area.x,
        area.y + area.height,
        9,
        16,
      );
    });

    await addSheet(pdf, font, fontBold, doc, "S4.00", "Structural Details", "แบบขยายโครงสร้าง", "1:20", (ctx, area) => {
      drawTextLines(
        ctx.page,
        ctx.font,
        ["Column-base connection detail", "Beam-column joint detail", "Slab reinforcement 150mm @ 200 c/c"],
        area.x,
        area.y + area.height,
        9,
        16,
      );
    });

    await addSheet(pdf, font, fontBold, doc, "S5.00", "Structural Calculation Report", "รายการคำนวณโครงสร้าง", "N/A", (ctx, area) => {
      drawTextLines(ctx.page, ctx.font, doc.structural.calculationSummary, area.x, area.y + area.height, 9, 16);
      ctx.page.drawText("Signed by licensed structural engineer: _________________________", {
        x: area.x,
        y: area.y + 40,
        size: 8,
        font: ctx.font,
      });
    });
  }

  if (doc.planOptions.includePlumbing) {
    for (let i = 0; i < doc.sanitary.length; i++) {
      const sn = doc.sanitary[i];
      await addSheet(
        pdf,
        font,
        fontBold,
        doc,
        `SN${sn.floor}.${String(i).padStart(2, "0")}`,
        `Sanitary Plan Floor ${sn.floor}`,
        `แปลนระบบสุขาภิบาล ชั้น ${sn.floor}`,
        "1:100",
        (ctx, area) => {
          drawTextLines(
            ctx.page,
            ctx.font,
            [
              "Fixtures:",
              ...sn.fixtures.map((f) => `  ${f.room}: ${f.type} (${f.pipeSize})`),
              "",
              `Septic tank: ${sn.septicTank.capacity} @ ${sn.septicTank.location}`,
              `Grease trap: ${sn.greaseTrap ? "Yes" : "No"}`,
              `Rainwater: ${sn.rainwater.downpipes} downpipes, ${sn.rainwater.drainSize} → ${sn.rainwater.outlet}`,
            ],
            area.x,
            area.y + area.height,
            8,
            14,
          );
        },
      );
    }
  }

  if (doc.planOptions.includeElectrical) {
    for (let i = 0; i < doc.electrical.length; i++) {
      const el = doc.electrical[i];
      await addSheet(
        pdf,
        font,
        fontBold,
        doc,
        `E${el.floor}.${String(i).padStart(2, "0")}`,
        `Electrical Plan Floor ${el.floor}`,
        `แปลนระบบไฟฟ้า ชั้น ${el.floor}`,
        "1:100",
        (ctx, area) => {
          drawTextLines(
            ctx.page,
            ctx.font,
            [
              "Lighting:",
              ...el.lighting.map((l) => `  ${l.room}: ${l.count}× ${l.wattage}`),
              "",
              "Power loads:",
              ...el.powerLoads.map((p) => `  ${p.appliance} @ ${p.location}: ${p.amperage}`),
              "",
              `Consumer unit: ${el.consumerUnit.mainBreaker}, ${el.consumerUnit.circuits} circuits`,
            ],
            area.x,
            area.y + area.height,
            8,
            14,
          );
        },
      );
    }

    await addSheet(pdf, font, fontBold, doc, "E9.00", "Single Line Diagram", "แผนผังระบบสายไฟ", "N/A", (ctx, area) => {
      const sld = doc.electrical[0]?.singleLineDiagram ?? [];
      drawTextLines(
        ctx.page,
        ctx.font,
        sld.map((l) => `${l.from} → ${l.to}  |  Cable: ${l.cableSize}  |  Breaker: ${l.breaker}`),
        area.x,
        area.y + area.height,
        9,
        16,
      );
    });
  }

  return pdf.save();
}
