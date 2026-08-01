"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Plus, Upload, X } from "lucide-react";
import { MAX_PORTFOLIO_IMAGES } from "@/lib/home-building/types";

interface FormState {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  lineId: string;
  serviceAreas: string;
  yearsExperience: string;
  expertise: string;
  logoUrl: string;
  portfolioUrls: string[];
  companyCertificateUrl: string;
  verificationDocumentUrl: string;
  privacyAccepted: boolean;
  termsAccepted: boolean;
}

const EMPTY: FormState = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  lineId: "",
  serviceAreas: "",
  yearsExperience: "",
  expertise: "",
  logoUrl: "",
  portfolioUrls: [],
  companyCertificateUrl: "",
  verificationDocumentUrl: "",
  privacyAccepted: false,
  termsAccepted: false,
};

async function uploadFile(file: File, kind: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const res = await fetch("/api/home-builders/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "อัปโหลดไม่สำเร็จ");
  return data.publicUrl as string;
}

/**
 * Contractor registration form — text fields + multi portfolio images + docs.
 * Submits to /api/home-builders (stored as pending in home_builders).
 */
export function ContractorRegistrationForm({
  onSubmitted,
  onCancel,
  embedInModal = false,
}: {
  onSubmitted?: (message: string) => void;
  onCancel?: () => void;
  /** Drop outer card chrome when rendered inside a modal. */
  embedInModal?: boolean;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSingleUpload(
    file: File | undefined,
    kind: "logo" | "company_certificate" | "verification_document",
    field: "logoUrl" | "companyCertificateUrl" | "verificationDocumentUrl",
  ) {
    if (!file) return;
    setUploading(kind);
    setError(null);
    try {
      const url = await uploadFile(file, kind);
      set(field, url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(null);
    }
  }

  async function handlePortfolioFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading("portfolio");
    setError(null);
    try {
      const remaining = MAX_PORTFOLIO_IMAGES - form.portfolioUrls.length;
      const batch = Array.from(files).slice(0, remaining);
      const urls: string[] = [];
      for (const file of batch) {
        urls.push(await uploadFile(file, "portfolio"));
      }
      set("portfolioUrls", [...form.portfolioUrls, ...urls].slice(0, MAX_PORTFOLIO_IMAGES));
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดรูปผลงานไม่สำเร็จ");
    } finally {
      setUploading(null);
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";
    }
  }

  function removePortfolio(index: number) {
    set(
      "portfolioUrls",
      form.portfolioUrls.filter((_, i) => i !== index),
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/home-builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          contactPerson: form.contactPerson,
          phone: form.phone,
          email: form.email,
          lineId: form.lineId,
          serviceAreas: form.serviceAreas,
          yearsExperience: Number(form.yearsExperience || 0),
          expertise: form.expertise,
          logoUrl: form.logoUrl || null,
          portfolioUrls: form.portfolioUrls,
          companyCertificateUrl: form.companyCertificateUrl || null,
          verificationDocumentUrl: form.verificationDocumentUrl || null,
          privacyAccepted: form.privacyAccepted,
          termsAccepted: form.termsAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ส่งใบสมัครไม่สำเร็จ");
      const message =
        data.message ??
        "ส่งใบสมัครเรียบร้อยแล้ว ทีมงานจะตรวจสอบเอกสารก่อนเผยแพร่ — สถานะรออนุมัติจากผู้ดูแลระบบ";
      setForm(EMPTY);
      onSubmitted?.(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งใบสมัครไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className={
        embedInModal
          ? "space-y-8"
          : "space-y-8 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8"
      }
    >
      {!embedInModal && (
        <div>
          <h2 className="text-xl font-bold text-[#1e3a5f]">สมัครเป็นผู้รับสร้างบ้าน</h2>
          <p className="mt-1 text-sm text-text-muted">
            กรอกข้อมูลและอัปโหลดเอกสาร — ทีมงานจะตรวจสอบก่อนเผยแพร่บนหน้าเว็บ
          </p>
        </div>
      )}

      {embedInModal && (
        <p className="text-sm text-text-muted">
          กรอกข้อมูลและอัปโหลดเอกสาร — บันทึกเป็นสถานะรอตรวจสอบ (pending) จนกว่าผู้ดูแลจะอนุมัติ
        </p>
      )}

      {/* 1. General */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          1. ข้อมูลทั่วไป
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อบริษัท / ผู้รับเหมา *">
            <input
              required
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              className={inputClass}
              placeholder="เช่น ช. การช่าง - สถาปัตยกรรมและการก่อสร้าง"
            />
          </Field>
          <Field label="ชื่อผู้ติดต่อ *">
            <input
              required
              value={form.contactPerson}
              onChange={(e) => set("contactPerson", e.target.value)}
              className={inputClass}
              placeholder="ชื่อ-นามสกุล"
            />
          </Field>
          <Field label="เบอร์โทร *">
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
              placeholder="081-234-5678"
            />
          </Field>
          <Field label="อีเมล *">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </Field>
          <Field label="Line ID">
            <input
              value={form.lineId}
              onChange={(e) => set("lineId", e.target.value)}
              className={inputClass}
              placeholder="@yourline"
            />
          </Field>
          <Field label="ความเชี่ยวชาญ / คำโปรย">
            <input
              value={form.expertise}
              onChange={(e) => set("expertise", e.target.value)}
              className={inputClass}
              placeholder="เช่น ผู้เชี่ยวชาญงานสร้างบ้านหรูและครบวงจร"
            />
          </Field>
        </div>
      </section>

      {/* 2. Areas & experience */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          2. พื้นที่บริการและประสบการณ์
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="พื้นที่ให้บริการ *">
            <input
              required
              value={form.serviceAreas}
              onChange={(e) => set("serviceAreas", e.target.value)}
              className={inputClass}
              placeholder="เช่น กรุงเทพฯ และปริมณฑล"
            />
          </Field>
          <Field label="ประสบการณ์ (ปี) *">
            <input
              required
              type="number"
              min={0}
              max={100}
              value={form.yearsExperience}
              onChange={(e) => set("yearsExperience", e.target.value)}
              className={inputClass}
              placeholder="15"
            />
          </Field>
        </div>
      </section>

      {/* 3. Portfolio */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          3. ผลงาน (Portfolio)
        </h3>
        <p className="text-xs text-text-muted">
          อัปโหลดรูปผลงานได้หลายรูป สูงสุด {MAX_PORTFOLIO_IMAGES} รูป — แสดงเป็นสไลด์บนการ์ดโปรไฟล์
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {form.portfolioUrls.map((url, i) => (
            <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePortfolio(i)}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1 text-slate-600 shadow"
                aria-label="ลบรูป"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {form.portfolioUrls.length < MAX_PORTFOLIO_IMAGES && (
            <button
              type="button"
              onClick={() => portfolioInputRef.current?.click()}
              disabled={uploading === "portfolio"}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-[#1e40af] hover:text-[#1e40af]"
            >
              {uploading === "portfolio" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span className="text-[11px] font-medium">เพิ่มรูป</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={portfolioInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => void handlePortfolioFiles(e.target.files)}
        />
      </section>

      {/* 4. Official documents */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          4. เอกสารสำคัญ
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <DocUpload
            label="หนังสือรับรองบริษัท"
            value={form.companyCertificateUrl}
            uploading={uploading === "company_certificate"}
            onClear={() => set("companyCertificateUrl", "")}
            onFile={(file) =>
              void handleSingleUpload(file, "company_certificate", "companyCertificateUrl")
            }
          />
          <DocUpload
            label="หนังสือยืนยันตัวตน / เอกสารสำคัญ"
            value={form.verificationDocumentUrl}
            uploading={uploading === "verification_document"}
            onClear={() => set("verificationDocumentUrl", "")}
            onFile={(file) =>
              void handleSingleUpload(file, "verification_document", "verificationDocumentUrl")
            }
          />
        </div>
      </section>

      {/* 5. Privacy + terms */}
      <section className="space-y-4">
        <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          ข้อมูลและเอกสารทั้งหมดจะถูกเก็บรักษาไว้เป็นความลับอย่างปลอดภัยในฐานข้อมูล
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={form.privacyAccepted}
            onChange={(e) => set("privacyAccepted", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1e40af]"
            required
          />
          <span>
            ข้าพเจ้ายอมรับว่าข้อมูลและเอกสารทั้งหมดจะถูกเก็บรักษาไว้เป็นความลับอย่างปลอดภัยในฐานข้อมูล
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={form.termsAccepted}
            onChange={(e) => set("termsAccepted", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1e40af]"
            required
          />
          <span>
            ข้าพเจ้ายอมรับ{" "}
            <a href="/terms" target="_blank" className="font-semibold text-[#1e40af] hover:underline">
              ข้อกำหนดและเงื่อนไข
            </a>{" "}
            ของ Planasia
          </span>
        </label>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || Boolean(uploading)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e3a8a] disabled:opacity-60 sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังส่งใบสมัคร…
            </>
          ) : (
            "ส่งใบสมัครผู้รับสร้างบ้าน"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex w-full items-center justify-center rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

function DocUpload({
  label,
  value,
  uploading,
  onFile,
  onClear,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onFile: (file: File | undefined) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-xl border border-border bg-surface-raised/40 p-4">
      <p className="text-sm font-semibold text-[#1e3a5f]">{label}</p>
      {value ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs text-text-secondary">
          <FileText className="h-4 w-4 shrink-0 text-[#1e40af]" />
          <a href={value} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
            ดูไฟล์ที่อัปโหลด
          </a>
          <button type="button" onClick={onClear} className="ml-auto text-slate-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-6 text-sm font-medium text-slate-600 hover:border-[#1e40af] hover:text-[#1e40af]"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Upload className="h-4 w-4" />
              อัปโหลด PDF / รูปภาพ
            </>
          )}
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
