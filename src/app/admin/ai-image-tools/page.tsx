"use client";

import { useEffect, useState } from "react";
import type { AiImageTool } from "@/lib/vendor/ai-image-tools";
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

/**
 * Admin: upload / replace preview images for the 3 vendor AI tool cards.
 */
export default function AdminAiImageToolsPage() {
  const [cards, setCards] = useState<AiImageTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/ai-image-tools")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "โหลดข้อมูลไม่สำเร็จ");
        return data as { cards?: AiImageTool[] };
      })
      .then((data) => {
        if (data.cards) setCards(data.cards);
      })
      .catch((err) => {
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  function updateCard(index: number, patch: Partial<AiImageTool>) {
    setCards((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function saveAll() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/ai-image-tools", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setCards(data.cards);
      setStatus({
        type: "success",
        message:
          "บันทึกรูปการ์ด AI แล้ว — รีเฟรชแดชบอร์ดผู้เขียนแบบ (/dashboard/draftsman) เพื่อดูผล",
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
    return <p className="text-slate-500">กำลังโหลดการ์ดเครื่องมือ AI…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="รูปการ์ดเครื่องมือ AI"
        description="อัปโหลดหรือเปลี่ยนภาพพื้นหลังของการ์ด Google Flow · Midjourney · Adobe Firefly ในแดชบอร์ดผู้เขียนแบบ"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-6 flex justify-end">
        <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map((card, index) => (
          <AdminCard key={card.id} title={card.name}>
            <div className="space-y-3">
              <ImageUploadField
                label="ภาพพื้นหลังการ์ด"
                hint="แนะนำอัตราส่วนแนวนอน ~16:10 กว้างอย่างน้อย 900px"
                value={card.previewImage || null}
                onChange={(url) => updateCard(index, { previewImage: url ?? "" })}
                category={`ai-tools/${card.id}`}
                previewClassName="h-36 w-full"
              />
              <AdminField label="ชื่อบนการ์ด">
                <AdminInput
                  value={card.name}
                  onChange={(e) => updateCard(index, { name: e.target.value })}
                />
              </AdminField>
              <AdminField label="คำอธิบายสั้น">
                <AdminTextarea
                  rows={2}
                  value={card.purpose}
                  onChange={(e) => updateCard(index, { purpose: e.target.value })}
                />
              </AdminField>
              <AdminField label="ลิงก์ปลายทาง" hint="เปิดแท็บใหม่เมื่อคลิกการ์ด">
                <AdminInput
                  value={card.href}
                  onChange={(e) => updateCard(index, { href: e.target.value })}
                />
              </AdminField>
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
      </div>
    </div>
  );
}
