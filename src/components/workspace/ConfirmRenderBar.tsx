"use client";

import { Lock, CheckCircle2, Store, CreditCard, Eye, Pencil } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { WorkflowStage } from "@/lib/ai/types";

interface ConfirmRenderBarProps {
  stage: WorkflowStage;
  onConfirm: () => void;
  onPayUnlock?: () => void;
  listedOnStore: boolean;
  editorMode?: boolean;
  onToggleEditor?: () => void;
  onRoughPreview?: () => void;
}

export function ConfirmRenderBar({
  stage,
  onConfirm,
  onPayUnlock,
  listedOnStore,
  editorMode,
  onToggleEditor,
  onRoughPreview,
}: ConfirmRenderBarProps) {
  const { translate } = useApp();

  if (stage === "render_ready") {
    return (
      <div className="flex shrink-0 flex-col gap-2 border-t border-accent/30 bg-accent/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          {editorMode ? translate("editor.barHint") : translate("workflow.preview3dHint")}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          {onToggleEditor && (
            <button type="button" onClick={onToggleEditor} className="btn-ghost gap-1.5 text-xs">
              <Pencil className="h-3.5 w-3.5" />
              {editorMode ? translate("editor.exitEdit") : translate("editor.openEdit")}
            </button>
          )}
          {onRoughPreview && (
            <button type="button" onClick={onRoughPreview} className="btn-ghost gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" />
              {translate("editor.previewStructure")}
            </button>
          )}
          <button type="button" onClick={onConfirm} className="btn-primary">
            {translate("workflow.confirmPlan")}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "plans_preview") {
    return (
      <div className="flex shrink-0 flex-col gap-3 border-t border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-sm text-amber-200">{translate("workflow.paywallHint")}</p>
        </div>
        {onPayUnlock && (
          <button type="button" onClick={onPayUnlock} className="btn-primary shrink-0 gap-2 sm:ml-auto">
            <CreditCard className="h-4 w-4" />
            {translate("workflow.payToUnlock")}
          </button>
        )}
      </div>
    );
  }

  if (stage === "unlocked") {
    return (
      <div className="flex shrink-0 items-center gap-3 border-t border-green-500/30 bg-green-500/10 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
        <p className="text-sm text-green-200">{translate("workflow.unlockedHint")}</p>
        {listedOnStore && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-text-secondary">
            <Store className="h-3.5 w-3.5" />
            {translate("workflow.autoListed")}
          </span>
        )}
      </div>
    );
  }

  return null;
}
