"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import type { SiteHeroSettings } from "@/lib/admin/defaults";
import { DEFAULT_SITE_SETTINGS } from "@/lib/admin/defaults";
import {
  AdminCard,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";

const FALLBACK_COVER = DEFAULT_SITE_SETTINGS.hero.backgroundImageUrl;

/**
 * Admin: manage the large homepage Hero cover image.
 * Stored in site_settings key `hero` → backgroundImageUrl (Supabase).
 * Files upload to the public `site-assets` bucket under `hero/…`.
 */
export default function AdminHeroCoverPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hero, setHero] = useState<SiteHeroSettings>(DEFAULT_SITE_SETTINGS.hero);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const coverUrl = hero.backgroundImageUrl?.trim() || "";
  const previewUrl = coverUrl || FALLBACK_COVER;
  const hasCustomCover = Boolean(coverUrl);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.hero) setHero(data.settings.hero);
      })
      .finally(() => setLoading(false));
  }, []);

  async function persist(next: SiteHeroSettings, successMessage: string) {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "hero", value: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setHero(next);
      setStatus({ type: "success", message: successMessage });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setStatus(null);
    const previousUrl = coverUrl;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "hero");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปโหลดไม่สำเร็จ");

      const next = { ...hero, backgroundImageUrl: data.publicUrl as string };
      await persist(next, "อัปโหลดและบันทึกภาพปก Hero เรียบร้อยแล้ว");

      // Best-effort cleanup of previous site-assets file
      if (previousUrl && previousUrl !== data.publicUrl) {
        void fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicUrl: previousUrl }),
        }).catch(() => undefined);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!hasCustomCover) {
      setStatus({ type: "error", message: "ยังไม่มีภาพปกที่กำหนดเองให้ลบ" });
      return;
    }
    if (!window.confirm("ลบภาพปก Hero ปัจจุบัน? เว็บจะกลับไปใช้ภาพเริ่มต้น")) {
      return;
    }

    const previousUrl = coverUrl;
    const next = { ...hero, backgroundImageUrl: "" };
    await persist(next, "ลบภาพปก Hero แล้ว — ใช้ภาพเริ่มต้นแทน");

    if (previousUrl) {
      void fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl: previousUrl }),
      }).catch(() => undefined);
    }
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลดภาพปก Hero…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="ภาพปกหน้าแรก (Hero Cover)"
        description="อัปโหลด เปลี่ยน หรือลบภาพปกขนาดใหญ่ในส่วน Hero ของหน้าแรก — แนะนำอัตราส่วนกว้างประมาณ 16:9 หรือ 21:9 ความกว้างอย่างน้อย 1920px"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <AdminCard title="ตัวอย่างภาพปก">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Hero cover preview"
              className="aspect-[21/9] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
            <div className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
              {hasCustomCover ? "ภาพที่อัปโหลด" : "ภาพเริ่มต้น (ยังไม่ได้กำหนดเอง)"}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {hasCustomCover ? (
                <Upload className="h-4 w-4" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {uploading
                ? "กำลังอัปโหลด…"
                : hasCustomCover
                  ? "เปลี่ยนภาพปก"
                  : "อัปโหลดภาพปก"}
            </button>

            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={!hasCustomCover || saving || uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              ลบภาพปก
            </button>

            <AdminSaveButton
              saving={saving}
              onClick={() =>
                void persist(hero, "บันทึกการตั้งค่าภาพปก Hero เรียบร้อยแล้ว")
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              หรือวาง URL รูปภาพ
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) =>
                setHero({ ...hero, backgroundImageUrl: e.target.value.trim() })
              }
              placeholder="https://…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500">
              หลังวาง URL ให้กด «บันทึก» — ถ้าเว้นว่าง หน้าแรกจะใช้ภาพเริ่มต้น
            </p>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
