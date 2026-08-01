/**
 * Construction Drawing Scope — formal review baseline.
 *
 * Maps the agreed 7-section permit drawing scope to DPT Golden Standard sheet codes.
 * Vector geometry for each requirement is delegated to external AI agents;
 * see templates/standards/sheet-vector-specs.json.
 */
import type { VectorImplementationStatus } from "@/lib/pdf/types";

export type ScopeSectionId =
  | "cover-index"
  | "floor-layouts"
  | "elevations-sections"
  | "details"
  | "structural"
  | "sanitation-electrical"
  | "specifications";

export interface ScopeRequirement {
  id: string;
  label: string;
  labelTh: string;
  /** Sheet code(s) that deliver this requirement */
  sheetCodes: string[];
  vectorStatus: VectorImplementationStatus;
  notes?: string;
}

export interface ScopeSection {
  id: ScopeSectionId;
  order: number;
  label: string;
  labelTh: string;
  requirements: ScopeRequirement[];
}

/** User-facing construction drawing scope (7 sections). */
export const CONSTRUCTION_DRAWING_SCOPE: ScopeSection[] = [
  {
    id: "cover-index",
    order: 1,
    label: "Cover Sheet & Index",
    labelTh: "หน้าปกและสารบัญ",
    requirements: [
      {
        id: "cover-page",
        label: "Cover page — project name, building owner, architect/engineer",
        labelTh: "หน้าปก — ชื่อโครงการ เจ้าของอาคาร สถาปนิก/วิศวกร",
        sheetCodes: ["A0.00"],
        vectorStatus: "vector-partial",
        notes: "Rendered as cover panel on A0.00; title block repeats on every sheet",
      },
      {
        id: "drawing-index",
        label: "Drawing index — all sheet names and numbers",
        labelTh: "สารบัญแบบ — รายการเลขที่แบบทั้งหมด",
        sheetCodes: ["A0.00"],
        vectorStatus: "vector-partial",
      },
      {
        id: "location-map-blank",
        label: "Location / site location map — left blank for user",
        labelTh: "แผนที่แสดงที่ตั้ง — ว่างไว้ให้ผู้ใช้กรอกเอง",
        sheetCodes: ["A0.00", "A1.00"],
        vectorStatus: "data-placeholder",
        notes: "Blank vector frame on A0.00; A1.00 holds plot/setback data when available",
      },
      {
        id: "symbols-abbreviations",
        label: "General symbols & abbreviations",
        labelTh: "สัญลักษณ์และคำย่อทั่วไป",
        sheetCodes: ["A0.00"],
        vectorStatus: "pending",
        notes: "Standard DPT symbol legend panel on A0.00",
      },
    ],
  },
  {
    id: "floor-layouts",
    order: 2,
    label: "Floor Plans & Layouts",
    labelTh: "แปลนพื้นและการจัดวาง",
    requirements: [
      {
        id: "first-floor-plan",
        label: "First floor — rooms, walls, doors, windows, furniture, dimension strings, elevation markers",
        labelTh: "ชั้น 1 — ห้อง ผนัง ประตู หน้าต่าง เฟอร์นิเจอร์ มิติ สัญลักษณ์รูปด้าน",
        sheetCodes: ["A2.00"],
        vectorStatus: "vector-partial",
        notes: "Rooms + elevation markers done; walls/doors/windows/furniture/dims pending",
      },
      {
        id: "upper-floor-plans",
        label: "Upper floor plans (if applicable)",
        labelTh: "แปลนชั้นบน (ถ้ามี)",
        sheetCodes: ["A2.01", "A2.02"],
        vectorStatus: "vector-partial",
      },
      {
        id: "roof-plan",
        label: "Roof plan — slope directions, eaves, drainage points",
        labelTh: "แปลนหลังคา — ทิศลาดชัน ชายคา จุดระบายน้ำ",
        sheetCodes: ["A3.00"],
        vectorStatus: "data-placeholder",
      },
    ],
  },
  {
    id: "elevations-sections",
    order: 3,
    label: "Elevations & Sections",
    labelTh: "รูปด้านและรูปตัด",
    requirements: [
      {
        id: "elevations-four-sides",
        label: "Four elevations — front, rear, left, right (heights, finishes, floor levels)",
        labelTh: "รูปด้าน 4 ด้าน — หน้า หลัง ซ้าย ขวา (ระดับชั้น วัสดุผิว)",
        sheetCodes: ["A4.00"],
        vectorStatus: "vector-partial",
        notes: "4-panel placeholder frames; full vector elevations pending",
      },
      {
        id: "building-sections",
        label: "Cross & longitudinal sections — interior heights, structure, beams, roof, ceiling",
        labelTh: "รูปตัดขวางและรูปตัดตามยาว — ความสูงภายใน โครงสร้าง คาน หลังคา เพดาน",
        sheetCodes: ["A5.00"],
        vectorStatus: "data-placeholder",
      },
    ],
  },
  {
    id: "details",
    order: 4,
    label: "Detail Drawings",
    labelTh: "แบบขยาย",
    requirements: [
      {
        id: "toilet-details",
        label: "Toilet details — enlarged plan/section, fixtures, dimensions, tiles",
        labelTh: "แบบขยายห้องน้ำ — แปลน/รูปตัด สุขภัณฑ์ มิติ กระเบื้อง",
        sheetCodes: ["A6.00"],
        vectorStatus: "data-placeholder",
      },
      {
        id: "staircase-details",
        label: "Staircase — plan, section, tread, riser, handrails",
        labelTh: "แบบขยายบันได — แปลน รูปตัด ขนาดย tread riser ราวจับ",
        sheetCodes: ["A7.00"],
        vectorStatus: "data-placeholder",
      },
      {
        id: "door-window-schedule",
        label: "Door & window schedule — codes, sizes, quantities, frame details",
        labelTh: "ตารางประตู-หน้าต่าง — รหัส ขนาด จำนวน รายละเอียดวงกบ",
        sheetCodes: ["A8.00"],
        vectorStatus: "data-placeholder",
      },
    ],
  },
  {
    id: "structural",
    order: 5,
    label: "Structural Drawings",
    labelTh: "แบบโครงสร้าง",
    requirements: [
      {
        id: "foundation-plan",
        label: "Foundation plan — piles, footings, ground beams",
        labelTh: "แปลนฐานราก — เสาเข็ม ฐานราก คานคอดิน",
        sheetCodes: ["S1.00", "S3.00"],
        vectorStatus: "data-placeholder",
      },
      {
        id: "structural-framing",
        label: "Structural floor & beam framing plans per level",
        labelTh: "แปลนโครงสร้างพื้นและคานแต่ละชั้น",
        sheetCodes: ["S1.00", "S2.00", "S4.00"],
        vectorStatus: "data-placeholder",
      },
      {
        id: "structural-reinforcement",
        label: "Structural details — beam, column, footing, stair reinforcement",
        labelTh: "รายละเอียดโครงสร้าง — คาน เสา ฐานราก บันได เหล็กเสริม",
        sheetCodes: ["S2.00", "S3.00"],
        vectorStatus: "data-placeholder",
      },
    ],
  },
  {
    id: "sanitation-electrical",
    order: 6,
    label: "Sanitation & Electrical Systems",
    labelTh: "ระบบสุขาภิบาลและไฟฟ้า",
    requirements: [
      {
        id: "sanitation-plan",
        label: "Sanitation — water supply, soil/waste pipes, septic, grease trap",
        labelTh: "ระบบสุขาภิบาล — ประปา ท่อระบาย บ่อบำบัด บ่อดักไขมัน",
        sheetCodes: ["SN-01", "SN-04", "SN-05", "SN-06", "SN-07", "SN-08"],
        vectorStatus: "data-placeholder",
        notes: "Smart A TYPE E splits SN across 6 sheets; rendered as SN-series",
      },
      {
        id: "electrical-plan",
        label: "Electrical — lighting, switches, outlets, consumer unit",
        labelTh: "ระบบไฟฟ้า — แสงสว่าง สวิตช์ ปลั๊ก ตู้ควบคุม",
        sheetCodes: ["E-01", "E-02", "E-03", "E-07"],
        vectorStatus: "data-placeholder",
      },
      {
        id: "mechanical-hvac",
        label: "Mechanical ventilation & air conditioning (DPT Smart A extension)",
        labelTh: "ระบบเครื่องกลและปรับอากาศ (ขยาย Smart A)",
        sheetCodes: ["ME-00", "ME-01", "ME-02", "AC-01", "AC-03"],
        vectorStatus: "data-placeholder",
        notes: "Included in Golden Standard; optional for simplified scope",
      },
    ],
  },
  {
    id: "specifications",
    order: 7,
    label: "Specifications & Data Sheets",
    labelTh: "ข้อกำหนดและแผ่นข้อมูล",
    requirements: [
      {
        id: "architectural-specs",
        label: "Architectural specifications — materials, paints, ceilings, flooring",
        labelTh: "ข้อกำหนดสถาปัตยกรรม — วัสดุ สี เพดาน พื้น",
        sheetCodes: ["A0.00", "A8.00"],
        vectorStatus: "pending",
        notes: "Spec notes panel on A0.00 or schedule sheet A8.00",
      },
      {
        id: "structural-specs",
        label: "Structural specifications — concrete strength, rebar types, standards",
        labelTh: "ข้อกำหนดโครงสร้าง — กำลังคอนกรีต เหล็กเสริม มาตรฐาน",
        sheetCodes: ["S5.00"],
        vectorStatus: "data-placeholder",
        notes: "S5.00 calculation report + spec summary; PE stamp placeholder",
      },
    ],
  },
];

export interface ScopeReviewItem {
  sectionId: ScopeSectionId;
  requirementId: string;
  label: string;
  sheetCodes: string[];
  vectorStatus: VectorImplementationStatus;
  ready: boolean;
}

export interface ScopeReviewReport {
  sections: ScopeSection[];
  items: ScopeReviewItem[];
  summary: {
    totalRequirements: number;
    vectorComplete: number;
    vectorPartial: number;
    dataPlaceholder: number;
    pending: number;
  };
}

/** Generate a scope review report for UI / export readiness checks. */
export function reviewConstructionScope(): ScopeReviewReport {
  const items: ScopeReviewItem[] = [];

  for (const section of CONSTRUCTION_DRAWING_SCOPE) {
    for (const req of section.requirements) {
      items.push({
        sectionId: section.id,
        requirementId: req.id,
        label: req.label,
        sheetCodes: req.sheetCodes,
        vectorStatus: req.vectorStatus,
        ready: req.vectorStatus === "vector-complete",
      });
    }
  }

  const summary = {
    totalRequirements: items.length,
    vectorComplete: items.filter((i) => i.vectorStatus === "vector-complete").length,
    vectorPartial: items.filter((i) => i.vectorStatus === "vector-partial").length,
    dataPlaceholder: items.filter((i) => i.vectorStatus === "data-placeholder").length,
    pending: items.filter((i) => i.vectorStatus === "pending").length,
  };

  return { sections: CONSTRUCTION_DRAWING_SCOPE, items, summary };
}

export function scopeSectionForSheet(sheetCode: string): ScopeSectionId | undefined {
  for (const section of CONSTRUCTION_DRAWING_SCOPE) {
    for (const req of section.requirements) {
      if (req.sheetCodes.some((code) => sheetCode === code || sheetCode.startsWith(code.replace(/\.$/, "")))) {
        return section.id;
      }
    }
  }
  if (sheetCode.startsWith("A2.")) return "floor-layouts";
  if (sheetCode.startsWith("S")) return "structural";
  if (sheetCode.startsWith("SN")) return "sanitation-electrical";
  if (sheetCode.startsWith("E") || sheetCode.startsWith("ME") || sheetCode.startsWith("AC")) {
    return "sanitation-electrical";
  }
  return undefined;
}

export function requirementsForSheet(sheetCode: string): ScopeRequirement[] {
  const found: ScopeRequirement[] = [];
  for (const section of CONSTRUCTION_DRAWING_SCOPE) {
    for (const req of section.requirements) {
      if (
        req.sheetCodes.includes(sheetCode) ||
        (sheetCode.startsWith("A2.") && req.sheetCodes.some((c) => c.startsWith("A2.")))
      ) {
        found.push(req);
      }
    }
  }
  return found;
}
