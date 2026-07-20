"use client";

import {
  DEFAULT_PLAN_OPTIONS,
  FLOOR_MATERIALS,
  ROOF_MATERIALS,
  WALL_MATERIALS,
  type PlanOptions,
} from "@/lib/ai/types";
import { useApp } from "@/context/AppContext";
import { pickLocalizedLabel } from "@/lib/i18n/localized-text";
import { X } from "lucide-react";
import { useState } from "react";

interface PlanOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (options: PlanOptions) => void;
  loading?: boolean;
}

export function PlanOptionsModal({
  open,
  onClose,
  onSubmit,
  loading,
}: PlanOptionsModalProps) {
  const { locale, translate } = useApp();
  const [options, setOptions] = useState<PlanOptions>(DEFAULT_PLAN_OPTIONS);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface-raised shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">{translate("workflow.optionsTitle")}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">{translate("workflow.optionsDesc")}</p>

          <Field label={translate("options.wall")}>
            <select
              value={options.wallMaterial}
              onChange={(e) => setOptions((o) => ({ ...o, wallMaterial: e.target.value }))}
              className="dropdown-select"
            >
              {WALL_MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {pickLocalizedLabel(locale, m.label)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={translate("options.floor")}>
            <select
              value={options.floorMaterial}
              onChange={(e) => setOptions((o) => ({ ...o, floorMaterial: e.target.value }))}
              className="dropdown-select"
            >
              {FLOOR_MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {pickLocalizedLabel(locale, m.label)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={translate("options.roof")}>
            <select
              value={options.roofMaterial}
              onChange={(e) => setOptions((o) => ({ ...o, roofMaterial: e.target.value }))}
              className="dropdown-select"
            >
              {ROOF_MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {pickLocalizedLabel(locale, m.label)}
                </option>
              ))}
            </select>
          </Field>

          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-text-secondary">
              {translate("options.extras")}
            </p>
            <Checkbox
              label={translate("options.electrical")}
              checked={options.includeElectrical}
              onChange={(v) => setOptions((o) => ({ ...o, includeElectrical: v }))}
            />
            <Checkbox
              label={translate("options.plumbing")}
              checked={options.includePlumbing}
              onChange={(v) => setOptions((o) => ({ ...o, includePlumbing: v }))}
            />
            <Checkbox
              label={translate("options.structural")}
              checked={options.includeStructural}
              onChange={(v) => setOptions((o) => ({ ...o, includeStructural: v }))}
            />
            <Checkbox
              label={translate("options.evCharger")}
              checked={options.evCharger}
              onChange={(v) => setOptions((o) => ({ ...o, evCharger: v }))}
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-border p-5">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            {translate("workflow.cancel")}
          </button>
          <button
            type="button"
            onClick={() => onSubmit(options)}
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-60"
          >
            {loading ? translate("workspace.generatingPlans") : translate("workflow.generatePlans")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border accent-accent"
      />
      {label}
    </label>
  );
}
