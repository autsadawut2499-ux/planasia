"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { displayAssetUrl } from "@/lib/assets/display-url";
import type { UploadKind } from "@/hooks/useVendorDashboard";

interface FileUploadProps {
  kind: UploadKind;
  onUpload: (file: File, kind: UploadKind) => Promise<string>;
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
  value?: string;
  variant?: "avatar" | "image" | "pdf" | "doc";
  label?: string;
  hint?: string;
  onClear?: () => void;
}

export function FileUpload({
  kind,
  onUpload,
  onUploaded,
  onError,
  value,
  variant = "image",
  label,
  hint,
  onClear,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const previewSrc = value ? displayAssetUrl(value) : "";

  const accept =
    variant === "pdf" || variant === "doc"
      ? ".pdf,application/pdf"
      : "image/png,image/jpeg,image/webp,image/gif";
  const isFileVariant = variant === "pdf" || variant === "doc";

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (isFileVariant) {
      const name = file.name.toLowerCase();
      const isPdf =
        file.type === "application/pdf" ||
        file.type === "application/x-pdf" ||
        name.endsWith(".pdf");
      if (!isPdf) {
        onError?.("อัปโหลดได้เฉพาะไฟล์ PDF (.pdf)");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        onError?.(
          `ไฟล์ใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) — สูงสุด 100MB`,
        );
        return;
      }
    } else {
      // KYC / gallery images — reject PDFs even if the picker allowed them.
      const name = file.name.toLowerCase();
      const isImage =
        file.type.startsWith("image/") ||
        /\.(jpe?g|png|webp|gif)$/i.test(name);
      if (!isImage || name.endsWith(".pdf")) {
        onError?.("อัปโหลดได้เฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP, GIF)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        onError?.(
          `ไฟล์ใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) — สูงสุด 10MB`,
        );
        return;
      }
    }
    setBusy(true);
    try {
      const url = await onUpload(file, kind);
      onUploaded(url); // real-time: caller updates preview state immediately
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-border bg-surface-raised"
        >
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-text-muted">
              <Upload className="h-6 w-6" />
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "เปลี่ยนรูป"}
          </span>
        </button>
        <div>
          {label && <p className="text-sm font-semibold text-text-primary">{label}</p>}
          {hint && <p className="mt-0.5 text-xs text-text-muted">{hint}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div>
      {label && <label className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition ${
          dragOver ? "border-[#1e40af] bg-blue-50" : "border-border bg-surface-raised hover:border-[#1e40af]/50"
        }`}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-[#1e40af]" />
        ) : isFileVariant && value ? (
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <FileText className="h-5 w-5 text-red-500" />
            <span className="max-w-[220px] truncate">อัปโหลดไฟล์แล้ว</span>
          </div>
        ) : previewSrc && variant === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="preview" className="max-h-40 w-full rounded-lg object-cover" />
        ) : (
          <>
            {isFileVariant ? (
              <FileText className="h-6 w-6 text-text-muted" />
            ) : (
              <Upload className="h-6 w-6 text-text-muted" />
            )}
            <span className="text-xs text-text-muted">{hint ?? "ลากไฟล์มาวาง หรือคลิกเพื่อเลือก"}</span>
          </>
        )}
        {value && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-text-muted shadow hover:text-red-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
