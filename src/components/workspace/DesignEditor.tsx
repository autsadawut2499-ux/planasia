"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  DoorOpen,
  Layers,
  Maximize2,
  Minimize2,
  Move,
  Paintbrush,
  Plus,
  Trash2,
  AppWindow,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  FLOOR_MATERIALS,
  ROOF_MATERIALS,
  WALL_MATERIALS,
  type ProjectInput,
} from "@/lib/ai/types";
import type { DesignEditorState, WallSide } from "@/lib/design/editor-types";
import {
  addOpening,
  removeOpening,
  setGlobalMaterials,
  updateOpening,
  updateRoom,
} from "@/lib/design/editor-state";
import {
  hitTestRoom,
  renderIsometricScene,
  renderTopDownPlan,
  screenToPlanCoords,
} from "@/lib/design/isometric-renderer";
import { estimateMaterials } from "@/lib/design/material-estimate";
import { CostBalancePanel } from "@/components/workspace/CostBalancePanel";
import { DocumentationExportButton } from "@/components/workspace/DocumentationExportButton";
import type { BudgetTargets } from "@/lib/design/budget-targets";

interface DesignEditorProps {
  editorState: DesignEditorState;
  project: ProjectInput;
  budgetTargets: BudgetTargets;
  onChange: (state: DesignEditorState) => void;
  onBudgetTargetsChange: (targets: BudgetTargets) => void;
  onSaveDraft: () => void;
  saving?: boolean;
}

const WALLS: WallSide[] = ["north", "south", "east", "west"];

export function DesignEditor({
  editorState,
  project,
  budgetTargets,
  onChange,
  onBudgetTargetsChange,
  onSaveDraft,
  saving,
}: DesignEditorProps) {
  const { translate, locale } = useApp();
  const isoRef = useRef<HTMLCanvasElement>(null);
  const planRef = useRef<HTMLCanvasElement>(null);
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const selectedRoom = editorState.rooms.find((r) => r.id === selectedRoomId) ?? null;
  const selectedOpening =
    editorState.openings.find((o) => o.id === selectedOpeningId) ?? null;
  const floorOpenings = editorState.openings.filter((o) => o.floor === activeFloor);

  const redraw = useCallback(() => {
    const iso = isoRef.current;
    const plan = planRef.current;
    if (iso) {
      const ctx = iso.getContext("2d");
      if (ctx) {
        renderIsometricScene(ctx, editorState, {
          width: iso.width,
          height: iso.height,
          floor: activeFloor,
          mode: "solid",
          selectedRoomId,
        });
      }
    }
    if (plan) {
      const ctx = plan.getContext("2d");
      if (ctx) {
        renderTopDownPlan(ctx, editorState, {
          width: plan.width,
          height: plan.height,
          floor: activeFloor,
          selectedRoomId,
        });
      }
    }
  }, [editorState, activeFloor, selectedRoomId]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const onResize = () => redraw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [redraw]);

  const handlePlanClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = planRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const sy = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const { x, y } = screenToPlanCoords(editorState, activeFloor, sx, sy, canvas.width, canvas.height);
    const hit = hitTestRoom(editorState, activeFloor, x, y);
    setSelectedRoomId(hit?.id ?? null);
    setSelectedOpeningId(null);
  };

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${expanded ? "fixed inset-0 z-50 bg-[#0a0a0f]" : ""}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 px-4 py-2">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">{translate("editor.title")}</span>
        </div>
        <div className="flex items-center gap-2">
          {project.floors === 2 && (
            <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5">
              {([1, 2] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFloor(f)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    activeFloor === f ? "bg-accent text-white" : "text-text-muted"
                  }`}
                >
                  {f === 1 ? translate("workspace.floor1") : translate("workspace.floor2")}
                </button>
              ))}
            </div>
          )}
          <DocumentationExportButton project={project} editorState={editorState} variant="ghost" />
          <button type="button" onClick={onSaveDraft} disabled={saving} className="btn-ghost text-xs">
            {saving ? translate("editor.saving") : translate("editor.saveDraft")}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="btn-ghost rounded-full p-2"
            aria-label={expanded ? "Minimize" : "Expand"}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-white/8 p-4 lg:block xl:w-72">
          <Section icon={Layers} title={translate("editor.rooms")}>
            <ul className="space-y-1">
              {editorState.rooms
                .filter((r) => r.floor === activeFloor)
                .map((room) => (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setSelectedOpeningId(null);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                        selectedRoomId === room.id
                          ? "bg-accent/20 text-accent"
                          : "hover:bg-white/5 text-text-secondary"
                      }`}
                    >
                      {locale === "th" ? room.nameTh : room.name}
                      <span className="mt-0.5 block text-[10px] text-text-muted">
                        {room.width}×{room.depth} m
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </Section>

          <Section icon={DoorOpen} title={translate("editor.openings")}>
            <ul className="mb-2 space-y-1">
              {floorOpenings.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOpeningId(o.id);
                      setSelectedRoomId(o.roomId);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs ${
                      selectedOpeningId === o.id ? "bg-accent/20 text-accent" : "hover:bg-white/5"
                    }`}
                  >
                    {o.type === "door" ? (
                      <DoorOpen className="h-3.5 w-3.5" />
                    ) : (
                      <AppWindow className="h-3.5 w-3.5" />
                    )}
                    {o.type === "door" ? translate("editor.door") : translate("editor.window")} —{" "}
                    {o.width}m
                  </button>
                </li>
              ))}
            </ul>
            {selectedRoom && (
              <div className="flex gap-1">
                <button
                  type="button"
                  className="btn-ghost flex-1 gap-1 text-[10px]"
                  onClick={() =>
                    onChange(
                      addOpening(editorState, {
                        type: "door",
                        roomId: selectedRoom.id,
                        wall: "south",
                        position: 0.5,
                        width: 0.9,
                        floor: activeFloor,
                      }),
                    )
                  }
                >
                  <Plus className="h-3 w-3" />
                  {translate("editor.addDoor")}
                </button>
                <button
                  type="button"
                  className="btn-ghost flex-1 gap-1 text-[10px]"
                  onClick={() =>
                    onChange(
                      addOpening(editorState, {
                        type: "window",
                        roomId: selectedRoom.id,
                        wall: "east",
                        position: 0.5,
                        width: 1.5,
                        floor: activeFloor,
                      }),
                    )
                  }
                >
                  <Plus className="h-3 w-3" />
                  {translate("editor.addWindow")}
                </button>
              </div>
            )}
          </Section>

          <Section icon={Paintbrush} title={translate("editor.materials")}>
            <MaterialSelect
              label={translate("options.wall")}
              value={editorState.rooms[0]?.wallMaterial ?? project.wallMaterial}
              options={WALL_MATERIALS}
              locale={locale}
              onChange={(v) => onChange(setGlobalMaterials(editorState, { wallMaterial: v }))}
            />
            <MaterialSelect
              label={translate("options.floor")}
              value={editorState.rooms[0]?.floorMaterial ?? project.floorMaterial}
              options={FLOOR_MATERIALS}
              locale={locale}
              onChange={(v) => onChange(setGlobalMaterials(editorState, { floorMaterial: v }))}
            />
            <MaterialSelect
              label={translate("options.roof")}
              value={editorState.roofMaterial}
              options={ROOF_MATERIALS}
              locale={locale}
              onChange={(v) => onChange(setGlobalMaterials(editorState, { roofMaterial: v }))}
            />
          </Section>

          <CostBalancePanel
            editorState={editorState}
            budgetTargets={budgetTargets}
            project={project}
            onTargetsChange={onBudgetTargetsChange}
            onEditorChange={onChange}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <div className="relative flex min-h-0 flex-1 flex-col border-b border-white/8 lg:border-b-0 lg:border-r">
            <p className="absolute left-3 top-2 z-10 text-[10px] uppercase tracking-wide text-text-muted">
              {translate("editor.view3d")}
            </p>
            <canvas
              ref={isoRef}
              width={800}
              height={520}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col">
            <p className="absolute left-3 top-2 z-10 flex items-center gap-1 text-[10px] uppercase tracking-wide text-text-muted">
              <Move className="h-3 w-3" />
              {translate("editor.viewPlan")}
            </p>
            <canvas
              ref={planRef}
              width={600}
              height={520}
              className="h-full w-full cursor-crosshair object-contain"
              onClick={handlePlanClick}
            />
          </div>
        </div>

        {(selectedRoom || selectedOpening) && (
          <aside className="w-56 shrink-0 overflow-y-auto border-l border-white/8 p-4 xl:w-64">
            {selectedRoom && (
              <>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                  {locale === "th" ? selectedRoom.nameTh : selectedRoom.name}
                </h3>
                <SliderField
                  label={translate("editor.width")}
                  value={selectedRoom.width}
                  min={2}
                  max={8}
                  step={0.1}
                  onChange={(width) => onChange(updateRoom(editorState, selectedRoom.id, { width }))}
                />
                <SliderField
                  label={translate("editor.depth")}
                  value={selectedRoom.depth}
                  min={2}
                  max={8}
                  step={0.1}
                  onChange={(depth) => onChange(updateRoom(editorState, selectedRoom.id, { depth }))}
                />
                <SliderField
                  label="X"
                  value={selectedRoom.x}
                  min={0}
                  max={12}
                  step={0.1}
                  onChange={(x) => onChange(updateRoom(editorState, selectedRoom.id, { x }))}
                />
                <SliderField
                  label="Y"
                  value={selectedRoom.y}
                  min={0}
                  max={14}
                  step={0.1}
                  onChange={(y) => onChange(updateRoom(editorState, selectedRoom.id, { y }))}
                />
              </>
            )}

            {selectedOpening && (
              <>
                <h3 className="mb-3 mt-4 text-xs font-medium uppercase tracking-wide text-text-muted">
                  {selectedOpening.type === "door"
                    ? translate("editor.door")
                    : translate("editor.window")}
                </h3>
                <label className="mb-2 block text-[10px] text-text-muted">
                  {translate("editor.wallSide")}
                  <select
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
                    value={selectedOpening.wall}
                    onChange={(e) =>
                      onChange(
                        updateOpening(editorState, selectedOpening.id, {
                          wall: e.target.value as WallSide,
                        }),
                      )
                    }
                  >
                    {WALLS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </label>
                <SliderField
                  label={translate("editor.position")}
                  value={selectedOpening.position}
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  onChange={(position) =>
                    onChange(updateOpening(editorState, selectedOpening.id, { position }))
                  }
                />
                <SliderField
                  label={translate("editor.openingWidth")}
                  value={selectedOpening.width}
                  min={0.6}
                  max={3}
                  step={0.1}
                  onChange={(width) =>
                    onChange(updateOpening(editorState, selectedOpening.id, { width }))
                  }
                />
                <button
                  type="button"
                  className="btn-ghost mt-3 w-full gap-1 text-xs text-red-400"
                  onClick={() => {
                    onChange(removeOpening(editorState, selectedOpening.id));
                    setSelectedOpeningId(null);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {translate("editor.removeOpening")}
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function MaterialSelect({
  label,
  value,
  options,
  locale,
  onChange,
}: {
  label: string;
  value: string;
  options: typeof WALL_MATERIALS;
  locale: string;
  onChange: (v: string) => void;
}) {
  const loc = locale as "en" | "th";
  return (
    <label className="mb-2 block text-[10px] text-text-muted">
      {label}
      <select
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label[loc] ?? o.label.en}
          </option>
        ))}
      </select>
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mb-3 block text-[10px] text-text-muted">
      {label}: <span className="text-text-primary">{value.toFixed(1)}m</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-1 w-full accent-accent"
      />
    </label>
  );
}
