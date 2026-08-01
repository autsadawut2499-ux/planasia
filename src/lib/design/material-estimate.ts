import type { DesignEditorState, MaterialEstimate, MaterialEstimateLine } from "./editor-types";

const UNIT_COSTS: Record<string, { unit: string; costPerUnit: number }> = {
  "concrete-block": { unit: "sqm", costPerUnit: 850 },
  brick: { unit: "sqm", costPerUnit: 720 },
  precast: { unit: "sqm", costPerUnit: 1100 },
  "clay-brick": { unit: "sqm", costPerUnit: 680 },
  "ceramic-porcelain": { unit: "sqm", costPerUnit: 450 },
  "ceramic-tile": { unit: "sqm", costPerUnit: 450 },
  "lvt-spc": { unit: "sqm", costPerUnit: 520 },
  laminate: { unit: "sqm", costPerUnit: 680 },
  "engineered-wood": { unit: "sqm", costPerUnit: 980 },
  parquet: { unit: "sqm", costPerUnit: 1200 },
  "granite-marble": { unit: "sqm", costPerUnit: 1400 },
  granite: { unit: "sqm", costPerUnit: 1400 },
  "polished-concrete": { unit: "sqm", costPerUnit: 550 },
  wood: { unit: "sqm", costPerUnit: 680 },
  "concrete-roof-tile": { unit: "sqm", costPerUnit: 620 },
  "ceramic-roof-tile": { unit: "sqm", costPerUnit: 780 },
  "fiber-cement-roof": { unit: "sqm", costPerUnit: 540 },
  "concrete-flat": { unit: "sqm", costPerUnit: 650 },
  "metal-sheet": { unit: "sqm", costPerUnit: 380 },
  "asphalt-shingle": { unit: "sqm", costPerUnit: 480 },
  "clay-tile": { unit: "sqm", costPerUnit: 520 },
  "polycarbonate-acrylic": { unit: "sqm", costPerUnit: 720 },
};

const WALL_HEIGHT = 2.8;
const ROOF_OVERHANG = 1.15;

function areaByMaterial(
  editor: DesignEditorState,
  category: "floor" | "wall",
): Map<string, number> {
  const map = new Map<string, number>();
  for (const room of editor.rooms) {
    const mat = category === "floor" ? room.floorMaterial : room.wallMaterial;
    const floorArea = room.width * room.depth;
    const wallArea = 2 * (room.width + room.depth) * WALL_HEIGHT;
    const add = category === "floor" ? floorArea : wallArea;
    map.set(mat, (map.get(mat) ?? 0) + add);
  }
  return map;
}

function lineFromMaterial(category: MaterialEstimateLine["category"], material: string, qty: number): MaterialEstimateLine {
  const pricing = UNIT_COSTS[material] ?? { unit: "sqm", costPerUnit: 500 };
  const total = Math.round(qty * pricing.costPerUnit);
  return {
    category,
    material,
    unit: pricing.unit,
    quantity: Math.round(qty * 10) / 10,
    unitCostThb: pricing.costPerUnit,
    totalThb: total,
  };
}

export function estimateMaterials(editor: DesignEditorState): MaterialEstimate {
  const lines: MaterialEstimateLine[] = [];

  for (const [mat, qty] of areaByMaterial(editor, "floor")) {
    lines.push(lineFromMaterial("floor", mat, qty));
  }
  for (const [mat, qty] of areaByMaterial(editor, "wall")) {
    lines.push(lineFromMaterial("wall", mat, qty));
  }

  const roofArea =
    editor.rooms
      .filter((r) => r.floor === 1)
      .reduce((a, r) => a + r.width * r.depth, 0) * ROOF_OVERHANG;
  lines.push(lineFromMaterial("roof", editor.roofMaterial, roofArea));

  const doors = editor.openings.filter((o) => o.type === "door");
  const windows = editor.openings.filter((o) => o.type === "window");
  if (doors.length) {
    lines.push({
      category: "door",
      material: "standard-door",
      unit: "ea",
      quantity: doors.length,
      unitCostThb: 8500,
      totalThb: doors.length * 8500,
    });
  }
  if (windows.length) {
    const windowArea = windows.reduce((a, w) => a + w.width * 1.2, 0);
    lines.push({
      category: "window",
      material: "aluminum-window",
      unit: "sqm",
      quantity: Math.round(windowArea * 10) / 10,
      unitCostThb: 4200,
      totalThb: Math.round(windowArea * 4200),
    });
  }

  const subtotal = lines.reduce((a, l) => a + l.totalThb, 0);
  const contingency = Math.round(subtotal * 0.1);
  const grossAreaSqm = editor.rooms.reduce((a, r) => a + r.width * r.depth, 0);

  return {
    lines,
    subtotalThb: subtotal,
    contingencyThb: contingency,
    totalThb: subtotal + contingency,
    grossAreaSqm: Math.round(grossAreaSqm * 10) / 10,
  };
}
