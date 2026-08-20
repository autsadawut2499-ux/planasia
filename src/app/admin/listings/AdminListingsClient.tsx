"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X, Eraser, ExternalLink, BadgeCheck } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatusMessage,
} from "@/components/admin/AdminForm";
import { AiImageToolCards } from "@/components/vendor/AiImageToolCards";
import { AiRenderingGuide } from "@/components/vendor/AiRenderingGuide";
import { FileUpload } from "@/components/vendor/FileUpload";
import { Card, Field, PrimaryButton, Select, TextArea, TextInput } from "@/components/vendor/ui";
import { COLLECTIONS, STYLES } from "@/lib/store/taxonomy";
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
import { supplierNeedsProductUrl, type SupplierKind } from "@/lib/store/supplier-platform";
import {
  clearListingDraft,
  readListingDraft,
  readListingDraftActive,
  writeListingDraft,
  type ListingDraftKey,
} from "@/lib/admin/listing-form-draft";

type AdminSupplier = {
  id: string;
  name: string;
  kind: SupplierKind;
  slug?: string;
};

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
  supplierId: string;
  productUrl: string;
  /** Admin note: original house code from supplier. */
  sourcePlanCode: string;
  floors: number;
  beds: number;
  baths: number;
  /** Living / reception rooms (ห้องรับแขก). */
  livingRooms: string;
  parking: string;
  widthMeters: string;
  lengthMeters: string;
  areaSqm: string;
  constructionCostEstimate: string;
  /** Supplier cost (THB) for the main package. */
  costPrice: string;
  /** Selling price (THB) for the main package. */
  price: string;
  compareAtPrice: string;
  /** Selling price for site-plan add-on (แผนผังบริเวณ). */
  sitePlanAddonPrice: string;
  image: string;
  renderUrls: string[];
  floorPlanUrls: string[];
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
    supplierId: "",
    productUrl: "",
    sourcePlanCode: "",
    floors: 1,
    beds: 3,
    baths: 2,
    livingRooms: "1",
    parking: "1",
    widthMeters: "",
    lengthMeters: "",
    areaSqm: "",
    constructionCostEstimate: "",
    costPrice: "",
    price: "",
    compareAtPrice: "",
    sitePlanAddonPrice: "",
    image: "",
    renderUrls: [],
    floorPlanUrls: [],
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
    supplierId: l.supplierId ?? "",
    productUrl: l.productUrl ?? "",
    sourcePlanCode: l.sourcePlanCode ?? "",
    floors: l.floors,
    beds: l.beds,
    baths: l.baths,
    livingRooms: l.livingRooms != null ? String(l.livingRooms) : "",
    parking: l.parking != null ? String(l.parking) : "",
    widthMeters: l.widthMeters != null ? String(l.widthMeters) : "",
    lengthMeters: l.lengthMeters != null ? String(l.lengthMeters) : "",
    areaSqm: parseAreaSqm(l.area)?.toString() ?? "",
    constructionCostEstimate:
      l.constructionCostEstimate != null ? String(l.constructionCostEstimate) : "",
    costPrice: l.costPrice != null ? String(l.costPrice) : "",
    price: l.price != null ? String(l.price) : "",
    compareAtPrice:
      l.compareAtPrice != null
        ? String(l.compareAtPrice)
        : l.priceBreakdown?.compareAt != null
          ? String(l.priceBreakdown.compareAt)
          : "",
    sitePlanAddonPrice: l.sitePlanAddonPrice != null ? String(l.sitePlanAddonPrice) : "",
    image: l.image,
    renderUrls: l.renderUrls ?? [],
    floorPlanUrls: l.floorPlanUrls ?? [],
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
    description: form.description.trim() || namePreview,
    pitch: form.pitch || undefined,
    highlights: form.highlights,
    style: form.style,
    collection: form.collection || undefined,
    supplierId: form.supplierId.trim() || undefined,
    productUrl: form.productUrl.trim() || undefined,
    sourcePlanCode: form.sourcePlanCode.trim() || undefined,
    floors: form.floors,
    beds: form.beds,
    baths: form.baths,
    livingRooms: form.livingRooms === "" ? undefined : Number(form.livingRooms),
    parking: form.parking === "" ? undefined : Number(form.parking),
    area: `${Number(form.areaSqm)} sqm`,
    widthMeters: form.widthMeters === "" ? undefined : Number(form.widthMeters),
    lengthMeters: form.lengthMeters === "" ? undefined : Number(form.lengthMeters),
    costPrice: form.costPrice === "" ? undefined : Number(form.costPrice),
    price: Number(form.price),
    compareAtPrice: form.compareAtPrice === "" ? undefined : Number(form.compareAtPrice),
    sitePlanAddonPrice:
      form.sitePlanAddonPrice === "" ? undefined : Number(form.sitePlanAddonPrice),
    constructionCostEstimate:
      form.constructionCostEstimate === "" ? undefined : Number(form.constructionCostEstimate),
    image: form.image,
    renderUrls: form.renderUrls.filter(Boolean),
    floorPlanUrls: form.floorPlanUrls.filter(Boolean),
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

function FilterMatchSummary({
  form,
  supplierLabel,
}: {
  form: FormState;
  supplierLabel?: string | null;
}) {
  const style = STYLE_OPTIONS.find((s) => s.id === form.style);
  const collection = COLLECTION_OPTIONS.find((c) => c.id === form.collection);
  const area = Number(form.areaSqm);
  const chips = [
    style ? style.th : null,
    collection ? collection.th : null,
    supplierLabel?.trim() || null,
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
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [pendingDraft, setPendingDraft] = useState<{
    key: ListingDraftKey;
    form: FormState;
    savedAt: number;
  } | null>(null);

  const loadSuppliers = useCallback(async () => {
    const res = await fetch("/api/admin/suppliers", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "โหลดซัพพลายเออร์ไม่สำเร็จ");
    setSuppliers((data.suppliers ?? []) as AdminSupplier[]);
  }, []);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (styleFilter) params.set("style", styleFilter);
    const res = await fetch(`/api/admin/listings?${params}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "โหลดไม่สำเร็จ");
    setListings(Array.isArray(data.listings) ? data.listings : []);
  }, [q, styleFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([load(), loadSuppliers()])
      .catch((err) =>
        setStatus({ type: "error", message: err instanceof Error ? err.message : "โหลดไม่สำเร็จ" }),
      )
      .finally(() => setLoading(false));
  }, [load, loadSuppliers]);

  // Detect auto-saved drafts — do NOT auto-open the form (that hid the listings table).
  useEffect(() => {
    if (form) return;
    try {
      const active = readListingDraftActive();
      if (!active) {
        setPendingDraft(null);
        return;
      }
      const draft = readListingDraft<FormState>(active);
      if (!draft?.form) {
        setPendingDraft(null);
        return;
      }
      setPendingDraft({
        key: active,
        form: { ...emptyForm(), ...draft.form },
        savedAt: draft.savedAt,
      });
    } catch {
      setPendingDraft(null);
    }
  }, [form]);

  // Auto-save form to localStorage on every change (debounced).
  useEffect(() => {
    if (!form) return;
    const key: ListingDraftKey = form.id?.trim() ? form.id.trim() : "new";
    const timer = window.setTimeout(() => {
      writeListingDraft(key, form);
      setDraftSavedAt(Date.now());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [form]);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === form?.supplierId) ?? null,
    [suppliers, form?.supplierId],
  );
  const showProductUrl = supplierNeedsProductUrl(selectedSupplier);
  const platformSuppliers = useMemo(
    () => suppliers.filter((s) => s.kind === "platform"),
    [suppliers],
  );
  const customSuppliers = useMemo(
    () => suppliers.filter((s) => s.kind !== "platform"),
    [suppliers],
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  function openCreate() {
    const draft = readListingDraft<FormState>("new");
    setForm(draft?.form ? { ...emptyForm(), ...draft.form, id: undefined } : emptyForm());
    setDraftSavedAt(draft?.savedAt ?? null);
    setStatus(
      draft?.form
        ? {
            type: "success",
            message: "กู้คืนแบบร่างรายการใหม่ที่บันทึกค้างไว้",
          }
        : null,
    );
  }

  function openEdit(listing: VendorListing) {
    const draft = readListingDraft<FormState>(listing.id);
    if (draft?.form) {
      setForm({ ...emptyForm(), ...draft.form, id: listing.id });
      setDraftSavedAt(draft.savedAt);
      setStatus({
        type: "success",
        message: "กู้คืนแบบร่างการแก้ไขที่บันทึกค้างไว้",
      });
      return;
    }
    setForm(listingToForm(listing));
    setDraftSavedAt(null);
    setStatus(null);
  }

  function closeForm() {
    // Keep draft in localStorage so returning later can restore it.
    setForm(null);
  }

  function resumePendingDraft() {
    if (!pendingDraft) return;
    setForm(pendingDraft.form);
    setDraftSavedAt(pendingDraft.savedAt);
    setPendingDraft(null);
    setStatus({
      type: "success",
      message: "เปิดแบบร่างที่บันทึกค้างไว้แล้ว — กดบันทึกเมื่อพร้อม หรือทิ้งแบบร่างได้",
    });
  }

  function discardPendingDraft() {
    if (!pendingDraft) return;
    clearListingDraft(pendingDraft.key);
    setPendingDraft(null);
    setStatus({ type: "success", message: "ล้างแบบร่างค้างไว้แล้ว" });
  }

  function discardDraft() {
    if (!form) return;
    const key: ListingDraftKey = form.id?.trim() ? form.id.trim() : "new";
    clearListingDraft(key);
    setDraftSavedAt(null);
    setPendingDraft(null);
    if (form.id) {
      const listing = listings.find((l) => l.id === form.id);
      setForm(listing ? listingToForm(listing) : emptyForm());
    } else {
      setForm(emptyForm());
    }
    setStatus({ type: "success", message: "ล้างแบบร่างแล้ว" });
  }

  async function saveNewSupplier() {
    const name = newSupplierName.trim();
    if (!name) {
      setStatus({ type: "error", message: "กรุณากรอกชื่อซัพพลายเออร์" });
      return;
    }
    setSavingSupplier(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เพิ่มซัพพลายเออร์ไม่สำเร็จ");
      const created = data.supplier as AdminSupplier;
      await loadSuppliers();
      setForm((f) => (f ? { ...f, supplierId: created.id, productUrl: "" } : f));
      setSupplierModalOpen(false);
      setNewSupplierName("");
      setStatus({ type: "success", message: `เพิ่มซัพพลายเออร์ “${created.name}” แล้ว` });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "เพิ่มซัพพลายเออร์ไม่สำเร็จ",
      });
    } finally {
      setSavingSupplier(false);
    }
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
    if (!form.supplierId.trim()) {
      setStatus({ type: "error", message: "กรุณาเลือกซัพพลายเออร์" });
      return;
    }
    if (showProductUrl) {
      const url = form.productUrl.trim();
      if (!url) {
        setStatus({ type: "error", message: "กรุณาใส่ลิงก์สินค้า (Product URL) สำหรับ Shopee / Lazada" });
        return;
      }
      try {
        const u = new URL(url);
        if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("bad");
      } catch {
        setStatus({ type: "error", message: "ลิงก์สินค้าต้องเป็น URL ที่ขึ้นต้นด้วย http:// หรือ https://" });
        return;
      }
    }
    if (
      form.costPrice === "" ||
      !Number.isFinite(Number(form.costPrice)) ||
      Number(form.costPrice) < 0 ||
      !Number.isInteger(Number(form.costPrice))
    ) {
      setStatus({ type: "error", message: "กรุณากรอกราคาต้นทุน (จำนวนเต็มไม่ติดลบ)" });
      return;
    }
    if (!form.description.trim()) {
      setStatus({ type: "error", message: "กรุณากรอกคำอธิบายบ้าน" });
      return;
    }
    if (
      form.sitePlanAddonPrice !== "" &&
      (!Number.isFinite(Number(form.sitePlanAddonPrice)) ||
        Number(form.sitePlanAddonPrice) < 0 ||
        !Number.isInteger(Number(form.sitePlanAddonPrice)))
    ) {
      setStatus({
        type: "error",
        message: "ราคาแพ็กเกจเสริมต้องเป็นจำนวนเต็มไม่ติดลบ หรือเว้นว่าง",
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
      clearListingDraft(form.id?.trim() ? form.id.trim() : "new");
      setDraftSavedAt(null);
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
      pending: "ยังไม่เผยแพร่ (ค้างจากก่อนยืนยันตัวตน)",
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
          description="โมเดลตัวกลาง: อัปโหลดภาพเรนเดอร์ ตั้งราคาต้นทุน/ราคาขาย และระบุซัพพลายเออร์ — ไม่เก็บไฟล์เอกสารแบบบนระบบ"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p>
            {draftSavedAt
              ? `บันทึกแบบร่างอัตโนมัติแล้ว · ${new Date(draftSavedAt).toLocaleTimeString("th-TH")}`
              : "ระบบจะบันทึกแบบร่างอัตโนมัติเมื่อมีการแก้ไข"}
          </p>
          <button
            type="button"
            onClick={discardDraft}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
          >
            ทิ้งแบบร่าง
          </button>
        </div>

        {status && (
          <AdminStatusMessage type={status.type} message={status.message} />
        )}

        <Card
          title="ลงขายแบบบ้าน (สั่งจากซัพพลายเออร์หลังมีออเดอร์)"
          desc={
            form.id
              ? "แก้ไขรายละเอียดแบบบ้านในแคตตาล็อก"
              : "กรอกข้อมูลต่อเนื่องจากบนลงล่าง แล้วกดบันทึกที่ด้านล่างสุด"
          }
        >
          {/* ── 1. Search filters + core listing data ── */}
          <section>
            <SectionTitle
              step={1}
              title="ข้อมูลหลักและตัวกรองค้นหา"
              desc="รหัสแบบบ้าน ราคา คำอธิบาย และข้อมูลสเปกสำหรับระบบค้นหา"
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
                    label="ราคาต้นทุน (บาท) *"
                    hint="ต้นทุนสั่งซื้อจากซัพพลายเออร์สำหรับแพ็กเกจหลัก"
                  >
                    <TextInput
                      type="number"
                      min={0}
                      step={1}
                      value={form.costPrice}
                      onChange={(e) => set("costPrice", e.target.value)}
                      placeholder="เช่น 1500"
                    />
                  </Field>
                  <Field
                    label="ราคาขาย (บาท) *"
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
                  {form.costPrice !== "" &&
                    form.price !== "" &&
                    Number.isFinite(Number(form.costPrice)) &&
                    Number.isFinite(Number(form.price)) && (
                      <div
                        className={`rounded-lg border px-3 py-2 text-xs ${
                          Number(form.price) - Number(form.costPrice) >= 0
                            ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                            : "border-red-200 bg-red-50 text-red-800"
                        }`}
                      >
                        กำไรโดยประมาณ:{" "}
                        <span className="font-bold">
                          ฿
                          {(Number(form.price) - Number(form.costPrice)).toLocaleString("th-TH")}
                        </span>
                        {" · "}
                        ต้นทุน ฿{Number(form.costPrice).toLocaleString("th-TH")} → ขาย ฿
                        {Number(form.price).toLocaleString("th-TH")}
                      </div>
                    )}
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
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field
                      label="ซัพพลายเออร์ (Supplier) *"
                      hint="แพลตฟอร์มหลักคงที่ (Shopee/Lazada) หรือซัพพลายเออร์ทั่วไปที่เพิ่มเอง"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <Select
                          value={form.supplierId}
                          onChange={(e) => {
                            const id = e.target.value;
                            const next = suppliers.find((s) => s.id === id) ?? null;
                            setForm((f) =>
                              f
                                ? {
                                    ...f,
                                    supplierId: id,
                                    productUrl: supplierNeedsProductUrl(next) ? f.productUrl : "",
                                  }
                                : f,
                            );
                          }}
                          className="sm:flex-1"
                        >
                          <option value="">— เลือกซัพพลายเออร์ —</option>
                          <optgroup label="แพลตฟอร์มหลัก">
                            {platformSuppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="ซัพพลายเออร์ทั่วไป">
                            {customSuppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </optgroup>
                        </Select>
                        <button
                          type="button"
                          onClick={() => {
                            setNewSupplierName("");
                            setSupplierModalOpen(true);
                          }}
                          className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-[#1e40af]/30 bg-white px-3 py-2 text-xs font-semibold text-[#1e40af] hover:bg-blue-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          เพิ่มซัพพลายเออร์ใหม่
                        </button>
                      </div>
                    </Field>
                    {showProductUrl && (
                      <div className="mt-3">
                        <Field
                          label="ใส่ลิงก์สินค้า (Product URL) *"
                          hint="ลิงก์หน้าสินค้าบน Shopee / Lazada สำหรับสั่งซื้อหลังมีออเดอร์"
                        >
                          <TextInput
                            value={form.productUrl}
                            onChange={(e) => set("productUrl", e.target.value.slice(0, 2000))}
                            placeholder="https://shopee.co.th/... หรือ https://www.lazada.co.th/..."
                          />
                        </Field>
                      </div>
                    )}
                    <div className="mt-3">
                      <Field
                        label="โน้ตรหัสบ้านต้นทาง"
                        hint="รหัสแบบบ้านจากซัพพลายเออร์ / แพลตฟอร์มต้นทาง — ใช้ค้นหาตอนสั่งซื้อหลังมีออเดอร์"
                      >
                        <TextInput
                          value={form.sourcePlanCode}
                          onChange={(e) => set("sourcePlanCode", e.target.value.slice(0, 120))}
                          placeholder="เช่น MOD-1234 / SKU จาก Shopee"
                          maxLength={120}
                        />
                      </Field>
                    </div>
                  </div>
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
                  <FilterMatchSummary form={form} supplierLabel={selectedSupplier?.name} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-raised/60 p-4 sm:p-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-text-secondary">คำอธิบายแบบบ้าน</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-text-muted">
                    แสดงบนหน้ารายละเอียดสินค้าและการ์ดแบบบ้านในร้านค้า — อธิบายจุดเด่น ฟังก์ชันห้อง และการใช้งานจริง
                  </p>
                </div>
                <div className="grid gap-4">
                  <Field
                    label="ข้อความสั้นใต้ชื่อ (ไม่บังคับ)"
                    hint="หนึ่งบรรทัดสรุปแบบบ้าน เช่น “บ้านโมเดิร์น 3 นอน รับแสงดี”"
                  >
                    <TextInput
                      value={form.tagline}
                      onChange={(e) => set("tagline", e.target.value.slice(0, 160))}
                      placeholder="เช่น บ้านชั้นเดียวโปร่งโล่ง · เหมาะกับที่ดินแคบ"
                      maxLength={160}
                    />
                  </Field>
                  <Field
                    label="คำอธิบายบ้าน *"
                    hint="รายละเอียดแบบบ้านที่ลูกค้าจะอ่านก่อนซื้อ — กรอกให้ตรงความจริง"
                  >
                    <TextArea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value.slice(0, 4000))}
                      placeholder="เช่น บ้าน 2 ชั้นสไตล์โมเดิร์น มีห้องรับแขกกว้าง เชื่อมต่อครัวเปิด ห้องนอนหลักพร้อมห้องน้ำในตัว จอดรถได้ 2 คัน…"
                      rows={5}
                      maxLength={4000}
                    />
                  </Field>
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
                  ภาพแปลนพื้น (สำหรับแสดงผล){" "}
                  <span className="text-text-muted">— ไม่บังคับ · ไม่ใช่ไฟล์เอกสารส่งมอบ</span>
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

          {/* ── 3. Packages (catalogue definition — docs ordered from supplier) ── */}
          <section className="mt-8 border-t border-border pt-8">
            <SectionTitle
              step={3}
              title="โครงสร้างแพ็กเกจสินค้า"
              desc="กำหนดราคาแพ็กเกจ — เอกสารจริงสั่งจากซัพพลายเออร์หลังมีออเดอร์ ไม่ได้อัปโหลดไฟล์เอกสารบนระบบ"
            />
            <div className="space-y-4">
              <div className="rounded-xl border border-[#1e40af]/20 bg-blue-50/50 px-4 py-3 text-sm text-[#1e3a5f]">
                <p className="font-semibold">แพ็กเกจหลัก (ราคาขายด้านบน)</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs text-slate-700">
                  <li>เอกสารแบบบ้านพร้อมยื่นขออนุญาตก่อสร้าง 3 ชุด</li>
                  <li>ไฟล์ Bill of Quantity (BOQ) เพื่อยื่นขออนุญาตก่อสร้าง</li>
                </ul>
              </div>
              <Field
                label="แพ็กเกจเสริม — แผนผังบริเวณ (บาท)"
                hint="ราคาขายแอดออน «เขียนแผนผังบริเวณ» · ว่างไว้ใช้ค่าเริ่มต้น ฿1,000"
              >
                <TextInput
                  type="number"
                  min={0}
                  step={1}
                  value={form.sitePlanAddonPrice}
                  onChange={(e) => set("sitePlanAddonPrice", e.target.value)}
                  placeholder="เช่น 490"
                />
              </Field>
              <p className="text-[11px] text-text-muted">
                หลังลูกค้าชำระเงิน ระบบจะใช้ชื่อซัพพลายเออร์เพื่อสั่งซื้อและจัดส่งเอกสารนอกแพลตฟอร์ม
                (เชื่อม LINE OA ในขั้นถัดไป)
              </p>
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

        {supplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
              <h3 className="text-base font-bold text-[#1e3a5f]">เพิ่มซัพพลายเออร์ใหม่</h3>
              <p className="mt-1 text-xs text-slate-500">
                บันทึกลงตาราง suppliers แล้วเลือกได้ทันทีใน Dropdown (ไม่ต้องรีเฟรช)
              </p>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  ชื่อซัพพลายเออร์ *
                </span>
                <TextInput
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value.slice(0, 120))}
                  placeholder="เช่น aphouse"
                  maxLength={120}
                  autoFocus
                />
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSupplierModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <PrimaryButton onClick={() => void saveNewSupplier()} loading={savingSupplier}>
                  บันทึก
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="จัดการแบบบ้าน"
        description="แคตตาล็อกตัวกลาง: ภาพเรนเดอร์ · ราคาต้นทุน/ขาย · ซัพพลายเออร์ — สั่งเอกสารจากซัพพลายเออร์หลังมีออเดอร์"
      />

      {status && (
        <div className="mb-6">
          <AdminStatusMessage type={status.type} message={status.message} />
        </div>
      )}

      {pendingDraft && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p>
            มีแบบร่างค้างไว้
            {pendingDraft.key === "new" ? " (รายการใหม่)" : " (กำลังแก้ไข)"} ·{" "}
            {new Date(pendingDraft.savedAt).toLocaleString("th-TH")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resumePendingDraft}
              className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
            >
              เปิดแบบร่างต่อ
            </button>
            <button
              type="button"
              onClick={discardPendingDraft}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              ทิ้งแบบร่าง
            </button>
          </div>
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
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load()
              .catch((err) =>
                setStatus({
                  type: "error",
                  message: err instanceof Error ? err.message : "โหลดไม่สำเร็จ",
                }),
              )
              .finally(() => setLoading(false));
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          รีเฟรช
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
                  <th className="pb-3 pr-3 font-semibold">ซัพพลายเออร์</th>
                  <th className="pb-3 pr-3 font-semibold">สเปก</th>
                  <th className="pb-3 pr-3 font-semibold">ราคา / ต้นทุน</th>
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
                        ? ["รอเผยแพร่ (ค้าง)", "bg-amber-100 text-amber-800"]
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
                        <p className="text-xs font-medium text-slate-800">
                          {l.supplierName?.trim() || "—"}
                        </p>
                        {l.productUrl ? (
                          <a
                            href={l.productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#1e40af] hover:underline"
                          >
                            ลิงก์สินค้า
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                        {l.sourcePlanCode?.trim() ? (
                          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                            ต้นทาง: {l.sourcePlanCode.trim()}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {l.beds} นอน · {l.baths} น้ำ
                        {l.livingRooms != null && l.livingRooms > 0
                          ? ` · ${l.livingRooms} รับแขก`
                          : ""}{" "}
                        · {l.floors} ชั้น
                        <br />
                        <span className="text-xs text-slate-400">{l.area}</span>
                      </td>
                      <td className="py-3 pr-3 font-semibold text-slate-900">
                        <p>{l.price <= 0 ? "ฟรี" : `฿${l.price.toLocaleString("th-TH")}`}</p>
                        {l.costPrice != null && (
                          <p className="text-[11px] font-normal text-slate-500">
                            ต้นทุน ฿{l.costPrice.toLocaleString("th-TH")}
                            {l.price > 0
                              ? ` · กำไร ฿${(l.price - l.costPrice).toLocaleString("th-TH")}`
                              : ""}
                          </p>
                        )}
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
