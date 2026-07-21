"use client";

import {
  Bath,
  BedDouble,
  Building2,
  Landmark,
  MapPin,
  Palette,
  PanelTop,
  Plus,
  SquareStack,
  User,
  Wallet,
  Home,
  ImageUp,
  Layers,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useProjectValidation } from "@/hooks/useProjectValidation";
import {
  FLOOR_MATERIALS,
  ROOF_MATERIALS,
  WALL_MATERIALS,
  type ProjectInput,
  type QuestionnaireInput,
  type QuestionnaireUploads,
} from "@/lib/ai/types";
import { HOUSE_STYLES } from "@/lib/geo/countries";
import {
  appendFilesToSlot,
  removeFileAtIndex,
} from "@/lib/upload/files";
import { UploadSlot } from "./UploadSlot";
import {
  FireflyField,
  FireflySidebarGroup,
  FireflySidebarShell,
  fireflyInputClass,
  fireflySelectClass,
} from "./SidebarAccordion";
import { pickLocalizedLabel } from "@/lib/i18n/localized-text";

interface QuestionnairePanelProps {
  project: ProjectInput;
  questionnaire: QuestionnaireInput;
  uploads: QuestionnaireUploads;
  onProjectChange: (updates: Partial<ProjectInput>) => void;
  onQuestionnaireChange: (updates: Partial<QuestionnaireInput>) => void;
  onUploadsChange: (updates: Partial<QuestionnaireUploads>) => void;
  onSubmit: () => void;
  submitting?: boolean;
  canSubmit?: boolean;
  embedded?: boolean;
}

const BED_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const BATH_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

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
  embedded = false,
}: QuestionnairePanelProps) {
  const { locale, translate } = useApp();
  const { error: toastError } = useToast();
  const { validateNow } = useProjectValidation(project);
  const [collapsed, setCollapsed] = useState(false);
  const [loadingSlot, setLoadingSlot] = useState<keyof QuestionnaireUploads | null>(null);

  const styleLabel = pickLocalizedLabel(
    locale,
    HOUSE_STYLES.find((s) => s.id === project.style)?.label ?? { en: project.style, th: project.style },
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

  const handleFloorsChange = (floors: 1 | 2) => {
    onProjectChange({
      floors,
      foundation: floors === 2 ? "pile" : project.foundation,
    });
  };

  const handleAddFiles = useCallback(
    async (key: keyof QuestionnaireUploads, incoming: File[]) => {
      setLoadingSlot(key);
      try {
        const next = await appendFilesToSlot(uploads[key], incoming);
        onUploadsChange({ [key]: next });
      } catch {
        toastError(translate("toast.error"));
      } finally {
        setLoadingSlot(null);
      }
    },
    [uploads, onUploadsChange, toastError, translate],
  );

  const handleRemoveFile = useCallback(
    (key: keyof QuestionnaireUploads, index: number) => {
      onUploadsChange({ [key]: removeFileAtIndex(uploads[key], index) });
    },
    [uploads, onUploadsChange],
  );

  const floorSummary = project.floors === 1 ? translate("sidebar.floor1") : translate("sidebar.floor2");
  const uploadSummary = [
    uploads.sitePlan.length,
    uploads.elevationSection.length,
    uploads.frontView3d.length,
    uploads.floorPlans.length,
  ].reduce((a, b) => a + b, 0);

  const submitButton = canSubmit ? (
    <button
      type="button"
      onClick={() => void handleSubmitWithValidation()}
      disabled={submitting}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2680eb] py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#1a6fd4] disabled:opacity-50"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      {submitting ? translate("questionnaire.checking") : translate("questionnaire.submit")}
    </button>
  ) : null;

  const menu = (
    <>
      <FireflySidebarGroup
        icon={Home}
        label={translate("sidebar.groupProject")}
        summary={project.projectName || "—"}
        defaultOpen
      >
        <FireflyField label={translate("sidebar.projectName")}>
          <input
            type="text"
            value={project.projectName}
            onChange={(e) => onProjectChange({ projectName: e.target.value })}
            className={fireflyInputClass}
            placeholder={translate("sidebar.projectName")}
          />
        </FireflyField>
        <FireflyField label={translate("sidebar.ownerName")}>
          <input
            type="text"
            value={project.ownerName}
            onChange={(e) => onProjectChange({ ownerName: e.target.value })}
            className={fireflyInputClass}
          />
        </FireflyField>
        <FireflyField label={translate("sidebar.location")}>
          <input
            type="text"
            value={project.location}
            onChange={(e) => onProjectChange({ location: e.target.value })}
            className={fireflyInputClass}
          />
        </FireflyField>
      </FireflySidebarGroup>

      <FireflySidebarGroup
        icon={Building2}
        label={translate("sidebar.groupBuilding")}
        summary={`${floorSummary} · ${project.bedrooms}BR`}
      >
        <FireflyField label={translate("sidebar.floors")}>
          <select
            value={project.floors}
            onChange={(e) => handleFloorsChange(Number(e.target.value) as 1 | 2)}
            className={fireflySelectClass}
          >
            <option value={1}>{translate("sidebar.floor1")}</option>
            <option value={2}>{translate("sidebar.floor2")}</option>
          </select>
        </FireflyField>
        {project.floors === 2 && (
          <p className="text-[10px] leading-snug text-amber-300/80">{translate("form.foundation.pileRequired")}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <FireflyField label={translate("sidebar.bedrooms")}>
            <select
              value={project.bedrooms}
              onChange={(e) => onProjectChange({ bedrooms: Number(e.target.value) })}
              className={fireflySelectClass}
            >
              {BED_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </FireflyField>
          <FireflyField label={translate("sidebar.bathrooms")}>
            <select
              value={project.bathrooms}
              onChange={(e) => onProjectChange({ bathrooms: Number(e.target.value) })}
              className={fireflySelectClass}
            >
              {BATH_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </FireflyField>
        </div>
        <FireflyField label={translate("sidebar.budget")}>
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
            className={fireflyInputClass}
          />
        </FireflyField>
        <FireflyField label={translate("sidebar.style")}>
          <select
            value={project.style}
            onChange={(e) => {
              onProjectChange({ style: e.target.value });
              onQuestionnaireChange({
                designDirection: { ...questionnaire.designDirection, catalogStyle: e.target.value },
              });
            }}
            className={fireflySelectClass}
          >
            {HOUSE_STYLES.map((s) => (
              <option key={s.id} value={s.id}>{pickLocalizedLabel(locale, s.label)}</option>
            ))}
          </select>
        </FireflyField>
      </FireflySidebarGroup>

      <FireflySidebarGroup icon={Layers} label={translate("sidebar.groupMaterials")} summary={styleLabel}>
        <FireflyField label={translate("sidebar.wallMaterial")}>
          <select
            value={project.wallMaterial}
            onChange={(e) => {
              onProjectChange({ wallMaterial: e.target.value });
              onQuestionnaireChange({ primaryMaterial: e.target.value });
            }}
            className={fireflySelectClass}
          >
            {WALL_MATERIALS.map((m) => (
              <option key={m.value} value={m.value}>{pickLocalizedLabel(locale, m.label)}</option>
            ))}
          </select>
        </FireflyField>
        <FireflyField label={translate("sidebar.floorMaterial")}>
          <select
            value={project.floorMaterial}
            onChange={(e) => onProjectChange({ floorMaterial: e.target.value })}
            className={fireflySelectClass}
          >
            {FLOOR_MATERIALS.map((m) => (
              <option key={m.value} value={m.value}>{pickLocalizedLabel(locale, m.label)}</option>
            ))}
          </select>
        </FireflyField>
        <FireflyField label={translate("sidebar.roofMaterial")}>
          <select
            value={project.roofMaterial}
            onChange={(e) => onProjectChange({ roofMaterial: e.target.value })}
            className={fireflySelectClass}
          >
            {ROOF_MATERIALS.map((m) => (
              <option key={m.value} value={m.value}>{pickLocalizedLabel(locale, m.label)}</option>
            ))}
          </select>
        </FireflyField>
        <FireflyField label={translate("sidebar.foundation")}>
          <select
            value={project.foundation}
            onChange={(e) => onProjectChange({ foundation: e.target.value as "pile" | "spread" })}
            className={fireflySelectClass}
            disabled={project.floors === 2}
          >
            <option value="spread">{translate("form.foundation.spread")}</option>
            <option value="pile">{translate("form.foundation.pile")}</option>
          </select>
        </FireflyField>
      </FireflySidebarGroup>

      <FireflySidebarGroup
        icon={ImageUp}
        label={translate("sidebar.groupUploads")}
        summary={uploadSummary > 0 ? `${uploadSummary}` : "—"}
      >
        <UploadSlot
          label={translate("questionnaire.slot1")}
          hint={translate("questionnaire.slot1Hint")}
          tooltip={translate("questionnaire.slot1Tooltip")}
          required
          icon="site"
          files={uploads.sitePlan}
          loading={loadingSlot === "sitePlan"}
          onAdd={(f) => handleAddFiles("sitePlan", f)}
          onRemove={(i) => handleRemoveFile("sitePlan", i)}
        />
        <UploadSlot
          label={translate("questionnaire.slot2")}
          hint={translate("questionnaire.slot2Hint")}
          tooltip={translate("questionnaire.slot2Tooltip")}
          required
          icon="elevation"
          files={uploads.elevationSection}
          loading={loadingSlot === "elevationSection"}
          onAdd={(f) => handleAddFiles("elevationSection", f)}
          onRemove={(i) => handleRemoveFile("elevationSection", i)}
        />
        <UploadSlot
          label={translate("questionnaire.slot3")}
          hint={translate("questionnaire.slot3Hint")}
          tooltip={translate("questionnaire.slot3Tooltip")}
          required
          icon="3d"
          files={uploads.frontView3d}
          loading={loadingSlot === "frontView3d"}
          onAdd={(f) => handleAddFiles("frontView3d", f)}
          onRemove={(i) => handleRemoveFile("frontView3d", i)}
        />
        <UploadSlot
          label={translate("questionnaire.slot4")}
          hint={translate("questionnaire.slot4Hint")}
          tooltip={translate("questionnaire.slot4Tooltip")}
          required
          icon="floor"
          files={uploads.floorPlans}
          loading={loadingSlot === "floorPlans"}
          onAdd={(f) => handleAddFiles("floorPlans", f)}
          onRemove={(i) => handleRemoveFile("floorPlans", i)}
        />
      </FireflySidebarGroup>
    </>
  );

  if (embedded) {
    return (
      <div className="bg-[#141414] py-1">
        {menu}
        {submitButton ? <div className="border-t border-white/[0.08] p-3">{submitButton}</div> : null}
      </div>
    );
  }

  return (
    <FireflySidebarShell
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((v) => !v)}
      headerAction={submitButton}
    >
      {menu}
    </FireflySidebarShell>
  );
}
