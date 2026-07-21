"use client";

import { useState } from "react";
import { Download, FileDown, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ExportJobModal } from "@/components/workspace/ExportJobModal";
import { useExportJob } from "@/hooks/useExportJob";
import { PRICING } from "@/lib/geo/countries";
import { formatPrice } from "@/lib/i18n";
import type { PaymentState, ProjectInput, WorkflowStage } from "@/lib/ai/types";
import type { ExportJobFormat } from "@/lib/jobs/types";

interface DownloadPanelProps {
  project: ProjectInput;
  stage: WorkflowStage;
  payment: PaymentState;
  downloadTokens: { pdf?: string; cad?: string };
  onRequestPayment: (format: "pdf" | "cad") => void;
}

export function DownloadPanel({
  project,
  stage,
  payment,
  downloadTokens,
  onRequestPayment,
}: DownloadPanelProps) {
  const { locale, country, unitSystem, translate } = useApp();
  const { state: jobState, startExport, reset } = useExportJob();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useState<ExportJobFormat>("pdf");

  const pdfPrice = PRICING.custom.pdf[String(project.floors) as "1" | "2"];
  const cadPrice = PRICING.custom.cad;

  const visible = stage === "plans_preview" || stage === "unlocked";
  if (!visible) return null;

  const queueExport = async (format: ExportJobFormat) => {
    const token = format === "pdf" ? downloadTokens.pdf : downloadTokens.cad;
    if (!token) return;
    setActiveFormat(format);
    setModalOpen(true);
    await startExport({
      token,
      format,
      unitSystem,
      countryCode: country.code,
    });
  };

  const handlePdf = () => {
    if (payment.pdfPaid && downloadTokens.pdf) {
      void queueExport("pdf");
      return;
    }
    onRequestPayment("pdf");
  };

  const handleCad = () => {
    if (payment.cadPaid && downloadTokens.cad) {
      void queueExport("cad");
      return;
    }
    onRequestPayment("cad");
  };

  const handleDownload = () => {
    if (jobState.downloadUrl) {
      window.location.href = jobState.downloadUrl;
    }
  };

  const formatLabel =
    activeFormat === "pdf" ? translate("workspace.exportPdf") : translate("workspace.exportCad");

  return (
    <>
      <aside className="sticky top-0 z-30 hidden h-full w-56 shrink-0 flex-col border-l border-white/8 bg-[#121214]/95 backdrop-blur-md lg:flex xl:w-64">
        <div className="border-b border-white/8 px-4 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {translate("workspace.downloadPanel")}
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
            {translate("workspace.downloadPanelHint")}
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <DownloadOption
            icon={payment.pdfPaid ? Download : Lock}
            label={translate("workspace.exportPdf")}
            sublabel={translate("workspace.exportPdfDesc")}
            price={formatPrice(pdfPrice, country.currency, locale)}
            locked={!payment.pdfPaid}
            onClick={handlePdf}
          />
          <DownloadOption
            icon={payment.cadPaid ? Download : Lock}
            label={translate("workspace.exportCad")}
            sublabel={translate("workspace.exportCadDesc")}
            price={formatPrice(cadPrice, country.currency, locale)}
            locked={!payment.cadPaid}
            onClick={handleCad}
          />
        </div>

        {!payment.pdfPaid && !payment.cadPaid && (
          <div className="border-t border-white/8 px-4 py-3">
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              {translate("workflow.paywallHint")}
            </p>
          </div>
        )}
      </aside>

      {/* Mobile: bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 border-t border-white/10 bg-[#121214]/98 p-3 backdrop-blur-md lg:hidden">
        <DownloadOption
          icon={payment.pdfPaid ? Download : Lock}
          label={translate("workspace.exportPdf")}
          price={formatPrice(pdfPrice, country.currency, locale)}
          locked={!payment.pdfPaid}
          onClick={handlePdf}
          compact
        />
        <DownloadOption
          icon={payment.cadPaid ? Download : Lock}
          label={translate("workspace.exportCad")}
          price={formatPrice(cadPrice, country.currency, locale)}
          locked={!payment.cadPaid}
          onClick={handleCad}
          compact
        />
      </div>

      <ExportJobModal
        open={modalOpen}
        state={jobState}
        formatLabel={formatLabel}
        onClose={() => {
          setModalOpen(false);
          reset();
        }}
        onDownload={handleDownload}
      />
    </>
  );
}

function DownloadOption({
  icon: Icon,
  label,
  sublabel,
  price,
  locked,
  onClick,
  compact,
}: {
  icon: typeof FileDown;
  label: string;
  sublabel?: string;
  price: string;
  locked: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${
        locked
          ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
          : "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
      } ${compact ? "flex-1 items-center text-center" : ""}`}
    >
      <div className={`flex items-center gap-2 ${compact ? "flex-col" : ""}`}>
        <Icon className={`h-4 w-4 shrink-0 ${locked ? "text-amber-300" : "text-green-400"}`} />
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      {!compact && sublabel && (
        <span className="text-[11px] leading-snug text-text-muted">{sublabel}</span>
      )}
      <span className={`text-xs ${locked ? "text-amber-200/80" : "text-green-300"}`}>
        {locked ? price : "✓ " + (compact ? "" : "Unlocked")}
      </span>
    </button>
  );
}
