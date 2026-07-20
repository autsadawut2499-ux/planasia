"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { DesignEditorState } from "@/lib/design/editor-types";
import { renderIsometricScene } from "@/lib/design/isometric-renderer";
import type { BudgetTargets } from "@/lib/design/budget-targets";
import { CostBalancePanel } from "@/components/workspace/CostBalancePanel";

interface RoughPreviewModalProps {
  open: boolean;
  onClose: () => void;
  editorState: DesignEditorState;
  budgetTargets: BudgetTargets;
  onConfirmGenerate: () => void;
  loading?: boolean;
}

export function RoughPreviewModal({
  open,
  onClose,
  editorState,
  budgetTargets,
  onConfirmGenerate,
  loading,
}: RoughPreviewModalProps) {
  const { translate } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderIsometricScene(ctx, editorState, {
      width: canvas.width,
      height: canvas.height,
      floor: "all",
      mode: "wireframe",
      showLabels: true,
    });
  }, [editorState]);

  useEffect(() => {
    if (open) draw();
  }, [open, draw]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-panel flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-accent" />
            <div>
              <h2 className="text-base font-semibold">{translate("editor.roughPreviewTitle")}</h2>
              <p className="text-xs text-text-muted">{translate("editor.roughPreviewDesc")}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost rounded-full p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5 md:flex-row">
          <div className="flex-1 rounded-xl border border-white/8 bg-black/40 p-2">
            <canvas ref={canvasRef} width={640} height={420} className="w-full rounded-lg" />
          </div>

          <div className="w-full shrink-0 md:w-64">
            <CostBalancePanel
              editorState={editorState}
              budgetTargets={budgetTargets}
              onTargetsChange={() => {}}
              editable={false}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/8 px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">
            {translate("editor.backToEdit")}
          </button>
          <button
            type="button"
            onClick={onConfirmGenerate}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? translate("workspace.generatingPlans") : translate("editor.confirmAndGenerate")}
          </button>
        </div>
      </div>
    </div>
  );
}
