"use client";

import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { HOUSE_STYLES } from "@/lib/geo/countries";
import {
  COLOR_PALETTES,
  DEFAULT_PROJECT,
  ROOF_TYPES,
  type ProjectInput,
} from "@/lib/ai/types";
import { pickLocalizedLabel } from "@/lib/i18n/localized-text";

interface ControlPanelProps {
  project: ProjectInput;
  onChange: (updates: Partial<ProjectInput>) => void;
  onGenerateRender?: () => void;
  generating?: boolean;
  canGenerateRender?: boolean;
}

export function ControlPanel({
  project,
  onChange,
  onGenerateRender,
  generating,
  canGenerateRender = true,
}: ControlPanelProps) {
  const { locale, translate } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFloorsChange = useCallback(
    (floors: 1 | 2) => {
      onChange({
        floors,
        foundation: floors === 2 ? "pile" : project.foundation,
      });
    },
    [onChange, project.foundation],
  );

  return (
    <aside className="flex h-full flex-col border-r border-border bg-surface-raised">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {translate("workspace.controlPanel")}
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Field label={translate("workspace.style")}>
          <select
            value={project.style}
            onChange={(e) => onChange({ style: e.target.value })}
            className="dropdown-select"
          >
            {HOUSE_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label[locale] ?? s.label.en}
              </option>
            ))}
          </select>
        </Field>

        <Field label={translate("workspace.roofType")}>
          <select
            value={project.roofType}
            onChange={(e) => onChange({ roofType: e.target.value })}
            className="dropdown-select"
          >
            {ROOF_TYPES.map((r) => (
              <option key={r.value} value={r.value}>
                {pickLocalizedLabel(locale, r.label)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={translate("workspace.colorPalette")}>
          <select
            value={project.colorPalette}
            onChange={(e) => onChange({ colorPalette: e.target.value })}
            className="dropdown-select"
          >
            {COLOR_PALETTES.map((c) => (
              <option key={c.value} value={c.value}>
                {pickLocalizedLabel(locale, c.label)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={translate("workspace.floors")}>
          <select
            value={project.floors}
            onChange={(e) => handleFloorsChange(Number(e.target.value) as 1 | 2)}
            className="dropdown-select"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </Field>

        {project.floors === 2 && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {translate("form.foundation.pileRequired")}
          </p>
        )}

        <Field label={translate("form.foundation")}>
          <select
            value={project.foundation}
            onChange={(e) =>
              onChange({ foundation: e.target.value as "pile" | "spread" })
            }
            disabled={project.floors === 2}
            className="dropdown-select disabled:opacity-60"
          >
            <option value="pile">{translate("form.foundation.pile")}</option>
            <option value="spread">{translate("form.foundation.spread")}</option>
          </select>
        </Field>

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-subtle bg-surface-overlay/50 px-4 py-8 transition-colors hover:border-accent/50 hover:bg-surface-overlay"
        >
          <Upload className="mb-2 h-8 w-8 text-text-muted" />
          <p className="text-center text-xs text-text-secondary">
            {translate("workspace.uploadHint")}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.dwg"
            className="hidden"
            onChange={() => {
              /* file handling wired in Phase 2 */
            }}
          />
        </div>

        <Field label={translate("workspace.projectName")}>
          <input
            type="text"
            value={project.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            placeholder={translate("form.projectName")}
            className="input-field"
          />
        </Field>

        <Field label={translate("workspace.location")}>
          <input
            type="text"
            value={project.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder={translate("form.province")}
            className="input-field"
          />
        </Field>

        <Field label={translate("form.ownerName")}>
          <input
            type="text"
            value={project.ownerName}
            onChange={(e) => onChange({ ownerName: e.target.value })}
            className="input-field"
          />
        </Field>

        {canGenerateRender && (
          <button
            type="button"
            onClick={onGenerateRender}
            disabled={generating}
            className="btn-primary w-full disabled:opacity-60"
          >
            {generating
              ? translate("workspace.generatingRender")
              : translate("workspace.generateRender")}
          </button>
        )}
      </div>
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

export { DEFAULT_PROJECT };
