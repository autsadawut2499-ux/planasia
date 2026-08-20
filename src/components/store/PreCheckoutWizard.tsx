"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  documentLanguageFromTargetCountry,
  localizationSurchargeThb,
  type DocumentLanguage,
} from "@/lib/store/document-languages";
import {
  EMPTY_SHIPPING_ADDRESS,
  isShippingAddressComplete,
  type ShippingAddress,
} from "@/lib/store/shipping-address";
import {
  EMPTY_SITE_PLAN_INFO,
  isSitePlanInfoComplete,
  type SitePlanInfo,
} from "@/lib/store/site-plan-info";
import {
  getDistrictForProvince,
  getThaiProvinceById,
  listDistrictsForProvince,
  listThaiProvinces,
} from "@/lib/geo/th-admin-divisions";
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
  /** @deprecated Optional BOQ package removed from pre-checkout UI. Always false. */
  boqAddon: boolean;
  /** @deprecated Hardcopy package removed from pre-checkout UI. Always false. */
  hardcopyAddon: boolean;
  buyerName: string;
  /** Optional — used for email receipt / download links when provided. */
  buyerEmail: string;
  /** Optional — used for SMS receipt / download links when provided. */
  buyerPhone: string;
  shippingAddress: ShippingAddress;
  /** Required when site-plan addon is selected. */
  sitePlanInfo: SitePlanInfo;
  /** Required: buyer acknowledges digital-goods ToS + refund policy. */
  acceptedDigitalTerms: boolean;
}

export interface PreCheckoutValidOptions {
  /**
   * True when the order includes a physical delivery add-on
   * (e.g. hardcopy / printed sets). Shipping address becomes required.
   */
  requiresShipping?: boolean;
  /** True when the order includes the site-plan (แผนผังบริเวณ) add-on. */
  requiresSitePlan?: boolean;
}

interface PreCheckoutWizardProps {
  /** Thai UI when true. */
  thai: boolean;
  formatMoney: (amountThb: number) => string;
  selections: PreCheckoutSelections;
  onChange: (next: PreCheckoutSelections) => void;
  /** @deprecated Optional packages UI removed — ignored. */
  showBoqAddon?: boolean;
  basePlanLabel?: string;
  basePlanPrice: number;
  /** Extra line items already in the parent total (e.g. cart discount). */
  extraLines?: { label: string; amount: number; tone?: "muted" | "green" }[];
  /** Visitor geo country — used with target country to resolve THB vs USD. */
  visitorCountryCode?: string;
  /**
   * When true, reveal shipping address fields and require them for payment.
   * Hidden by default for digital-only checkouts.
   */
  requiresShipping?: boolean;
  /** When true, reveal site-plan info fields (province / district / deed no.). */
  requiresSitePlan?: boolean;
  /** Prefill from Google Login session (name + email). */
  sessionPrefill?: { name?: string | null; email?: string | null } | null;
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Loose phone check — digits only, 8–15 length (E.164-ish). */
function validPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isPreCheckoutValid(
  s: PreCheckoutSelections,
  opts?: PreCheckoutValidOptions,
): boolean {
  if (!s.targetCountry) return false;
  // Contact fields are optional (no pre-checkout form). Validate format only if present
  // e.g. silently prefilled from Google session.
  const email = s.buyerEmail.trim();
  const phone = s.buyerPhone.trim();
  if (email && !validEmail(email)) return false;
  if (phone && !validPhone(phone)) return false;
  if (opts?.requiresShipping && !isShippingAddressComplete(s.shippingAddress)) {
    return false;
  }
  if (opts?.requiresSitePlan && !isSitePlanInfoComplete(s.sitePlanInfo)) {
    return false;
  }
  if (!s.acceptedDigitalTerms) return false;
  return true;
}

export function defaultPreCheckoutSelections(
  documentLanguage: DocumentLanguage,
  _hardcopyAddon = false,
  _boqAddon = false,
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
    boqAddon: false,
    hardcopyAddon: false,
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    shippingAddress: { ...EMPTY_SHIPPING_ADDRESS },
    sitePlanInfo: { ...EMPTY_SITE_PLAN_INFO },
    acceptedDigitalTerms: false,
  };
}

/**
 * Shared pre-payment steps:
 * (international) target country →
 * (physical only) shipping address → terms → total.
 * Buyer name/email/phone are not collected in this UI; Google session may
 * still prefill them silently for receipts.
 */
export function PreCheckoutWizard({
  thai,
  formatMoney,
  selections,
  onChange,
  basePlanLabel,
  basePlanPrice,
  extraLines = [],
  visitorCountryCode = "TH",
  requiresShipping = false,
  requiresSitePlan = false,
  sessionPrefill = null,
}: PreCheckoutWizardProps) {
  const shippingRef = useRef<HTMLElement>(null);
  const sitePlanRef = useRef<HTMLElement>(null);
  const prevRequiresShipping = useRef(requiresShipping);
  const prevRequiresSitePlan = useRef(requiresSitePlan);
  const prefilledFromSession = useRef(false);
  const countryOptions = useMemo(() => listGeminiMarketCountryOptions(), []);
  const provinces = useMemo(() => listThaiProvinces(), []);
  const districts = useMemo(
    () => listDistrictsForProvince(selections.sitePlanInfo?.provinceId ?? ""),
    [selections.sitePlanInfo?.provinceId],
  );
  const selectedCountry =
    countryOptions.find((c) => c.code === selections.targetCountry) ?? countryOptions[0];
  const chargeCurrency = checkoutCurrencyFor(
    selections.targetCountry,
    visitorCountryCode,
  );

  // Ensure legacy wizard BOQ toggle stays off (packages are chosen on the listing).
  useEffect(() => {
    if (selections.boqAddon) {
      onChange({ ...selections, boqAddon: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot clear
  }, [selections.boqAddon]);

  // Apply Google Login name/email once (low friction — no retyping).
  useEffect(() => {
    if (!sessionPrefill?.email && !sessionPrefill?.name) return;
    if (prefilledFromSession.current) return;
    const name = sessionPrefill.name?.trim() || "";
    const email = sessionPrefill.email?.trim().toLowerCase() || "";
    if (!name && !email) return;
    prefilledFromSession.current = true;
    onChange({
      ...selections,
      buyerName: selections.buyerName.trim() || name,
      buyerEmail: selections.buyerEmail.trim() || email,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply session identity once
  }, [sessionPrefill?.email, sessionPrefill?.name]);

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

  // When physical shipping becomes required, reveal + scroll + prefills.
  useEffect(() => {
    if (requiresShipping && !prevRequiresShipping.current) {
      const ship = selections.shippingAddress ?? EMPTY_SHIPPING_ADDRESS;
      const patch: Partial<PreCheckoutSelections> = {};
      if (!ship.fullName.trim() && selections.buyerName.trim()) {
        patch.shippingAddress = {
          ...ship,
          fullName: selections.buyerName.trim(),
          phone: ship.phone || selections.buyerPhone.trim(),
        };
      } else if (!ship.phone.trim() && selections.buyerPhone.trim()) {
        patch.shippingAddress = { ...ship, phone: selections.buyerPhone.trim() };
      }
      if (Object.keys(patch).length) onChange({ ...selections, ...patch });

      const el = shippingRef.current;
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          el.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
        });
      }
    }
    prevRequiresShipping.current = requiresShipping;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reveal when shipping requirement flips on
  }, [requiresShipping]);

  // When site-plan becomes required, scroll to the section.
  useEffect(() => {
    if (requiresSitePlan && !prevRequiresSitePlan.current) {
      const el = sitePlanRef.current;
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
    }
    prevRequiresSitePlan.current = requiresSitePlan;
  }, [requiresSitePlan]);

  const localizationFee = localizationSurchargeThb(selections.targetCountry);
  const extras = extraLines.reduce((sum, l) => sum + l.amount, 0);
  const total = Math.max(0, basePlanPrice + localizationFee + extras);

  const set = (patch: Partial<PreCheckoutSelections>) =>
    onChange({
      ...selections,
      ...patch,
      boqAddon: false,
    });

  const setShip = (patch: Partial<ShippingAddress>) =>
    set({
      shippingAddress: {
        ...(selections.shippingAddress ?? EMPTY_SHIPPING_ADDRESS),
        ...patch,
      },
    });

  const setSitePlan = (patch: Partial<SitePlanInfo>) =>
    set({
      sitePlanInfo: {
        ...(selections.sitePlanInfo ?? EMPTY_SITE_PLAN_INFO),
        ...patch,
      },
    });

  const stepCountry = "1";
  const stepShip = THAI_DOMESTIC_MARKET ? "1" : "2";
  const stepSitePlan = THAI_DOMESTIC_MARKET
    ? requiresShipping
      ? "2"
      : "1"
    : requiresShipping
      ? "3"
      : "2";
  const ship = selections.shippingAddress ?? EMPTY_SHIPPING_ADDRESS;
  const sitePlan = selections.sitePlanInfo ?? EMPTY_SITE_PLAN_INFO;

  return (
    <div className="space-y-5">
      {!THAI_DOMESTIC_MARKET && (
      <section>
        <h3 className="text-sm font-bold text-text-primary">
          {thai
            ? `${stepCountry}. เลือกประเทศเป้าหมาย (หน่วยวัด / แปลภาษา)`
            : `${stepCountry}. Target country (units & translation)`}
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

      {requiresShipping && (
        <section
          ref={shippingRef}
          className="scroll-mt-4 rounded-xl border border-[#1e40af]/25 bg-[#1e40af]/[0.04] p-3.5"
          aria-labelledby="shipping-address-heading"
        >
          <h3
            id="shipping-address-heading"
            className="text-sm font-bold text-text-primary"
          >
            {thai
              ? `${stepShip}. ที่อยู่จัดส่งเอกสารรูปเล่ม`
              : `${stepShip}. Shipping address`}
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            {thai
              ? "จำเป็นเมื่อสั่งถ่ายเอกสาร / เอกสารรูปเล่ม — เราจะจัดส่งตามที่อยู่นี้"
              : "Required for printed / physical document delivery — we ship to this address"}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "ชื่อผู้รับ *" : "Recipient name *"}
              </span>
              <input
                type="text"
                autoComplete="shipping name"
                value={ship.fullName}
                onChange={(e) => setShip({ fullName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "เบอร์โทรผู้รับ *" : "Recipient phone *"}
              </span>
              <input
                type="tel"
                autoComplete="shipping tel"
                value={ship.phone}
                onChange={(e) => setShip({ phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder="08x-xxx-xxxx"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "ที่อยู่ *" : "Address *"}
              </span>
              <input
                type="text"
                autoComplete="shipping address-line1"
                value={ship.line1}
                onChange={(e) => setShip({ line1: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder={
                  thai ? "บ้านเลขที่ ถนน หมู่บ้าน" : "House no., street, village"
                }
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "แขวง / ตำบล *" : "Sub-district *"}
              </span>
              <input
                type="text"
                autoComplete="address-level3"
                value={ship.subDistrict}
                onChange={(e) => setShip({ subDistrict: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder={thai ? "เช่น บางรัก" : "Tambon / Khwaeng"}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "อำเภอ / เขต *" : "District *"}
              </span>
              <input
                type="text"
                autoComplete="address-level2"
                value={ship.district}
                onChange={(e) => setShip({ district: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder={thai ? "เช่น เมือง" : "Amphoe / Khet"}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "จังหวัด *" : "Province *"}
              </span>
              <input
                type="text"
                autoComplete="address-level1"
                value={ship.province}
                onChange={(e) => setShip({ province: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "รหัสไปรษณีย์ *" : "Postal code *"}
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={ship.postalCode}
                onChange={(e) => setShip({ postalCode: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder="10xxx"
                maxLength={5}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "หมายเหตุการจัดส่ง (ถ้ามี)" : "Delivery notes (optional)"}
              </span>
              <input
                type="text"
                value={ship.notes ?? ""}
                onChange={(e) => setShip({ notes: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              />
            </label>
          </div>
          {!isShippingAddressComplete(ship) && (
            <p className="mt-2 text-[11px] font-medium text-amber-800">
              {thai
                ? "กรุณากรอกที่อยู่จัดส่งให้ครบก่อนชำระเงิน"
                : "Please complete the shipping address before paying"}
            </p>
          )}
        </section>
      )}

      {requiresSitePlan && (
        <section
          ref={sitePlanRef}
          className="scroll-mt-4 rounded-xl border border-emerald-600/25 bg-emerald-50/40 p-3.5"
          aria-labelledby="site-plan-info-heading"
        >
          <h3
            id="site-plan-info-heading"
            className="text-sm font-bold text-text-primary"
          >
            {thai
              ? `${stepSitePlan}. ข้อมูลแผนผังบริเวณ`
              : `${stepSitePlan}. Site plan information`}
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary">
            {thai
              ? "จำเป็นเมื่อเลือกบริการเขียนแผนผังบริเวณ — ใช้จัดทำเอกสารสำหรับที่ดินของคุณ"
              : "Required when site-plan drafting is selected — used to prepare your land documents"}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                จังหวัด *
              </span>
              <select
                value={sitePlan.provinceId}
                onChange={(e) => {
                  const provinceId = e.target.value;
                  const province = getThaiProvinceById(provinceId);
                  setSitePlan({
                    provinceId,
                    // Always persist Thai display name (land documents).
                    provinceName: province?.th ?? "",
                    districtId: "",
                    districtName: "",
                  });
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.th}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                อำเภอ / เขต *
              </span>
              <select
                value={sitePlan.districtId}
                disabled={!sitePlan.provinceId}
                onChange={(e) => {
                  const districtId = e.target.value;
                  const district = getDistrictForProvince(
                    sitePlan.provinceId,
                    districtId,
                  );
                  setSitePlan({
                    districtId,
                    districtName: district?.th ?? "",
                  });
                }}
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af] disabled:opacity-50"
              >
                <option value="">
                  {!sitePlan.provinceId
                    ? "เลือกจังหวัดก่อน"
                    : "เลือกอำเภอ / เขต"}
                </option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.th}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-text-secondary">
                {thai ? "เลขโฉนดที่ดิน *" : "Land title deed number *"}
              </span>
              <input
                type="text"
                value={sitePlan.landTitleDeedNumber}
                onChange={(e) =>
                  setSitePlan({ landTitleDeedNumber: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]"
                placeholder={thai ? "เช่น 12345 หรือ เลขที่โฉนด" : "e.g. deed number"}
                maxLength={80}
              />
            </label>
          </div>
          {!isSitePlanInfoComplete(sitePlan) && (
            <p className="mt-2 text-[11px] font-medium text-amber-800">
              {thai
                ? "กรุณาเลือกจังหวัด อำเภอ และกรอกเลขโฉนดที่ดินให้ครบ"
                : "Please complete province, district, and land title deed number"}
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
          <span className="font-price">{formatMoney(basePlanPrice)}</span>
        </div>
        {extraLines.map((line) => (
          <div
            key={line.label}
            className={`mt-1 flex justify-between ${line.tone === "green" ? "text-green-700" : "text-text-secondary"}`}
          >
            <span>{line.label}</span>
            <span className="font-price">
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
            <span className="font-price">+{formatMoney(localizationFee)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold text-text-primary">
          <span>{thai ? "ยอดชำระ" : "Total"}</span>
          <span className="font-price text-[#1e40af]">{formatMoney(total)}</span>
        </div>
      </section>
    </div>
  );
}
