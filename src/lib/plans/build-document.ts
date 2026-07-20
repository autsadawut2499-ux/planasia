import type { PlanOptions, ProjectInput } from "@/lib/ai/types";
import type { DrawingIndexEntry, HousePlanDocument } from "./schema";
import type { DesignEditorState } from "@/lib/design/editor-types";
import { editorToFloorPlans } from "@/lib/design/editor-state";

function room(
  id: string,
  name: string,
  nameTh: string,
  w: number,
  d: number,
  x: number,
  y: number,
) {
  return { id, name, nameTh, width: w, depth: d, x, y };
}

function buildGroundFloor(project: ProjectInput): HousePlanDocument["floorPlans"][0] {
  const rooms = [
    room("living", "Living Room", "ห้องนั่งเล่น", 5.0, 4.5, 0, 0),
    room("kitchen", "Kitchen", "ครัว", 3.5, 3.0, 5.0, 0),
    room("dining", "Dining", "ห้องทานอาหาร", 3.5, 2.5, 5.0, 3.0),
    room("bed1", "Bedroom 1", "ห้องนอน 1", 3.8, 4.0, 0, 4.5),
    room("bath1", "Bathroom 1", "ห้องน้ำ 1", 2.2, 2.5, 3.8, 4.5),
    room("garage", "Carport", "ที่จอดรถ", 3.5, 6.0, 8.5, 0),
  ];
  if (project.bedrooms >= 2) {
    rooms.push(room("bed2", "Bedroom 2", "ห้องนอน 2", 3.5, 3.5, 0, 8.5));
  }
  if (project.bathrooms >= 2) {
    rooms.push(room("bath2", "Bathroom 2", "ห้องน้ำ 2", 2.0, 2.5, 3.5, 8.5));
  }
  return {
    level: 1,
    label: "Ground Floor Plan",
    labelTh: "แปลนพื้นชั้นล่าง",
    scale: "1:100",
    rooms,
    grossArea: rooms.reduce((a, r) => a + r.width * r.depth, 0),
  };
}

function buildUpperFloor(project: ProjectInput): HousePlanDocument["floorPlans"][0] {
  const rooms = [
    room("master", "Master Bedroom", "ห้องนอนใหญ่", 4.5, 4.5, 0, 0),
    room("mbath", "Master Bath", "ห้องน้ำใน", 2.5, 3.0, 4.5, 0),
    room("bed3", "Bedroom 3", "ห้องนอน 3", 3.5, 3.5, 0, 4.5),
    room("hall", "Hall", "โถง", 3.0, 2.5, 3.5, 4.5),
    room("balcony", "Balcony", "ระเบียง", 4.0, 1.5, 6.5, 0),
  ];
  return {
    level: 2,
    label: "Upper Floor Plan",
    labelTh: "แปลนพื้นชั้นบน",
    scale: "1:100",
    rooms,
    grossArea: rooms.reduce((a, r) => a + r.width * r.depth, 0),
  };
}

function buildIndex(doc: Partial<HousePlanDocument>): DrawingIndexEntry[] {
  const entries: DrawingIndexEntry[] = [
    { sheetNo: "A0.00", title: "Drawing Index", titleTh: "สารบัญแบบ", category: "A", scale: "N/A" },
    { sheetNo: "A1.00", title: "Site Plan", titleTh: "แผนผังบริเวณ", category: "A", scale: "1:500" },
  ];
  doc.floorPlans?.forEach((fp, i) => {
    entries.push({
      sheetNo: `A2.${String(i).padStart(2, "0")}`,
      title: fp.label,
      titleTh: fp.labelTh,
      category: "A",
      scale: fp.scale,
    });
  });
  entries.push(
    { sheetNo: "A3.00", title: "Roof Plan", titleTh: "แปลนหลังคา", category: "A", scale: "1:100" },
    { sheetNo: "A4.00", title: "Elevations", titleTh: "รูปด้าน", category: "A", scale: "1:100" },
    { sheetNo: "A5.00", title: "Sections", titleTh: "รูปตัด", category: "A", scale: "1:100" },
    { sheetNo: "A6.00", title: "Bathroom Details", titleTh: "แบบขยายห้องน้ำ", category: "A", scale: "1:20" },
    { sheetNo: "A7.00", title: "Stair Details", titleTh: "แบบขยายบันได", category: "A", scale: "1:20" },
    { sheetNo: "A8.00", title: "Door & Window Schedule", titleTh: "ตารางประตู-หน้าต่าง", category: "A", scale: "1:20" },
  );
  if (doc.planOptions?.includeStructural) {
    entries.push(
      { sheetNo: "S1.00", title: "Foundation & Pile Plan", titleTh: "แปลนฐานรากและเสาเข็ม", category: "S", scale: "1:100" },
      { sheetNo: "S2.00", title: "Floor/Beam Plans", titleTh: "แปลนโครงสร้างพื้น-คาน", category: "S", scale: "1:100" },
      { sheetNo: "S3.00", title: "Roof Structure", titleTh: "แปลนโครงสร้างหลังคา", category: "S", scale: "1:100" },
      { sheetNo: "S4.00", title: "Structural Details", titleTh: "แบบขยายโครงสร้าง", category: "S", scale: "1:20" },
      { sheetNo: "S5.00", title: "Structural Calculation", titleTh: "รายการคำนวณโครงสร้าง", category: "S", scale: "N/A" },
    );
  }
  if (doc.planOptions?.includePlumbing) {
    doc.floorPlans?.forEach((fp, i) => {
      entries.push({
        sheetNo: `SN${fp.level}.${String(i).padStart(2, "0")}`,
        title: `Sanitary Plan Floor ${fp.level}`,
        titleTh: `แปลนระบบสุขาภิบาล ชั้น ${fp.level}`,
        category: "SN",
        scale: "1:100",
      });
    });
  }
  if (doc.planOptions?.includeElectrical) {
    doc.floorPlans?.forEach((fp, i) => {
      entries.push({
        sheetNo: `E${fp.level}.${String(i).padStart(2, "0")}`,
        title: `Electrical Plan Floor ${fp.level}`,
        titleTh: `แปลนระบบไฟฟ้า ชั้น ${fp.level}`,
        category: "E",
        scale: "1:100",
      });
    });
    entries.push({
      sheetNo: "E9.00",
      title: "Single Line Diagram",
      titleTh: "แผนผังระบบสายไฟ",
      category: "E",
      scale: "N/A",
    });
  }
  return entries;
}

/** Build a complete plan document from project inputs (fallback when Gemini unavailable) */
export function buildPlanDocument(
  id: string,
  project: ProjectInput,
  planOptions: PlanOptions,
  referencePatternId: string,
  buildingCode: string,
  designEditor?: DesignEditorState,
): HousePlanDocument {
  const floorPlans = designEditor
    ? editorToFloorPlans(designEditor)
    : project.floors === 2
      ? [buildGroundFloor(project), buildUpperFloor(project)]
      : [buildGroundFloor(project)];

  const buildingW = Math.max(...floorPlans[0].rooms.map((r) => r.x + r.width));
  const buildingD = Math.max(...floorPlans[0].rooms.map((r) => r.y + r.depth));

  const partial: Partial<HousePlanDocument> = { floorPlans, planOptions };
  const index = buildIndex(partial);

  return {
    id,
    createdAt: new Date().toISOString(),
    project,
    planOptions,
    referencePatternId,
    buildingCode,
    index,
    sitePlan: {
      plotWidth: buildingW + 6,
      plotDepth: buildingD + 8,
      building: { x: 3, y: 4, width: buildingW, depth: buildingD },
      setbacks: { front: 3, rear: 2, left: 1.5, right: 1.5 },
      roadSide: "south",
      entrance: "South — Main gate",
      northArrow: true,
    },
    floorPlans,
    roofPlan: {
      type: project.roofType,
      slope: project.roofType === "flat" ? "2%" : "30°",
      drainage: ["PVC 100mm gutter", "4 downpipes to storm drain"],
      material: project.roofMaterial,
    },
    elevations: [
      { side: "front", label: "Front Elevation", labelTh: "รูปด้านหน้า", height: project.floors === 2 ? 7.5 : 4.2, finishNotes: [project.wallMaterial, project.colorPalette] },
      { side: "rear", label: "Rear Elevation", labelTh: "รูปด้านหลัง", height: project.floors === 2 ? 7.5 : 4.2, finishNotes: [project.wallMaterial] },
      { side: "left", label: "Left Elevation", labelTh: "รูปด้านซ้าย", height: project.floors === 2 ? 7.5 : 4.2, finishNotes: [project.roofMaterial] },
      { side: "right", label: "Right Elevation", labelTh: "รูปด้านขวา", height: project.floors === 2 ? 7.5 : 4.2, finishNotes: [project.roofMaterial] },
    ],
    sections: [
      {
        id: "A-A",
        label: "Longitudinal Section A-A",
        labelTh: "รูปตัดตามยาว A-A",
        cutDirection: "North-South",
        floorLevels: project.floors === 2
          ? [{ name: "Ground", elevation: 0 }, { name: "Upper", elevation: 3.0 }, { name: "Roof", elevation: 6.0 }]
          : [{ name: "Ground", elevation: 0 }, { name: "Roof", elevation: 3.5 }],
        notes: [`Foundation: ${project.foundation}`, `Style: ${project.style}`],
      },
      {
        id: "B-B",
        label: "Cross Section B-B",
        labelTh: "รูปตัดตามขวาง B-B",
        cutDirection: "East-West",
        floorLevels: project.floors === 2
          ? [{ name: "Ground", elevation: 0 }, { name: "Upper", elevation: 3.0 }]
          : [{ name: "Ground", elevation: 0 }],
        notes: [`Ceiling height: 2.80m`, `Floor: ${project.floorMaterial}`],
      },
    ],
    architecturalDetails: [
      {
        id: "bath",
        title: "Bathroom Detail",
        titleTh: "แบบขยายห้องน้ำ",
        items: [
          { label: "Floor tile", value: "300×300 mm ceramic" },
          { label: "WC", value: "Wall-hung, 350mm setout" },
          { label: "Basin", value: "600mm vanity" },
          { label: "Shower", value: "900×900 mm, slope 2%" },
        ],
      },
      {
        id: "stair",
        title: "Stair Detail",
        titleTh: "แบบขยายบันได",
        items: [
          { label: "Riser", value: "175 mm" },
          { label: "Tread", value: "280 mm" },
          { label: "Width", value: "1,000 mm" },
          { label: "Handrail", value: "SS 38mm @ 900mm" },
        ],
      },
      {
        id: "openings",
        title: "Door & Window Schedule",
        titleTh: "ตารางประตูและหน้าต่าง",
        items: [
          { label: "D1 Main door", value: "900×2100 mm, aluminum" },
          { label: "D2 Bedroom", value: "800×2100 mm" },
          { label: "W1 Living", value: "2400×1500 mm sliding" },
          { label: "W2 Bedroom", value: "1500×1200 mm awning" },
        ],
      },
    ],
    structural: {
      foundationType: project.foundation,
      elements: project.foundation === "pile"
        ? [
            { id: "P1", type: "pile", label: "RC Pile", size: "0.30×0.30m L=12m", location: "Grid A1-D4", reinforcement: "8-D16" },
            { id: "PC1", type: "column", label: "RC Column", size: "0.25×0.40m", location: "All grids", reinforcement: "8-D16" },
            { id: "B1", type: "beam", label: "Main Beam", size: "0.25×0.50m", location: "Span ≤5.0m", reinforcement: "4-D20 top/bot" },
          ]
        : [
            { id: "F1", type: "footing", label: "Spread Footing", size: "1.2×1.2×0.40m", location: "Under columns" },
            { id: "PC1", type: "column", label: "RC Column", size: "0.25×0.40m", location: "All grids" },
            { id: "B1", type: "beam", label: "Main Beam", size: "0.25×0.50m", location: "Span ≤5.0m" },
          ],
      beamSpans: [
        { id: "BM-01", span: 4.5, size: "250×500" },
        { id: "BM-02", span: 5.0, size: "250×550" },
      ],
      calculationSummary: [
        "Live load: 200 kg/m² (residential)",
        "Dead load: 500 kg/m² (RC slab 150mm)",
        "Max beam span verified ≤ 5.0m per Thai building code",
        project.floors === 2 ? "Pile foundation required for 2-storey" : "Spread footing adequate for 1-storey",
        "NOTE: Final stamp by licensed structural engineer required for permit submission",
      ],
    },
    sanitary: floorPlans.map((fp) => ({
      floor: fp.level,
      fixtures: fp.rooms
        .filter((r) => /bath|kitchen/i.test(r.name))
        .map((r) => ({
          room: r.name,
          type: /kitchen/i.test(r.name) ? "Sink + trap" : "WC + basin + shower",
          pipeSize: /kitchen/i.test(r.name) ? "PP 50mm" : "PP 100mm",
        })),
      septicTank: { capacity: "2,000 L", location: "Rear setback, 5m from building" },
      greaseTrap: true,
      rainwater: { downpipes: 4, drainSize: "110mm PVC", outlet: "Municipal storm drain — south" },
    })),
    electrical: floorPlans.map((fp) => ({
      floor: fp.level,
      lighting: fp.rooms.map((r) => ({
        room: r.name,
        count: /living|kitchen|dining/i.test(r.name) ? 3 : 2,
        wattage: "9W LED",
      })),
      switches: fp.rooms.map((r) => ({ room: r.name, count: 1 })),
      outlets: fp.rooms.map((r) => ({
        room: r.name,
        count: /kitchen/i.test(r.name) ? 4 : 2,
      })),
      powerLoads: [
        { appliance: "A/C", location: "Bedrooms", amperage: "16A" },
        { appliance: "Water heater", location: "Bathroom", amperage: "20A" },
        ...(planOptions.evCharger
          ? [{ appliance: "EV Charger", location: "Carport", amperage: "32A" }]
          : []),
      ],
      consumerUnit: { mainBreaker: "63A", circuits: 12 },
      singleLineDiagram: [
        { from: "Meter", to: "Main MCB 63A", cableSize: "10 sq.mm", breaker: "63A" },
        { from: "Main MCB", to: "Lighting DB", cableSize: "4 sq.mm", breaker: "16A" },
        { from: "Main MCB", to: "Power DB", cableSize: "6 sq.mm", breaker: "32A" },
      ],
    })),
    perspectivePrompt: `${project.style} ${project.floors}-storey house, ${project.bedrooms} bedrooms, ${project.roofType} roof, ${project.colorPalette} palette, ${project.location}`,
  };
}
