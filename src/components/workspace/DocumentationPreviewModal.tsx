"use client";

import { CheckCircle2, Download, FileJson, FileText, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { PermitCompliancePanel } from "@/components/workspace/PermitCompliancePanel";
import { formatBudgetThb } from "@/lib/design/budget-targets";
import type { DesignExportBundle } from "@/lib/design/export-documentation";
import { useDesignExport } from "@/hooks/useDesignExport";
import {
  documentationPdfFilename,
  downloadJsonBundle,
  downloadPdfBytes,
  generateDocumentationSummaryPdf,
} from "@/lib/pdf/documentation-summary";
import type { ProjectInput } from "@/lib/ai/types";
import type { DesignEditorState } from "@/lib/design/editor-types";

interface DocumentationPreviewModalProps {
  open: boolean;
  onClose: () => void;
  project: ProjectInput;
  editorState: DesignEditorState;
}

export function DocumentationPreviewModal({
  open,
  onClose,
  project,
  editorState,
}: DocumentationPreviewModalProps) {
  const { locale, translate } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();
  const { fetchExport } = useDesignExport();
  const [bundle, setBundle] = useState<DesignExportBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExport(project, editorState);
      setBundle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "export failed");
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, [fetchExport, project, editorState]);

  useEffect(() => {
    if (open) void load();
    else {
      setBundle(null);
      setError(null);
    }
  }, [open, load]);

  if (!open) return null;

  const slug = project.projectName || "planasia-design";

  const handleJson = () => {
    if (!bundle) return;
    downloadJsonBundle(bundle, slug);
    toastSuccess(translate("editor.exportDocumentationSuccess"));
  };

  const handlePdf = async () => {
    if (!bundle) return;
    setPdfLoading(true);
    try {
      const bytes = await generateDocumentationSummaryPdf(bundle, locale);
      downloadPdfBytes(bytes, documentationPdfFilename(slug));
      toastSuccess(translate("editor.exportPdfSuccess"));
    } catch {
      toastError(translate("editor.exportPdfFailed"));
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
        aria-label={translate("workflow.cancel")}
        onClick={onClose}
      />
      <div
        className="fixed inset-x-4 top-[5vh] z-[81] mx-auto flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl md:inset-x-auto md:w-full"
        role="dialog"
        aria-modal="true"
        aria-label={translate("editor.exportPreviewTitle")}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-white">{translate("editor.exportPreviewTitle")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label={translate("nav.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              {translate("editor.exportPreviewLoading")}
            </div>
          )}

          {error === "rate_limited" && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {translate("permit.rateLimited")}
            </p>
          )}

          {error && error !== "rate_limited" && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {translate("editor.exportDocumentationFailed")}
            </p>
          )}

          {bundle && (
            <div className="space-y-5">
              <section className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {translate("editor.exportPreviewProject")}
                </h3>
                <p className="mt-2 text-lg font-bold text-white">{bundle.project.projectName || "—"}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-text-muted">{translate("form.ownerName")}</dt>
                    <dd className="text-text-primary">{bundle.project.ownerName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">{translate("workspace.location")}</dt>
                    <dd className="text-text-primary">{bundle.project.location || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">{translate("questionnaire.projectType")}</dt>
                    <dd className="text-text-primary">{bundle.project.projectTypeCode ?? "residential"}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">{translate("workspace.floors")}</dt>
                    <dd className="text-text-primary">{bundle.project.floors}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {translate("cost.liveTotal")}
                </h3>
                <p className="mt-1 text-2xl font-bold text-accent">
                  {formatBudgetThb(bundle.costBalance.totalEstimatedThb)}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {bundle.costBalance.grossAreaSqm} m²
                  {bundle.costBalance.targetAreaSqm > 0 && ` / ${bundle.costBalance.targetAreaSqm} m² target`}
                </p>
                {bundle.costBalance.bankReady && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {translate("cost.bankReadyShort")}
                  </p>
                )}
              </section>

              <PermitCompliancePanel report={bundle.permitCompliance} />

              <section className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {translate("editor.materialEstimate")}
                </h3>
                <p className="mt-1 text-lg font-semibold text-white">
                  {formatBudgetThb(bundle.materialEstimate.totalThb)}
                </p>
                <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto text-[11px] text-text-secondary">
                  {bundle.materialEstimate.lines.slice(0, 8).map((line) => (
                    <li key={`${line.category}-${line.material}`}>
                      {line.category} · {line.material}: {line.quantity} {line.unit} — ฿
                      {line.totalThb.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {translate("editor.openings")}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {bundle.doorWindowSchedule.length} {translate("editor.exportPreviewScheduleItems")}
                </p>
                <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-[11px] text-text-secondary">
                  {bundle.doorWindowSchedule.slice(0, 10).map((row) => (
                    <li key={row.id}>
                      {row.type} — {row.room} ({row.wall}, {row.widthM}m)
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleJson}
            disabled={!bundle || loading}
            className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50"
          >
            <FileJson className="h-4 w-4" />
            {translate("editor.exportDownloadJson")}
          </button>
          <button
            type="button"
            onClick={() => void handlePdf()}
            disabled={!bundle || loading || pdfLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 py-2.5 text-sm font-medium text-accent hover:bg-accent/20 disabled:opacity-50"
          >
            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {translate("editor.exportDownloadPdf")}
          </button>
        </div>
      </div>
    </>
  );
}
