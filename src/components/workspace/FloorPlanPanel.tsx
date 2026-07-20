"use client";

import { Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface FloorPlanPanelProps {
  floors: 1 | 2;
  activeFloor: 1 | 2;
  onSelectFloor: (floor: 1 | 2) => void;
  floorPlanUrls?: string[];
  watermarked?: boolean;
  visible?: boolean;
}

const FLOOR1_URL =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80";
const FLOOR2_URL =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80";

export function FloorPlanPanel({
  floors,
  activeFloor,
  onSelectFloor,
  floorPlanUrls = [],
  watermarked = false,
  visible = true,
}: FloorPlanPanelProps) {
  const { translate } = useApp();

  if (!visible || floorPlanUrls.length === 0) return null;

  const floor1Src = floorPlanUrls[0] || FLOOR1_URL;
  const floor2Src = floorPlanUrls[1] || FLOOR2_URL;

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-3 border-l border-white/8 bg-surface-raised/60 p-4 backdrop-blur-sm xl:flex">
      <p className="section-label mb-1">{translate("workspace.preview")}</p>
      <PlanThumb
        src={floor1Src}
        label={translate("workspace.floor1")}
        active={activeFloor === 1}
        watermarked={watermarked}
        onClick={() => onSelectFloor(1)}
      />
      {floors === 2 && (
        <PlanThumb
          src={floor2Src}
          label={translate("workspace.floor2")}
          active={activeFloor === 2}
          watermarked={watermarked}
          onClick={() => onSelectFloor(2)}
        />
      )}
    </aside>
  );
}

function PlanThumb({
  src,
  label,
  active,
  watermarked,
  onClick,
}: {
  src: string;
  label: string;
  active: boolean;
  watermarked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-card overflow-hidden text-left ${active ? "glass-card-selected" : ""}`}
    >
      <div className="relative bg-white/95 p-1.5">
        <img src={src} alt={label} className="aspect-[4/3] w-full rounded-lg object-cover" />
        {watermarked && (
          <div className="absolute inset-1.5 flex items-center justify-center rounded-lg bg-black/25 backdrop-blur-[1px]">
            <Lock className="h-4 w-4 text-white/80" />
          </div>
        )}
      </div>
      <p className="px-3 py-2 text-center text-xs font-medium text-text-secondary">{label}</p>
    </button>
  );
}
