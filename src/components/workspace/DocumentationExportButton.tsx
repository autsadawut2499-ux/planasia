"use client";

import { FileText } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DocumentationPreviewModal } from "@/components/workspace/DocumentationPreviewModal";
import type { ProjectInput } from "@/lib/ai/types";
import type { DesignEditorState } from "@/lib/design/editor-types";

interface DocumentationExportButtonProps {
  project: ProjectInput;
  editorState: DesignEditorState;
  variant?: "bar" | "ghost";
  className?: string;
}

export function DocumentationExportButton({
  project,
  editorState,
  variant = "bar",
  className = "",
}: DocumentationExportButtonProps) {
  const { translate } = useApp();
  const [open, setOpen] = useState(false);

  const modal = (
    <DocumentationPreviewModal
      open={open}
      onClose={() => setOpen(false)}
      project={project}
      editorState={editorState}
    />
  );

  if (variant === "ghost") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`btn-ghost glass-card gap-1.5 text-xs ${className}`}
        >
          <FileText className="h-3.5 w-3.5" />
          {translate("editor.exportDocumentation")}
        </button>
        {modal}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 ${className}`}
      >
        <FileText className="h-4 w-4" />
        <span>{translate("editor.exportDocumentation")}</span>
      </button>
      {modal}
    </>
  );
}
