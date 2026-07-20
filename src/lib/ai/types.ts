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

export interface DesignPreview {
  perspectiveUrl: string;
  floorPlans: string[];
  status: "idle" | "generating" | "ready" | "error";
  watermarked?: boolean;
}

export type WorkflowStage =
  | "input"
  | "clarifying"
  | "render_ready"
  | "plans_generating"
  | "plans_preview"
  | "unlocked";

export interface UploadedFileRef {
  name: string;
  mimeType: string;
  dataUrl: string;
  sizeBytes: number;
}

export interface QuestionnaireUploads {
  sitePlan: UploadedFileRef | null;
  elevationSection: UploadedFileRef | null;
  frontView3d: UploadedFileRef | null;
  floorPlans: (UploadedFileRef | null)[];
}

export interface DesignDirection {
  goldenStandardId: string;
  disciplinePreset: string;
  catalogStyle: string;
}

export interface QuestionnaireInput {
  decorationStyle: string;
  colorTone: string;
  primaryMaterial: string;
  specialConstraints: string;
  landSize: string;
  sitePlanHasDimensions: boolean | null;
  frontViewConfirmed: boolean | null;
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
  designDirection: {
    goldenStandardId: "smart-a-type-e",
    disciplinePreset: "full",
    catalogStyle: "modern",
  },
};

export const EMPTY_UPLOADS = (floors: 1 | 2): QuestionnaireUploads => ({
  sitePlan: null,
  elevationSection: null,
  frontView3d: null,
  floorPlans: floors === 2 ? [null, null] : [null],
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
  style: "modern",
  roofType: "flat",
  colorPalette: "gray",
  foundation: "pile",
  wallMaterial: "concrete-block",
  floorMaterial: "ceramic-tile",
  roofMaterial: "concrete-flat",
};

export const ROOF_TYPES = [
  { value: "flat", label: { en: "Flat Roof", th: "หลังคาแบน" } },
  { value: "gable", label: { en: "Gable", th: "หลังคาทรงจั่ว" } },
  { value: "hip", label: { en: "Hip Roof", th: "หลังคาทรงปั้นหยา" } },
  { value: "shed", label: { en: "Shed", th: "หลังคาทรงเพิง" } },
];

export const WALL_MATERIALS = [
  { value: "concrete-block", label: { en: "Concrete Block", th: "คอนกรีตบล็อก" } },
  { value: "brick", label: { en: "Brick", th: "อิฐมวลเบา" } },
  { value: "precast", label: { en: "Precast Panel", th: "แผ่นคอนกรีตสำเร็จรูป" } },
];

export const FLOOR_MATERIALS = [
  { value: "ceramic-tile", label: { en: "Ceramic Tile", th: "กระเบื้องเซรามิค" } },
  { value: "granite", label: { en: "Granite", th: "หินแกรนิต" } },
  { value: "wood", label: { en: "Wood", th: "ไม้" } },
];

export const ROOF_MATERIALS = [
  { value: "concrete-flat", label: { en: "Concrete Flat", th: "คอนกรีตเสมอระดับ" } },
  { value: "metal-sheet", label: { en: "Metal Sheet", th: "เมทัลชีท" } },
  { value: "clay-tile", label: { en: "Clay Tile", th: "กระเบื้องดินเผา" } },
];

export const DEFAULT_PLAN_OPTIONS: PlanOptions = {
  wallMaterial: "concrete-block",
  floorMaterial: "ceramic-tile",
  roofMaterial: "concrete-flat",
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
