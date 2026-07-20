import type { PlanOptions, ProjectInput } from "@/lib/ai/types";

/** Room on a floor plan (coordinates in meters from building origin) */
export interface PlanRoom {
  id: string;
  name: string;
  nameTh: string;
  width: number;
  depth: number;
  x: number;
  y: number;
}

export interface FloorPlanSheet {
  level: number;
  label: string;
  labelTh: string;
  scale: string;
  rooms: PlanRoom[];
  grossArea: number;
}

export interface SitePlanData {
  plotWidth: number;
  plotDepth: number;
  building: { x: number; y: number; width: number; depth: number };
  setbacks: { front: number; rear: number; left: number; right: number };
  roadSide: "north" | "south" | "east" | "west";
  entrance: string;
  northArrow: boolean;
}

export interface RoofPlanData {
  type: string;
  slope: string;
  drainage: string[];
  material: string;
}

export interface ElevationData {
  side: "front" | "rear" | "left" | "right";
  label: string;
  labelTh: string;
  height: number;
  finishNotes: string[];
}

export interface SectionData {
  id: string;
  label: string;
  labelTh: string;
  cutDirection: string;
  floorLevels: { name: string; elevation: number }[];
  notes: string[];
}

export interface DetailItem {
  id: string;
  title: string;
  titleTh: string;
  items: { label: string; value: string }[];
}

export interface StructuralElement {
  id: string;
  type: "pile" | "footing" | "column" | "beam" | "slab";
  label: string;
  size: string;
  location: string;
  reinforcement?: string;
}

export interface StructuralPlanData {
  foundationType: "pile" | "spread";
  elements: StructuralElement[];
  beamSpans: { id: string; span: number; size: string }[];
  calculationSummary: string[];
}

export interface SanitaryPlanData {
  floor: number;
  fixtures: { room: string; type: string; pipeSize: string }[];
  septicTank: { capacity: string; location: string };
  greaseTrap: boolean;
  rainwater: { downpipes: number; drainSize: string; outlet: string };
}

export interface ElectricalPlanData {
  floor: number;
  lighting: { room: string; count: number; wattage: string }[];
  switches: { room: string; count: number }[];
  outlets: { room: string; count: number }[];
  powerLoads: { appliance: string; location: string; amperage: string }[];
  consumerUnit: { mainBreaker: string; circuits: number };
  singleLineDiagram: { from: string; to: string; cableSize: string; breaker: string }[];
}

export interface DrawingIndexEntry {
  sheetNo: string;
  title: string;
  titleTh: string;
  category: "A" | "S" | "SN" | "E" | "ME" | "AC";
  scale: string;
}

/** Complete permit drawing set — user+AI original design */
export interface HousePlanDocument {
  id: string;
  createdAt: string;
  project: ProjectInput;
  planOptions: PlanOptions;
  referencePatternId: string;
  cadPatternIds?: string[];
  buildingCode: string;
  index: DrawingIndexEntry[];
  sitePlan: SitePlanData;
  floorPlans: FloorPlanSheet[];
  roofPlan: RoofPlanData;
  elevations: ElevationData[];
  sections: SectionData[];
  architecturalDetails: DetailItem[];
  structural: StructuralPlanData;
  sanitary: SanitaryPlanData[];
  electrical: ElectricalPlanData[];
  perspectivePrompt?: string;
}
