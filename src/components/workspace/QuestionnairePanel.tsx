"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useProjectValidation } from "@/hooks/useProjectValidation";
import { mergeBuildingSpecIntoProject } from "@/lib/db/building-spec-factory";
import type { ProjectTypeCode } from "@/lib/db/schema/project-types";
import {
  ROOF_TYPES,
  WALL_MATERIALS,
  type ProjectInput,
  type QuestionnaireInput,
  type QuestionnaireUploads,
} from "@/lib/ai/types";
import { fileToUploadRef, resizeUploadsForFloors } from "@/lib/upload/files";
import { DesignDirectionCards, FloorToggle } from "./DesignDirectionCards";
import { PermitCompliancePanel } from "./PermitCompliancePanel";
import { ProjectTypeSelector } from "./ProjectTypeSelector";
import { UploadSlot } from "./UploadSlot";
import { Tooltip } from "@/components/ui/Tooltip";
import { pickLocalizedLabel } from "@/lib/i18n/localized-text";

interface QuestionnairePanelProps {
  project: ProjectInput;
  questionnaire: QuestionnaireInput;
  uploads: QuestionnaireUploads;
  onProjectChange: (updates: Partial<ProjectInput>) => void;
  onQuestionnaireChange: (updates: Partial<QuestionnaireInput>) => void;
  onUploadsChange: (uploads: QuestionnaireUploads) => void;
  onSubmit: () => void;
  submitting?: boolean;
  canSubmit?: boolean;
}

export function QuestionnairePanel({
  project,
  questionnaire,
  uploads,
  onProjectChange,
  onQuestionnaireChange,
  onUploadsChange,
  onSubmit,
  submitting,
  canSubmit = true,
}: QuestionnairePanelProps) {
  const { locale, translate } = useApp();
  const { loading: toastLoading, update: toastUpdate, error: toastError } = useToast();
  const { projectTypes, loading: catalogLoading, getProjectType } = useCatalog();
  const { result: validation, loading: permitLoading, error: permitError, validateNow } =
    useProjectValidation(project);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const projectTypeCode = project.projectTypeCode ?? "residential";
  const isResidential = projectTypeCode === "residential";
  const buildingSpec = validation?.buildingSpec ?? project.buildingSpec;

  const handleProjectTypeChange = useCallback(
    (code: ProjectTypeCode) => {
      const meta = getProjectType(code);
      const workspaceFloors = Math.min(2, Math.max(1, meta?.defaultFloors ?? project.floors)) as 1 | 2;
      onProjectChange(
        mergeBuildingSpecIntoProject(
          {
            ...project,
            projectTypeCode: code,
            floors: workspaceFloors,
            foundation: workspaceFloors === 2 ? "pile" : project.foundation,
          },
          { projectTypeCode: code, numberOfFloors: workspaceFloors },
        ),
      );
      if (workspaceFloors !== project.floors) {
        onUploadsChange({
          ...uploads,
          floorPlans: resizeUploadsForFloors(uploads.floorPlans, workspaceFloors),
        });
      }
    },
    [getProjectType, onProjectChange, onUploadsChange, project, uploads],
  );

  const handleSubmitWithValidation = useCallback(async () => {
    const fresh = await validateNow(project);
    if (fresh?.permitCompliance.errorCount && fresh.permitCompliance.errorCount > 0) {
      toastError(translate("permit.blockSubmit"));
      return;
    }
    if (fresh?.buildingSpec) {
      onProjectChange({
        buildingSpec: fresh.buildingSpec,
        projectTypeCode: fresh.buildingSpec.projectTypeCode,
      });
    }
    onSubmit();
  }, [validateNow, project, onProjectChange, onSubmit, toastError, translate]);

  const handleFloorsChange = useCallback(
    (floors: 1 | 2) => {
      onProjectChange({
        floors,
        foundation: floors === 2 ? "pile" : project.foundation,
      });
      onUploadsChange({
        ...uploads,
        floorPlans: resizeUploadsForFloors(uploads.floorPlans, floors),
      });
    },
    [onProjectChange, onUploadsChange, uploads, project.foundation],
  );

  const setFile = async (
    key: keyof Pick<QuestionnaireUploads, "sitePlan" | "elevationSection" | "frontView3d">,
    file: File | null,
  ) => {
    if (!file) {
      onUploadsChange({ ...uploads, [key]: null });
      return;
    }
    setUploadingKey(key);
    const toastId = toastLoading(translate("toast.uploading"));
    try {
      const ref = await fileToUploadRef(file);
      onUploadsChange({ ...uploads, [key]: ref });
      if (key === "sitePlan") onQuestionnaireChange({ sitePlanHasDimensions: null });
      if (key === "frontView3d") onQuestionnaireChange({ frontViewConfirmed: null });
      toastUpdate(toastId, translate("toast.uploadSuccess"), "success");
    } catch {
      toastError(translate("toast.uploadError"));
    } finally {
      setUploadingKey(null);
    }
  };

  const setFloorFile = async (index: number, file: File | null) => {
    if (!file) {
      const next = [...uploads.floorPlans];
      next[index] = null;
      onUploadsChange({ ...uploads, floorPlans: next });
      return;
    }
    const key = `floor-${index}`;
    setUploadingKey(key);
    const toastId = toastLoading(translate("toast.uploading"));
    try {
      const next = [...uploads.floorPlans];
      next[index] = await fileToUploadRef(file);
      onUploadsChange({ ...uploads, floorPlans: next });
      toastUpdate(toastId, translate("toast.uploadSuccess"), "success");
    } catch {
      toastError(translate("toast.uploadError"));
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <aside className="flex h-full flex-col border-r border-white/8 bg-surface-raised/80 backdrop-blur-xl">
      <div className="border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              {translate("questionnaire.title")}
            </h2>
            <p className="text-[11px] text-text-muted">{translate("questionnaire.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <section className="glass-panel p-4">
          <p className="section-label">{translate("questionnaire.designDirection")}</p>
          <DesignDirectionCards
            questionnaire={questionnaire}
            catalogStyle={project.style}
            onChange={(updates) =>
              onQuestionnaireChange({
                designDirection: { ...questionnaire.designDirection, ...updates },
              })
            }
            onStyleChange={(styleId) => {
              onProjectChange({ style: styleId });
              onQuestionnaireChange({
                designDirection: { ...questionnaire.designDirection, catalogStyle: styleId },
              });
            }}
            decorationStyle={questionnaire.decorationStyle}
            colorTone={questionnaire.colorTone}
            onDecorationChange={(v) => onQuestionnaireChange({ decorationStyle: v })}
            onColorChange={(v) => {
              onQuestionnaireChange({ colorTone: v });
              onProjectChange({ colorPalette: v });
            }}
          />
        </section>

        <section className="glass-panel p-4">
          <p className="section-label">{translate("questionnaire.preferences")}</p>
          <div className="space-y-4">
            <Field label={translate("questionnaire.projectType")}>
              <ProjectTypeSelector
                types={projectTypes}
                value={projectTypeCode}
                onChange={handleProjectTypeChange}
                loading={catalogLoading}
              />
            </Field>

            <Field label={translate("workspace.floors")}>
              <FloorToggle value={project.floors} onChange={handleFloorsChange} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={translate("workspace.roofType")}>
                <select
                  value={project.roofType}
                  onChange={(e) => onProjectChange({ roofType: e.target.value })}
                  className="dropdown-select text-xs"
                >
                  {ROOF_TYPES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {pickLocalizedLabel(locale, r.label)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={translate("questionnaire.primaryMaterial")}>
                <select
                  value={questionnaire.primaryMaterial || project.wallMaterial}
                  onChange={(e) => {
                    onQuestionnaireChange({ primaryMaterial: e.target.value });
                    onProjectChange({ wallMaterial: e.target.value });
                  }}
                  className="dropdown-select text-xs"
                >
                  <option value="">{translate("questionnaire.selectMaterial")}</option>
                  {WALL_MATERIALS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {pickLocalizedLabel(locale, m.label)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {isResidential ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label={translate("form.bedrooms")}>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={project.bedrooms}
                    onChange={(e) => onProjectChange({ bedrooms: Number(e.target.value) })}
                    className="input-field text-xs"
                  />
                </Field>
                <Field label={translate("form.bathrooms")}>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={project.bathrooms}
                    onChange={(e) => onProjectChange({ bathrooms: Number(e.target.value) })}
                    className="input-field text-xs"
                  />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label={translate("questionnaire.parkingSpaces")}>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={buildingSpec?.parkingSpaces ?? ""}
                    onChange={(e) =>
                      onProjectChange(
                        mergeBuildingSpecIntoProject(project, {
                          parkingSpaces: Number(e.target.value) || 0,
                        }),
                      )
                    }
                    className="input-field text-xs"
                  />
                </Field>
                {(projectTypeCode === "commercial" || projectTypeCode === "high_rise") && (
                  <Field label={translate("questionnaire.elevators")}>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={buildingSpec?.elevatorCount ?? ""}
                      onChange={(e) =>
                        onProjectChange(
                          mergeBuildingSpecIntoProject(project, {
                            elevatorCount: Number(e.target.value) || 0,
                          }),
                        )
                      }
                      className="input-field text-xs"
                    />
                  </Field>
                )}
                {projectTypeCode === "warehouse" && (
                  <Field label={translate("questionnaire.floorLoad")}>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={buildingSpec?.loadBearingCapacityKnSqm ?? ""}
                      onChange={(e) =>
                        onProjectChange(
                          mergeBuildingSpecIntoProject(project, {
                            loadBearingCapacityKnSqm: Number(e.target.value) || 0,
                          }),
                        )
                      }
                      className="input-field text-xs"
                    />
                  </Field>
                )}
              </div>
            )}

            {!isResidential && (
              <p className="text-[11px] text-text-muted">{translate("questionnaire.nonResidentialNote")}</p>
            )}

            {project.floors === 2 && (
              <p className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2.5 text-[11px] leading-relaxed text-amber-200/90">
                {translate("form.foundation.pileRequired")}
              </p>
            )}

            <Field label={translate("questionnaire.landSize")}>
              <input
                type="text"
                value={questionnaire.landSize}
                onChange={(e) => onQuestionnaireChange({ landSize: e.target.value })}
                placeholder="e.g. 20×30 m"
                className="input-field text-xs"
              />
            </Field>

            <p className="section-label mt-2">{translate("cost.inputTitle")}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={translate("cost.maxBudget")}>
                <input
                  type="number"
                  min={0}
                  step={100_000}
                  value={project.maxBudgetThb ?? ""}
                  onChange={(e) => {
                    const maxBudgetThb = Number(e.target.value) || 0;
                    onProjectChange({
                      maxBudgetThb,
                      budget: maxBudgetThb > 0 ? String(maxBudgetThb) : project.budget,
                    });
                  }}
                  placeholder="2500000"
                  className="input-field text-xs"
                />
              </Field>
              <Field label={translate("cost.targetArea")}>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={project.targetAreaSqm ?? ""}
                  onChange={(e) =>
                    onProjectChange({ targetAreaSqm: Number(e.target.value) || 0 })
                  }
                  placeholder="120"
                  className="input-field text-xs"
                />
              </Field>
            </div>
            <Field label={translate("cost.tierLabel")}>
              <select
                value={project.costTier ?? "standard"}
                onChange={(e) =>
                  onProjectChange({
                    costTier: e.target.value as import("@/lib/design/cost-reference").CostTier,
                  })
                }
                className="dropdown-select text-xs"
              >
                <option value="economy">{translate("cost.tierEconomy")}</option>
                <option value="standard">{translate("cost.tierStandard")}</option>
                <option value="premium">{translate("cost.tierPremium")}</option>
              </select>
            </Field>

            <Field label={translate("questionnaire.constraints")}>
              <textarea
                value={questionnaire.specialConstraints}
                onChange={(e) => onQuestionnaireChange({ specialConstraints: e.target.value })}
                placeholder={translate("questionnaire.constraintsPlaceholder")}
                rows={3}
                className="input-field resize-none text-xs"
              />
            </Field>
          </div>
        </section>

        <PermitCompliancePanel
          report={validation?.permitCompliance ?? null}
          loading={permitLoading}
          error={permitError}
        />

        <section>
          <p className="section-label">{translate("questionnaire.uploads")}</p>
          <div className="grid gap-3">
            <UploadSlot
              label={translate("questionnaire.slot1")}
              hint={translate("questionnaire.slot1Hint")}
              tooltip={translate("questionnaire.slot1Tooltip")}
              required
              icon="site"
              loading={uploadingKey === "sitePlan"}
              fileName={uploads.sitePlan?.name}
              previewUrl={uploads.sitePlan?.dataUrl}
              onFile={(f) => void setFile("sitePlan", f)}
            />
            <UploadSlot
              label={translate("questionnaire.slot2")}
              hint={translate("questionnaire.slot2Hint")}
              tooltip={translate("questionnaire.slot2Tooltip")}
              required
              icon="elevation"
              loading={uploadingKey === "elevationSection"}
              fileName={uploads.elevationSection?.name}
              previewUrl={uploads.elevationSection?.dataUrl}
              onFile={(f) => void setFile("elevationSection", f)}
            />
            <UploadSlot
              label={translate("questionnaire.slot3")}
              hint={translate("questionnaire.slot3Hint")}
              tooltip={translate("questionnaire.slot3Tooltip")}
              required
              accept="image/*"
              icon="3d"
              loading={uploadingKey === "frontView3d"}
              fileName={uploads.frontView3d?.name}
              previewUrl={uploads.frontView3d?.dataUrl}
              onFile={(f) => void setFile("frontView3d", f)}
            />
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                {translate("questionnaire.slot4")}
                <span className="text-red-400">*</span>
                <Tooltip content={translate("questionnaire.slot4Tooltip")} />
              </p>
              <p className="text-[11px] text-text-muted">{translate("questionnaire.slot4Hint")}</p>
              {uploads.floorPlans.map((fp, i) => (
                <UploadSlot
                  key={i}
                  label={translate("questionnaire.slot4")}
                  hint={translate("questionnaire.floorPlanUnit")}
                  tooltip={translate("questionnaire.slot4Tooltip")}
                  required
                  icon="floor"
                  slotIndex={i}
                  loading={uploadingKey === `floor-${i}`}
                  fileName={fp?.name}
                  previewUrl={fp?.dataUrl}
                  onFile={(f) => void setFloorFile(i, f)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="glass-panel p-4">
          <p className="section-label">{translate("workspace.projectName")}</p>
          <div className="space-y-3">
            <Field label={translate("workspace.projectName")}>
              <input
                type="text"
                value={project.projectName}
                onChange={(e) => onProjectChange({ projectName: e.target.value })}
                className="input-field text-xs"
              />
            </Field>
            <Field label={translate("workspace.location")}>
              <input
                type="text"
                value={project.location}
                onChange={(e) => onProjectChange({ location: e.target.value })}
                className="input-field text-xs"
              />
            </Field>
            <Field label={translate("form.ownerName")}>
              <input
                type="text"
                value={project.ownerName}
                onChange={(e) => onProjectChange({ ownerName: e.target.value })}
                className="input-field text-xs"
              />
            </Field>
          </div>
        </section>

        <button
          type="button"
          onClick={() => void handleSubmitWithValidation()}
          disabled={submitting || !canSubmit}
          className="btn-primary w-full py-3.5 disabled:opacity-50"
        >
          {submitting ? translate("questionnaire.checking") : translate("questionnaire.submit")}
        </button>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}
