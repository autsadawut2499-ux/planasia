"use client";

import { Loader2, Download, AlertCircle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { ExportJobState } from "@/hooks/useExportJob";

interface ExportJobModalProps {
  open: boolean;
  state: ExportJobState;
  formatLabel: string;
  onClose: () => void;
  onDownload: () => void;
}

export function ExportJobModal({ open, state, formatLabel, onClose, onDownload }: ExportJobModalProps) {
  const { translate } = useApp();
  if (!open) return null;

  const isActive = state.status === "queued" || state.status === "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{translate("job.exportTitle")}</h2>
            <p className="mt-1 text-sm text-muted">{formatLabel}</p>
          </div>
          {!isActive && (
            <button type="button" onClick={onClose} className="rounded p-1 text-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {isActive && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
              <span>
                {state.status === "queued"
                  ? translate("job.queued").replace("{n}", String(state.queuePosition))
                  : translate("job.processing")}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${Math.max(state.progress, state.status === "queued" ? 5 : 15)}%` }}
              />
            </div>
            <p className="text-xs text-muted">{translate("job.jobId")}: {state.jobId}</p>
          </div>
        )}

        {state.status === "completed" && (
          <div className="space-y-4">
            <p className="text-sm text-green-400">{translate("job.completed")}</p>
            <button
              type="button"
              onClick={onDownload}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand/90"
            >
              <Download className="h-4 w-4" />
              {translate("job.download")}
            </button>
          </div>
        )}

        {state.status === "failed" && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{state.error === "rate_limited" ? translate("job.rateLimited") : state.error ?? translate("job.failed")}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface"
            >
              {translate("workflow.cancel")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
