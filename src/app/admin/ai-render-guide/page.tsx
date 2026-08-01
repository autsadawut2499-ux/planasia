"use client";

import { useEffect, useState } from "react";
import {
  AdminCard,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
  AdminTextarea,
} from "@/components/admin/AdminForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { AiRenderGuide } from "@/lib/vendor/ai-render-guide";
import { defaultAiRenderGuide } from "@/lib/vendor/ai-render-guide";

/**
 * Admin: manage 5 prompt packs + 5 before/after house image sets
 * for the draftsman AI Rendering Guide.
 */
export default function AdminAiRenderGuidePage() {
  const [guide, setGuide] = useState<AiRenderGuide>(defaultAiRenderGuide());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/ai-render-guide")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "โหลดข้อมูลไม่สำเร็จ");
        return data as { guide?: AiRenderGuide };
      })
      .then((data) => {
        if (data.guide) setGuide(data.guide);
      })
      .catch((err) => {
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  function updatePrompt(index: number, patch: Partial<AiRenderGuide["prompts"][number]>) {
    setGuide((prev) => ({
      ...prev,
      prompts: prev.prompts.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateImage(index: number, patch: Partial<AiRenderGuide["images"][number]>) {
    setGuide((prev) => ({
      ...prev,
      images: prev.images.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  async function saveAll() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/ai-render-guide", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guide }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setGuide(data.guide);
      setStatus({
        type: "success",
        message:
          "บันทึกคู่มือ AI Rendering แล้ว — รีเฟรชแดชบอร์ดผู้เขียนแบบ (/dashboard/draftsman) เพื่อดูผล",
      });
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
    return <p className="text-slate-500">กำลังโหลดคู่มือ AI Rendering…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="คู่มือ AI Rendering Guide"
        description="จัดการ 5 ชุดแนวตั้ง: ชื่อชุด → Before/After → พร้อมพ์ต สำหรับแดชบอร์ดผู้เขียนแบบ — อัปโหลดรูปเก็บใน site-assets/ai-guide"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-6 flex justify-end">
        <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
      </div>

      <p className="mb-4 text-sm text-slate-500">
        แต่ละชุดรวมชื่อ · รูป Before/After · พร้อมพ์ต ไว้ด้วยกัน (เหมือนที่ผู้เขียนแบบเห็นในแดชบอร์ด)
      </p>

      <div className="space-y-6">
        {guide.prompts.map((prompt, index) => {
          const imageSet = guide.images[index];
          return (
            <AdminCard key={prompt.id} title={`ชุดที่ ${prompt.sortOrder}`}>
              <div className="space-y-4">
                <AdminField label="ชื่อชุด">
                  <AdminInput
                    value={prompt.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      updatePrompt(index, { title });
                      updateImage(index, { title });
                    }}
                    placeholder={`ชุดคำสั่ง ${prompt.sortOrder}`}
                  />
                </AdminField>

                {imageSet && (
                  <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <ImageUploadField
                        label="รูป Before (ก่อนเรนเดอร์)"
                        hint="ภาพต้นทาง / แบบเส้น / ภาพร่าง"
                        value={imageSet.beforeUrl || null}
                        onChange={(url) => updateImage(index, { beforeUrl: url ?? "" })}
                        category={`ai-guide/${imageSet.id}/before`}
                        previewClassName="h-36 w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <ImageUploadField
                        label="รูป After (หลังเรนเดอร์)"
                        hint="ภาพเรนเดอร์ AI ที่เสร็จแล้ว"
                        value={imageSet.afterUrl || null}
                        onChange={(url) => updateImage(index, { afterUrl: url ?? "" })}
                        category={`ai-guide/${imageSet.id}/after`}
                        previewClassName="h-36 w-full"
                      />
                    </div>
                  </div>
                )}

                <AdminField label="เนื้อหาพร้อมพ์ต (คัดลอกได้ในแดชบอร์ด)">
                  <AdminTextarea
                    rows={6}
                    value={prompt.content}
                    onChange={(e) => updatePrompt(index, { content: e.target.value })}
                    placeholder="วางพร้อมพ์ตสำหรับเครื่องมือ AI เรนเดอร์…"
                  />
                </AdminField>
              </div>
            </AdminCard>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
      </div>
    </div>
  );
}
