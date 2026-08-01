"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Upload, X } from "lucide-react";
import { AdminField } from "./AdminForm";

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  /** Fires only after a successful file upload (not URL typing). */
  onUploaded?: (url: string) => void;
  /** Fires when the clear (X) button is pressed. */
  onCleared?: (previousUrl: string | null) => void;
  category?: string;
  /**
   * When true (default), clearing the preview also DELETEs the file from site-assets.
   * Set false when the parent persists first, then cleans up storage itself.
   */
  deleteFromStorageOnClear?: boolean;
  /** Larger preview for logos / banners. */
  previewClassName?: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Admin image picker — uploads via multipart FormData to /api/admin/upload.
 * The browser sets Content-Type: multipart/form-data (with boundary) automatically
 * when the request body is a FormData instance (do not set that header manually).
 */
export function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  onUploaded,
  onCleared,
  category = "general",
  deleteFromStorageOnClear = true,
  previewClassName = "h-24 w-24",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setSuccess(null);

    if (file.size <= 0) {
      setError("ไฟล์ว่างเปล่า");
      setUploading(false);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`ไฟล์ใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) — สูงสุด 10MB`);
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — fetch will set multipart/form-data + boundary.
      });

      let data: { error?: string; publicUrl?: string } = {};
      try {
        data = (await res.json()) as { error?: string; publicUrl?: string };
      } catch {
        throw new Error(`อัปโหลดล้มเหลว (HTTP ${res.status}) — ตอบกลับไม่ใช่ JSON`);
      }

      if (!res.ok) {
        throw new Error(data.error ?? `อัปโหลดไม่สำเร็จ (HTTP ${res.status})`);
      }
      if (!data.publicUrl) {
        throw new Error("อัปโหลดสำเร็จแต่ไม่ได้รับ publicUrl จากเซิร์ฟเวอร์");
      }

      onChange(data.publicUrl);
      onUploaded?.(data.publicUrl);
      setSuccess("อัปโหลดรูปสำเร็จ");
      window.setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      console.error("[ImageUploadField]", err);
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleClear() {
    const prev = value;
    onChange(null);
    onCleared?.(prev);
    setSuccess(null);
    setError(null);
    if (deleteFromStorageOnClear && prev) {
      void fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl: prev }),
      }).catch(() => undefined);
    }
  }

  // Full-width previews must stack vertically — side-by-side flex pushes the
  // upload button outside the card (esp. in 2-column Before/After grids).
  const widePreview = /\bw-full\b/.test(previewClassName);

  return (
    <AdminField label={label} hint={hint}>
      <div
        className={
          widePreview
            ? "flex min-w-0 flex-col gap-3"
            : "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start"
        }
      >
        {value ? (
          <div
            className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 ${widePreview ? "" : "shrink-0"} ${previewClassName}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={value}
              src={value}
              alt=""
              className="h-full w-full object-contain p-1.5"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-slate-500 shadow hover:text-red-600"
              aria-label="ลบรูปภาพ"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 ${widePreview ? "" : "shrink-0"} ${previewClassName}`}
          >
            <Upload className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/jpg,.jpg,.jpeg,.png,.webp,.gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {uploading ? "กำลังอัปโหลด…" : value ? "เปลี่ยนรูปภาพ" : "อัปโหลดรูปภาพ"}
          </button>
          <input
            type="url"
            value={value ?? ""}
            onChange={(e) => {
              setSuccess(null);
              onChange(e.target.value || null);
            }}
            placeholder="หรือวาง URL รูปภาพ"
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {success}
            </p>
          )}
        </div>
      </div>
    </AdminField>
  );
}
