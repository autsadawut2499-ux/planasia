"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X, Eraser, ExternalLink, BadgeCheck } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { AiImageToolCards } from "@/components/vendor/AiImageToolCards";
import { AiRenderingGuide } from "@/components/vendor/AiRenderingGuide";
import { FileUpload } from "@/components/vendor/FileUpload";
import { MultiFileUpload } from "@/components/vendor/MultiFileUpload";
import { Card, Field, PrimaryButton, Select, TextInput } from "@/components/vendor/ui";
import { COLLECTIONS, STYLES } from "@/lib/store/taxonomy";
import { PROVINCES_BY_REGION, provinceLabel } from "@/lib/geo/th-provinces";
import { listingStorePath } from "@/lib/seo/slug";
import { parseAreaSqm } from "@/lib/format";
import {
  MIN_ADMIN_TEST_LISTING_PRICE_THB,
  MIN_PAID_LISTING_PRICE_THB,
  listingPriceErrorTh,
} from "@/lib/store/listing-price";
import {
  buildAutoListingName,
  planPrefixForStyle,
  styleLabelForListingName,
} from "@/lib/store/plan-code";
import type { UploadKind } from "@/hooks/useVendorDashboard";
import type { VendorListing } from "@/lib/store/listing-types";

const STYLE_OPTIONS = STYLES;
const COLLECTION_OPTIONS = COLLECTIONS;

type FormState = {
  id?: string;
  planId?: string;
  name: string;
  tagline: string;
  description: string;
  pitch: string;
  highlights: string[];
  style: string;
  collection: string;
  province: string;
  floors: number;
  beds: number;
  baths: number;
  parking: string;
  widthMeters: string;
  lengthMeters: string;
  areaSqm: string;
  constructionCostEstimate: string;
  price: string;
  compareAtPrice: string;
  image: string;
  renderUrls: string[];
  floorPlanUrls: string[];
  blueprintPdfUrls: string[];
  cadFileUrls: string[];
  boqFileUrls: string[];
  boqPrice: string;
  calcPrice: string;
  calcSheetUrls: string[];
  permitReady: boolean;
  boqComplete: boolean;
  contractConsent: boolean;
};

function emptyForm(): FormState {
  return {
    name: "",
    tagline: "",
    description: "",
    pitch: "",
    highlights: [],
    style: "modern",
    collection: "",
    province: "",
    floors: 1,
    beds: 3,
    baths: 2,
    parking: "1",
    widthMeters: "",
    lengthMeters: "",
    areaSqm: "",
    constructionCostEstimate: "",
    price: "",
    compareAtPrice: "",
    image: "",
    renderUrls: [],
    floorPlanUrls: [],
    blueprintPdfUrls: [],
    cadFileUrls: [],
    boqFileUrls: [],
    boqPrice: "",
    calcPrice: "",
    calcSheetUrls: [],
    permitReady: false,
    boqComplete: false,
    contractConsent: false,
  };
}

function listingToForm(l: VendorListing): FormState {
  return {
    id: l.id,
    planId: l.planCode || l.planId,
    name: l.name,
    tagline: l.tagline ?? "",
    description: l.description,
    pitch: l.pitch ?? "",
    highlights: l.highlights ?? [],
    style: l.style || "modern",
    collection: l.collection ?? "",
    province: l.province ?? "",
    floors: l.floors,
    beds: l.beds,
    baths: l.baths,
    parking: l.parking != null ? String(l.parking) : "",
    widthMeters: l.widthMeters != null ? String(l.widthMeters) : "",
    lengthMeters: l.lengthMeters != null ? String(l.lengthMeters) : "",
    areaSqm: parseAreaSqm(l.area)?.toString() ?? "",
    constructionCostEstimate:
      l.constructionCostEstimate != null ? String(l.constructionCostEstimate) : "",
    price: l.price != null ? String(l.price) : "",
    compareAtPrice:
      l.compareAtPrice != null
        ? String(l.compareAtPrice)
        : l.priceBreakdown?.compareAt != null
          ? String(l.priceBreakdown.compareAt)
          : "",
    image: l.image,
    renderUrls: l.renderUrls ?? [],
    floorPlanUrls: l.floorPlanUrls ?? [],
    blueprintPdfUrls: (l.blueprintPdfUrls ?? (l.blueprintPdfUrl ? [l.blueprintPdfUrl] : [])).slice(
      0,
      1,
    ),
    cadFileUrls: (l.cadFileUrls ?? []).slice(0, 1),
    boqFileUrls: (l.boqFileUrls ?? (l.boqFileUrl ? [l.boqFileUrl] : [])).slice(0, 1),
    boqPrice: l.boqPrice != null ? String(l.boqPrice) : "",
    calcPrice: l.calcPrice != null ? String(l.calcPrice) : "",
    calcSheetUrls: (l.calcSheetUrls ?? []).slice(0, 1),
    permitReady: l.permitReady ?? false,
    boqComplete: l.boqComplete ?? false,
    contractConsent: l.contractConsent ?? false,
  };
}

function formToBody(form: FormState) {
  const namePreview = buildAutoListingName(
    form.style,
    form.planId || `${planPrefixForStyle(form.style)}-###`,
  );
  return {
    name: namePreview,
    tagline: form.tagline || undefined,
    description: form.description || namePreview,
    pitch: form.pitch || undefined,
    highlights: form.highlights,
    style: form.style,
    collection: form.collection || undefined,
    province: form.province || undefined,
    floors: form.floors,
    beds: form.beds,
    baths: form.baths,
    parking: form.parking === "" ? undefined : Number(form.parking),
    area: `${Number(form.areaSqm)} sqm`,
    widthMeters: form.widthMeters === "" ? undefined : Number(form.widthMeters),
    lengthMeters: form.lengthMeters === "" ? undefined : Number(form.lengthMeters),
    price: Number(form.price),
    compareAtPrice: form.compareAtPrice === "" ? undefined : Number(form.compareAtPrice),
    constructionCostEstimate:
      form.constructionCostEstimate === "" ? undefined : Number(form.constructionCostEstimate),
    image: form.image,
    renderUrls: form.renderUrls.filter(Boolean),
    floorPlanUrls: form.floorPlanUrls.filter(Boolean),
    blueprintPdfUrls: form.blueprintPdfUrls.filter(Boolean).slice(0, 1),
    cadFileUrls: form.cadFileUrls.filter(Boolean).slice(0, 1),
    boqFileUrls: form.boqFileUrls.filter(Boolean).slice(0, 1),
    calcSheetUrls: form.calcSheetUrls.filter(Boolean).slice(0, 1),
    boqPrice: form.boqPrice !== "" ? form.boqPrice : "",
    calcPrice: form.calcPrice !== "" ? form.calcPrice : "",
    permitReady: form.permitReady,
    boqComplete: form.boqComplete,
    contractConsent: form.contractConsent,
  };
}

async function uploadAdminFile(file: File, kind: UploadKind): Promise<string> {
  const isDoc =
    kind === "pdf" ||
    kind === "document" ||
    kind === "boq" ||
    kind === "cad" ||
    kind === "calc";

  let payload = file;
  if (!isDoc) {
    const { compressImageFile, isImageUploadKind } = await import(
      "@/lib/uploads/compress-image-client"
    );
    if (isImageUploadKind(kind)) {
      payload = await compressImageFile(file);
    }
  }

  const useSigned = isDoc || payload.size > 8 * 1024 * 1024;
  if (useSigned) {
    const signRes = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "sign",
        kind,
        fileName: payload.name,
        sizeBytes: payload.size,
        contentType: payload.type || (isDoc ? "application/pdf" : undefined),
      }),
    });
    const signJson = await signRes.json().catch(() => null);
    if (!signRes.ok) {
      throw new Error(signJson?.error ?? "สร้างลิงก์อัปโหลดไม่สำเร็จ");
    }
    const contentType =
      (signJson?.contentType as string | undefined) ||
      payload.type ||
      (isDoc ? "application/pdf" : "application/octet-stream");
    const signedUrl = signJson?.signedUrl as string | undefined;
    const publicUrl = signJson?.publicUrl as string | undefined;
    if (!signedUrl || !publicUrl) {
      throw new Error("เซิร์ฟเวอร์ไม่ได้ส่งลิงก์อัปโหลด");
    }
    const putRes = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType, "x-upsert": "true" },
      body: payload,
    });
    if (!putRes.ok) {
      const detail = await putRes.text().catch(() => "");
      throw new Error(
        detail
          ? `อัปโหลดไปยังคลังไฟล์ไม่สำเร็จ: ${detail.slice(0, 180)}`
          : `อัปโหลดไปยังคลังไฟล์ไม่สำเร็จ (HTTP ${putRes.status})`,
      );
    }
    return publicUrl;
  }

  const fd = new FormData();
  fd.append("file", payload);
  fd.append("kind", kind);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "อัปโหลดไม่สำเร็จ");
  return json.publicUrl as string;
}

function SectionTitle({ step, title, desc }: { step: number; title: string; desc?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 border-b border-border pb-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e40af] text-sm font-bold text-white">
        {step}
      </span>
      <div>
        <h4 className="text-sm font-bold text-text-primary">{title}</h4>
        {desc && <p className="mt-0.5 text-xs text-text-muted">{desc}</p>}
      </div>
    </div>
  );
}

function FilterMatchSummary({ form }: { form: FormState }) {
  const style = STYLE_OPTIONS.find((s) => s.id === form.style);
  const collection = COLLECTION_OPTIONS.find((c) => c.id === form.collection);
  const area = Number(form.areaSqm);
  const chips = [
    style ? style.th : null,
    collection ? collection.th : null,
    provinceLabel(form.province),
    `${form.floors} ชั้น`,
    `${form.beds} ห้องนอน`,
    `${form.baths} ห้องน้ำ`,
    area > 0 ? `${area.toLocaleString()} ตร.ม.` : null,
    Number(form.constructionCostEstimate) > 0
      ? `งบ ~฿${Number(form.constructionCostEstimate).toLocaleString()}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-lg border border-[#1e40af]/20 bg-blue-50/60 px-3 py-2.5">
      <p className="text-[11px] font-semibold text-[#1e3a5f]">แบบนี้จะปรากฏในตัวกรอง</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#1e40af] ring-1 ring-[#1e40af]/15"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-surface-raised">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-[#1e40af] focus:ring-[#1e40af]"
      />
      <span className="text-sm text-text-secondary">{children}</span>
    </label>
  );
}

export default function AdminListingsClient() {
  const [listings, setListings] = useState<VendorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [q, setQ] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [form, setForm] = useState<FormState | null>(null);

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

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  function openCreate() {
    setForm(emptyForm());
    setStatus(null);
  }

  function openEdit(listing: VendorListing) {
    setForm(listingToForm(listing));
    setStatus(null);
  }

  function closeForm() {
    setForm(null);
  }

  async function saveForm() {
    if (!form) return;
    if (!form.image) {
      setStatus({ type: "error", message: "ต้องมีภาพเรนเดอร์ 3D อย่างน้อย 1 รูป" });
      return;
    }
    const priceErr = listingPriceErrorTh(form.price, { allowAdminTestPricing: true });
    if (priceErr) {
      setStatus({ type: "error", message: priceErr });
      return;
    }
    if (!form.areaSqm || Number(form.areaSqm) <= 0) {
      setStatus({
        type: "error",
        message: "กรุณากรอกพื้นที่ใช้สอย (ตร.ม.) — ระบบใช้ค่านี้ในตัวกรองค้นหา",
      });
      return;
    }
    if (!form.province) {
      setStatus({ type: "error", message: "กรุณาเลือกจังหวัดที่ให้บริการ" });
      return;
    }
    if (form.floorPlanUrls.length < 1) {
      setStatus({ type: "error", message: "กรุณาอัปโหลดแปลนพื้นอย่างน้อย 1 รูป" });
      return;
    }
    if (form.blueprintPdfUrls.length !== 1) {
      setStatus({ type: "error", message: "กรุณาอัปโหลดไฟล์แบบแปลนหลัก PDF (1 ไฟล์)" });
      return;
    }
    if (!form.contractConsent) {
      setStatus({
        type: "error",
        message:
          "กรุณายืนยันว่าผลงานเป็นลิขสิทธิ์แท้ของผู้ขาย และยินยอมตามเงื่อนไขของแพลตฟอร์ม",
      });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const body = formToBody(form);
      const res = await fetch(
        form.id ? `/api/admin/listings/${encodeURIComponent(form.id)}` : "/api/admin/listings",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setForm(null);
      setStatus({
        type: "success",
        message: form.id
          ? `อัปเดตแบบบ้านแล้ว — รหัส ${data.listing?.planId ?? form.planId ?? ""}`
          : `สร้างแบบบ้านใหม่แล้ว — รหัส ${data.listing?.planId ?? ""}`,
      });
      await load();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "บันทึกไม่สำเร็จ" });
    } finally {
      setSaving(false);
    }
  }

  async function removeListing(listing: VendorListing) {
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
    listing: VendorListing,
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
          : await fetch(`/api/admin/listings/${encodeURIComponent(listing.id)}/moderate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: next }),
            });
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

  if (form) {
    return (
      <div className="space-y-5">
        <AdminPageHeader
          title={form.id ? "แก้ไขแบบบ้าน" : "เพิ่มแบบบ้านใหม่"}
          description="ฟอร์มเดียวกับฝั่งผู้ขาย — กรอกต่อเนื่องจากบนลงล่าง แล้วกดบันทึกด้านล่างสุด"
        />

        {status && (
          <AdminStatusMessage type={status.type} message={status.message} />
        )}

        <Card
          title="ส่งผลงานเพื่อลงขายบนแพลตฟอร์ม"
          desc={
            form.id
              ? "แก้ไขรายละเอียดแบบบ้าน (รูปแบบเดียวกับแดชบอร์ดผู้ขาย)"
              : "กรอกข้อมูลต่อเนื่องจากบนลงล่าง แล้วกดบันทึกที่ด้านล่างสุด"
          }
        >
          {/* ── 1. Search filters + core listing data ── */}
          <section>
            <SectionTitle
              step={1}
              title="ข้อมูลหลักและตัวกรองค้นหา"
              desc="รหัสแบบบ้าน ราคา และข้อมูลสเปกสำหรับระบบค้นหา — ไม่ต้องกรอกข้อความนำเสนอ"
            />

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="ชื่อแบบบ้าน / รหัส (สร้างอัตโนมัติ)"
                  hint="ระบบตั้งชื่อภาษาอังกฤษแบบ House Code + Style เช่น MOD-001 Modern — ไม่ต้องกรอกเอง"
                >
                  {form.id && form.planId ? (
                    <div className="rounded-lg border border-[#1e40af]/25 bg-blue-50 px-3 py-2.5">
                      <p className="text-base font-bold tracking-tight text-[#1e40af]">
                        {buildAutoListingName(form.style, form.planId)}
                      </p>
                      <p className="mt-1 text-[11px] text-text-muted">
                        รหัส{" "}
                        <span className="font-mono font-semibold">{form.planId}</span>
                        {" · "}
                        สไตล์ {styleLabelForListingName(form.style)}
                        {" — เปลี่ยนสไตล์แล้วชื่อจะอัปเดตเมื่อบันทึก (รหัสคงเดิม)"}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-surface-raised px-3 py-2.5 text-sm text-text-muted">
                      หลังบันทึกจะได้ชื่อประมาณ:{" "}
                      <span className="font-semibold text-text-secondary">
                        {styleLabelForListingName(form.style)}{" "}
                        <span className="font-mono">
                          {planPrefixForStyle(form.style)}-###
                        </span>
                      </span>
                    </div>
                  )}
                </Field>
                <div className="space-y-2">
                  <Field
                    label="ราคาขายไฟล์แบบ (บาท) *"
                    hint={`แจกฟรีได้ (ใส่ 0) — ถ้าคิดเงินต้องอย่างน้อย ฿${MIN_PAID_LISTING_PRICE_THB.toLocaleString("th-TH")} · แอดมินทดสอบ Stripe ได้ตั้งแต่ ฿${MIN_ADMIN_TEST_LISTING_PRICE_THB}`}
                  >
                    <TextInput
                      type="number"
                      min={0}
                      step={1}
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      placeholder={`0 = ฟรี, หรือ ≥ ${MIN_PAID_LISTING_PRICE_THB}`}
                    />
                  </Field>
                  {form.price !== "" && Number(form.price) === 0 && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900">
                      แบบบ้านนี้จะแสดงเป็น <span className="font-bold">ฟรี</span>
                    </div>
                  )}
                  {Number(form.price) > 0 &&
                    Number(form.price) < MIN_PAID_LISTING_PRICE_THB &&
                    Number(form.price) >= MIN_ADMIN_TEST_LISTING_PRICE_THB && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        โหมดทดสอบแอดมิน: ราคา ฿{Number(form.price).toLocaleString("th-TH")} —
                        ใช้ทดลองชำระเงิน Stripe เท่านั้น อย่าปล่อยราคาทดสอบนี้บนหน้าร้านถาวร
                      </div>
                    )}
                  {Number(form.price) > 0 &&
                    Number(form.price) < MIN_ADMIN_TEST_LISTING_PRICE_THB && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        ราคาต่ำกว่าขั้นต่ำ — ต้องอย่างน้อย ฿
                        {MIN_ADMIN_TEST_LISTING_PRICE_THB.toLocaleString("th-TH")} หรือใส่ 0
                        หากแจกฟรี
                      </div>
                    )}
                  <Field label="ราคาขีดฆ่า (compare-at)" hint="ไม่บังคับ — แสดงราคาเดิมก่อนลด">
                    <TextInput
                      type="number"
                      min={0}
                      step={1}
                      value={form.compareAtPrice}
                      onChange={(e) => set("compareAtPrice", e.target.value)}
                      placeholder="เช่น 2500"
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised/60 p-4 sm:p-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-text-secondary">
                    ข้อมูลสำหรับระบบค้นหาและตัวกรอง
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-text-muted">
                    กรอกให้ตรงความจริงเพื่อให้แบบถูกค้นเจอ
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="สไตล์ *">
                    <Select value={form.style} onChange={(e) => set("style", e.target.value)}>
                      {STYLE_OPTIONS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.th} · {s.en}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="คอลเลกชัน / ประเภทอาคาร">
                    <Select
                      value={form.collection}
                      onChange={(e) => set("collection", e.target.value)}
                    >
                      <option value="">— ไม่ระบุ —</option>
                      {COLLECTION_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.th}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="จังหวัดที่ให้บริการ *" hint="ผู้ซื้อกรองหาช่างใกล้บ้านด้วยค่านี้">
                    <Select
                      value={form.province}
                      onChange={(e) => set("province", e.target.value)}
                    >
                      <option value="">— เลือกจังหวัด —</option>
                      {PROVINCES_BY_REGION.map((group) => (
                        <optgroup key={group.region} label={group.label}>
                          {group.provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.th}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  </Field>
                  <Field label="จำนวนชั้น *">
                    <Select
                      value={form.floors}
                      onChange={(e) => set("floors", Number(e.target.value))}
                    >
                      <option value={1}>1 ชั้น</option>
                      <option value={2}>2 ชั้น</option>
                    </Select>
                  </Field>
                  <Field label="พื้นที่ใช้สอยรวม (ตร.ม.) *" hint="ตัวเลขเท่านั้น">
                    <TextInput
                      type="number"
                      min={1}
                      step="1"
                      value={form.areaSqm}
                      onChange={(e) => set("areaSqm", e.target.value)}
                      placeholder="เช่น 180"
                    />
                  </Field>
                  <Field label="ห้องนอน *">
                    <TextInput
                      type="number"
                      min={0}
                      value={form.beds}
                      onChange={(e) => set("beds", Number(e.target.value))}
                    />
                  </Field>
                  <Field label="ห้องน้ำ *">
                    <TextInput
                      type="number"
                      min={0}
                      value={form.baths}
                      onChange={(e) => set("baths", Number(e.target.value))}
                    />
                  </Field>
                  <Field label="ที่จอดรถ (คัน)">
                    <TextInput
                      type="number"
                      min={0}
                      value={form.parking}
                      onChange={(e) => set("parking", e.target.value)}
                      placeholder="เช่น 2"
                    />
                  </Field>
                  <Field label="งบก่อสร้างโดยประมาณ (บาท)">
                    <TextInput
                      type="number"
                      value={form.constructionCostEstimate}
                      onChange={(e) => set("constructionCostEstimate", e.target.value)}
                      placeholder="เช่น 2000000"
                    />
                  </Field>
                  <Field
                    label="ที่ดินขั้นต่ำ — กว้าง (ม.)"
                    hint="ใส่ขนาดบ้าน + 2 เมตร เพื่อให้ขออนุญาตก่อสร้างผ่านได้"
                  >
                    <TextInput
                      type="number"
                      step="0.1"
                      value={form.widthMeters}
                      onChange={(e) => set("widthMeters", e.target.value)}
                      placeholder="เช่น ขนาดบ้าน + 2 ม."
                    />
                  </Field>
                  <Field
                    label="ที่ดินขั้นต่ำ — ลึก (ม.)"
                    hint="ใส่ขนาดบ้าน + 2 เมตร เพื่อให้ขออนุญาตก่อสร้างผ่านได้"
                  >
                    <TextInput
                      type="number"
                      step="0.1"
                      value={form.lengthMeters}
                      onChange={(e) => set("lengthMeters", e.target.value)}
                      placeholder="เช่น ขนาดบ้าน + 2 ม."
                    />
                  </Field>
                </div>

                <div className="mt-4">
                  <FilterMatchSummary form={form} />
                </div>
              </div>
            </div>
          </section>

          {/* ── 2. Render / 3D images ── */}
          <section className="mt-8 border-t border-border pt-8">
            <SectionTitle
              step={2}
              title="อัปโหลดภาพเรนเดอร์ / ภาพ 3D"
              desc="อัปโหลดรูปปกอย่างน้อย 1 รูป — เพิ่มมุมอื่นได้ตามต้องการ"
            />
            <div className="space-y-5">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-text-secondary">
                  ภาพเรนเดอร์ 3D *{" "}
                  <span className="text-text-muted">
                    (อย่างน้อย 1 รูป — แนะนำเพิ่มมุมอื่นถ้ามี)
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <FileUpload
                      kind="render"
                      variant="image"
                      value={form.image}
                      hint="รูปปก *"
                      onUpload={uploadAdminFile}
                      onUploaded={(url) => set("image", url)}
                      onError={(m) => setStatus({ type: "error", message: m })}
                      onClear={() => set("image", "")}
                    />
                    <p className="mt-1 text-center text-[10px] text-text-muted">
                      รูปปก (แสดงเป็นภาพหลัก)
                    </p>
                  </div>
                  {form.renderUrls.map((url) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="render" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "renderUrls",
                            form.renderUrls.filter((u) => u !== url),
                          )
                        }
                        className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-text-muted hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {form.renderUrls.length < 8 && (
                    <div className="aspect-square">
                      <FileUpload
                        kind="render"
                        variant="image"
                        onUpload={uploadAdminFile}
                        onUploaded={(url) => set("renderUrls", [...form.renderUrls, url])}
                        onError={(m) => setStatus({ type: "error", message: m })}
                        hint="+ เพิ่มรูป"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-text-secondary">
                  ภาพแปลนพื้น (Clean Plan){" "}
                  <span className="text-text-muted">— สำหรับโชว์ลูกค้า</span>
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {form.floorPlanUrls.map((url) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="floor plan" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "floorPlanUrls",
                            form.floorPlanUrls.filter((u) => u !== url),
                          )
                        }
                        className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-text-muted hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {form.floorPlanUrls.length < 12 && (
                    <div className="aspect-square">
                      <FileUpload
                        kind="floorplan"
                        variant="image"
                        onUpload={uploadAdminFile}
                        onUploaded={(url) => set("floorPlanUrls", [...form.floorPlanUrls, url])}
                        onError={(m) => setStatus({ type: "error", message: m })}
                        hint="+ เพิ่ม"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. Delivery files ── */}
          <section className="mt-8 border-t border-border pt-8">
            <SectionTitle
              step={3}
              title="อัปโหลดไฟล์ส่งมอบ"
              desc="ไฟล์หลักและไฟล์เสริมสำหรับผู้ซื้อหลังชำระเงิน"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <MultiFileUpload
                kind="pdf"
                variant="pdf"
                values={form.blueprintPdfUrls}
                onChange={(urls) => set("blueprintPdfUrls", urls.slice(0, 1))}
                label="แบบแปลนหลัก (PDF) *"
                hint="อัปโหลดได้ 1 ไฟล์เท่านั้น · นามสกุล .pdf (สูงสุด 100MB)"
                onUpload={uploadAdminFile}
                onError={(m) => setStatus({ type: "error", message: m })}
              />
              <MultiFileUpload
                kind="cad"
                variant="cad"
                values={form.cadFileUrls}
                onChange={(urls) => set("cadFileUrls", urls.slice(0, 1))}
                label="ไฟล์ AutoCAD (DWG)"
                hint="อัปโหลดได้ 1 ไฟล์เท่านั้น · นามสกุล .dwg"
                onUpload={uploadAdminFile}
                onError={(m) => setStatus({ type: "error", message: m })}
              />
              <MultiFileUpload
                kind="boq"
                variant="doc"
                values={form.boqFileUrls}
                onChange={(urls) => set("boqFileUrls", urls.slice(0, 1))}
                label="ไฟล์ BOQ (PDF)"
                hint="อัปโหลดได้ 1 ไฟล์เท่านั้น · นามสกุล .pdf — รายการประมาณราคา"
                onUpload={uploadAdminFile}
                onError={(m) => setStatus({ type: "error", message: m })}
              />
              <MultiFileUpload
                kind="calc"
                variant="calc"
                values={form.calcSheetUrls}
                onChange={(urls) => set("calcSheetUrls", urls.slice(0, 1))}
                label="รายการคำนวณ (PDF)"
                hint="อัปโหลดได้ 1 ไฟล์เท่านั้น · นามสกุล .pdf (ไม่บังคับ)"
                onUpload={uploadAdminFile}
                onError={(m) => setStatus({ type: "error", message: m })}
              />
              <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <Field
                    label="กำหนดราคา BOQ (บาท)"
                    hint="ตั้งราคาเสริม BOQ ได้เอง — ว่างไว้ใช้ราคาเริ่มต้นของแพลตฟอร์ม · ใส่ 0 ได้หากแจกฟรีพร้อมแบบ"
                  >
                    <TextInput
                      type="number"
                      min={0}
                      step={1}
                      value={form.boqPrice}
                      onChange={(e) => set("boqPrice", e.target.value)}
                      placeholder="เช่น 490"
                    />
                  </Field>
                  {form.boqFileUrls.length > 0 && form.boqPrice === "" && (
                    <p className="text-[11px] text-amber-800">
                      มีไฟล์ BOQ แล้วแต่ยังไม่ได้ตั้งราคา — ลูกค้าจะเห็นราคาเริ่มต้นของระบบ
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Field
                    label="กำหนดราคารายการคำนวณ (บาท)"
                    hint="ตั้งราคาเสริมรายการคำนวณได้เอง — ว่างไว้ใช้ราคาเริ่มต้นของแพลตฟอร์ม · ใส่ 0 ได้หากแจกฟรีพร้อมแบบ"
                  >
                    <TextInput
                      type="number"
                      min={0}
                      step={1}
                      value={form.calcPrice}
                      onChange={(e) => set("calcPrice", e.target.value)}
                      placeholder="เช่น 390"
                    />
                  </Field>
                  {form.calcSheetUrls.length > 0 && form.calcPrice === "" && (
                    <p className="text-[11px] text-amber-800">
                      มีไฟล์รายการคำนวณแล้วแต่ยังไม่ได้ตั้งราคา — ลูกค้าจะเห็นราคาเริ่มต้นของระบบ
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── 4. Confirmations ── */}
          <section className="mt-8 border-t border-border pt-8">
            <SectionTitle
              step={4}
              title="การยืนยันมาตรฐาน"
              desc="โปรดอ่านและยืนยันข้อความต่อไปนี้ก่อนบันทึก"
            />
            <div className="space-y-3">
              <CheckRow checked={form.permitReady} onChange={(v) => set("permitReady", v)}>
                แบบชุดนี้มีรายละเอียดครบถ้วน พร้อมสำหรับนำไปใช้ยื่นขออนุญาตก่อสร้างได้จริง
              </CheckRow>
              <CheckRow checked={form.boqComplete} onChange={(v) => set("boqComplete", v)}>
                มีรายการประมาณราคา (BOQ) ครบถ้วนครอบคลุมงานโครงสร้างและสถาปัตยกรรม
              </CheckRow>
              <CheckRow
                checked={form.contractConsent}
                onChange={(v) => set("contractConsent", v)}
              >
                ยืนยันว่าผลงานนี้เป็นลิขสิทธิ์แท้ของผู้ขาย และยินยอมให้ระบบนำไปใช้ตามเงื่อนไขของแพลตฟอร์ม{" "}
                <span className="text-red-500">*</span>
              </CheckRow>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-raised"
              >
                ยกเลิก
              </button>
              <PrimaryButton onClick={() => void saveForm()} loading={saving}>
                {form.id ? "บันทึกการแก้ไข" : "บันทึกและเปิดขาย"}
              </PrimaryButton>
            </div>
          </section>
        </Card>

        <div className="space-y-4 rounded-xl border border-[#1e40af]/20 bg-gradient-to-b from-blue-50/70 to-white p-4 sm:p-5">
          <div>
            <h3 className="text-base font-bold text-[#1e3a5f]">เครื่องมือเรนเดอร์ด้วย AI</h3>
            <p className="mt-0.5 text-sm text-text-muted">
              ใช้สร้างภาพเรนเดอร์ช่วยงานก่อนอัปโหลดในฟอร์มด้านบน — แสดงเต็มจอ ไม่พับเก็บ
            </p>
          </div>
          <AiImageToolCards />
          <AiRenderingGuide />
        </div>
      </div>
    );
  }

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
          onClick={() => void cleanupDummy()}
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
                          {COLLECTIONS.find((c) => c.id === l.collection)?.th ??
                            l.collection ??
                            "—"}
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
                            onClick={() => void removeListing(l)}
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
    </div>
  );
}
