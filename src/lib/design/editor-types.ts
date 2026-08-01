import type { ProjectInput } from "@/lib/ai/types";

export type WallSide = "north" | "south" | "east" | "west";
export type OpeningType = "door" | "window";

export interface EditorOpening {
  id: string;
  type: OpeningType;
  roomId: string;
  wall: WallSide;
  /** Position along wall, 0–1 */
  position: number;
  /** Width in meters */
  width: number;
  floor: 1 | 2;
}

export interface EditorRoom {
  id: string;
  name: string;
  nameTh: string;
  width: number;
  depth: number;
  x: number;
  y: number;
  floor: 1 | 2;
  floorMaterial: string;
  wallMaterial: string;
}

export interface DesignEditorState {
  version: 1;
  rooms: EditorRoom[];
  openings: EditorOpening[];
  roofMaterial: string;
  updatedAt: string;
  workspaceSessionId?: string;
}

export interface MaterialEstimateLine {
  category: "wall" | "floor" | "roof" | "door" | "window";
  material: string;
  unit: string;
  quantity: number;
  unitCostThb: number;
  totalThb: number;
}

export interface MaterialEstimate {
  lines: MaterialEstimateLine[];
  subtotalThb: number;
  contingencyThb: number;
  totalThb: number;
  grossAreaSqm: number;
}

export interface EditorExportPayload {
  editorState: DesignEditorState;
  project: ProjectInput;
  materialEstimate: MaterialEstimate;
  doorWindowSchedule: { id: string; type: OpeningType; room: string; wall: WallSide; widthM: number; floor: number }[];
}
