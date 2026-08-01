"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X, Eraser, ExternalLink, BadgeCheck } from "lucide-react";
import {
  AdminCard,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSaveButton,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { COLLECTIONS, STYLES } from "@/lib/store/taxonomy";
import { TH_PROVINCES } from "@/lib/geo/th-provinces";
import { listingStorePath } from "@/lib/seo/slug";
import {
  MIN_PAID_LISTING_PRICE_THB,
  listingPriceErrorTh,
} from "@/lib/store/listing-price";
import type { StoreListing } from "@/lib/store/db";

type FormState = {
  name: string;
  description: string;
  tagline: string;
  style: string;
  collection: string;
  province: string;
  floors: 1 | 2;
  beds: number;
  baths: number;
  parking: string;
  area: string;
  widthMeters: string;
  lengthMeters: string;
  price: string;
  compareAtPrice: string;
  constructionCostEstimate: string;
  image: string;
  renderUrls: string[];
  floorPlanUrls: string[];
};

function emptyForm(): FormState {
  return {
    name: "",
    description: "",
    tagline: "",
    style: "modern",
    collection: "single-storey",
    province: "",
    floors: 1,
    beds: 3,
    baths: 2,
    parking: "1",
    area: "120",
    widthMeters: "",
    lengthMeters: "",
    price: "1500",
    compareAtPrice: "",
    constructionCostEstimate: "",
    image: "",
    renderUrls: [],
    floorPlanUrls: [],
  };
}

function listingToForm(l: StoreListing): FormState {
  const areaNum = (l.area.match(/[\d.]+/) ?? [""])[0];
  return {
    name: l.name,
    description: l.description,
    tagline: l.tagline ?? "",
    style: l.style || "modern",
    collection: l.collection ?? "",
    province: l.province ?? "",
    floors: l.floors,
    beds: l.beds,
    baths: l.baths,
    parking: l.parking != null ? String(l.parking) : "",
    area: areaNum,
    widthMeters: l.widthMeters != null ? String(l.widthMeters) : "",
    lengthMeters: l.lengthMeters != null ? String(l.lengthMeters) : "",
    price: String(l.price),
    compareAtPrice:
      l.compareAtPrice != null
        ? String(l.compareAtPrice)
        : l.priceBreakdown?.compareAt != null
          ? String(l.priceBreakdown.compareAt)
          : "",
    constructionCostEstimate:
      l.constructionCostEstimate != null ? String(l.constructionCostEstimate) : "",
    image: l.image,
    renderUrls: l.renderUrls ?? [],
    floorPlanUrls: l.floorPlanUrls ?? [],
  };
}

function formToBody(form: FormState) {
  return {
    name: form.name,
    description: form.description,
    tagline: form.tagline || undefined,
    style: form.style,
    collection: form.collection || undefined,
    province: form.province || undefined,
    floors: form.floors,
    beds: form.beds,
    baths: form.baths,
    parking: form.parking === "" ? undefined : Number(form.parking),
    area: form.area,
    widthMeters: form.widthMeters === "" ? undefined : Number(form.widthMeters),
    lengthMeters: form.lengthMeters === "" ? undefined : Number(form.lengthMeters),
    price: Number(form.price),
    compareAtPrice: form.compareAtPrice === "" ? undefined : Number(form.compareAtPrice),
    constructionCostEstimate:
      form.constructionCostEstimate === "" ? undefined : Number(form.constructionCostEstimate),
    image: form.image,
    renderUrls: form.renderUrls.filter(Boolean),
    floorPlanUrls: form.floorPlanUrls.filter(Boolean),
  };
}

const selectClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function AdminListingsClient() {
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [q, setQ] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (styleFilter) params.set("style", styleFilter);
    const res = await fetch(`/api/admin/listings?${params}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
    setListings(data.listings ?? []);
  }, [q, styleFilter]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) =>
        setStatus({ type: "error", message: err instanceof Error ? err.message : "โหลดไม่สำเร็จ" }),
      )
      .finally(() => setLoading(false));
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setEditorOpen(true);
    setStatus(null);
  }

  function openEdit(listing: StoreListing) {
    setEditingId(listing.id);
    setForm(listingToForm(listing));
    setEditorOpen(true);
    setStatus(null);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveForm() {
    const priceErr = listingPriceErrorTh(form.price);
    if (priceErr) {
      setStatus({ type: "error", message: priceErr });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const body = formToBody(form);
      const res = await fetch(
        editingId ? `/api/admin/listings/${encodeURIComponent(editingId)}` : "/api/admin/listings",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setEditorOpen(false);
      setStatus({
        type: "success",
        message: editingId ? "อัปเดตแบบบ้านแล้ว" : "สร้างแบบบ้านใหม่แล้ว",
      });
      await load();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }

  async function removeListing(listing: StoreListing) {
    if (!confirm(`ลบแบบบ้าน “${listing.name}” (#${listing.planId}) ถาวร?`)) return;
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/listings/${encodeURIComponent(listing.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ลบไม่สำเร็จ");
      setStatus({ type: "success", message: "ลบแบบบ้านแล้ว" });
      await load();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "ลบไม่สำเร็จ" });
    }
  }

  async function setModeration(
    listing: StoreListing,
    next: "pending" | "approved" | "rejected",
  ) {
    const labels = {
      approved: "อนุมัติและเปิดขาย",
      pending: "ล็อกการซื้อ (รออนุมัติ)",
      rejected: "ปฏิเสธ / ซ่อนจากร้าน",
    } as const;
    if (!confirm(`${labels[next]} แบบ “${listing.name}” (#${listing.planId}) ?`)) return;
    setStatus(null);
    try {
      const res =
        next === "approved"
          ? await fetch(`/api/admin/plans/${encodeURIComponent(listing.id)}/approve`, {
              method: "PUT",
            })
          : await fetch(
              `/api/admin/listings/${encodeURIComponent(listing.id)}/moderate`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next }),
              },
            );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปเดตสถานะไม่สำเร็จ");
      setStatus({
        type: "success",
        message:
          next === "approved"
            ? `อนุมัติแล้ว — เปิดปุ่มซื้อสำหรับ “${listing.name}”`
            : next === "rejected"
              ? `ปฏิเสธแล้ว — ซ่อน “${listing.name}” จากร้าน`
              : `ล็อกการซื้อแล้ว — “${listing.name}” ยังแสดงบนเว็บแต่ซื้อไม่ได้`,
      });
      await load();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ",
      });
    }
  }

  async function cleanupDummy() {
    if (
      !confirm(
        "ลบข้อมูลตัวอย่าง / AI-community ทั้งหมดออกจากร้านค้า?\nการกระทำนี้ย้อนกลับไม่ได้",
      )
    ) {
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/listings/cleanup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ล้างข้อมูลไม่สำเร็จ");
      setStatus({
        type: "success",
        message: `ล้างข้อมูลตัวอย่างแล้ว (${data.deleted ?? 0} รายการ)`,
      });
      await load();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "ล้างข้อมูลไม่สำเร็จ",
      });
    } finally {
      setSaving(false);
    }
  }

  const dummyCount = listings.filter(
    (l) => l.source === "seed-demo" || l.source === "community-ai" || l.ownerId === "seed-demo",
  ).length;

  return (
    <div>
      <AdminPageHeader
        title="จัดการแบบบ้าน"
        description="เพิ่ม/แก้ไขแบบบ้าน · อนุมัติเพื่อเปิดปุ่มซื้อ (แบบที่รออนุมัติแสดงบนเว็บได้แต่ยังซื้อไม่ได้)"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาชื่อ / รหัสแบบ…"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-56"
        />
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">ทุกสไตล์</option>
          {STYLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.th}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          เพิ่มแบบบ้าน
        </button>
        <button
          type="button"
          onClick={cleanupDummy}
          disabled={saving || dummyCount === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
        >
          <Eraser className="h-4 w-4" />
          ล้างข้อมูลตัวอย่าง ({dummyCount})
        </button>
        <p className="ml-auto text-sm text-slate-500">{listings.length} รายการ</p>
      </div>

      <AdminCard>
        {loading ? (
          <p className="text-sm text-slate-500">กำลังโหลด…</p>
        ) : listings.length === 0 ? (
          <p className="text-sm text-slate-500">ยังไม่มีแบบบ้าน — กด “เพิ่มแบบบ้าน” เพื่อเริ่มต้น</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-3 font-semibold">รูป</th>
                  <th className="pb-3 pr-3 font-semibold">รหัส / ชื่อ</th>
                  <th className="pb-3 pr-3 font-semibold">หมวด</th>
                  <th className="pb-3 pr-3 font-semibold">สเปก</th>
                  <th className="pb-3 pr-3 font-semibold">ราคา</th>
                  <th className="pb-3 pr-3 font-semibold">สถานะขาย</th>
                  <th className="pb-3 pr-3 font-semibold">ที่มา</th>
                  <th className="pb-3 font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const mod = l.moderationStatus ?? "approved";
                  const modBadge =
                    mod === "approved"
                      ? ["เปิดขาย", "bg-emerald-100 text-emerald-800"]
                      : mod === "pending"
                        ? ["รออนุมัติ (ดูได้/ซื้อไม่ได้)", "bg-amber-100 text-amber-800"]
                        : ["ปฏิเสธ / ซ่อน", "bg-red-100 text-red-800"];
                  return (
                  <tr key={l.id} className="border-b border-slate-100 align-middle">
                    <td className="py-3 pr-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={l.image}
                        alt=""
                        className="h-14 w-20 rounded-md object-cover ring-1 ring-slate-200"
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-mono text-xs text-slate-500">#{l.planId}</p>
                      <p className="font-medium text-slate-900">{l.name}</p>
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      <p>{STYLES.find((s) => s.id === l.style)?.th ?? l.style}</p>
                      <p className="text-xs text-slate-400">
                        {COLLECTIONS.find((c) => c.id === l.collection)?.th ?? l.collection ?? "—"}
                      </p>
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      {l.beds} นอน · {l.baths} น้ำ · {l.floors} ชั้น
                      <br />
                      <span className="text-xs text-slate-400">{l.area}</span>
                    </td>
                    <td className="py-3 pr-3 font-semibold text-slate-900">
                      {l.price <= 0 ? "ฟรี" : `฿${l.price.toLocaleString("th-TH")}`}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${modBadge[1]}`}
                      >
                        {modBadge[0]}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          l.source === "seed-demo" || l.source === "community-ai"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {l.source}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {mod !== "approved" && (
                          <button
                            type="button"
                            onClick={() => void setModeration(l, "approved")}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                            title="อนุมัติ — เปิดปุ่มซื้อ"
                          >
                            <BadgeCheck className="h-3.5 w-3.5" />
                            อนุมัติ
                          </button>
                        )}
                        {mod === "approved" && (
                          <button
                            type="button"
                            onClick={() => void setModeration(l, "pending")}
                            className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
                            title="ล็อกการซื้ออีกครั้ง"
                          >
                            ล็อกซื้อ
                          </button>
                        )}
                        {mod !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => void setModeration(l, "rejected")}
                            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                            title="ปฏิเสธ / ซ่อนจากร้าน"
                          >
                            ปฏิเสธ
                          </button>
                        )}
                        <a
                          href={listingStorePath(l.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                          title="เปิดหน้าร้าน"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEdit(l)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                          title="แก้ไข"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeListing(l)}
                          className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-10">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "แก้ไขแบบบ้าน" : "เพิ่มแบบบ้านใหม่"}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="ชื่อแบบบ้าน *">
                  <AdminInput
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="เช่น Modern Tropical 2F"
                  />
                </AdminField>
                <AdminField label="คำโปรยสั้นๆ">
                  <AdminInput
                    value={form.tagline}
                    onChange={(e) => setField("tagline", e.target.value)}
                  />
                </AdminField>
              </div>

              <AdminField
                label="รายละเอียด"
                hint="Rich Text — ตัวหนา · ตัวเอียง · หัวข้อ · รายการ · ลิงก์"
              >
                <AdminRichTextEditor
                  key={editingId ?? "new-listing-description"}
                  value={form.description}
                  onChange={(html) => setField("description", html)}
                  placeholder="อธิบายแบบบ้าน ฟังก์ชันการใช้งาน วัสดุ ฯลฯ"
                  minHeightClass="min-h-[160px]"
                />
              </AdminField>

              <div className="grid gap-4 sm:grid-cols-3">
                <AdminField label="สไตล์ *">
                  <select
                    className={selectClass}
                    value={form.style}
                    onChange={(e) => setField("style", e.target.value)}
                  >
                    {STYLES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.th}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="คอลเลกชัน">
                  <select
                    className={selectClass}
                    value={form.collection}
                    onChange={(e) => setField("collection", e.target.value)}
                  >
                    <option value="">— ไม่ระบุ —</option>
                    {COLLECTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.th}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="จังหวัด">
                  <select
                    className={selectClass}
                    value={form.province}
                    onChange={(e) => setField("province", e.target.value)}
                  >
                    <option value="">— ไม่ระบุ —</option>
                    {TH_PROVINCES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.th}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <AdminField label="ชั้น">
                  <select
                    className={selectClass}
                    value={form.floors}
                    onChange={(e) => setField("floors", Number(e.target.value) === 2 ? 2 : 1)}
                  >
                    <option value={1}>1 ชั้น</option>
                    <option value={2}>2 ชั้น</option>
                  </select>
                </AdminField>
                <AdminField label="ห้องนอน">
                  <AdminInput
                    type="number"
                    min={0}
                    value={form.beds}
                    onChange={(e) => setField("beds", Number(e.target.value))}
                  />
                </AdminField>
                <AdminField label="ห้องน้ำ">
                  <AdminInput
                    type="number"
                    min={0}
                    value={form.baths}
                    onChange={(e) => setField("baths", Number(e.target.value))}
                  />
                </AdminField>
                <AdminField label="ที่จอดรถ">
                  <AdminInput
                    type="number"
                    min={0}
                    value={form.parking}
                    onChange={(e) => setField("parking", e.target.value)}
                  />
                </AdminField>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <AdminField label="พื้นที่ (ตร.ม.)">
                  <AdminInput
                    value={form.area}
                    onChange={(e) => setField("area", e.target.value)}
                    placeholder="120"
                  />
                </AdminField>
                <AdminField label="ความกว้าง (ม.)">
                  <AdminInput
                    value={form.widthMeters}
                    onChange={(e) => setField("widthMeters", e.target.value)}
                  />
                </AdminField>
                <AdminField label="ความลึก (ม.)">
                  <AdminInput
                    value={form.lengthMeters}
                    onChange={(e) => setField("lengthMeters", e.target.value)}
                  />
                </AdminField>
                <AdminField label="งบก่อสร้างโดยประมาณ (บาท)">
                  <AdminInput
                    value={form.constructionCostEstimate}
                    onChange={(e) => setField("constructionCostEstimate", e.target.value)}
                  />
                </AdminField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField
                  label="ราคาขาย (บาท) *"
                  hint={`ใส่ 0 = ฟรี · ถ้าคิดเงินขั้นต่ำ ฿${MIN_PAID_LISTING_PRICE_THB.toLocaleString("th-TH")}`}
                >
                  <AdminInput
                    type="number"
                    min={0}
                    step={1}
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder={`0 หรือ ≥ ${MIN_PAID_LISTING_PRICE_THB}`}
                  />
                </AdminField>
                <AdminField label="ราคาเดิมก่อนลด (บาท)" hint="ถ้ากรอกและสูงกว่าราคาขาย จะแสดงป้ายลดราคา">
                  <AdminInput
                    type="number"
                    min={0}
                    value={form.compareAtPrice}
                    onChange={(e) => setField("compareAtPrice", e.target.value)}
                  />
                </AdminField>
              </div>

              <ImageUploadField
                label="รูปปก (เรนเดอร์หลัก) *"
                value={form.image || null}
                onChange={(url) => setField("image", url ?? "")}
                category="listings/cover"
              />

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  รูปเรนเดอร์เพิ่มเติม ({form.renderUrls.length}/9)
                </p>
                <div className="space-y-3">
                  {form.renderUrls.map((url, i) => (
                    <div key={`${url}-${i}`} className="flex items-start gap-2">
                      <div className="flex-1">
                        <ImageUploadField
                          label={`เรนเดอร์ ${i + 1}`}
                          value={url}
                          onChange={(next) => {
                            const nextUrls = [...form.renderUrls];
                            if (!next) nextUrls.splice(i, 1);
                            else nextUrls[i] = next;
                            setField("renderUrls", nextUrls);
                          }}
                          category={`listings/renders/${i + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                  {form.renderUrls.length < 9 && (
                    <button
                      type="button"
                      onClick={() => setField("renderUrls", [...form.renderUrls, ""])}
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      + เพิ่มรูปเรนเดอร์
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  แปลนพื้น ({form.floorPlanUrls.length}/3)
                </p>
                <div className="space-y-3">
                  {form.floorPlanUrls.map((url, i) => (
                    <ImageUploadField
                      key={`${url}-${i}`}
                      label={`แปลน ${i + 1}`}
                      value={url}
                      onChange={(next) => {
                        const nextUrls = [...form.floorPlanUrls];
                        if (!next) nextUrls.splice(i, 1);
                        else nextUrls[i] = next;
                        setField("floorPlanUrls", nextUrls);
                      }}
                      category={`listings/floorplans/${i + 1}`}
                    />
                  ))}
                  {form.floorPlanUrls.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setField("floorPlanUrls", [...form.floorPlanUrls, ""])}
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      + เพิ่มแปลนพื้น
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <AdminSaveButton
                saving={saving}
                onClick={saveForm}
                label={editingId ? "บันทึกการแก้ไข" : "สร้างแบบบ้าน"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
