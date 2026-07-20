"use client";

import { FileDown, Lock, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DocumentationExportButton } from "@/components/workspace/DocumentationExportButton";
import { PRICING } from "@/lib/geo/countries";
import { formatPrice } from "@/lib/i18n";
import type { DesignEditorState } from "@/lib/design/editor-types";
import type { PaymentState, ProjectInput, WorkflowStage } from "@/lib/ai/types";

interface ExportBarProps {
  project: ProjectInput;
  stage: WorkflowStage;
  payment: PaymentState;
  downloadTokens: { pdf?: string; cad?: string };
  onRequestPayment: (format: "pdf" | "cad") => void;
  editorState?: DesignEditorState | null;
}

function triggerDownload(token: string, format: "pdf" | "cad") {
  window.location.href = `/api/download?token=${encodeURIComponent(token)}&format=${format}`;
}

export function ExportBar({
  project,
  stage,
  payment,
  downloadTokens,
  onRequestPayment,
  editorState,
}: ExportBarProps) {
  const { locale, country, translate } = useApp();
  const pdfPrice = PRICING.custom.pdf[String(project.floors) as "1" | "2"];
  const cadPrice = PRICING.custom.cad;

  const showExports = stage === "plans_preview" || stage === "unlocked";
  const showDocumentation = Boolean(editorState) && (stage === "render_ready" || showExports);
  if (!showExports && !showDocumentation) return null;

  const handlePdf = () => {
    if (payment.pdfPaid && downloadTokens.pdf) {
      triggerDownload(downloadTokens.pdf, "pdf");
      return;
    }
    onRequestPayment("pdf");
  };

  const handleCad = () => {
    if (payment.cadPaid && downloadTokens.cad) {
      triggerDownload(downloadTokens.cad, "cad");
      return;
    }
    onRequestPayment("cad");
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border bg-surface-raised px-4 py-3">
      {showDocumentation && editorState && (
        <DocumentationExportButton project={project} editorState={editorState} />
      )}
      {showExports && (
        <>
      <ExportButton
        icon={payment.pdfPaid ? Download : Lock}
        label={translate("workspace.exportPdf")}
        price={formatPrice(pdfPrice, country.currency, locale)}
        locked={!payment.pdfPaid}
        onClick={handlePdf}
      />
      <ExportButton
        icon={payment.cadPaid ? Download : Lock}
        label={translate("workspace.exportCad")}
        price={formatPrice(cadPrice, country.currency, locale)}
        locked={!payment.cadPaid}
        onClick={handleCad}
      />
        </>
      )}
    </div>
  );
}

function ExportButton({
  icon: Icon,
  label,
  price,
  locked,
  onClick,
}: {
  icon: typeof FileDown;
  label: string;
  price: string;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
        locked
          ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          : "border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      <span className="text-xs opacity-70">{locked ? price : "✓"}</span>
    </button>
  );
}
