"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Plus, Replace, Trash2 } from "lucide-react";
import type { UploadKind } from "@/hooks/useVendorDashboard";
import { SITE_ASSETS_DOC_MAX_BYTES, formatMb } from "@/lib/supabase/site-assets";
import { looksLikeDwg, looksLikePdf } from "@/lib/uploads/mime";

type DocVariant = "pdf" | "doc" | "cad" | "calc";

interface MultiFileUploadProps {
  kind: UploadKind;
  /** pdf/doc/calc = PDF only; cad = DWG only. Exactly 1 file per field. */
  variant: DocVariant;
  values: string[];
  onChange: (urls: string[]) => void;
  onUpload: (file: File, kind: UploadKind) => Promise<string>;
  onError?: (message: string) => void;
  label: string;
  hint?: string;
}

/** Exactly one file per delivery-document field. */
const MAX_FILES = 1;

const ACCEPT: Record<DocVariant, string> = {
  pdf: ".pdf,application/pdf",
  doc: ".pdf,application/pdf",
  cad: ".dwg,application/acad,application/x-dwg,application/dwg,image/vnd.dwg",
  calc: ".pdf,application/pdf",
};

const TYPE_HINT: Record<DocVariant, string> = {
  pdf: ".pdf เท่านั้น · 1 ไฟล์",
  doc: ".pdf เท่านั้น · 1 ไฟล์",
  cad: ".dwg เท่านั้น · 1 ไฟล์",
  calc: ".pdf เท่านั้น · 1 ไฟล์",
};

const DOC_MAX_MB = formatMb(SITE_ASSETS_DOC_MAX_BYTES);

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1)) || url;
  } catch {
    return url;
  }
}

function validateFile(file: File, variant: DocVariant): void {
  if (variant === "cad") {
    if (!looksLikeDwg(file)) {
      throw new Error("อัปโหลดได้เฉพาะไฟล์ AutoCAD (.dwg)");
    }
  } else if (!looksLikePdf(file)) {
    throw new Error("อัปโหลดได้เฉพาะไฟล์ PDF (.pdf)");
  }
  if (file.size > SITE_ASSETS_DOC_MAX_BYTES) {
    throw new Error(
      `ไฟล์ใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) — สูงสุด ${DOC_MAX_MB}MB`,
    );
  }
  if (file.size <= 0) {
    throw new Error("ไฟล์ว่างเปล่า");
  }
}

/**
 * Single-file document uploader for blueprint / CAD / BOQ / calc.
 * Replaces any existing file; never accumulates unlimited uploads.
 */
export function MultiFileUpload({
  kind,
  variant,
  values,
  onChange,
  onUpload,
  onError,
  label,
  hint,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Enforce UI contract even if parent state still holds legacy multi-file rows.
  const current = values.slice(0, MAX_FILES);
  const hasFile = current.length >= MAX_FILES;

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      validateFile(file, variant);
      const url = await onUpload(file, kind);
      onChange([url]);
    } catch (err) {
      onError?.(
        `${file.name}: ${err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ"}`,
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-text-secondary">{label}</label>
        <span className="text-[11px] text-text-muted">{TYPE_HINT[variant]}</span>
      </div>

      {current.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {current.map((url) => (
            <li
              key={url}
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-red-500" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-xs font-medium text-text-primary hover:text-[#1e40af] hover:underline"
              >
                {fileNameFromUrl(url)}
              </a>
              <button
                type="button"
                onClick={() => onChange([])}
                className="shrink-0 rounded p-1 text-text-muted transition hover:bg-red-50 hover:text-red-500"
                aria-label={`ลบ ${fileNameFromUrl(url)}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        disabled={busy}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-xs font-semibold transition disabled:cursor-wait ${
          dragOver
            ? "border-[#1e40af] bg-blue-50 text-[#1e40af]"
            : "border-border bg-surface-raised text-text-secondary hover:border-[#1e40af]/50 hover:text-[#1e40af]"
        }`}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังอัปโหลด…
          </>
        ) : hasFile ? (
          <>
            <Replace className="h-4 w-4" />
            แทนที่ไฟล์
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            เลือกไฟล์ หรือลากมาวาง
          </>
        )}
      </button>

      {hint && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[variant]}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
