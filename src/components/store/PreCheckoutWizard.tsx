"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import {
  documentLanguageFromTargetCountry,
  localizationSurchargeThb,
  type DocumentLanguage,
} from "@/lib/store/document-languages";
import { BOQ_BUNDLE_PRICE, HARDCOPY_3SETS_PRICE } from "@/lib/store/cart-pricing";
import {
  EMPTY_SHIPPING_ADDRESS,
  isShippingAddressComplete,
  type ShippingAddress,
} from "@/lib/store/shipping-address";
import {
  listGeminiMarketCountryOptions,
  resolveGeminiMarketCountry,
  type GeminiMarketCountryCode,
} from "@/lib/gemini/regional-units";
import { checkoutCurrencyFor } from "@/lib/currency";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

export interface PreCheckoutSelections {
  /**
   * Target country for post-payment document translation + unit conversion.
   * Stored on the order; localization runs only after payment succeeds.
   */
  targetCountry: GeminiMarketCountryCode;
  documentLanguage: DocumentLanguage;
  boqAddon: boolean;
  /** Physical hard-copy documents — 3 sets (+฿500). */
  hardcopyAddon: boolean;
  buyerName: string;
  buyerEmail: string;
  /** Required when hardcopyAddon is true. */
  shippingAddress: ShippingAddress;
  /** Required: buyer acknowledges digital-goods ToS + refund policy. */
  acceptedDigitalTerms: boolean;
}

interface PreCheckoutWizardProps {
  /** Thai UI when true. */
  thai: boolean;
  formatMoney: (amountThb: number) => string;
  selections: PreCheckoutSelections;
  onChange: (next: PreCheckoutSelections) => void;
  /** Hide optional add-on toggles when parent manages them elsewhere. */
  showBoqAddon?: boolean;
  basePlanLabel?: string;
  basePlanPrice: number;
  /** Extra line items already in the parent total (e.g. cart discount). */
  extraLines?: { label: string; amount: number; tone?: "muted" | "green" }[];
  /** Visitor geo country — used with target country to resolve THB vs USD. */
  visitorCountryCode?: string;
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isPreCheckoutValid(s: PreCheckoutSelections): boolean {
  if (!s.targetCountry) return false;
  if (s.buyerName.trim().length < 2 || !validEmail(s.buyerEmail)) return false;
  if (s.hardcopyAddon && !isShippingAddressComplete(s.shippingAddress)) return false;
  if (!s.acceptedDigitalTerms) return false;
  return true;
}

export function defaultPreCheckoutSelections(
  documentLanguage: DocumentLanguage,
  hardcopyAddon = false,
  boqAddon = false,
  /** Visitor / geo country — international visitors default to their market. */
  initialTargetCountry?: string,
): PreCheckoutSelections {
  const targetCountry = THAI_DOMESTIC_MARKET
    ? ("TH" as GeminiMarketCountryCode)
    : resolveGeminiMarketCountry(initialTargetCountry ?? "TH");
  return {
    targetCountry,
    documentLanguage: THAI_DOMESTIC_MARKET
      ? "th"
      : documentLanguageFromTargetCountry(targetCountry),
    boqAddon,
    hardcopyAddon,
    buyerName: "",
    buyerEmail: "",
    shippingAddress: { ...EMPTY_SHIPPING_ADDRESS },
    acceptedDigitalTerms: false,
  };
}

/**
 * Shared pre-payment steps:
 * target country (localized units + flat foreign fee) → add-ons → buyer + shipping → total.
 */
export function PreCheckoutWizard({
  thai,
  formatMoney,
  selections,
  onChange,
  showBoqAddon = true,
  basePlanLabel,
  basePlanPrice,
  extraLines = [],
  visitorCountryCode = "TH",
}: PreCheckoutWizardProps) {
  const shippingRef = useRef<HTMLElement>(null);
  const prevHardcopy = useRef(selections.hardcopyAddon);
  const countryOptions = useMemo(() => listGeminiMarketCountryOptions(), []);
  const selectedCountry =
    countryOptions.find((c) => c.code === selections.targetCountry) ?? countryOptions[0];
  const chargeCurrency = checkoutCurrencyFor(
    selections.targetCountry,
    visitorCountryCode,
  );

  // Thai-only: lock target market + document language.
  useEffect(() => {
    if (!THAI_DOMESTIC_MARKET) return;
    if (selections.targetCountry !== "TH" || selections.documentLanguage !== "th") {
      onChange({ ...selections, targetCountry: "TH", documentLanguage: "th" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- domestic lock only
  }, [selections.targetCountry, selections.documentLanguage]);

  // Keep document language aligned with the selected target country (international mode).
  useEffect(() => {
    if (THAI_DOMESTIC_MARKET) return;
    const nextLang = documentLanguageFromTargetCountry(selections.targetCountry);
    if (selections.documentLanguage !== nextLang) {
      onChange({ ...selections, documentLanguage: nextLang });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync language from country only
  }, [selections.targetCountry]);

  // When hardcopy is turned on, reveal + scroll to shipping fields.
  useEffect(() => {
    if (selections.hardcopyAddon && !prevHardcopy.current) {
      const el = shippingRef.current;
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          const first = el.querySelector<HTMLInputElement>("input");
          first?.focus({ preventScroll: true });
        });
      }
    }
    prevHardcopy.current = selections.hardcopyAddon;
  }, [selections.hardcopyAddon]);

  const localizationFee = localizationSurchargeThb(selections.targetCountry);
  const boqFee = selections.boqAddon ? BOQ_BUNDLE_PRICE : 0;
  const hardcopyFee = selections.hardcopyAddon ? HARDCOPY_3SETS_PRICE : 0;
  const extras = extraLines.reduce((sum, l) => sum + l.amount, 0);
  const total = Math.max(0, basePlanPrice + localizationFee + boqFee + hardcopyFee + extras);

  const set = (patch: Partial<PreCheckoutSelections>) =>
    onChange({ ...selections, ...patch });

  const setShip = (patch: Partial<ShippingAddress>) =>
    set({
      shippingAddress: {
        ...(selections.shippingAddress ?? EMPTY_SHIPPING_ADDRESS),
        ...patch,
      },
    });

  const stepAddons = THAI_DOMESTIC_MARKET ? "1" : "2";
  const stepBuyer = THAI_DOMESTIC_MARKET
    ? showBoqAddon
      ? "2"
      : "1"
    : showBoqAddon
      ? "3"
      : "2";

  const toggleHardcopy = () => {
    const next = !selections.hardcopyAddon;
    const ship = selections.shippingAddress ?? EMPTY_SHIPPING_ADDRESS;
    set({
      hardcopyAddon: next,
      shippingAddress: {
        ...ship,
        fullName: ship.fullName || selections.buyerName,
      },
    });
  };

  return (
    <div className="space-y-5">
      {!THAI_DOMESTIC_MARKET && (
      <section>
        <h3 className="text-sm font-bold text-text-primary">
          {thai ? "1. เลือกประเทศเป้าหมาย (หน่วยวัด / แปลภาษา)" : "1. Target country (units & translation)"}
        </h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          {thai
            ? "เลือกประเทศก่อนชำระเงิน — หลังชำระเงินสำเร็จ ระบบจะแปลเอกสารและแปลงหน่วยตามประเทศที่เลือก ประเทศนอกไทยคิดค่าบริการคงที่ +$10"
            : "Choose a country before payment — after payment, the system translates documents and converts units for that market. Non-Thailand countries add a flat +$10 localization fee"}
        </p>
        <label className="mt-3 block">
          <span className="sr-only">
            {thai ? "ประเทศเป้าหมาย" : "Target country"}
          </span>
          <select
            value={selections.targetCountry}
            onChange={(e) => {
              const targetCountry = resolveGeminiMarketCountry(e.target.value);
              set({
                targetCountry,
                documentLanguage: documentLanguageFromTargetCountry(targetCountry),
              });
            }}
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium text-text-primary shadow-sm outline-none transition focus:border-[#1e40af] focus:ring-2 focus:ring-[#1e40af]/20"
          >
            {countryOptions.map((opt) => {
              const fee = localizationSurchargeThb(opt.code);
              const feeLabel =
                fee > 0
                  ? ` — +${formatMoney(fee)}`
                  : thai
                    ? " — รวมแล้ว"
                    : " — Included";
              return (
                <option key={opt.code} value={opt.code}>
                  {thai ? opt.nameTh : opt.nameEn} ({opt.code}) — {opt.unitsLabel}
                  {feeLabel}
                </option>
              );
            })}
          </select>
        </label>
        {selectedCountry && (
          <p className="mt-1.5 text-[11px] text-text-muted">
            {thai ? "หน่วยที่กำหนด" : "Designated units"}:{" "}
            <span className="font-semibold text-[#1e40af]">{selectedCountry.unitsLabel}</span>
            {" · "}
            <span className="font-semibold text-[#1e40af]">
              {thai ? "สกุลเงิน" : "Currency"}: {chargeCurrency}
              {chargeCurrency === "THB"
                ? thai
                  ? " (ประเทศไทย)"
                  : " (Thailand)"
                : thai
                  ? " (ตามประเทศผู้เยี่ยมชม)"
                  : " (visitor local)"}
            </span>
            {localizationFee > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-[#1e40af]">
                  {thai ? "ค่าแปล/แปลงหน่วย" : "Localization"} +{formatMoney(localizationFee)}
                </span>
              </>
            )}
          </p>
        )}
      </section>
      )}

      {showBoqAddon && (
        <section>
          <h3 className="text-sm font-bold text-text-primary">
            {thai ? `${stepAddons}. แพ็กเกจเสริม (ไม่บังคับ)` : `${stepAddons}. Optional add-ons`}
          </h3>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={() => set({ boqAddon: !selections.boqAddon })}
              className="flex w-full items-start gap-3 rounded-lg border border-dashed border-[#1e40af]/30 bg-blue-50/50 p-3 text-left"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selections.boqAddon
                    ? "border-[#1e40af] bg-[#1e40af] text-white"
                    : "border-border bg-white"
                }`}
                aria-checked={selections.boqAddon}
                role="checkbox"
              >
                {selections.boqAddon ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {thai
                    ? "แพ็ค BOQ เสริม (รายการคำนวณราคาก่อสร้างและประมาณการวัสดุ)"
                    : "BOQ add-on (bill of quantities / material estimate)"}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {thai
                    ? "รายการคำนวณราคาบ้านและวัสดุก่อสร้าง"
                    : "Construction cost & material quantities"}
                </p>
                <p className="mt-1 text-sm font-bold text-[#1e40af]">+{formatMoney(BOQ_BUNDLE_PRICE)}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={toggleHardcopy}
              className="flex w-full items-start gap-3 rounded-lg border border-dashed border-[#1e40af]/30 bg-blue-50/50 p-3 text-left"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selections.hardcopyAddon
                    ? "border-[#1e40af] bg-[#1e40af] text-white"
                    : "border-border bg-white"
                }`}
                aria-checked={selections.hardcopyAddon}
                role="checkbox"
              >
                {selections.hardcopyAddon ? (
                  <Minus className="h-3 w-3" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {thai
                    ? "รับเอกสารรูปเล่ม 3 ชุด (Physical Hard Copy Documents)"
                    : "Physical Hard Copy Documents — 3 Sets"}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {thai
                    ? "พิมพ์จัดส่งถึงที่อยู่ของคุณ — กรอกที่อยู่จัดส่งด้านล่างเมื่อเลือกแพ็กนี้"
                    : "Printed sets shipped to your address — enter shipping details below when selected"}
                </p>
                <p className="mt-1 text-sm font-bold text-[#1e40af]">
                  +{formatMoney(HARDCOPY_3SETS_PRICE)}
                </p>
              </div>
            </button>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-sm font-bold text-text-primary">
          {thai ? `${stepBuyer}. ข้อมูลผู้ซื้อ` : `${stepBuyer}. Buyer details`}
        </h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          {thai
            ? "ใช้ส่งลิงก์ดาวน์โหลดและใบเสร็จ"
            : "Used for download links and receipts"}
        </p>
        <div className="mt-2 space-y-2">
          <label className="block">
            <span className="text-xs font-medium text-text-secondary">
              {thai ? "ชื่อ-นามสกุล" : "Full name"}
            </span>
            <input
              type="text"
              autoComplete="name"
              value={selections.buyerName}
              onChange={(e) => {
                const buyerName = e.target.value;
                const ship = selections.shippingAddress ?? EMPTY_SHIPPING_ADDRESS;
                set({
                  buyerName,
                  shippingAddress:
                    selections.hardcopyAddon && !ship.fullName.trim()
                      ? { ...ship, fullName: buyerName }
                      : ship,
                });
              }}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              placeholder={thai ? "ชื่อที่ใช้ในใบเสร็จ" : "Name on receipt"}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-text-secondary">
              {thai ? "อีเมล" : "Email"}
            </span>
            <input
              type="email"
              autoComplete="email"
              value={selections.buyerEmail}
              onChange={(e) => set({ buyerEmail: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              placeholder={thai ? "name@email.com" : "you@example.com"}
            />
          </label>
        </div>
      </section>

      {selections.hardcopyAddon && (
        <section
          ref={shippingRef}
          className="rounded-xl border border-[#1e40af]/25 bg-[#1e40af]/[0.04] p-3.5 scroll-mt-4"
          aria-labelledby="shipping-address-heading"
        >
          <h3 id="shipping-address-heading" className="text-sm font-bold text-text-primary">
            {thai ? "ที่อยู่จัดส่งเอกสารรูปเล่ม" : "Shipping address for hard copies"}
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            {thai
              ? "จำเป็นเมื่อเลือกแพ็กเอกสารรูปเล่ม 3 ชุด — เราจะจัดส่งตามที่อยู่นี้"
              : "Required for the 3-set hardcopy package — we ship to this address"}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "ชื่อผู้รับ" : "Recipient name"}
              </span>
              <input
                type="text"
                autoComplete="shipping name"
                value={selections.shippingAddress?.fullName ?? ""}
                onChange={(e) => setShip({ fullName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "เบอร์โทรผู้รับ" : "Recipient phone"}
              </span>
              <input
                type="tel"
                autoComplete="shipping tel"
                value={selections.shippingAddress?.phone ?? ""}
                onChange={(e) => setShip({ phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder="08x-xxx-xxxx"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "ที่อยู่บรรทัดที่ 1" : "Address line 1"}
              </span>
              <input
                type="text"
                autoComplete="shipping address-line1"
                value={selections.shippingAddress?.line1 ?? ""}
                onChange={(e) => setShip({ line1: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder={thai ? "บ้านเลขที่ ถนน หมู่บ้าน" : "House no., street, village"}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "ที่อยู่บรรทัดที่ 2 (ถ้ามี)" : "Address line 2 (optional)"}
              </span>
              <input
                type="text"
                autoComplete="shipping address-line2"
                value={selections.shippingAddress?.line2 ?? ""}
                onChange={(e) => setShip({ line2: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "อำเภอ / เขต" : "District"}
              </span>
              <input
                type="text"
                autoComplete="shipping address-level2"
                value={selections.shippingAddress?.district ?? ""}
                onChange={(e) => setShip({ district: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "จังหวัด" : "Province"}
              </span>
              <input
                type="text"
                autoComplete="shipping address-level1"
                value={selections.shippingAddress?.province ?? ""}
                onChange={(e) => setShip({ province: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "รหัสไปรษณีย์" : "Postal code"}
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="shipping postal-code"
                maxLength={5}
                value={selections.shippingAddress?.postalCode ?? ""}
                onChange={(e) =>
                  setShip({ postalCode: e.target.value.replace(/\D/g, "").slice(0, 5) })
                }
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder="10110"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "หมายเหตุถึงผู้จัดส่ง (ถ้ามี)" : "Delivery notes (optional)"}
              </span>
              <input
                type="text"
                value={selections.shippingAddress?.notes ?? ""}
                onChange={(e) => setShip({ notes: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              />
            </label>
          </div>
          {!isShippingAddressComplete(selections.shippingAddress) && (
            <p className="mt-2 text-xs font-medium text-amber-700">
              {thai
                ? "กรุณากรอกที่อยู่ให้ครบ (รวมรหัสไปรษณีย์ 5 หลัก) ก่อนชำระเงิน"
                : "Please complete the shipping address (including 5-digit postal code) before paying"}
            </p>
          )}
        </section>
      )}

      <section className="rounded-xl border border-[#1e40af]/20 bg-blue-50/50 p-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={selections.acceptedDigitalTerms}
            onChange={(e) => set({ acceptedDigitalTerms: e.target.checked })}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#1e40af] focus:ring-[#1e40af]"
            required
          />
          <span className="text-xs leading-relaxed text-text-secondary">
            {thai ? (
              <>
                ข้าพเจ้ายอมรับ{" "}
                <Link href="/terms" target="_blank" className="font-semibold text-[#1e40af] underline">
                  ข้อกำหนดการให้บริการ
                </Link>{" "}
                และ{" "}
                <Link href="/refund" target="_blank" className="font-semibold text-[#1e40af] underline">
                  นโยบายการคืนเงิน
                </Link>{" "}
                — สินค้าเป็นไฟล์ดิจิทัล เมื่อดาวน์โหลดแบบแปลนสำเร็จแล้ว
                จะไม่คืนเงินเพราะเปลี่ยนใจ คืนเงินได้เฉพาะไฟล์เสีย/ชำรุดจริงและแก้ไขไม่ได้
              </>
            ) : (
              <>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="font-semibold text-[#1e40af] underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/refund" target="_blank" className="font-semibold text-[#1e40af] underline">
                  Refund Policy
                </Link>
                . These are digital goods — once a blueprint is successfully downloaded, no refunds
                for change of mind. Refunds only if the file is genuinely corrupted or defective and
                cannot be fixed.
              </>
            )}
          </span>
        </label>
        {!selections.acceptedDigitalTerms && (
          <p className="mt-2 pl-7 text-[11px] font-medium text-amber-800">
            {thai
              ? "ต้องทำเครื่องหมายยอมรับก่อนจึงจะชำระเงินได้"
              : "You must accept these terms before paying"}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface-raised/60 p-3 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>{basePlanLabel ?? (thai ? "แบบบ้าน" : "House plan")}</span>
          <span>{formatMoney(basePlanPrice)}</span>
        </div>
        {extraLines.map((line) => (
          <div
            key={line.label}
            className={`mt-1 flex justify-between ${line.tone === "green" ? "text-green-700" : "text-text-secondary"}`}
          >
            <span>{line.label}</span>
            <span>
              {line.amount < 0 ? "-" : ""}
              {formatMoney(Math.abs(line.amount))}
            </span>
          </div>
        ))}
        {localizationFee > 0 && (
          <div className="mt-1 flex justify-between text-text-secondary">
            <span>
              {thai
                ? "ค่าแปลภาษาและแปลงหน่วย (ต่างประเทศ)"
                : "Localization & unit conversion"}
            </span>
            <span>+{formatMoney(localizationFee)}</span>
          </div>
        )}
        {boqFee > 0 && (
          <div className="mt-1 flex justify-between text-text-secondary">
            <span>BOQ</span>
            <span>+{formatMoney(boqFee)}</span>
          </div>
        )}
        {hardcopyFee > 0 && (
          <div className="mt-1 flex justify-between text-text-secondary">
            <span>{thai ? "เอกสารรูปเล่ม 3 ชุด" : "Hard copy — 3 sets"}</span>
            <span>+{formatMoney(hardcopyFee)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold text-text-primary">
          <span>{thai ? "ยอดชำระ" : "Total"}</span>
          <span className="text-[#1e40af]">{formatMoney(total)}</span>
        </div>
      </section>
    </div>
  );
}
