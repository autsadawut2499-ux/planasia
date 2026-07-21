"use client";

import { Box, ChevronLeft, ChevronRight, Home, LayoutGrid, Share2, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useProjectValidation } from "@/hooks/useProjectValidation";
import { DocumentationExportButton } from "@/components/workspace/DocumentationExportButton";
import { PermitCompliancePanel } from "@/components/workspace/PermitCompliancePanel";
import type { AiPreviewView, DesignPreview, ProjectInput } from "@/lib/ai/types";
import { DEFAULT_PROJECT } from "@/lib/ai/types";
import type { DesignEditorState } from "@/lib/design/editor-types";
import { applyEditorToProject } from "@/lib/design/editor-state";
import type { BudgetTargets } from "@/lib/design/budget-targets";
import { computeCostBalance } from "@/lib/design/cost-balance-engine";
import { CostBalanceBar } from "@/components/workspace/CostBalancePanel";

interface PreviewCanvasProps {
  preview: DesignPreview;
  activeView: AiPreviewView;
  onViewChange: (view: AiPreviewView) => void;
  floors: 1 | 2;
  onSaveDraft?: () => void;
  savingDraft?: boolean;
  editorState?: DesignEditorState | null;
  budgetTargets?: BudgetTargets | null;
  project?: ProjectInput | null;
}

const VIEW_META: Record<
  AiPreviewView,
  { icon: typeof Home; labelKey: "workspace.viewRender3d" | "workspace.viewFacade" | "workspace.viewFloorPlan" }
> = {
  render3d: { icon: Home, labelKey: "workspace.viewRender3d" },
  facade: { icon: Box, labelKey: "workspace.viewFacade" },
  floorplan: { icon: LayoutGrid, labelKey: "workspace.viewFloorPlan" },
};

export function PreviewCanvas({
  preview,
  activeView,
  onViewChange,
  floors,
  onSaveDraft,
  savingDraft,
  editorState,
  budgetTargets,
  project,
}: PreviewCanvasProps) {
  const { translate } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();
  const [floorIndex, setFloorIndex] = useState(0);

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

  const imageUrl = useMemo(() => {
    switch (activeView) {
      case "render3d":
        return preview.perspectiveUrl;
      case "facade":
        return preview.facadeUrl;
      case "floorplan":
        return preview.floorPlans[floorIndex] ?? preview.floorPlans[0] ?? "";
      default:
        return "";
    }
  }, [activeView, preview, floorIndex]);

  const hasAnyImage =
    Boolean(preview.perspectiveUrl) ||
    Boolean(preview.facadeUrl) ||
    preview.floorPlans.length > 0;

  const views = (["render3d", "facade"] as const).map((id) => ({
    id,
    label: translate(VIEW_META[id].labelKey),
    available:
      id === "render3d"
        ? Boolean(preview.perspectiveUrl)
        : Boolean(preview.facadeUrl),
  }));

  const viewIndex = views.findIndex((v) => v.id === activeView);

  const cycleView = useCallback(
    (direction: -1 | 1) => {
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

  const ActiveIcon = VIEW_META[activeView].icon;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="absolute right-3 top-2 z-10 flex flex-wrap justify-end gap-2 md:right-4">
        {editorState && project && (
          <DocumentationExportButton project={project} editorState={editorState} variant="ghost" />
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
        {hasAnyImage && (
          <button type="button" onClick={handleShare} className="btn-ghost glass-card gap-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            {translate("workspace.share")}
          </button>
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-2 md:px-6">
        {preview.status === "generating" ? (
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            </div>
            <p className="gradient-text text-sm font-medium">{translate("workspace.generating")}</p>
            <p className="mt-2 text-xs text-text-muted">{translate("workspace.aiPreviewHint")}</p>
          </div>
        ) : imageUrl ? (
          <div className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center">
            <div className="relative w-full overflow-hidden rounded-xl">
              <img
                src={imageUrl}
                alt={translate(VIEW_META[activeView].labelKey)}
                className="mx-auto max-h-[calc(100vh-280px)] w-full object-contain"
              />
            </div>
            {activeView === "floorplan" && floors === 2 && preview.floorPlans.length > 1 && (
              <div className="mt-3 flex gap-2">
                {preview.floorPlans.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFloorIndex(i)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      floorIndex === i
                        ? "bg-accent text-white"
                        : "border border-white/10 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {i === 0 ? translate("workspace.floor1") : translate("workspace.floor2")}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex max-w-md flex-col items-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-8 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <ActiveIcon className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <div className="mb-2 flex items-center gap-1.5 text-accent/80">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{translate("workspace.aiZone")}</span>
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              {translate(VIEW_META[activeView].labelKey)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{translate("workspace.aiPreviewEmpty")}</p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2 px-3 pb-2 pt-1">
        <button
          type="button"
          onClick={() => cycleView(-1)}
          className="btn-ghost rounded-full p-2"
          aria-label={translate("workspace.prevView")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {views.map((v) => {
            const Icon = VIEW_META[v.id].icon;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onViewChange(v.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 ${
                  activeView === v.id
                    ? "bg-gradient-to-r from-accent to-violet text-white shadow-md shadow-accent/25"
                    : v.available
                      ? "text-text-muted hover:text-text-primary"
                      : "text-text-muted/50 hover:text-text-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => cycleView(1)}
          className="btn-ghost rounded-full p-2"
          aria-label={translate("workspace.nextView")}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {costBar && (
        <div className="shrink-0 px-3 pb-1">
          <CostBalanceBar balance={costBar} />
        </div>
      )}

      {mergedProject && (
        <div className="absolute bottom-16 left-3 z-10 max-w-xs md:left-4">
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
