"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import {
  LOAN_BUDGET_PRESETS,
  LOAN_OCCUPATION_OPTIONS,
  type LoanOccupation,
} from "@/lib/loan-consultation/types";

interface FormState {
  planCode: string;
  fullName: string;
  phone: string;
  occupation: LoanOccupation | "";
  monthlyIncomeThb: string;
  constructionBudgetThb: string;
  notes: string;
}

const EMPTY: FormState = {
  planCode: "",
  fullName: "",
  phone: "",
  occupation: "",
  monthlyIncomeThb: "",
  constructionBudgetThb: "",
  notes: "",
};

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/20";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-text-muted">{hint}</span>}
    </label>
  );
}

function LineIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 01-.63-.629V8.108c0-.347.281-.63.63-.63h2.386c.349 0 .63.283.63.63 0 .348-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.63.63 0 01-.63-.63V8.108c0-.347.282-.63.63-.63.348 0 .63.283.63.63v4.141a.63.63 0 01-.63.63zm-1.598-.006a.605.605 0 01-.55-.348l-2.14-4.595V12.25a.63.63 0 01-.63.629.63.63 0 01-.63-.629V8.108c0-.347.281-.63.63-.63.255 0 .48.15.575.376l2.14 4.595V8.108c0-.347.282-.63.63-.63.349 0 .63.283.63.63v4.141a.626.626 0 01-.625.624zM6.704 12.88H4.868V8.108c0-.347.281-.63.63-.63.348 0 .63.283.63.63v4.141a.63.63 0 01-.63.63h-.001zM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.121.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export function LoanConsultationForm({
  expertLineOaUrl = "",
}: {
  expertLineOaUrl?: string;
}) {
  const L = useBilingual();
  const lineUrl = expertLineOaUrl.trim();
  const hasLine = Boolean(lineUrl);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/loan-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: form.planCode.trim() || undefined,
          fullName: form.fullName,
          phone: form.phone,
          occupation: form.occupation || undefined,
          monthlyIncomeThb: form.monthlyIncomeThb || undefined,
          constructionBudgetThb: form.constructionBudgetThb || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ส่งข้อมูลไม่สำเร็จ");
      setDone(
        data.message ??
          L(
            "We received your details — our advisor will contact you soon.",
            "รับข้อมูลแล้ว — ที่ปรึกษาจะติดต่อกลับเร็วๆ นี้",
          ),
      );
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="mt-3 text-base font-semibold text-emerald-900">{done}</p>
          <button
            type="button"
            onClick={() => setDone(null)}
            className="mt-4 text-sm font-semibold text-[#1e40af] hover:underline"
          >
            {L("Submit another inquiry", "ส่งคำขอใหม่")}
          </button>
        </div>
        <LineContactButton href={lineUrl} enabled={hasLine} L={L} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <Field
          label={L("Interested house code", "รหัสแบบบ้านที่สนใจ")}
          hint={L(
            "Enter the plan code from our store, e.g. MOD-001",
            "ใส่รหัสแบบจากหน้าร้านค้า เช่น MOD-001",
          )}
        >
          <input
            className={inputClass}
            value={form.planCode}
            onChange={(e) => set("planCode", e.target.value.slice(0, 80))}
            maxLength={80}
            placeholder="เช่น MOD-001"
            autoComplete="off"
            inputMode="text"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={L("Full name *", "ชื่อ-นามสกุล *")}>
            <input
              className={inputClass}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              required
              maxLength={120}
              autoComplete="name"
              placeholder={L("e.g. Somchai Jaidee", "เช่น สมชาย ใจดี")}
            />
          </Field>
          <Field label={L("Phone number *", "เบอร์โทรศัพท์ติดต่อ *")}>
            <input
              className={inputClass}
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
              maxLength={40}
              autoComplete="tel"
              placeholder="08x-xxx-xxxx"
            />
          </Field>
        </div>

        <Field label={L("Occupation", "อาชีพ")}>
          <select
            className={inputClass}
            value={form.occupation}
            onChange={(e) => set("occupation", e.target.value as LoanOccupation | "")}
          >
            <option value="">{L("— Select —", "— เลือกอาชีพ —")}</option>
            {LOAN_OCCUPATION_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {L(o.en, o.th)}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={L("Monthly income (THB)", "รายได้ต่อเดือน (บาท)")}
            hint={L("Used to estimate loan capacity", "ใช้ประมาณความสามารถในการกู้")}
          >
            <input
              className={inputClass}
              type="number"
              min={0}
              step={1000}
              value={form.monthlyIncomeThb}
              onChange={(e) => set("monthlyIncomeThb", e.target.value)}
              placeholder="เช่น 45000"
            />
          </Field>
          <Field
            label={L("Estimated construction budget", "งบประมาณค่าก่อสร้างบ้าน")}
            hint={L("Select a range or closest amount", "เลือกช่วงงบที่ใกล้เคียง")}
          >
            <select
              className={inputClass}
              value={form.constructionBudgetThb}
              onChange={(e) => set("constructionBudgetThb", e.target.value)}
            >
              <option value="">{L("— Select budget —", "— เลือกงบประมาณ —")}</option>
              {LOAN_BUDGET_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {L(p.en, p.th)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label={L(
            "Additional notes / topics to discuss",
            "หมายเหตุเพิ่มเติม / เรื่องที่ต้องการปรึกษา",
          )}
          hint={L(
            "Credit history, land status, timeline, or specific questions",
            "เช่น ประวัติเครดิต สถานะที่ดิน ไทม์ไลน์ หรือคำถามเฉพาะ",
          )}
        >
          <textarea
            className={`${inputClass} min-h-[120px] resize-y`}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder={L(
              "Tell us what you need help with…",
              "บอกสิ่งที่อยากปรึกษาเพิ่มเติม…",
            )}
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-4 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving
            ? L("Sending…", "กำลังส่ง…")
            : L("Submit consultation request", "ส่งคำขอปรึกษา")}
        </button>
      </form>

      <div className="border-t border-border pt-5">
        <p className="mb-3 text-center text-xs text-text-muted">
          {L("Or chat with us directly", "หรือแชทสอบถามโดยตรง")}
        </p>
        <LineContactButton href={lineUrl} enabled={hasLine} L={L} />
      </div>
    </div>
  );
}

function LineContactButton({
  href,
  enabled,
  L,
}: {
  href: string;
  enabled: boolean;
  L: (en: string, th: string) => string;
}) {
  if (!enabled) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
        {L(
          "LINE contact is not configured yet. The admin can set it under Admin → Loan consultation.",
          "ยังไม่ได้ตั้งค่า LINE — แอดมินตั้งค่าได้ที่ แอดมิน → ปรึกษาสินเชื่อบ้าน",
        )}
      </p>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#06C755] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#05b34c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06C755]"
    >
      <LineIcon className="h-5 w-5" />
      {L("Contact via LINE", "ติดต่อผ่าน LINE")}
    </a>
  );
}
