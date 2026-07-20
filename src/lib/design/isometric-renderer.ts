import type { DesignEditorState, EditorOpening, EditorRoom, WallSide } from "./editor-types";

export const MATERIAL_COLORS: Record<string, string> = {
  "concrete-block": "#b8b5ae",
  brick: "#c4785a",
  precast: "#a8adb5",
  "ceramic-tile": "#e8e4dc",
  granite: "#8b9199",
  wood: "#c4a574",
  "concrete-flat": "#9ca3af",
  "metal-sheet": "#64748b",
  "clay-tile": "#b45309",
};

export type RenderMode = "solid" | "wireframe";

const ISO_X = 0.866;
const ISO_Y = 0.5;
const WALL_H = 2.8;

function iso(x: number, y: number, z: number, ox: number, oy: number, scale: number) {
  return {
    x: ox + (x - y) * ISO_X * scale,
    y: oy + (x + y) * ISO_Y * scale - z * scale,
  };
}

function darken(hex: string, amt = 0.15): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) * (1 - amt));
  const g = Math.max(0, ((n >> 8) & 0xff) * (1 - amt));
  const b = Math.max(0, (n & 0xff) * (1 - amt));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  fill: string,
  stroke: string,
  mode: RenderMode,
) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  if (mode === "solid") {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = mode === "wireframe" ? 1.5 : 1;
  ctx.stroke();
}

function roomCorners(room: EditorRoom) {
  return [
    { x: room.x, y: room.y },
    { x: room.x + room.width, y: room.y },
    { x: room.x + room.width, y: room.y + room.depth },
    { x: room.x, y: room.y + room.depth },
  ];
}

function openingOnWall(
  room: EditorRoom,
  wall: WallSide,
  position: number,
  width: number,
): { x: number; y: number }[] | null {
  const margin = 0.15;
  const pos = Math.max(margin, Math.min(1 - margin, position));
  const hw = width / 2;

  switch (wall) {
    case "south": {
      const cx = room.x + room.width * pos;
      return [
        { x: cx - hw, y: room.y },
        { x: cx + hw, y: room.y },
      ];
    }
    case "north": {
      const cx = room.x + room.width * pos;
      return [
        { x: cx - hw, y: room.y + room.depth },
        { x: cx + hw, y: room.y + room.depth },
      ];
    }
    case "west": {
      const cy = room.y + room.depth * pos;
      return [
        { x: room.x, y: cy - hw },
        { x: room.x, y: cy + hw },
      ];
    }
    case "east": {
      const cy = room.y + room.depth * pos;
      return [
        { x: room.x + room.width, y: cy - hw },
        { x: room.x + room.width, y: cy + hw },
      ];
    }
    default:
      return null;
  }
}

function drawOpeningMarker(
  ctx: CanvasRenderingContext2D,
  opening: EditorOpening,
  room: EditorRoom,
  ox: number,
  oy: number,
  scale: number,
) {
  const seg = openingOnWall(room, opening.wall, opening.position, opening.width);
  if (!seg) return;

  const a = iso(seg[0].x, seg[0].y, opening.type === "door" ? 0 : 1.0, ox, oy, scale);
  const b = iso(seg[1].x, seg[1].y, opening.type === "door" ? 0 : 1.0, ox, oy, scale);
  const topA = iso(seg[0].x, seg[0].y, opening.type === "door" ? 2.1 : 2.2, ox, oy, scale);
  const topB = iso(seg[1].x, seg[1].y, opening.type === "door" ? 2.1 : 2.2, ox, oy, scale);

  ctx.strokeStyle = opening.type === "door" ? "#f59e0b" : "#38bdf8";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(topA.x, topA.y);
  ctx.lineTo(topB.x, topB.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(topA.x, topA.y);
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(topB.x, topB.y);
  ctx.stroke();
}

function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: EditorRoom,
  ox: number,
  oy: number,
  scale: number,
  mode: RenderMode,
  selected: boolean,
) {
  const base = MATERIAL_COLORS[room.floorMaterial] ?? "#d4d4d8";
  const wall = MATERIAL_COLORS[room.wallMaterial] ?? "#a1a1aa";
  const corners = roomCorners(room);

  const floorPts = corners.map((c) => iso(c.x, c.y, 0, ox, oy, scale));
  drawFace(ctx, floorPts, base, selected ? "#818cf8" : "#52525b", mode);

  for (let i = 0; i < 4; i++) {
    const c0 = corners[i];
    const c1 = corners[(i + 1) % 4];
    const face = [
      iso(c0.x, c0.y, 0, ox, oy, scale),
      iso(c1.x, c1.y, 0, ox, oy, scale),
      iso(c1.x, c1.y, WALL_H, ox, oy, scale),
      iso(c0.x, c0.y, WALL_H, ox, oy, scale),
    ];
    drawFace(ctx, face, darken(wall, i * 0.05), selected ? "#818cf8" : "#3f3f46", mode);
  }

  const roofPts = corners.map((c) => iso(c.x, c.y, WALL_H, ox, oy, scale));
  drawFace(ctx, roofPts, mode === "wireframe" ? "transparent" : darken(base, 0.2), "#71717a", mode);
}

export interface IsometricRenderOptions {
  width: number;
  height: number;
  floor?: 1 | 2 | "all";
  mode?: RenderMode;
  selectedRoomId?: string | null;
  showLabels?: boolean;
}

export function renderIsometricScene(
  ctx: CanvasRenderingContext2D,
  editor: DesignEditorState,
  opts: IsometricRenderOptions,
) {
  const { width, height, floor = "all", mode = "solid", selectedRoomId, showLabels = true } = opts;

  ctx.clearRect(0, 0, width, height);

  const rooms =
    floor === "all" ? editor.rooms : editor.rooms.filter((r) => r.floor === floor);

  if (!rooms.length) return;

  const maxX = Math.max(...rooms.map((r) => r.x + r.width));
  const maxY = Math.max(...rooms.map((r) => r.y + r.depth));
  const scale = Math.min(width / (maxX + maxY + 4), height / (maxX + maxY + WALL_H + 4)) * 0.85;
  const ox = width * 0.35;
  const oy = height * 0.65;

  for (const room of rooms) {
    drawRoom(ctx, room, ox, oy, scale, mode, room.id === selectedRoomId);
  }

  const relevantOpenings = editor.openings.filter((o) =>
    floor === "all" ? true : o.floor === floor,
  );
  for (const opening of relevantOpenings) {
    const room = editor.rooms.find((r) => r.id === opening.roomId);
    if (room) drawOpeningMarker(ctx, opening, room, ox, oy, scale);
  }

  if (showLabels && selectedRoomId) {
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (room) {
      const c = iso(room.x + room.width / 2, room.y + room.depth / 2, WALL_H + 0.3, ox, oy, scale);
      ctx.fillStyle = "#e4e4e7";
      ctx.font = "12px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${room.name} (${room.width}×${room.depth}m)`, c.x, c.y);
    }
  }
}

/** Hit-test in top-down plan coordinates (meters) */
export function hitTestRoom(
  editor: DesignEditorState,
  floor: 1 | 2,
  mx: number,
  my: number,
): EditorRoom | null {
  const rooms = editor.rooms.filter((r) => r.floor === floor);
  for (let i = rooms.length - 1; i >= 0; i--) {
    const r = rooms[i];
    if (mx >= r.x && mx <= r.x + r.width && my >= r.y && my <= r.y + r.depth) {
      return r;
    }
  }
  return null;
}

export function renderTopDownPlan(
  ctx: CanvasRenderingContext2D,
  editor: DesignEditorState,
  opts: { width: number; height: number; floor: 1 | 2; selectedRoomId?: string | null },
) {
  const { width, height, floor, selectedRoomId } = opts;
  ctx.clearRect(0, 0, width, height);

  const rooms = editor.rooms.filter((r) => r.floor === floor);
  if (!rooms.length) return;

  const maxX = Math.max(...rooms.map((r) => r.x + r.width));
  const maxY = Math.max(...rooms.map((r) => r.y + r.depth));
  const pad = 20;
  const scale = Math.min((width - pad * 2) / maxX, (height - pad * 2) / maxY);

  const toPx = (x: number, y: number) => ({
    x: pad + x * scale,
    y: pad + y * scale,
  });

  ctx.fillStyle = "#18181b";
  ctx.fillRect(0, 0, width, height);

  for (const room of rooms) {
    const tl = toPx(room.x, room.y);
    const w = room.width * scale;
    const h = room.depth * scale;
    ctx.fillStyle = MATERIAL_COLORS[room.floorMaterial] ?? "#d4d4d8";
    ctx.fillRect(tl.x, tl.y, w, h);
    ctx.strokeStyle = room.id === selectedRoomId ? "#818cf8" : "#52525b";
    ctx.lineWidth = room.id === selectedRoomId ? 2.5 : 1;
    ctx.strokeRect(tl.x, tl.y, w, h);

    ctx.fillStyle = "#27272a";
    ctx.font = "11px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(room.name, tl.x + w / 2, tl.y + h / 2);
  }

  for (const opening of editor.openings.filter((o) => o.floor === floor)) {
    const room = editor.rooms.find((r) => r.id === opening.roomId);
    if (!room) continue;
    const seg = openingOnWall(room, opening.wall, opening.position, opening.width);
    if (!seg) continue;
    const a = toPx(seg[0].x, seg[0].y);
    const b = toPx(seg[1].x, seg[1].y);
    ctx.strokeStyle = opening.type === "door" ? "#f59e0b" : "#38bdf8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

export function screenToPlanCoords(
  editor: DesignEditorState,
  floor: 1 | 2,
  sx: number,
  sy: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const rooms = editor.rooms.filter((r) => r.floor === floor);
  const maxX = Math.max(...rooms.map((r) => r.x + r.width), 1);
  const maxY = Math.max(...rooms.map((r) => r.y + r.depth), 1);
  const pad = 20;
  const scale = Math.min((width - pad * 2) / maxX, (height - pad * 2) / maxY);
  return {
    x: (sx - pad) / scale,
    y: (sy - pad) / scale,
  };
}
