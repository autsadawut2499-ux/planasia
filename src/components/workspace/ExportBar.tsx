"use client";



import { useState } from "react";

import { FileDown, Lock, Download } from "lucide-react";

import { useApp } from "@/context/AppContext";

import { DocumentationExportButton } from "@/components/workspace/DocumentationExportButton";

import { ExportJobModal } from "@/components/workspace/ExportJobModal";

import { useExportJob } from "@/hooks/useExportJob";

import { PRICING } from "@/lib/geo/countries";

import { formatPrice } from "@/lib/i18n";

import type { DesignEditorState } from "@/lib/design/editor-types";

import type { PaymentState, ProjectInput, WorkflowStage } from "@/lib/ai/types";

import type { ExportJobFormat } from "@/lib/jobs/types";



interface ExportBarProps {

  project: ProjectInput;

  stage: WorkflowStage;

  payment: PaymentState;

  downloadTokens: { pdf?: string; cad?: string };

  onRequestPayment: (format: "pdf" | "cad") => void;

  editorState?: DesignEditorState | null;

  compact?: boolean;

}



export function ExportBar({

  project,

  stage,

  payment,

  downloadTokens,

  onRequestPayment,

  editorState,

  compact,

}: ExportBarProps) {

  const { locale, country, unitSystem, translate } = useApp();

  const { state: jobState, startExport, reset } = useExportJob();

  const [modalOpen, setModalOpen] = useState(false);

  const [activeFormat, setActiveFormat] = useState<ExportJobFormat>("pdf");



  const pdfPrice = PRICING.custom.pdf[String(project.floors) as "1" | "2"];

  const cadPrice = PRICING.custom.cad;



  const showExports = stage === "plans_preview" || stage === "unlocked";

  const showDocumentation = Boolean(editorState) && (stage === "render_ready" || showExports);

  if (!showExports && !showDocumentation) return null;



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



  const handleCloseModal = () => {

    setModalOpen(false);

    reset();

  };



  const formatLabel =

    activeFormat === "pdf" ? translate("workspace.exportPdf") : translate("workspace.exportCad");



  return (

    <>

      <div
        className={
          compact
            ? "flex shrink-0 flex-wrap items-center justify-center gap-2 px-4 pb-2"
            : "flex shrink-0 flex-wrap items-center gap-3 border-t border-border bg-surface-raised px-4 py-3"
        }
      >

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



      <ExportJobModal

        open={modalOpen}

        state={jobState}

        formatLabel={formatLabel}

        onClose={handleCloseModal}

        onDownload={handleDownload}

      />

    </>

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

