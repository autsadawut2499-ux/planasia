import type { HousePlanDocument, PlanRoom } from "./schema";

export interface SheetPreview {
  sheetNo: string;
  title: string;
  titleTh: string;
  category: "A" | "S" | "SN" | "E";
  scale: string;
  /** SVG markup for the drawing area (title block rendered separately in UI) */
  svg: string;
}

const A3_RATIO = 841.89 / 1190.55;

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgText(
  x: number,
  y: number,
  text: string,
  size = 11,
  weight: "normal" | "bold" = "normal",
): string {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="#111" font-family="Inter, sans-serif">${esc(text)}</text>`;
}

function svgRect(
  x: number,
  y: number,
  w: number,
  h: number,
  fill = "none",
  stroke = "#111",
  sw = 1,
): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function drawRoomsSvg(rooms: PlanRoom[], width: number, height: number): string {
  const pad = 24;
  const maxX = Math.max(...rooms.map((r) => r.x + r.width), 1);
  const maxY = Math.max(...rooms.map((r) => r.y + r.depth), 1);
  const scale = Math.min((width - pad * 2) / maxX, (height - pad * 2) / maxY) * 0.9;

  let out = "";
  for (const room of rooms) {
    const rx = pad + room.x * scale;
    const ry = pad + (maxY - room.y - room.depth) * scale;
    const rw = room.width * scale;
    const rh = room.depth * scale;
    out += svgRect(rx, ry, rw, rh);
    out += svgText(rx + 6, ry + rh / 2 - 4, room.name, 9, "bold");
    out += svgText(rx + 6, ry + rh / 2 + 10, `${room.width.toFixed(1)}×${room.depth.toFixed(1)} m`, 8);
  }
  return out;
}

function wrapSvg(content: string, viewW = 900, viewH = Math.round(900 * A3_RATIO)): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${content}</svg>`;
}

function indexSheet(doc: HousePlanDocument): string {
  const lines = doc.index.map(
    (e) => `${e.sheetNo}  [${e.category}]  ${e.title} / ${e.titleTh}  (${e.scale})`,
  );
  let y = 40;
  let content = "";
  for (const line of lines) {
    content += svgText(24, y, line, 10);
    y += 16;
  }
  return wrapSvg(content);
}

function sitePlanSheet(doc: HousePlanDocument): string {
  const sp = doc.sitePlan;
  const pad = 40;
  const scale = Math.min(400 / sp.plotWidth, 280 / sp.plotDepth);
  const ox = pad;
  const oy = pad;
  let content = svgRect(ox, oy, sp.plotWidth * scale, sp.plotDepth * scale, "none", "#111", 1.5);
  content += svgRect(
    ox + sp.building.x * scale,
    oy + sp.building.y * scale,
    sp.building.width * scale,
    sp.building.depth * scale,
    "#ddd",
  );
  const notes = [
    `Plot: ${sp.plotWidth}×${sp.plotDepth} m`,
    `Setbacks — F:${sp.setbacks.front} R:${sp.setbacks.rear} L:${sp.setbacks.left} R:${sp.setbacks.right} m`,
    `Road: ${sp.roadSide}  |  Entrance: ${sp.entrance}`,
    "N ↑",
  ];
  notes.forEach((n, i) => {
    content += svgText(ox + sp.plotWidth * scale + 20, pad + i * 18, n, 9);
  });
  return wrapSvg(content);
}

function tableSheet(rows: string[][], viewH?: number): string {
  let y = 36;
  let content = "";
  for (const row of rows) {
    content += svgText(24, y, row.join("  |  "), row === rows[0] ? 10 : 9, row === rows[0] ? "bold" : "normal");
    y += row === rows[0] ? 20 : 16;
  }
  return wrapSvg(content, 900, viewH ?? Math.max(400, y + 40));
}

/** Build lightweight SVG previews for every sheet in the drawing set */
export function buildSheetPreviews(doc: HousePlanDocument): SheetPreview[] {
  const previews: SheetPreview[] = [];

  for (const entry of doc.index) {
    previews.push({
      sheetNo: entry.sheetNo,
      title: entry.title,
      titleTh: entry.titleTh,
      category: entry.category as SheetPreview["category"],
      scale: entry.scale,
      svg: "",
    });
  }

  const byNo = new Map(previews.map((p) => [p.sheetNo, p]));

  const a000 = byNo.get("A0.00");
  if (a000) a000.svg = indexSheet(doc);

  const a100 = byNo.get("A1.00");
  if (a100) a100.svg = sitePlanSheet(doc);

  doc.floorPlans.forEach((fp, i) => {
    const sheetNo = `A2.${String(i).padStart(2, "0")}`;
    const sheet = byNo.get(sheetNo);
    if (sheet) {
      const h = Math.round(900 * A3_RATIO);
      sheet.svg = wrapSvg(drawRoomsSvg(fp.rooms, 900, h - 60) + svgText(24, h - 20, `Gross area: ${fp.grossArea.toFixed(1)} m²`, 9));
    }
  });

  const a300 = byNo.get("A3.00");
  if (a300) {
    const rp = doc.roofPlan;
    a300.svg = tableSheet([
      ["Roof Plan"],
      [`Type: ${rp.type}`],
      [`Slope: ${rp.slope}`],
      [`Material: ${rp.material}`],
      ...rp.drainage.map((d) => [`Drainage: ${d}`]),
    ]);
  }

  const a400 = byNo.get("A4.00");
  if (a400) {
    a400.svg = tableSheet([
      ["Elevation", "Height", "Notes"],
      ...doc.elevations.flatMap((el) => [
        [`${el.label} / ${el.labelTh}`, `${el.height.toFixed(1)} m`, el.finishNotes.join("; ") || "—"],
      ]),
    ]);
  }

  const a500 = byNo.get("A5.00");
  if (a500) {
    a500.svg = tableSheet([
      ["Section", "Cut", "Notes"],
      ...doc.sections.map((s) => [s.label, s.cutDirection, s.notes.join("; ") || "—"]),
    ]);
  }

  for (const detail of doc.architecturalDetails) {
    const sheet = [...byNo.values()].find((s) => s.title === detail.title);
    if (sheet) {
      sheet.svg = tableSheet([
        [detail.title, detail.titleTh],
        ...detail.items.map((it) => [it.label, it.value]),
      ]);
    }
  }

  const s100 = byNo.get("S1.00");
  if (s100) {
    const st = doc.structural;
    s100.svg = tableSheet([
      ["Element", "Type", "Size", "Location"],
      ...st.elements.map((el) => [el.label, el.type, el.size, el.location]),
    ]);
  }

  const s200 = byNo.get("S2.00");
  if (s200) {
    s200.svg = tableSheet([
      ["Beam Span", "Span (m)", "Size"],
      ...doc.structural.beamSpans.map((b) => [b.id, b.span.toFixed(1), b.size]),
    ]);
  }

  const s400 = byNo.get("S4.00");
  if (s400) {
    s400.svg = tableSheet([["Structural Details"], ...doc.structural.calculationSummary.map((l) => [l])]);
  }

  const s500 = byNo.get("S5.00");
  if (s500) {
    s500.svg = tableSheet([["Calculation Report"], ...doc.structural.calculationSummary.map((l) => [l])]);
  }

  for (const sn of doc.sanitary) {
    const sheetNo = `SN${sn.floor}.00`;
    const sheet = byNo.get(sheetNo);
    if (sheet) {
      sheet.svg = tableSheet([
        ["Fixture", "Type", "Pipe"],
        ...sn.fixtures.map((f) => [f.room, f.type, f.pipeSize]),
        [`Septic: ${sn.septicTank.capacity} @ ${sn.septicTank.location}`],
        [`Rainwater: ${sn.rainwater.downpipes} downpipes, ${sn.rainwater.drainSize}`],
      ]);
    }
  }

  for (const el of doc.electrical) {
    const sheetNo = `E${el.floor}.00`;
    const sheet = byNo.get(sheetNo);
    if (sheet) {
      sheet.svg = tableSheet([
        ["Room", "Lights", "Switches", "Outlets"],
        ...el.lighting.map((lit, i) => {
          const sw = el.switches[i];
          const out = el.outlets[i];
          return [
            lit.room,
            `${lit.count}× ${lit.wattage}`,
            sw ? String(sw.count) : "—",
            out ? String(out.count) : "—",
          ];
        }),
        [`Main breaker: ${el.consumerUnit.mainBreaker}`, `${el.consumerUnit.circuits} circuits`],
      ]);
    }
  }

  const e900 = byNo.get("E9.00");
  if (e900 && doc.electrical[0]) {
    const sld = doc.electrical[0].singleLineDiagram;
    e900.svg = tableSheet([
      ["From", "To", "Cable", "Breaker"],
      ...sld.map((l) => [l.from, l.to, l.cableSize, l.breaker]),
    ]);
  }

  for (const p of previews) {
    if (!p.svg) {
      p.svg = wrapSvg(svgText(24, 48, `${p.title} / ${p.titleTh}`, 12, "bold"));
    }
  }

  return previews;
}
