"use client";

import { ChevronLeft, ChevronRight, Share2, Lock } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useProjectValidation } from "@/hooks/useProjectValidation";
import { DocumentationExportButton } from "@/components/workspace/DocumentationExportButton";
import { PermitCompliancePanel } from "@/components/workspace/PermitCompliancePanel";
import type { DesignPreview, ProjectInput } from "@/lib/ai/types";
import { DEFAULT_PROJECT } from "@/lib/ai/types";
import type { DesignEditorState } from "@/lib/design/editor-types";
import { applyEditorToProject } from "@/lib/design/editor-state";
import type { BudgetTargets } from "@/lib/design/budget-targets";
import { computeCostBalance } from "@/lib/design/cost-balance-engine";
import { CostBalanceBar } from "@/components/workspace/CostBalancePanel";

interface PreviewCanvasProps {
  preview: DesignPreview;
  activeView: "3d" | "floor1" | "floor2";
  onViewChange: (view: "3d" | "floor1" | "floor2") => void;
  floors: 1 | 2;
  /** When false, only 3D teaser is shown — floor plans stay behind paywall. */
  unlocked?: boolean;
  showFloorTabs?: boolean;
  onSaveDraft?: () => void;
  savingDraft?: boolean;
  editorState?: DesignEditorState | null;
  budgetTargets?: BudgetTargets | null;
  project?: ProjectInput | null;
}

const PERSPECTIVE_URL =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85";
const FLOOR1_URL =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80";
const FLOOR2_URL =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";

export function PreviewCanvas({
  preview,
  activeView,
  onViewChange,
  floors,
  unlocked = false,
  showFloorTabs = true,
  onSaveDraft,
  savingDraft,
  editorState,
  budgetTargets,
  project,
}: PreviewCanvasProps) {
  const { translate } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();

  const mergedProject = useMemo(() => {
    if (!project) return null;
    return editorState ? applyEditorToProject(project, editorState) : project;
  }, [project, editorState]);

  const { result: validation, loading: permitLoading, error: permitError } = useProjectValidation(
    mergedProject ?? DEFAULT_PROJECT,
    { enabled: Boolean(mergedProject), debounceMs: 900 },
  );

  const costBar = useMemo(() => {
    if (!editorState || !budgetTargets) return null;
    return computeCostBalance(editorState, budgetTargets, project ?? undefined);
  }, [editorState, budgetTargets, project]);

  const canShowFloors = unlocked && preview.floorPlans.length > 0;
  const view = canShowFloors ? activeView : "3d";

  const imageUrl =
    view === "3d"
      ? preview.perspectiveUrl || PERSPECTIVE_URL
      : view === "floor1"
        ? preview.floorPlans[0] || FLOOR1_URL
        : preview.floorPlans[1] || FLOOR2_URL;

  const views: { id: "3d" | "floor1" | "floor2"; label: string }[] = [
    { id: "3d", label: "3D" },
    ...(showFloorTabs && canShowFloors
      ? [
          { id: "floor1" as const, label: translate("workspace.floor1") },
          ...(floors === 2
            ? [{ id: "floor2" as const, label: translate("workspace.floor2") }]
            : []),
        ]
      : []),
  ];

  const viewIndex = views.findIndex((v) => v.id === view);

  const cycleView = useCallback(
    (direction: -1 | 1) => {
      if (views.length <= 1) return;
      const next = (viewIndex + direction + views.length) % views.length;
      onViewChange(views[next].id);
    },
    [viewIndex, views, onViewChange],
  );

  const handleShare = useCallback(async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: "Planasia Design Preview",
      text: translate("workspace.share"),
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toastSuccess(translate("workspace.shareCopied"));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toastError(translate("workspace.shareFailed"));
    }
  }, [translate, toastSuccess, toastError]);

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />

      <div className="absolute right-4 top-4 z-10 flex flex-wrap justify-end gap-2">
        {editorState && project && (
          <DocumentationExportButton
            project={project}
            editorState={editorState}
            variant="ghost"
          />
        )}
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={savingDraft}
            className="btn-ghost glass-card text-xs uppercase tracking-wide"
          >
            {savingDraft ? translate("editor.saving") : translate("editor.saveDraft")}
          </button>
        )}
        <button type="button" onClick={handleShare} className="btn-ghost glass-card gap-1.5 text-xs">
          <Share2 className="h-3.5 w-3.5" />
          {translate("workspace.share")}
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6 md:p-10">
        {preview.status === "generating" ? (
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            </div>
            <p className="gradient-text text-sm font-medium">{translate("workspace.generating")}</p>
          </div>
        ) : (
          <div className="gradient-border relative max-h-full max-w-full rounded-2xl">
            <div className="glass-panel overflow-hidden rounded-2xl border-0 p-2">
              <img
                src={imageUrl}
                alt={translate("workspace.preview")}
                className="max-h-[calc(100vh-220px)] max-w-full rounded-xl object-contain"
              />
            </div>
            {!unlocked && preview.status === "ready" && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-text-secondary backdrop-blur-md">
                <Lock className="h-3.5 w-3.5 text-accent" />
                {translate("workflow.preview3dOnly")}
              </div>
            )}
          </div>
        )}
      </div>

      {views.length > 1 && (
        <div className="flex items-center justify-center gap-3 border-t border-white/8 px-4 py-3 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => cycleView(-1)}
            disabled={views.length <= 1}
            className="btn-ghost rounded-full p-2 disabled:opacity-30"
            aria-label={translate("workspace.prevView")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onViewChange(v.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  view === v.id
                    ? "bg-gradient-to-r from-accent to-violet text-white shadow-md shadow-accent/25"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => cycleView(1)}
            disabled={views.length <= 1}
            className="btn-ghost rounded-full p-2 disabled:opacity-30"
            aria-label={translate("workspace.nextView")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {costBar && <CostBalanceBar balance={costBar} />}

      {mergedProject && (
        <div className="shrink-0 border-t border-white/8 px-4 py-2">
          <PermitCompliancePanel
            report={validation?.permitCompliance ?? null}
            loading={permitLoading}
            error={permitError}
            compact
          />
        </div>
      )}
    </div>
  );
}
