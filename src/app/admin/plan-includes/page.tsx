"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  AdminCard,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
  AdminTextarea,
} from "@/components/admin/AdminForm";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  DEFAULT_PLAN_INCLUDES,
  PLAN_INCLUDES_MAX_IMAGES,
  type PlanIncludesContent,
} from "@/lib/content/plan-includes";

export default function AdminPlanIncludesPage() {
  const [content, setContent] = useState<PlanIncludesContent>(DEFAULT_PLAN_INCLUDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/plan-includes", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { content?: PlanIncludesContent }) => {
        if (data.content) setContent(data.content);
      })
      .catch(() => setStatus({ type: "error", message: "โหลดข้อมูลไม่สำเร็จ" }))
      .finally(() => setLoading(false));
  }, []);

  function setLocaleField(
    field: "title" | "intro" | "body",
    locale: "th" | "en",
    value: string,
  ) {
    setContent((c) => ({
      ...c,
      [field]: { ...c[field], [locale]: value },
    }));
  }

  function setImageAt(index: number, url: string | null) {
    setContent((c) => {
      const images = [...c.images];
      if (!url) {
        images.splice(index, 1);
      } else {
        images[index] = url;
      }
      return { ...c, images: images.filter(Boolean).slice(0, PLAN_INCLUDES_MAX_IMAGES) };
    });
  }

  function addImageSlot() {
    setContent((c) => {
      if (c.images.length >= PLAN_INCLUDES_MAX_IMAGES) return c;
      return { ...c, images: [...c.images, ""] };
    });
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const payload: PlanIncludesContent = {
        ...content,
        images: content.images.map((u) => u.trim()).filter(Boolean).slice(0, PLAN_INCLUDES_MAX_IMAGES),
      };
      const res = await fetch("/api/admin/plan-includes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setContent(data.content);
      setStatus({ type: "success", message: "บันทึกเรียบร้อยแล้ว" });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลด…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="แบบประกอบด้วยอะไรบ้าง"
        description={`แก้ไขบทความและอัปโหลดรูปตัวอย่าง (สูงสุด ${PLAN_INCLUDES_MAX_IMAGES} รูป) สำหรับหน้า /whats-included — คลิกภาพบนหน้าเว็บจะขยายได้`}
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-6 flex justify-end">
        <AdminSaveButton saving={saving} onClick={save} label="บันทึกทั้งหมด" />
      </div>

      <div className="space-y-6">
        <AdminCard title="หัวข้อและคำโปรย">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="หัวข้อ (ไทย)">
              <AdminInput
                value={content.title.th}
                onChange={(e) => setLocaleField("title", "th", e.target.value)}
              />
            </AdminField>
            <AdminField label="Title (English)">
              <AdminInput
                value={content.title.en}
                onChange={(e) => setLocaleField("title", "en", e.target.value)}
              />
            </AdminField>
            <AdminField label="คำโปรย (ไทย)">
              <AdminTextarea
                rows={3}
                value={content.intro.th}
                onChange={(e) => setLocaleField("intro", "th", e.target.value)}
              />
            </AdminField>
            <AdminField label="Intro (English)">
              <AdminTextarea
                rows={3}
                value={content.intro.en}
                onChange={(e) => setLocaleField("intro", "en", e.target.value)}
              />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard title="เนื้อหาบทความ">
          <p className="mb-3 text-xs text-slate-500">
            Rich Text Editor — ตัวหนา · ตัวเอียง · หัวข้อ · รายการ · ลิงก์
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <AdminField label="เนื้อหา (ไทย)">
              <AdminRichTextEditor
                key="plan-includes-body-th"
                value={content.body.th}
                onChange={(html) => setLocaleField("body", "th", html)}
                placeholder="เขียนเนื้อหาภาษาไทย…"
                minHeightClass="min-h-[280px]"
              />
            </AdminField>
            <AdminField label="Body (English)">
              <AdminRichTextEditor
                key="plan-includes-body-en"
                value={content.body.en}
                onChange={(html) => setLocaleField("body", "en", html)}
                placeholder="Write the English body…"
                minHeightClass="min-h-[280px]"
              />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard title={`รูปแปลนคร่าวๆ (${content.images.filter(Boolean).length}/${PLAN_INCLUDES_MAX_IMAGES})`}>
          <p className="mb-4 text-xs text-slate-500">
            อัปโหลดได้สูงสุด {PLAN_INCLUDES_MAX_IMAGES} รูป — แสดงเป็นกริดแนวตั้งบนหน้าบทความ
          </p>
          <div className="space-y-6">
            {content.images.map((url, index) => (
              <div key={index} className="relative rounded-xl border border-slate-200 p-4">
                <button
                  type="button"
                  onClick={() => setImageAt(index, null)}
                  className="absolute right-3 top-3 rounded-full bg-white p-1 text-slate-400 shadow hover:text-red-600"
                  aria-label="ลบรูป"
                >
                  <X className="h-4 w-4" />
                </button>
                <ImageUploadField
                  label={`รูปที่ ${index + 1}`}
                  value={url || null}
                  onChange={(next) => setImageAt(index, next)}
                  category={`plan-includes/${index + 1}`}
                />
              </div>
            ))}
          </div>

          {content.images.length < PLAN_INCLUDES_MAX_IMAGES && (
            <button
              type="button"
              onClick={addImageSlot}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-[#1e40af] hover:text-[#1e40af]"
            >
              <Plus className="h-4 w-4" />
              เพิ่มช่องอัปโหลดรูป
            </button>
          )}
        </AdminCard>
      </div>

      <div className="mt-8 flex justify-end">
        <AdminSaveButton saving={saving} onClick={save} label="บันทึกทั้งหมด" />
      </div>
    </div>
  );
}
