"use client";

import { Upload, X, ImageIcon, FileText, Map, Box, Layers, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { MAX_UPLOAD_FILES_PER_SLOT, type UploadedFileRef } from "@/lib/ai/types";
import { Tooltip } from "@/components/ui/Tooltip";

type SlotIcon = "site" | "elevation" | "3d" | "floor" | "default";

interface UploadSlotProps {
  label: string;
  hint: string;
  tooltip?: string;
  required?: boolean;
  accept?: string;
  files: UploadedFileRef[];
  maxFiles?: number;
  error?: string | null;
  loading?: boolean;
  onAdd: (files: File[]) => void | Promise<void>;
  onRemove: (index: number) => void;
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
  files,
  maxFiles = MAX_UPLOAD_FILES_PER_SLOT,
  error,
  loading,
  onAdd,
  onRemove,
  icon = "default",
  slotIndex,
}: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hasFiles = files.length > 0;
  const canAddMore = files.length < maxFiles;
  const Icon = ICONS[icon];
  const title = slotIndex != null ? `${label} ${slotIndex + 1}` : label;

  const ingest = useCallback(
    (list: FileList | File[]) => {
      if (loading || !canAddMore) return;
      const picked = Array.from(list).slice(0, maxFiles - files.length);
      if (picked.length > 0) void onAdd(picked);
    },
    [canAddMore, files.length, loading, maxFiles, onAdd],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      ingest(e.dataTransfer.files);
    },
    [ingest],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!loading && canAddMore) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-md border transition-colors ${
        error
          ? "border-red-500/50 bg-red-500/5"
          : dragging
            ? "border-indigo-400/50 bg-indigo-500/10"
            : hasFiles
              ? "border-green-500/25 bg-[#252525]"
              : "border-white/12 bg-[#252525]"
      }`}
    >
      <div className="flex min-h-[30px] items-center gap-2 px-2 py-1">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${
            loading
              ? "bg-indigo-500/15 text-indigo-400"
              : hasFiles
                ? "bg-green-500/15 text-green-400"
                : "bg-white/5 text-white/45"
          }`}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-[11px] font-medium text-white/90">
              {title}
              {required && <span className="text-red-400"> *</span>}
            </p>
            {tooltip ? <Tooltip content={tooltip} /> : null}
          </div>
          {!hasFiles && !loading ? (
            <p className="truncate text-[10px] text-white/35">{hint}</p>
          ) : null}
        </div>

        {hasFiles ? (
          <div className="flex shrink-0 items-center gap-1">
            {files.map((file, i) => {
              const isImage = file.dataUrl.startsWith("data:image");
              return (
                <div key={`${file.name}-${i}`} className="group/thumb relative">
                  {isImage ? (
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      className="h-6 w-6 rounded object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white/5 ring-1 ring-white/10">
                      <FileText className="h-3 w-3 text-white/50" />
                    </div>
                  )}
                  {!loading ? (
                    <button
                      type="button"
                      onClick={() => onRemove(i)}
                      className="absolute -right-1 -top-1 hidden rounded-full bg-red-500/90 p-0.5 text-white group-hover/thumb:block"
                      aria-label="Remove file"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  ) : null}
                </div>
              );
            })}
            {canAddMore && !loading ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-white/15 text-white/40 hover:border-indigo-400/40 hover:text-indigo-300"
                aria-label="Add file"
              >
                <Upload className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        ) : loading ? (
          <span className="shrink-0 text-[10px] text-indigo-300/80">…</span>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded border border-white/12 px-2 py-0.5 text-[10px] text-indigo-300 hover:bg-white/5"
          >
            <Upload className="mr-0.5 inline h-3 w-3" />
          </button>
        )}
      </div>

      {error ? <p className="px-2 pb-1 text-[10px] text-red-400">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        disabled={loading || !canAddMore}
        onChange={(e) => {
          if (e.target.files) ingest(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
