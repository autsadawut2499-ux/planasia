"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import type { UploadKind } from "@/hooks/useVendorDashboard";
import { SITE_ASSETS_DOC_MAX_BYTES, formatMb } from "@/lib/supabase/site-assets";

interface MultiFileUploadProps {
  kind: UploadKind;
  /** Document uploads accept PDF only (blueprints + BOQ). */
  variant: "pdf" | "doc";
  values: string[];
  onChange: (urls: string[]) => void;
  onUpload: (file: File, kind: UploadKind) => Promise<string>;
  onError?: (message: string) => void;
  label: string;
  hint?: string;
}

/** `.pdf` helps Windows file pickers; MIME alone is often ignored. */
const ACCEPT: Record<"pdf" | "doc", string> = {
  pdf: ".pdf,application/pdf",
  doc: ".pdf,application/pdf",
};

const DOC_MAX_MB = formatMb(SITE_ASSETS_DOC_MAX_BYTES);

/** Best-effort display name from a storage url. */
function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1)) || url;
  } catch {
    return url;
  }
}

/**
 * Unlimited document uploader: every file is listed with its own remove action
 * and a persistent "add more" control, so vendors can keep attaching drawings.
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
  const [busyCount, setBusyCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;

    setBusyCount(list.length);
    const uploaded: string[] = [];
    for (const file of list) {
      try {
        const name = file.name.toLowerCase();
        const isPdf =
          file.type === "application/pdf" ||
          file.type === "application/x-pdf" ||
          name.endsWith(".pdf");
        if (!isPdf) {
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
        uploaded.push(await onUpload(file, kind));
      } catch (err) {
        onError?.(
          `${file.name}: ${err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ"}`,
        );
      } finally {
        setBusyCount((n) => Math.max(0, n - 1));
      }
    }
    if (uploaded.length > 0) {
      onChange([...values, ...uploaded.filter((u) => !values.includes(u))]);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-text-secondary">{label}</label>
        <span className="text-[11px] text-text-muted">
          {values.length > 0 ? `${values.length} ไฟล์` : "ไม่จำกัดจำนวน"}
        </span>
      </div>

      {values.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {values.map((url, index) => (
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
              {index === 0 && (
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#1e40af]">
                  ไฟล์หลัก
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(values.filter((u) => u !== url))}
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
        disabled={busyCount > 0}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-xs font-semibold transition disabled:cursor-wait ${
          dragOver
            ? "border-[#1e40af] bg-blue-50 text-[#1e40af]"
            : "border-border bg-surface-raised text-text-secondary hover:border-[#1e40af]/50 hover:text-[#1e40af]"
        }`}
      >
        {busyCount > 0 ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังอัปโหลด… ({busyCount})
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            {values.length > 0 ? "เพิ่มไฟล์อีก" : "เลือกไฟล์ หรือลากมาวาง"}
          </>
        )}
      </button>

      {hint && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT[variant]}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
