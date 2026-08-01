"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createEmptyMegaMenuCollection,
  MAX_MEGA_MENU_COLLECTIONS,
  type MegaMenuCollectionCard,
} from "@/lib/admin/mega-menu-collections";
import {
  AdminCard,
  AdminCheckbox,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

/**
 * Admin: manage Collections cards in the header dropdown + homepage section.
 */
export default function AdminMegaMenuCollectionsPage() {
  const [cards, setCards] = useState<MegaMenuCollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/mega-menu-collections")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "โหลดข้อมูลไม่สำเร็จ");
        return data as { cards?: MegaMenuCollectionCard[] };
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

  function updateCard(index: number, patch: Partial<MegaMenuCollectionCard>) {
    setCards((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addCard() {
    if (cards.length >= MAX_MEGA_MENU_COLLECTIONS) return;
    setCards((prev) => [...prev, createEmptyMegaMenuCollection()]);
  }

  function removeCard(index: number) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveAll() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/mega-menu-collections", {
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
          "บันทึกคอลเลกชันแล้ว — รีเฟรชหน้าแรกแล้วเปิดเมนู Collections เพื่อดูผล",
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
    return <p className="text-slate-500">กำลังโหลดการ์ดคอลเลกชัน…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="คอลเลกชันในเมนู (Collections)"
        description={`จัดการการ์ดคอลเลกชันในเมนูแบบเลื่อนลงและส่วนคอลเลกชันแนะนำบนหน้าแรก — อัปโหลดรูป แก้ไขชื่อ (EN/TH) ลิงก์ เพิ่ม/ลบ สูงสุด ${MAX_MEGA_MENU_COLLECTIONS} การ์ด`}
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {cards.length} / {MAX_MEGA_MENU_COLLECTIONS} การ์ด
          {" · "}
          แสดงในเมนู {cards.filter((c) => c.enabled).length} ใบ
          {" · "}
          หน้าแรกแสดง 4 การ์ดแรกที่เปิดใช้
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addCard}
            disabled={cards.length >= MAX_MEGA_MENU_COLLECTIONS}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            เพิ่มการ์ด
          </button>
          <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <AdminCard key={card.id} title={`การ์ด ${index + 1}`}>
            <div className="space-y-3">
              <ImageUploadField
                label="รูปภาพ"
                hint="แนะนำอัตราส่วน 4:3 กว้างอย่างน้อย 400px"
                value={card.imageUrl || null}
                onChange={(url) => updateCard(index, { imageUrl: url ?? "" })}
                category={`mega-collections/${card.id}`}
                previewClassName="h-28 w-full"
              />
              <AdminField label="ชื่อ (ภาษาอังกฤษ)">
                <AdminInput
                  value={card.titleEn}
                  onChange={(e) => updateCard(index, { titleEn: e.target.value })}
                />
              </AdminField>
              <AdminField label="ชื่อ (ภาษาไทย)">
                <AdminInput
                  value={card.titleTh}
                  onChange={(e) => updateCard(index, { titleTh: e.target.value })}
                />
              </AdminField>
              <AdminField label="ลิงก์" hint="เช่น /store?collection=single-storey">
                <AdminInput
                  value={card.href}
                  onChange={(e) => updateCard(index, { href: e.target.value })}
                />
              </AdminField>
              <div className="flex items-center justify-between gap-3 pt-1">
                <AdminCheckbox
                  label="แสดงในเมนู / หน้าแรก"
                  checked={card.enabled}
                  onChange={(v) => updateCard(index, { enabled: v })}
                />
                <button
                  type="button"
                  onClick={() => removeCard(index)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  ลบ
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
          ยังไม่มีการ์ด — กด «เพิ่มการ์ด» เพื่อเริ่มต้น
        </p>
      )}

      <div className="mt-8">
        <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
      </div>
    </div>
  );
}
