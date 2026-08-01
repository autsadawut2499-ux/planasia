import type { CostTier } from "@/lib/design/cost-reference";
import type { ProjectTypeCode } from "@/lib/db/schema/project-types";
import type { BuildingSpecifications } from "@/lib/db/schema/building-specifications";

export interface ProjectInput {
  ownerName: string;
  projectName: string;
  location: string;
  floors: 1 | 2;
  bedrooms: number;
  bathrooms: number;
  budget: string;
  /** Parsed max construction budget (THB) */
  maxBudgetThb?: number;
  /** Target usable area (sqm) */
  targetAreaSqm?: number;
  /** REA cost tier for benchmarking */
  costTier?: CostTier;
  /** Building category — maps to project_types table */
  projectTypeCode?: ProjectTypeCode;
  /** Engineering parameters — maps to building_specifications table */
  buildingSpec?: BuildingSpecifications;
  style: string;
  roofType: string;
  colorPalette: string;
  foundation: "pile" | "spread";
  wallMaterial: string;
  floorMaterial: string;
  roofMaterial: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent?: "designer" | "validator";
  timestamp: Date;
}

export interface SheetPreviewItem {
  sheetNo: string;
  title: string;
  titleTh: string;
  category: "A" | "S" | "SN" | "E" | "ME" | "AC";
  scale: string;
  svg: string;
}

export interface DesignPreview {
  /** AI 3D exterior render */
  perspectiveUrl: string;
  /** AI front facade / elevation */
  facadeUrl: string;
  /** AI presentation board (exterior + plans + interiors) — primary client overview */
  presentationBoardUrl?: string;
  floorPlans: string[];
  /** Watermarked drawing sheet previews — populated after user confirms design */
  sheetPreviews?: SheetPreviewItem[];
  status: "idle" | "generating" | "ready" | "error";
  watermarked?: boolean;
}

export type AiPreviewView = "render3d" | "facade" | "floorplan" | "presentationBoard";

export type WorkflowStage =
  | "input"
  | "clarifying"
  | "render_ready"
  | "concept_review"
  | "concept_exported"
  /** @deprecated Legacy permit workflow — kept for persisted session migration */
  | "plans_generating"
  | "plans_preview"
  | "unlocked";

export interface UploadedFileRef {
  name: string;
  mimeType: string;
  /** Inline data — stripped after Supabase upload; kept transient on client. */
  dataUrl: string;
  sizeBytes: number;
  /** Supabase Storage object path (workspace-assets bucket). */
  storagePath?: string;
  /** Public CDN URL after persistence. */
  publicUrl?: string;
  /** Client PDF first-page thumbnail (PNG data URL) for Canva-like preview. */
  previewUrl?: string;
}

/**
 * Geometry reference slots for two-story pipeline:
 *   [0] First floor plan (แปลนชั้น 1)
 *   [1] Second floor plan (แปลนชั้น 2)
 *   [2] Front elevation / front view (รูปหน้าบ้าน)
 */
export const MAX_REFERENCE_IMAGES = 3;

export type ReferenceSlotIndex = 0 | 1 | 2;

export type UploadSlotFiles = UploadedFileRef[];

export interface PlanImageAnalysis {
  architectural: {
    floorPlanNotes: string;
    walls: string;
    doors: string;
    windows: string;
    dimensions: string;
  };
  materials: {
    walls: string;
    floors: string;
    roof: string;
    notes: string;
  };
  summary: string;
  confidence: "high" | "medium" | "low";
  analyzedAt: string;
}

export interface QuestionnaireUploads {
  /**
   * Fixed 3-slot geometry refs:
   * [0] floor1, [1] floor2, [2] elevation. Accepts PNG / JPEG / PDF.
   */
  referenceImages: UploadSlotFiles;
}

export interface DesignDirection {
  goldenStandardId: string;
  disciplinePreset: string;
  catalogStyle: string;
}

export interface PresentationBoardFile {
  name: string;
  mimeType: string;
  dataUrl: string;
  sizeBytes: number;
  source: "generated" | "uploaded";
  storedAt: string;
  storagePath?: string;
  publicUrl?: string;
}

export interface QuestionnaireInput {
  decorationStyle: string;
  colorTone: string;
  primaryMaterial: string;
  specialConstraints: string;
  landSize: string;
  sitePlanHasDimensions: boolean | null;
  frontViewConfirmed: boolean | null;
  /** AI extraction from referenceImages (optional). */
  imageAnalysis?: PlanImageAnalysis | null;
  /** Stored presentation board image — input for DPT drafting. */
  presentationBoard?: PresentationBoardFile | null;
  designDirection: DesignDirection;
}

export interface ClarificationAnswer {
  issueId: string;
  field?: string;
  value: string;
  timestamp: string;
}

export const DEFAULT_QUESTIONNAIRE: QuestionnaireInput = {
  decorationStyle: "modern-minimal",
  colorTone: "gray",
  primaryMaterial: "",
  specialConstraints: "",
  landSize: "",
  sitePlanHasDimensions: null,
  frontViewConfirmed: null,
  imageAnalysis: null,
  presentationBoard: null,
  designDirection: {
    goldenStandardId: "smart-a-type-e",
    disciplinePreset: "full",
    catalogStyle: "minimal",
  },
};

export const EMPTY_UPLOADS = (): QuestionnaireUploads => ({
  referenceImages: [],
});

export interface PlanOptions {
  wallMaterial: string;
  floorMaterial: string;
  roofMaterial: string;
  includeElectrical: boolean;
  includePlumbing: boolean;
  includeStructural: boolean;
  evCharger: boolean;
}

export interface PaymentState {
  pdfPaid: boolean;
  cadPaid: boolean;
}

export interface ProjectSession {
  id: string;
  stage: WorkflowStage;
  renderConfirmed: boolean;
  listedOnStore: boolean;
}

export interface ValidationResult {
  passed: boolean;
  issues: { severity: "error" | "warning"; message: string }[];
  agent: "architectural" | "structural";
}

export const DEFAULT_PROJECT: ProjectInput = {
  ownerName: "",
  projectName: "",
  location: "",
  floors: 2,
  bedrooms: 3,
  bathrooms: 2,
  budget: "",
  projectTypeCode: "residential",
  style: "minimal",
  roofType: "flat",
  colorPalette: "gray",
  foundation: "pile",
  wallMaterial: "concrete-block",
  floorMaterial: "ceramic-porcelain",
  roofMaterial: "concrete-roof-tile",
};

export const ROOF_TYPES = [
  { value: "flat", label: { en: "Flat Roof", th: "หลังคาแบน" } },
  { value: "gable", label: { en: "Gable", th: "หลังคาทรงจั่ว" } },
  { value: "hip", label: { en: "Hip Roof", th: "หลังคาทรงปั้นหยา" } },
  { value: "shed", label: { en: "Shed", th: "หลังคาทรงเพิง" } },
];

export const WALL_MATERIALS = [
  { value: "concrete-block", label: { en: "Concrete Block", th: "อิฐบล็อก" } },
  { value: "brick", label: { en: "AAC Block", th: "อิฐมวลเบา" } },
  { value: "precast", label: { en: "Precast Panel", th: "แผ่นคอนกรีตสำเร็จรูป" } },
  { value: "clay-brick", label: { en: "Clay Brick", th: "อิฐมอญ" } },
];

export const FLOOR_MATERIALS = [
  {
    value: "ceramic-porcelain",
    label: {
      en: "Ceramic / Porcelain Tile (20–100 cm sizes)",
      th: "กระเบื้องเซรามิค/พอร์ซเลน (20x20 ซม., 30x30 ซม., 40x40 ซม., 50x50 ซม., 60x60 ซม., 60x120 ซม., 80x80 ซม., 100x100 ซม.)",
    },
  },
  {
    value: "lvt-spc",
    label: {
      en: "Rubber Tile & Vinyl (LVT / SPC)",
      th: "กระเบื้องยางและวัสดุไวนิล (LVT / SPC)",
    },
  },
  {
    value: "laminate",
    label: { en: "Laminate Flooring", th: "พื้นไม้ลามิเนต" },
  },
  {
    value: "engineered-wood",
    label: { en: "Engineered Wood", th: "ไม้เอ็นจิเนียร์" },
  },
  {
    value: "parquet",
    label: { en: "Parquet", th: "ไม้ปาเก้" },
  },
  {
    value: "granite-marble",
    label: { en: "Granite / Marble", th: "หินแกรนิต / หินอ่อน" },
  },
  {
    value: "polished-concrete",
    label: { en: "Polished Concrete / Loft Screed", th: "คอนกรีตขัดมัน / ปูนลอฟท์" },
  },
];

export const ROOF_MATERIALS = [
  {
    value: "concrete-roof-tile",
    label: {
      en: "Concrete Roof Tile (Double Roman / Mono / Flat)",
      th: "กระเบื้องหลังคาคอนกรีต (ลอนคู่ / โมเนา / แผ่นเรียบ)",
    },
  },
  {
    value: "ceramic-roof-tile",
    label: { en: "Ceramic Roof Tile", th: "กระเบื้องหลังคาเซรามิค" },
  },
  {
    value: "fiber-cement-roof",
    label: {
      en: "Fiber Cement Roof Tile (Double Roman / High Grade / Cut Edge)",
      th: "กระเบื้องหลังคาไฟเบอร์ซีเมนต์ (ลอนคู่ / ไฮเกรน / ปลายตัด)",
    },
  },
  {
    value: "metal-sheet",
    label: { en: "Metal Sheet", th: "เมทัลชีท (Metal Sheet)" },
  },
  {
    value: "asphalt-shingle",
    label: { en: "Asphalt Shingle", th: "หลังคาชingle (Asphalt Shingle)" },
  },
  {
    value: "clay-tile",
    label: { en: "Clay Roof Tile", th: "กระเบื้องหลังคาดินเผา" },
  },
  {
    value: "polycarbonate-acrylic",
    label: {
      en: "Polycarbonate / Acrylic (Translucent)",
      th: "หลังคาโพลีคาร์บอเนต / อะคริลิก (โปร่งแสง)",
    },
  },
];

export const DEFAULT_PLAN_OPTIONS: PlanOptions = {
  wallMaterial: "concrete-block",
  floorMaterial: "ceramic-porcelain",
  roofMaterial: "concrete-roof-tile",
  includeElectrical: true,
  includePlumbing: true,
  includeStructural: true,
  evCharger: false,
};

export const COLOR_PALETTES = [
  { value: "gray", label: { en: "Gray Tones", th: "โทนสีเทา" } },
  { value: "white", label: { en: "White & Clean", th: "ขาวสะอาด" } },
  { value: "earth", label: { en: "Earth Tones", th: "โทนสีดิน" } },
  { value: "wood", label: { en: "Natural Wood", th: "ไม้ธรรมชาติ" } },
];
