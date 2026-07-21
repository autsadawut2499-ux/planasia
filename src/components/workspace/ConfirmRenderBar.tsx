"use client";

import type { ReactNode } from "react";
import { Lock, CheckCircle2, Store, CreditCard, Eye, Pencil } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { WorkflowStage } from "@/lib/ai/types";

interface ConfirmRenderBarProps {
  stage: WorkflowStage;
  onConfirm: () => void;
  confirmLoading?: boolean;
  onPayUnlock?: () => void;
  listedOnStore: boolean;
  editorMode?: boolean;
  onToggleEditor?: () => void;
  onRoughPreview?: () => void;
  compact?: boolean;
}

export function ConfirmRenderBar({
  stage,
  onConfirm,
  confirmLoading,
  onPayUnlock,
  listedOnStore,
  editorMode,
  onToggleEditor,
  onRoughPreview,
  compact,
}: ConfirmRenderBarProps) {
  const { translate } = useApp();

  const wrap = (content: ReactNode, tone: "accent" | "amber" | "green") => {
    if (!compact) {
      const border =
        tone === "accent"
          ? "border-accent/30 bg-accent/10"
          : tone === "amber"
            ? "border-amber-500/30 bg-amber-500/10"
            : "border-green-500/30 bg-green-500/10";
      return (
        <div className={`flex shrink-0 flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${border}`}>
          {content}
        </div>
      );
    }
    return (
      <div className="flex justify-center px-4 pb-2 pt-1">
        <div className="flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#161618]/95 px-3 py-2 shadow-lg shadow-black/30 backdrop-blur-md">
          {content}
        </div>
      </div>
    );
  };

  if (stage === "render_ready") {
    return wrap(
      <>
        <p className={`text-xs text-text-secondary ${compact ? "hidden sm:block" : ""}`}>
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
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmLoading}
            className="btn-primary text-xs disabled:opacity-60"
          >
            {confirmLoading ? translate("workspace.generatingPlans") : translate("workflow.confirmPlan")}
          </button>
        </div>
      </>,
      "accent",
    );
  }

  if (stage === "plans_preview") {
    return wrap(
      <>
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          <p className="text-xs text-amber-200">{translate("workflow.paywallHint")}</p>
        </div>
        {onPayUnlock && (
          <button type="button" onClick={onPayUnlock} className="btn-primary shrink-0 gap-2 text-xs">
            <CreditCard className="h-3.5 w-3.5" />
            {translate("workflow.payToUnlock")}
          </button>
        )}
      </>,
      "amber",
    );
  }

  if (stage === "unlocked") {
    return wrap(
      <>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-400" />
          <p className="text-xs text-green-200">{translate("workflow.unlockedHint")}</p>
        </div>
        {listedOnStore && (
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Store className="h-3.5 w-3.5" />
            {translate("workflow.autoListed")}
          </span>
        )}
      </>,
      "green",
    );
  }

  return null;
}
