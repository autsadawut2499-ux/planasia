"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createEmptyPopularHighlight,
  MAX_POPULAR_HIGHLIGHTS,
  type PopularHighlightCard,
} from "@/lib/admin/popular-highlights";
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

export default function AdminPopularPage() {
  const [cards, setCards] = useState<PopularHighlightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  /** Always mirror latest cards for auto-save after upload (avoids stale closures). */
  const cardsRef = useRef<PopularHighlightCard[]>([]);
  cardsRef.current = cards;

  useEffect(() => {
    fetch("/api/admin/popular-highlights", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "โหลดข้อมูลไม่สำเร็จ");
        return data as { cards?: PopularHighlightCard[] };
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

  function updateCard(index: number, patch: Partial<PopularHighlightCard>) {
    setCards((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addCard() {
    if (cards.length >= MAX_POPULAR_HIGHLIGHTS) return;
    setCards((prev) => [...prev, createEmptyPopularHighlight()]);
  }

  function removeCard(index: number) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  async function persistCards(
    nextCards: PopularHighlightCard[],
    successMessage: string,
  ): Promise<boolean> {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/popular-highlights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: nextCards }),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setCards(data.cards);
      setStatus({ type: "success", message: successMessage });
      return true;
    } catch (err) {
      console.error("[admin/popular] save failed", err);
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    await persistCards(
      cardsRef.current,
      "บันทึกการ์ดแบบบ้านยอดนิยมแล้ว — รีเฟรชหน้าแรกเพื่อดูการเปลี่ยนแปลง",
    );
  }

  /** Persist immediately after a successful upload so the homepage picks up the new URL. */
  async function handleImageUploaded(index: number, url: string) {
    const next = cardsRef.current.map((item, i) =>
      i === index ? { ...item, imageUrl: url } : item,
    );
    cardsRef.current = next;
    setCards(next);
    await persistCards(
      next,
      "อัปโหลดและบันทึกรูปการ์ดแล้ว — รีเฟรชหน้าแรกเพื่อดูภาพใหม่",
    );
  }

  if (loading) {
    return <p className="text-slate-500">กำลังโหลดการ์ดยอดนิยม…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="แบบบ้านยอดนิยม"
        description={`จัดการการ์ดหัวข้อบนหน้าแรก สูงสุด ${MAX_POPULAR_HIGHLIGHTS} ใบ — อัปโหลดรูปแล้วระบบบันทึกลงฐานข้อมูลทันที`}
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {cards.length} / {MAX_POPULAR_HIGHLIGHTS} การ์ด
          {" · "}
          แสดงบนหน้าแรก {cards.filter((c) => c.enabled).length} ใบ
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addCard}
            disabled={cards.length >= MAX_POPULAR_HIGHLIGHTS}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            เพิ่มการ์ด
          </button>
          <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((card, index) => (
          <AdminCard key={card.id} title={`การ์ด ${index + 1}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={card.enabled}
                    onChange={(e) => updateCard(index, { enabled: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  แสดงบนหน้าแรก
                </label>
                <button
                  type="button"
                  onClick={() => removeCard(index)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  ลบ
                </button>
              </div>

              <ImageUploadField
                label="รูปภาพการ์ด"
                hint="JPG / PNG / WEBP สูงสุด 10MB — อัปโหลดแล้วบันทึกอัตโนมัติ"
                value={card.imageUrl || null}
                onChange={(url) => updateCard(index, { imageUrl: url ?? "" })}
                onUploaded={(url) => void handleImageUploaded(index, url)}
                category={`popular/${card.id}`}
                previewClassName="h-36 w-full"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="หัวข้อ (ไทย)">
                  <AdminInput
                    value={card.titleTh}
                    onChange={(e) => updateCard(index, { titleTh: e.target.value })}
                  />
                </AdminField>
                <AdminField label="หัวข้อ (EN)">
                  <AdminInput
                    value={card.titleEn}
                    onChange={(e) => updateCard(index, { titleEn: e.target.value })}
                  />
                </AdminField>
              </div>

              <AdminField label="รายละเอียด (ไทย)">
                <AdminTextarea
                  value={card.descriptionTh}
                  onChange={(e) => updateCard(index, { descriptionTh: e.target.value })}
                  rows={2}
                />
              </AdminField>
              <AdminField label="รายละเอียด (EN)">
                <AdminTextarea
                  value={card.descriptionEn}
                  onChange={(e) => updateCard(index, { descriptionEn: e.target.value })}
                  rows={2}
                />
              </AdminField>

              <AdminField label="ลิงก์ (เช่น /store?style=modern)">
                <AdminInput
                  value={card.href}
                  onChange={(e) => updateCard(index, { href: e.target.value })}
                  placeholder="/store"
                />
              </AdminField>
            </div>
          </AdminCard>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          ยังไม่มีการ์ด — กด &ldquo;เพิ่มการ์ด&rdquo; เพื่อเริ่มต้น (สูงสุด {MAX_POPULAR_HIGHLIGHTS} ใบ)
        </p>
      )}

      <div className="mt-8">
        <AdminSaveButton saving={saving} onClick={saveAll} label="บันทึกทั้งหมด" />
      </div>
    </div>
  );
}
