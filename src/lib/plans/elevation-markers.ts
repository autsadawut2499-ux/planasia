/**
 * Standard elevation markers (วงกลมบอกมุมมอง 4 ด้าน) for floor plans.
 * Fixed placeholders — no AI-generated elevation views until a later phase.
 */

export const ELEVATION_SHEET_NO = "A4.00";

export interface ElevationDirection {
  id: "north" | "east" | "south" | "west";
  /** Marker number inside the circle (Thai drafting convention). */
  code: string;
  labelTh: string;
  labelEn: string;
  /** Caption stamped on floor plan near the marker. */
  floorPlanNoteTh: string;
  /** Placeholder panel title on the elevation sheet. */
  placeholderTitleTh: string;
}

export const ELEVATION_DIRECTIONS: ElevationDirection[] = [
  {
    id: "north",
    code: "1",
    labelTh: "ทิศเหนือ",
    labelEn: "North",
    floorPlanNoteTh: "① รูปด้านทิศเหนือ → ดูแผ่น A4.00",
    placeholderTitleTh: "รูปด้านทิศเหนือ — กรุณาดูแบบรูปด้านประกอบ",
  },
  {
    id: "east",
    code: "2",
    labelTh: "ทิศตะวันออก",
    labelEn: "East",
    floorPlanNoteTh: "② รูปด้านทิศตะวันออก → ดูแผ่น A4.00",
    placeholderTitleTh: "รูปด้านทิศตะวันออก — กรุณาดูแบบรูปด้านประกอบ",
  },
  {
    id: "south",
    code: "3",
    labelTh: "ทิศใต้",
    labelEn: "South",
    floorPlanNoteTh: "③ รูปด้านทิศใต้ → ดูแผ่น A4.00",
    placeholderTitleTh: "รูปด้านทิศใต้ — กรุณาดูแบบรูปด้านประกอบ",
  },
  {
    id: "west",
    code: "4",
    labelTh: "ทิศตะวันตก",
    labelEn: "West",
    floorPlanNoteTh: "④ รูปด้านทิศตะวันตก → ดูแผ่น A4.00",
    placeholderTitleTh: "รูปด้านทิศตะวันตก — กรุณาดูแบบรูปด้านประกอบ",
  },
];

export const ELEVATION_PLACEHOLDER_FOOTNOTE_TH =
  "มุมมองรูปด้านเป็นแบบอ้างอิงมาตรฐาน (Placeholder) — จะแทนที่ด้วยรูปด้านจริงในเวอร์ชันถัดไป";

export const ELEVATION_PLACEHOLDER_FOOTNOTE_EN =
  "Standardized elevation placeholder — dynamic views will replace these in a future release.";

export interface RoomBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function roomBoundsFromPlan(
  rooms: { x: number; y: number; width: number; depth: number }[],
): RoomBounds {
  if (!rooms.length) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  return {
    minX: Math.min(...rooms.map((r) => r.x)),
    minY: Math.min(...rooms.map((r) => r.y)),
    maxX: Math.max(...rooms.map((r) => r.x + r.width)),
    maxY: Math.max(...rooms.map((r) => r.y + r.depth)),
  };
}

/** Marker anchor in plan coordinates (meters) — outside each face of the building bbox. */
export function elevationMarkerAnchors(bounds: RoomBounds, offset = 1.2): Record<ElevationDirection["id"], { x: number; y: number }> {
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return {
    north: { x: cx, y: bounds.maxY + offset },
    east: { x: bounds.maxX + offset, y: cy },
    south: { x: cx, y: bounds.minY - offset },
    west: { x: bounds.minX - offset, y: cy },
  };
}
