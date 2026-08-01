import type { ProjectInput } from "@/lib/ai/types";
import { mergeBuildingSpecIntoProject } from "@/lib/db/building-spec-factory";
import { grossAreaFromEditor } from "./budget-targets";
import type { DesignEditorState, EditorOpening, EditorRoom } from "./editor-types";

function room(
  id: string,
  name: string,
  nameTh: string,
  w: number,
  d: number,
  x: number,
  y: number,
  floor: 1 | 2,
  floorMaterial: string,
  wallMaterial: string,
): EditorRoom {
  return { id, name, nameTh, width: w, depth: d, x, y, floor, floorMaterial, wallMaterial };
}

function defaultOpenings(rooms: EditorRoom[]): EditorOpening[] {
  const living = rooms.find((r) => r.id === "living" && r.floor === 1);
  const master = rooms.find((r) => r.id === "master" && r.floor === 2);
  const openings: EditorOpening[] = [];

  if (living) {
    openings.push({
      id: "door-main",
      type: "door",
      roomId: living.id,
      wall: "south",
      position: 0.5,
      width: 1.2,
      floor: 1,
    });
    openings.push({
      id: "win-living",
      type: "window",
      roomId: living.id,
      wall: "east",
      position: 0.4,
      width: 1.8,
      floor: 1,
    });
  }
  if (master) {
    openings.push({
      id: "win-master",
      type: "window",
      roomId: master.id,
      wall: "north",
      position: 0.5,
      width: 2.0,
      floor: 2,
    });
  }
  return openings;
}

function groundRooms(project: ProjectInput): EditorRoom[] {
  const fm = project.floorMaterial;
  const wm = project.wallMaterial;
  const rooms = [
    room("living", "Living Room", "ห้องนั่งเล่น", 5.0, 4.5, 0, 0, 1, fm, wm),
    room("kitchen", "Kitchen", "ครัว", 3.5, 3.0, 5.0, 0, 1, fm, wm),
    room("dining", "Dining", "ห้องทานอาหาร", 3.5, 2.5, 5.0, 3.0, 1, fm, wm),
    room("bed1", "Bedroom 1", "ห้องนอน 1", 3.8, 4.0, 0, 4.5, 1, fm, wm),
    room("bath1", "Bathroom 1", "ห้องน้ำ 1", 2.2, 2.5, 3.8, 4.5, 1, fm, wm),
    room("garage", "Carport", "ที่จอดรถ", 3.5, 6.0, 8.5, 0, 1, fm, wm),
  ];
  if (project.bedrooms >= 2) {
    rooms.push(room("bed2", "Bedroom 2", "ห้องนอน 2", 3.5, 3.5, 0, 8.5, 1, fm, wm));
  }
  if (project.bathrooms >= 2) {
    rooms.push(room("bath2", "Bathroom 2", "ห้องน้ำ 2", 2.0, 2.5, 3.5, 8.5, 1, fm, wm));
  }
  return rooms;
}

function upperRooms(project: ProjectInput): EditorRoom[] {
  const fm = project.floorMaterial;
  const wm = project.wallMaterial;
  return [
    room("master", "Master Bedroom", "ห้องนอนใหญ่", 4.5, 4.5, 0, 0, 2, fm, wm),
    room("mbath", "Master Bath", "ห้องน้ำใน", 2.5, 3.0, 4.5, 0, 2, fm, wm),
    room("bed3", "Bedroom 3", "ห้องนอน 3", 3.5, 3.5, 0, 4.5, 2, fm, wm),
    room("hall", "Hall", "โถง", 3.0, 2.5, 3.5, 4.5, 2, fm, wm),
    room("balcony", "Balcony", "ระเบียง", 4.0, 1.5, 6.5, 0, 2, fm, wm),
  ];
}

export function createEditorStateFromProject(
  project: ProjectInput,
  workspaceSessionId?: string,
): DesignEditorState {
  const rooms =
    project.floors === 2
      ? [...groundRooms(project), ...upperRooms(project)]
      : groundRooms(project);

  return {
    version: 1,
    rooms,
    openings: defaultOpenings(rooms),
    roofMaterial: project.roofMaterial,
    updatedAt: new Date().toISOString(),
    workspaceSessionId,
  };
}

export function applyEditorToProject(
  project: ProjectInput,
  editor: DesignEditorState,
): ProjectInput {
  const primaryWall = editor.rooms[0]?.wallMaterial ?? project.wallMaterial;
  const primaryFloor = editor.rooms[0]?.floorMaterial ?? project.floorMaterial;
  const grossAreaSqm = grossAreaFromEditor(editor);
  const withMaterials = {
    ...project,
    wallMaterial: primaryWall,
    floorMaterial: primaryFloor,
    roofMaterial: editor.roofMaterial,
    targetAreaSqm: grossAreaSqm,
  };
  return mergeBuildingSpecIntoProject(withMaterials, { grossFloorAreaSqm: grossAreaSqm });
}

export function updateRoom(
  editor: DesignEditorState,
  roomId: string,
  patch: Partial<Pick<EditorRoom, "width" | "depth" | "x" | "y" | "floorMaterial" | "wallMaterial">>,
): DesignEditorState {
  return {
    ...editor,
    updatedAt: new Date().toISOString(),
    rooms: editor.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
  };
}

export function updateOpening(
  editor: DesignEditorState,
  openingId: string,
  patch: Partial<Pick<EditorOpening, "position" | "width" | "wall" | "type">>,
): DesignEditorState {
  return {
    ...editor,
    updatedAt: new Date().toISOString(),
    openings: editor.openings.map((o) => (o.id === openingId ? { ...o, ...patch } : o)),
  };
}

export function addOpening(
  editor: DesignEditorState,
  opening: Omit<EditorOpening, "id">,
): DesignEditorState {
  const id = `opening_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return {
    ...editor,
    updatedAt: new Date().toISOString(),
    openings: [...editor.openings, { ...opening, id }],
  };
}

export function removeOpening(editor: DesignEditorState, openingId: string): DesignEditorState {
  return {
    ...editor,
    updatedAt: new Date().toISOString(),
    openings: editor.openings.filter((o) => o.id !== openingId),
  };
}

export function setGlobalMaterials(
  editor: DesignEditorState,
  patch: { floorMaterial?: string; wallMaterial?: string; roofMaterial?: string },
): DesignEditorState {
  return {
    ...editor,
    roofMaterial: patch.roofMaterial ?? editor.roofMaterial,
    updatedAt: new Date().toISOString(),
    rooms: editor.rooms.map((r) => ({
      ...r,
      floorMaterial: patch.floorMaterial ?? r.floorMaterial,
      wallMaterial: patch.wallMaterial ?? r.wallMaterial,
    })),
  };
}

export function editorToFloorPlans(editor: DesignEditorState) {
  const levels = [...new Set(editor.rooms.map((r) => r.floor))].sort();
  return levels.map((level) => {
    const rooms = editor.rooms.filter((r) => r.floor === level);
    return {
      level,
      label: level === 1 ? "Ground Floor Plan" : "Upper Floor Plan",
      labelTh: level === 1 ? "แปลนพื้นชั้นล่าง" : "แปลนพื้นชั้นบน",
      scale: "1:100",
      rooms: rooms.map(({ id, name, nameTh, width, depth, x, y }) => ({
        id,
        name,
        nameTh,
        width,
        depth,
        x,
        y,
      })),
      grossArea: rooms.reduce((a, r) => a + r.width * r.depth, 0),
    };
  });
}
