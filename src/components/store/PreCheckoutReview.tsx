"use client";

import { CheckCircle2, Globe2, Loader2, Ruler } from "lucide-react";
import type { CheckoutPreview } from "@/lib/checkout/preview-types";

interface PreCheckoutReviewProps {
  preview: CheckoutPreview | null;
  loading: boolean;
  error: string | null;
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
  /** Bilingual helper from parent. */
  L: (en: string, th: string) => string;
}

/**
 * Pre-checkout gate: plan details + unit preview for the selected country.
 * Gemini translate + unit conversion runs only after payment succeeds.
 */
export function PreCheckoutReview({
  preview,
  loading,
  error,
  confirmed,
  onConfirmChange,
  L,
}: PreCheckoutReviewProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin text-[#1e40af]" />
        {L(
          "Preparing plan details & unit preview for your country…",
          "กำลังเตรียมรายละเอียดแบบบ้านและตัวอย่างหน่วยวัดตามประเทศของคุณ…",
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!preview) return null;

  const unitLabel = preview.unitSystem === "imperial" ? "ft / sq ft" : "m / m²";

  return (
    <div className="space-y-3 rounded-xl border border-[#1e40af]/25 bg-gradient-to-br from-blue-50/80 to-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#1e3a5f]">
            {L("Review before payment", "ตรวจสอบก่อนชำระเงิน")}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {L(
              "Confirm plan details and price. Full document translation and unit conversion run after payment.",
              "ตรวจสอบรายละเอียดแบบบ้านและราคา — การแปลเอกสารและแปลงหน่วยวัดเต็มรูปแบบจะทำหลังชำระเงินสำเร็จ",
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[#1e40af] ring-1 ring-[#1e40af]/20">
            <Globe2 className="h-3 w-3" /> {preview.uiLocale.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[#1e40af] ring-1 ring-[#1e40af]/20">
            <Ruler className="h-3 w-3" /> {unitLabel}
          </span>
          <span className="rounded-full bg-white px-2 py-1 text-text-muted ring-1 ring-border">
            {preview.targetCountry ?? preview.countryCode} · {preview.currency}
          </span>
          {preview.designatedUnits?.length > 0 && (
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium normal-case tracking-normal text-text-secondary ring-1 ring-border">
              {preview.designatedUnits.join(" / ")}
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-3">
        {preview.listings.map((item) => (
          <li key={item.listingId} className="rounded-lg border border-border bg-white p-3">
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-20 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                {item.tagline && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{item.tagline}</p>
                )}
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                  {item.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-secondary">
                  {item.specs.slice(0, 6).map((s) => (
                    <span key={s.key}>
                      <span className="text-text-muted">{s.label}:</span> {s.value}
                    </span>
                  ))}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#1e40af]">{item.priceFormatted}</span>
                  {item.translated && (
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      AI {L("translated", "แปลแล้ว")}
                    </span>
                  )}
                  {item.unitsConverted && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#1e40af]">
                      {L("units localized", "แปลงหน่วยแล้ว")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-[11px] text-text-muted">
        {L("Building code reference", "มาตรฐานอาคารอ้างอิง")}: {preview.buildingCode}
        {" · "}
        {preview.exchangeRate.note}
      </p>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-white px-3 py-2.5 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-[#1e40af] focus:ring-[#1e40af]"
        />
        <span className="text-text-secondary">
          <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
            <CheckCircle2 className="h-4 w-4 text-[#1e40af]" />
            {L("I have reviewed the details", "ฉันตรวจสอบรายละเอียดแล้ว")}
          </span>
          <span className="mt-0.5 block text-xs">
            {L(
              "Plan details, unit preview, and price look correct. Continue to payment.",
              "รายละเอียดแบบบ้าน ตัวอย่างหน่วยวัด และราคาถูกต้อง พร้อมไปชำระเงิน",
            )}
          </span>
        </span>
      </label>
    </div>
  );
}
