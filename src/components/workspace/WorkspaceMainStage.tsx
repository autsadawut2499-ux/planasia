"use client";

import type { ReactNode } from "react";
import { AIChatBar } from "@/components/workspace/AIChatBar";
import { ConfirmRenderBar } from "@/components/workspace/ConfirmRenderBar";
import { DownloadPanel } from "@/components/workspace/DownloadPanel";
import { WorkflowStepper } from "@/components/workspace/WorkflowStepper";
import type { PaymentState, ProjectInput, WorkflowStage } from "@/lib/ai/types";
import type { DesignEditorState } from "@/lib/design/editor-types";

interface WorkspaceMainStageProps {
  project: ProjectInput;
  stage: WorkflowStage;
  optionsOpen: boolean;
  payment: PaymentState;
  downloadTokens: { pdf?: string; cad?: string };
  onRequestPayment: (format: "pdf" | "cad") => void;
  onConfirmRender: () => void;
  confirmLoading?: boolean;
  listedOnStore: boolean;
  editorMode: boolean;
  onToggleEditor?: () => void;
  onRoughPreview?: () => void;
  editorState?: DesignEditorState | null;
  showEditor: boolean;
  children: ReactNode;
}

/** Main stage: canvas + sticky download panel on the right */
export function WorkspaceMainStage({
  project,
  stage,
  optionsOpen,
  payment,
  downloadTokens,
  onRequestPayment,
  onConfirmRender,
  confirmLoading,
  listedOnStore,
  editorMode,
  onToggleEditor,
  onRoughPreview,
  editorState,
  showEditor,
  children,
}: WorkspaceMainStageProps) {
  const showSheetPreview = stage === "plans_preview" || stage === "plans_generating" || stage === "unlocked";
  const showDownloadPanel = stage === "plans_preview" || stage === "unlocked";

  return (
    <main className="workspace-canvas relative flex min-w-0 flex-1 bg-[#0a0a0c]">
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(55,48,107,0.12),transparent_65%)]" />

        <div className="relative z-10 shrink-0 px-3 pt-2 md:px-4">
          <WorkflowStepper stage={stage} optionsOpen={optionsOpen} compact />
        </div>

        <div className="relative z-0 flex min-h-0 flex-1 flex-col">{children}</div>

        {!showSheetPreview && (
          <div className="relative z-10 shrink-0">
            <ConfirmRenderBar
              stage={stage}
              onConfirm={onConfirmRender}
              confirmLoading={confirmLoading}
              listedOnStore={listedOnStore}
              editorMode={editorMode}
              onToggleEditor={onToggleEditor}
              onRoughPreview={onRoughPreview}
              compact
            />
            {!showEditor && <AIChatBar project={project} embedded />}
          </div>
        )}

        {showSheetPreview && stage === "unlocked" && (
          <div className="relative z-10 shrink-0 px-4 pb-2 lg:pb-4">
            <ConfirmRenderBar stage={stage} onConfirm={onConfirmRender} listedOnStore={listedOnStore} compact />
          </div>
        )}
      </div>

      {showDownloadPanel && (
        <DownloadPanel
          project={project}
          stage={stage}
          payment={payment}
          downloadTokens={downloadTokens}
          onRequestPayment={onRequestPayment}
        />
      )}
    </main>
  );
}
