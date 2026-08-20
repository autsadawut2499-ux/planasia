"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { AiImageToolCards } from "@/components/vendor/AiImageToolCards";
import { AiRenderingGuide } from "@/components/vendor/AiRenderingGuide";
import { FileUpload } from "@/components/vendor/FileUpload";
import { MultiFileUpload } from "@/components/vendor/MultiFileUpload";
import { Card, Field, PrimaryButton, Select, TextInput } from "@/components/vendor/ui";
import type { useVendorDashboard } from "@/hooks/useVendorDashboard";
import { PLATFORM_SHARE, VENDOR_SHARE, vendorNetPreview } from "@/lib/commerce/commission";
import { parseAreaSqm } from "@/lib/format";
import {
  MIN_PAID_LISTING_PRICE_THB,
  listingPriceErrorTh,
} from "@/lib/store/listing-price";
import { PROVINCES_BY_REGION, provinceLabel } from "@/lib/geo/th-provinces";
import {
  buildAutoListingName,
  planPrefixForStyle,
  styleLabelForListingName,
} from "@/lib/store/plan-code";
import { COLLECTIONS, STYLES } from "@/lib/store/taxonomy";
import type { VendorListing } from "@/lib/store/listing-types";

type Dashboard = ReturnType<typeof useVendorDashboard>;

/** Filter vocabularies come from the store taxonomy so submissions stay findable. */
const STYLE_OPTIONS = STYLES;
const COLLECTION_OPTIONS = COLLECTIONS;

interface FormState {
  id?: string;
  /** Public running code (MOD-001) — assigned by the server on first save. */
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
  livingRooms: string;
  parking: string;
  widthMeters: string;
  lengthMeters: string;
  /** Usable area in m² — numeric so the store's area filter always matches. */
  areaSqm: string;
  constructionCostEstimate: string;
  price: string;
  image: string;
  renderUrls: string[];
  floorPlanUrls: string[];
  blueprintPdfUrls: string[];
  cadFileUrls: string[];
  boqFileUrls: string[];
  /** Designer-set BOQ add-on price (THB). Empty = platform default. */
  boqPrice: string;
  calcPrice: string;
  calcSheetUrls: string[];
  permitReady: boolean;
  boqComplete: boolean;
  contractConsent: boolean;
}

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
    livingRooms: "1",
    parking: "1",
    widthMeters: "",
    lengthMeters: "",
    areaSqm: "",
    constructionCostEstimate: "",
    price: "",
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

function fromListing(l: VendorListing): FormState {
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
    livingRooms: l.livingRooms?.toString() ?? "",
    parking: l.parking?.toString() ?? "",
    widthMeters: l.widthMeters?.toString() ?? "",
    lengthMeters: l.lengthMeters?.toString() ?? "",
    areaSqm: parseAreaSqm(l.area)?.toString() ?? "",
    constructionCostEstimate: l.constructionCostEstimate?.toString() ?? "",
    price: l.price?.toString() ?? "",
    image: l.image,
    renderUrls: l.renderUrls ?? [],
    floorPlanUrls: l.floorPlanUrls ?? [],
    blueprintPdfUrls: (l.blueprintPdfUrls ?? (l.blueprintPdfUrl ? [l.blueprintPdfUrl] : [])).slice(0, 1),
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

/** Seller-facing Active / Hidden (+ moderation note when useful). */
function listingStatusBadge(listing: VendorListing): { label: string; cls: string } {
  if (listing.isPublished === false) {
    return { label: "ซ่อน", cls: "bg-slate-200 text-slate-700" };
  }
  if (listing.moderationStatus === "rejected") {
    return { label: "ถูกระงับ", cls: "bg-red-100 text-red-700" };
  }
  if (listing.moderationStatus === "pending") {
    return { label: "รอเผยแพร่", cls: "bg-amber-100 text-amber-800" };
  }
  return { label: "เปิดใช้งาน", cls: "bg-emerald-100 text-emerald-800" };
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

/** Mirrors the store filter chips so vendors see how buyers will find the plan. */
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
    Number(form.livingRooms) > 0 ? `${form.livingRooms} ห้องรับแขก` : null,
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

export function VendorListingsTab({ dash }: { dash: Dashboard }) {
  const { data, uploadFile, saveListing, deleteListing, setListingPublished } = dash;
  const toast = useToast();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<string[]>([]);

  const listings = data?.listings ?? [];
  const kycOk = data?.kycApproved ?? false;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  async function handleSave() {
    if (!form) return;
    if (!form.image) return toast.error("ต้องมีภาพเรนเดอร์ 3D อย่างน้อย 1 รูป");
    const priceErr = listingPriceErrorTh(form.price);
    if (priceErr) return toast.error(priceErr);
    if (!form.areaSqm || Number(form.areaSqm) <= 0)
      return toast.error("กรุณากรอกพื้นที่ใช้สอย (ตร.ม.) — ระบบใช้ค่านี้ในตัวกรองค้นหา");
    if (!form.province) return toast.error("กรุณาเลือกจังหวัดที่ให้บริการ");
    if (form.floorPlanUrls.length < 1) return toast.error("กรุณาอัปโหลดแปลนพื้นอย่างน้อย 1 รูป");
    if (form.blueprintPdfUrls.length !== 1)
      return toast.error("กรุณาอัปโหลดไฟล์แบบแปลนหลัก PDF หรือ ZIP (1 ไฟล์)");
    if (!form.contractConsent)
      return toast.error(
        "กรุณายืนยันว่าผลงานเป็นลิขสิทธิ์แท้ของผู้ขาย และยินยอมตามเงื่อนไขของแพลตฟอร์ม",
      );

    setSaving(true);
    setRejectReasons([]);
    try {
      // Name is assigned on the server as "{PlanCode} {Style}" (e.g. MOD-001 Modern).
      // Client sends a preview placeholder; server overwrites with the real code.
      const namePreview = buildAutoListingName(
        form.style,
        form.planId || `${planPrefixForStyle(form.style)}-###`,
      );
      const result = await saveListing({
        id: form.id,
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
        livingRooms: form.livingRooms || undefined,
        parking: form.parking || undefined,
        widthMeters: form.widthMeters || undefined,
        lengthMeters: form.lengthMeters || undefined,
        // Stored in the canonical "<n> sqm" shape the area filter parses.
        area: `${Number(form.areaSqm)} sqm`,
        constructionCostEstimate: form.constructionCostEstimate || undefined,
        price: form.price,
        image: form.image,
        renderUrls: form.renderUrls,
        floorPlanUrls: form.floorPlanUrls,
        blueprintPdfUrls: form.blueprintPdfUrls,
        cadFileUrls: form.cadFileUrls,
        boqFileUrls: form.boqFileUrls,
        boqPrice: form.boqPrice !== "" ? form.boqPrice : undefined,
        calcPrice: form.calcPrice !== "" ? form.calcPrice : undefined,
        calcSheetUrls: form.calcSheetUrls,
        permitReady: form.permitReady,
        boqComplete: form.boqComplete,
        contractConsent: form.contractConsent,
      });
      if (result.published) {
        toast.success(
          form.id
            ? `อัปเดตและเผยแพร่แล้ว — รหัส ${result.listing.planId}`
            : `เผยแพร่แล้วทันที — รหัสแบบบ้าน ${result.listing.planId}`,
        );
        setForm(null);
        setRejectReasons([]);
      } else {
        const reasons =
          result.reasons.length > 0
            ? result.reasons
            : ["AI ไม่ผ่านการตรวจสอบ — แก้ไขข้อมูลแล้วส่งใหม่"];
        setRejectReasons(reasons);
        toast.error(`AI ไม่ผ่าน: ${reasons[0]}`);
        // Keep the form open so the vendor can fix issues without re-entering data.
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(l: VendorListing) {
    if (!confirm(`ลบแบบบ้าน "${l.name}" ?`)) return;
    setDeletingId(l.id);
    try {
      await deleteListing(l.id);
      toast.success("ลบแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTogglePublish(l: VendorListing) {
    const next = l.isPublished === false;
    setTogglingId(l.id);
    try {
      await setListingPublished(l.id, next);
      toast.success(
        next
          ? "เผยแพร่แล้ว — แบบกลับไปแสดงในร้านสาธารณะ"
          : "ซ่อนแล้ว — แบบไม่แสดงในร้าน แต่ยังอยู่ในแดชบอร์ด",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setTogglingId(null);
    }
  }

  if (form) {
    return (
      <div className="space-y-5">
        {rejectReasons.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">AI ไม่ผ่านการตรวจสอบ — กรุณาแก้ไขแล้วส่งใหม่</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {rejectReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Single continuous form — no AI tools interrupting the flow */}
        <Card
          title="ส่งผลงานเพื่อลงขายบนแพลตฟอร์ม"
          desc={form.id ? "แก้ไขรายละเอียดแบบบ้าน" : "กรอกข้อมูลต่อเนื่องจากบนลงล่าง แล้วกดส่งที่ด้านล่างสุด"}
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
                    hint={`แจกฟรีได้ (ใส่ 0) — ถ้าคิดเงินต้องอย่างน้อย ฿${MIN_PAID_LISTING_PRICE_THB.toLocaleString("th-TH")} · แพลตฟอร์มหัก ${Math.round(PLATFORM_SHARE * 100)}% / คุณได้ ${Math.round(VENDOR_SHARE * 100)}%`}
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
                  {Number(form.price) > 0 && Number(form.price) < MIN_PAID_LISTING_PRICE_THB && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      ราคาต่ำกว่าขั้นต่ำ — ต้องอย่างน้อย ฿
                      {MIN_PAID_LISTING_PRICE_THB.toLocaleString("th-TH")} หรือใส่ 0 หากแจกฟรี
                    </div>
                  )}
                  {Number(form.price) >= MIN_PAID_LISTING_PRICE_THB && (
                    <div className="rounded-lg border border-[#1e40af]/20 bg-blue-50/60 px-3 py-2 text-xs text-[#1e3a5f]">
                      <p>
                        ราคาขายลูกค้า:{" "}
                        <span className="font-bold">฿{Number(form.price).toLocaleString()}</span>
                      </p>
                      <p className="mt-0.5">
                        คุณจะได้รับ ({Math.round(VENDOR_SHARE * 100)}%):{" "}
                        <span className="font-bold text-[#1e40af]">
                          ฿{vendorNetPreview(Number(form.price)).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised/60 p-4 sm:p-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-text-secondary">
                    ข้อมูลสำหรับระบบค้นหาและตัวกรอง
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-text-muted">
                    กรอกให้ตรงความจริงเพื่อให้แบบของคุณถูกค้นเจอ
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
                  <Field
                    label="ห้องรับแขก"
                    hint="จำนวนห้องรับแขก / ห้องนั่งเล่น — กรอกให้ตรงแบบเพื่อให้ค้นเจอ"
                  >
                    <TextInput
                      type="number"
                      min={0}
                      value={form.livingRooms}
                      onChange={(e) => set("livingRooms", e.target.value)}
                      placeholder="เช่น 1"
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
                      onUpload={uploadFile}
                      onUploaded={(url) => set("image", url)}
                      onError={(m) => toast.error(m)}
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
                        onUpload={uploadFile}
                        onUploaded={(url) => set("renderUrls", [...form.renderUrls, url])}
                        onError={(m) => toast.error(m)}
                        hint="+ เพิ่มรูป"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-text-secondary">
                  ภาพแปลนพื้น (Clean Plan){" "}
                  <span className="text-text-muted">— สำหรับโชว์ลูกค้า (ไม่บังคับ)</span>
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
                        onUpload={uploadFile}
                        onUploaded={(url) => set("floorPlanUrls", [...form.floorPlanUrls, url])}
                        onError={(m) => toast.error(m)}
                        hint="+ เพิ่ม"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. Delivery files: PDF / CAD / BOQ / calc ── */}
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
                hint="อัปโหลดได้ 1 ไฟล์ · .pdf หรือ .zip (สูงสุด 100MB)"
                onUpload={uploadFile}
                onError={(m) => toast.error(m)}
              />
              <MultiFileUpload
                kind="cad"
                variant="cad"
                values={form.cadFileUrls}
                onChange={(urls) => set("cadFileUrls", urls.slice(0, 1))}
                label="ไฟล์ AutoCAD (DWG)"
                hint="อัปโหลดได้ 1 ไฟล์เท่านั้น · นามสกุล .dwg"
                onUpload={uploadFile}
                onError={(m) => toast.error(m)}
              />
              <MultiFileUpload
                kind="boq"
                variant="doc"
                values={form.boqFileUrls}
                onChange={(urls) => set("boqFileUrls", urls.slice(0, 1))}
                label="ไฟล์ BOQ (PDF)"
                hint="อัปโหลดได้ 1 ไฟล์เท่านั้น · นามสกุล .pdf — รายการประมาณราคา"
                onUpload={uploadFile}
                onError={(m) => toast.error(m)}
              />
              <MultiFileUpload
                kind="calc"
                variant="calc"
                values={form.calcSheetUrls}
                onChange={(urls) => set("calcSheetUrls", urls.slice(0, 1))}
                label="รายการคำนวณ (PDF)"
                hint="อัปโหลดได้ 1 ไฟล์เท่านั้น · นามสกุล .pdf (ไม่บังคับ)"
                onUpload={uploadFile}
                onError={(m) => toast.error(m)}
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

          {/* Confirmations + single bottom actions */}
          <section className="mt-8 border-t border-border pt-8">
            <SectionTitle
              step={4}
              title="การยืนยันมาตรฐาน"
              desc="โปรดอ่านและยืนยันข้อความต่อไปนี้ก่อนส่งผลงาน"
            />
            <div className="space-y-3">
              <CheckRow checked={form.permitReady} onChange={(v) => set("permitReady", v)}>
                แบบชุดนี้มีรายละเอียดครบถ้วน พร้อมสำหรับนำไปใช้ยื่นขออนุญาตก่อสร้างได้จริง
              </CheckRow>
              <CheckRow checked={form.boqComplete} onChange={(v) => set("boqComplete", v)}>
                มีรายการประมาณราคา (BOQ) ครบถ้วนครอบคลุมงานโครงสร้างและสถาปัตยกรรม
              </CheckRow>
              <CheckRow checked={form.contractConsent} onChange={(v) => set("contractConsent", v)}>
                ยืนยันว่าผลงานนี้เป็นลิขสิทธิ์แท้ของผู้ขาย และยินยอมให้ระบบนำไปใช้ตามเงื่อนไขของแพลตฟอร์ม{" "}
                <span className="text-red-500">*</span>
              </CheckRow>
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => {
                  setForm(null);
                  setRejectReasons([]);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-raised"
              >
                ยกเลิก
              </button>
              <PrimaryButton onClick={handleSave} loading={saving}>
                {form.id ? "บันทึกการแก้ไข" : "ส่งผลงานเพื่อตรวจสอบ"}
              </PrimaryButton>
            </div>
          </section>
        </Card>

        {/* AI tools below the form — always fully visible (no collapse) */}
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">แบบบ้านของฉัน ({listings.length})</h3>
          <p className="text-sm text-text-muted">จัดการผลงาน อัปโหลดแบบใหม่ และแก้ไขราคา</p>
        </div>
        <PrimaryButton
          disabled={!kycOk}
          onClick={() => {
            if (!kycOk) return;
            setForm(emptyForm());
            setRejectReasons([]);
          }}
        >
          <Plus className="h-4 w-4" /> ส่งผลงานใหม่
        </PrimaryButton>
      </div>

      {!kycOk ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          กรุณายืนยันตัวตนให้ผ่านก่อนอัปโหลดแบบบ้าน — เมื่อยืนยันแล้วจะเผยแพร่สู่เว็บไซต์ได้ทันทีโดยไม่ต้องรอแอดมินอนุมัติ
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ยืนยันตัวตนแล้ว — อัปโหลดแบบบ้านผ่านการตรวจ AI แล้วจะเผยแพร่และเปิดขายทันที
        </div>
      )}

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-raised py-16 text-center">
          <p className="text-text-muted">
            ยังไม่มีแบบบ้าน — กด “ส่งผลงานใหม่” เพื่อเริ่มขายผลงานแรกของคุณ
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => {
            const status = listingStatusBadge(l);
            const hidden = l.isPublished === false;
            return (
              <li
                key={l.id}
                className={`flex flex-col gap-3 rounded-xl border bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-3.5 ${
                  hidden ? "border-slate-200 bg-slate-50/80" : "border-border"
                }`}
              >
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-surface-raised sm:h-[72px] sm:w-[96px]">
                  {l.image ? (
                    <Image
                      src={l.image}
                      alt={l.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[11px] font-bold tracking-wide text-[#1e40af]">
                      {l.planId}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-text-primary">
                    {l.name}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[#1e40af]">
                    {l.price <= 0 ? "ฟรี" : `฿${l.price.toLocaleString()}`}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(fromListing(l));
                      setRejectReasons([]);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-raised"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleTogglePublish(l)}
                    disabled={togglingId === l.id}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                      hidden
                        ? "border border-[#1e40af]/30 bg-[#1e40af] text-white hover:bg-[#1d4ed8]"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {hidden ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        เผยแพร่
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        ซ่อน
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(l)}
                    disabled={deletingId === l.id}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-2.5 py-2 text-text-muted hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                    aria-label="ลบแบบบ้าน"
                    title="ลบถาวร"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-4 border-t border-border pt-5">
        <AiImageToolCards />
        <AiRenderingGuide />
      </div>
    </div>
  );
}
