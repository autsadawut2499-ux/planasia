"use client";

import { useEffect, useState } from "react";
import type { CuratedStyleItem } from "@/lib/admin/curated-styles";
import type { Locale } from "@/lib/geo/countries";
import {
  AdminCard,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const LOCALES: { code: Locale; label: string }[] = [{ code: "th", label: "ไทย" }];

export default function AdminGalleryPage() {
  const [styles, setStyles] = useState<CuratedStyleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/curated-styles")
      .then((r) => r.json())
      .then((data) => {
        if (data.styles) setStyles(data.styles);
      })
      .finally(() => setLoading(false));
  }, []);

  function updateStyle(index: number, patch: Partial<CuratedStyleItem>) {
    setStyles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function updateCaption(index: number, locale: Locale, value: string) {
    setStyles((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, caption: { ...item.caption, [locale]: value } }
          : item,
      ),
    );
  }

  async function saveAll() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/curated-styles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styles }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setStyles(data.styles);
      setStatus({ type: "success", message: "บันทึกสไตล์แนะนำแล้ว — รีเฟรชหน้าแรกเพื่อดูการเปลี่ยนแปลง" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลดแกลเลอรี…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="สไตล์แนะนำ"
        description="จัดการรูปภาพและคำบรรยายในแกลเลอรีสไตล์บนหน้าแรก"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">{styles.length} สไตล์</p>
        <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {styles.map((style, index) => (
          <AdminCard key={style.id} title={style.id}>
            <div className="space-y-4">
              <ImageUploadField
                label="รูปแกลเลอรี"
                value={style.imageUrl}
                onChange={(url) => updateStyle(index, { imageUrl: url ?? "" })}
                category={`gallery/${style.id}`}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {LOCALES.map(({ code, label }) => (
                  <AdminField key={code} label={`คำบรรยาย (${label})`}>
                    <AdminInput
                      value={style.caption[code] ?? ""}
                      onChange={(e) => updateCaption(index, code, e.target.value)}
                      placeholder={style.caption.en ?? style.id}
                    />
                  </AdminField>
                ))}
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="mt-8">
        <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
      </div>
    </div>
  );
}
