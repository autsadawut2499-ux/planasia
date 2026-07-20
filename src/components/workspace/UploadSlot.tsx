"use client";

import {
  Upload,
  X,
  CheckCircle2,
  ImageIcon,
  FileText,
  Map,
  Box,
  Layers,
  Loader2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

type SlotIcon = "site" | "elevation" | "3d" | "floor" | "default";

interface UploadSlotProps {
  label: string;
  hint: string;
  tooltip?: string;
  required?: boolean;
  accept?: string;
  fileName?: string | null;
  previewUrl?: string | null;
  error?: string | null;
  loading?: boolean;
  onFile: (file: File | null) => void;
  icon?: SlotIcon;
  slotIndex?: number;
}

const ICONS: Record<SlotIcon, typeof Upload> = {
  site: Map,
  elevation: FileText,
  "3d": Box,
  floor: Layers,
  default: ImageIcon,
};

export function UploadSlot({
  label,
  hint,
  tooltip,
  required,
  accept = "image/*,.pdf,.dwg",
  fileName,
  previewUrl,
  error,
  loading,
  onFile,
  icon = "default",
  slotIndex,
}: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hasFile = Boolean(fileName);
  const Icon = ICONS[icon];
  const isImagePreview = previewUrl?.startsWith("data:image");

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (loading) return;
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile, loading],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!loading) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`upload-zone group relative ${dragging ? "upload-zone-drag" : ""} ${hasFile && !error && !loading ? "upload-zone-done" : ""} ${error ? "border-red-500/50 bg-red-500/5" : ""} ${loading ? "border-indigo-500/40" : ""}`}
    >
      {hasFile && isImagePreview && !loading && (
        <div className="absolute inset-0 opacity-20">
          <img src={previewUrl!} alt="" className="h-full w-full object-cover blur-sm" />
        </div>
      )}

      <div className="relative p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                loading
                  ? "bg-indigo-500/15 text-indigo-400"
                  : hasFile
                    ? "bg-green-500/15 text-green-400"
                    : "bg-accent/10 text-accent group-hover:bg-accent/20"
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : hasFile ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Icon className="h-5 w-5 opacity-60" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-text-primary">
                  {slotIndex != null ? `${label} ${slotIndex + 1}` : label}
                  {required && <span className="ml-1 text-red-400">*</span>}
                </p>
                {tooltip && <Tooltip content={tooltip} />}
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-text-muted">{hint}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              <span className="text-xs text-indigo-300">Processing upload…</span>
            </div>
            <div className="space-y-2">
              <div className="skeleton-shimmer h-3 rounded-full" />
              <div className="skeleton-shimmer h-3 w-2/3 rounded-full" />
            </div>
          </div>
        ) : hasFile ? (
          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-black/30 p-3 backdrop-blur-sm">
            {isImagePreview ? (
              <img
                src={previewUrl!}
                alt={fileName ?? "Preview"}
                className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <FileText className="h-5 w-5 text-text-muted" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-green-300">{fileName}</p>
              <p className="text-[10px] text-green-400/70">Uploaded successfully</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/10 hover:text-red-400"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 py-8 transition-colors hover:border-accent/40 hover:bg-accent/5"
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/5" />
              <Icon className="relative h-6 w-6 text-text-muted/50" strokeWidth={1.5} />
              <Upload className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent/20 p-0.5 text-accent" />
            </div>
            <div className="text-center">
              <span className="text-xs text-text-secondary">
                Drag & drop or <span className="text-accent">browse</span>
              </span>
              <p className="mt-1 text-[10px] text-text-muted">PDF, DWG, JPG, PNG</p>
            </div>
          </button>
        )}

        {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={loading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}
