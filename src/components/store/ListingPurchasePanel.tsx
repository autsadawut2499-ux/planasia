"use client";

import { ChevronDown, Download, ShieldCheck } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useBilingual } from "@/components/landing/useBilingual";
import {
  ListingPolicyPopup,
  type ListingPolicyId,
} from "@/components/store/ListingPolicyPopup";
import { ListingWhatsIncludedPopup } from "@/components/store/ListingWhatsIncludedPopup";
import { useApp } from "@/context/AppContext";
import {
  sitePlanDocumentLabel,
  MAIN_PACKAGE_INCLUDE_ITEMS,
  MAIN_PACKAGE_INCLUDES,
  MAIN_PACKAGE_LABEL,
  resolveSitePlanPrice,
  resolvePurchaseAddons,
  resolvePurchaseFormat,
  resolveCartLinePrice,
  type ListingExtraId,
  type ListingPackageId,
} from "@/lib/store/listing-packages";
import { resolveListingSale } from "@/lib/store/plan-card-specs";
import type { StoreListing } from "@/lib/store/listing-types";

/** Informational option label: price first, never merges into the headline. */
function pricedOptionLabel(priceTag: string, name: string): string {
  return `${priceTag} — ${name}`;
}

export interface ListingPurchaseSelection {
  packageId: ListingPackageId;
  extraId: ListingExtraId;
  format: "pdf" | "cad";
  addons: ReturnType<typeof resolvePurchaseAddons>;
  linePrice: number;
}

interface ListingPurchasePanelProps {
  listing: StoreListing;
  canPurchase: boolean;
  inCart: boolean;
  onAddToCart: (selection: ListingPurchaseSelection) => void;
  onBuyNow: (selection: ListingPurchaseSelection) => void;
  className?: string;
}

const selectClass =
  "w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-[#1e3a5f] outline-none transition focus:border-[#1e40af]/45 focus:ring-2 focus:ring-[#1e40af]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

function FieldHeader({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
      {children}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
    </span>
  );
}

function SelectShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mt-1.5 ${className}`}>
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden
      />
    </div>
  );
}

export function ListingPurchasePanel({
  listing,
  canPurchase,
  inCart,
  onAddToCart,
  onBuyNow,
  className = "",
}: ListingPurchasePanelProps) {
  const L = useBilingual();
  const { formatMoney, translate, uiLocale } = useApp();
  const thai = uiLocale === "th";
  const sale = resolveListingSale(listing);
  const sitePlanLabel = sitePlanDocumentLabel(thai);
  const sitePlanPriceTag = formatMoney(resolveSitePlanPrice(listing));

  const [packageId, setPackageId] = useState<ListingPackageId | "">("");
  const [extraId, setExtraId] = useState<ListingExtraId>("");
  const [openPolicy, setOpenPolicy] = useState<ListingPolicyId | null>(null);
  const [openWhatsIncluded, setOpenWhatsIncluded] = useState(false);
  const [packageHint, setPackageHint] = useState(false);

  const selection = useMemo<ListingPurchaseSelection>(() => {
    const pkg: ListingPackageId = packageId || "main";
    const linePrice = resolveCartLinePrice(listing, pkg);
    return {
      packageId: pkg,
      extraId,
      format: resolvePurchaseFormat(pkg),
      addons: resolvePurchaseAddons(pkg, extraId),
      linePrice,
    };
  }, [extraId, listing, packageId]);

  /** Always the clean base starting price — never merges package/extra add-ons. */
  const startingPrice = Math.max(0, listing.price);
  const mainPriceTag =
    startingPrice <= 0 ? L("Free", "ฟรี") : formatMoney(startingPrice);

  function requirePackage(next: (sel: ListingPurchaseSelection) => void) {
    if (!packageId) {
      setPackageHint(true);
      return;
    }
    setPackageHint(false);
    next(selection);
  }

  return (
    <div
      id="listing-purchase-panel"
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5 ${className}`}
    >
      <div className="min-w-0">
        <p className="text-xs text-gray-500">
          {L("Packages starting at", "แพ็กเกจเริ่มต้นที่")}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <p
            className={`font-price text-[1.65rem] font-bold tracking-tight sm:text-3xl ${
              startingPrice <= 0 ? "text-emerald-700" : "text-[#1e40af]"
            }`}
          >
            {startingPrice <= 0 ? L("Free", "ฟรี") : formatMoney(startingPrice)}
          </p>
          {sale.price > 0 && sale.compareAt != null && (
            <p className="font-price text-sm text-gray-400 line-through">
              {formatMoney(sale.compareAt)}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpenWhatsIncluded(true)}
        className="mt-2 inline-block text-xs font-semibold text-[#1e40af] hover:underline"
      >
        {L("See what’s included ›", "ดูรายละเอียดสิ่งที่รวมอยู่ด้วย ›")}
      </button>

      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {L("Main package includes", "แพ็กเกจหลักรวม")}
        </p>
        <ul className="mt-1.5 space-y-1">
          {MAIN_PACKAGE_INCLUDE_ITEMS.map((item) => (
            <li
              key={item.th}
              className="flex items-start gap-1.5 text-xs leading-snug text-[#1e3a5f]"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#1e40af]" aria-hidden />
              <span>{thai ? item.th : item.en}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
          {thai ? MAIN_PACKAGE_INCLUDES.th : MAIN_PACKAGE_INCLUDES.en}
        </p>
      </div>

      {/* Main package — PDF / CAD downloads are no longer offered */}
      <label className="mt-4 block">
        <FieldHeader>{L(MAIN_PACKAGE_LABEL.en, MAIN_PACKAGE_LABEL.th)}</FieldHeader>
        <SelectShell>
          <select
            className={selectClass}
            value={packageId}
            onChange={(e) => {
              setPackageId(e.target.value as ListingPackageId | "");
              setPackageHint(false);
            }}
          >
            <option value="" disabled>
              {L(MAIN_PACKAGE_LABEL.en, MAIN_PACKAGE_LABEL.th)}
            </option>
            <option value="main">
              {pricedOptionLabel(
                mainPriceTag,
                L(MAIN_PACKAGE_LABEL.en, MAIN_PACKAGE_LABEL.th),
              )}
            </option>
          </select>
        </SelectShell>
        {packageHint && (
          <p className="mt-1.5 text-[11px] font-medium text-amber-700">
            {L("Please select the main package", "กรุณาเลือกแพ็คเกจหลัก")}
          </p>
        )}
      </label>

      {/* Extra dropdown — site-plan only; BOQ / calc are included in main package */}
      <label className="mt-3 block">
        <FieldHeader>{L("Additional options", "ตัวเลือกเพิ่มเติม")}</FieldHeader>
        <SelectShell>
          <select
            className={selectClass}
            value={extraId}
            onChange={(e) => setExtraId(e.target.value as ListingExtraId)}
          >
            <option value="">
              {L("None", "ไม่เลือก")}
            </option>
            <option value="site-plan">
              {pricedOptionLabel(sitePlanPriceTag, sitePlanLabel)}
            </option>
          </select>
        </SelectShell>
      </label>

      {!canPurchase && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
          {L(
            "This plan is not available for purchase yet.",
            "แบบบ้านนี้ยังไม่เปิดให้ซื้อในขณะนี้",
          )}
        </p>
      )}

      <div className="relative z-10 mt-4 space-y-2.5">
        <button
          type="button"
          onClick={() => requirePackage(onAddToCart)}
          disabled={inCart || !canPurchase}
          className="relative flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-slate-300 text-sm font-semibold text-[#1e3a5f] transition hover:border-[#1e40af]/40 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!canPurchase
            ? L("Purchase locked", "ยังไม่เปิดขาย")
            : inCart
              ? translate("store.cartInCart")
              : translate("store.addToCart")}
        </button>
        <button
          type="button"
          onClick={() => requirePackage(onBuyNow)}
          disabled={!canPurchase}
          className="relative flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1e40af] text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          <Download className="h-4 w-4" />
          {!canPurchase ? L("Unavailable", "ยังไม่เปิดขาย") : translate("store.buyNow")}
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2.5">
        <p className="flex items-start gap-2 text-xs font-semibold leading-snug text-[#1e3a5f]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1e40af]" strokeWidth={2} />
          <span>
            {L(
              "Quality guarantee — suitable for building-permit submission",
              "รับประกันคุณภาพ — แบบยื่นขออนุญาตก่อสร้างได้",
            )}
          </span>
        </p>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
        <button
          type="button"
          onClick={() => setOpenPolicy("refund")}
          className="hover:text-[#1e40af] hover:underline"
        >
          {L("Return policy", "นโยบายคืนสินค้า")}
        </button>
        <span className="mx-1.5 text-gray-300">·</span>
        <button
          type="button"
          onClick={() => setOpenPolicy("construction")}
          className="hover:text-[#1e40af] hover:underline"
        >
          {L("Construction terms", "ข้อกำหนดด้านการก่อสร้าง")}
        </button>
        <span className="mx-1.5 text-gray-300">·</span>
        <button
          type="button"
          onClick={() => setOpenPolicy("copyright")}
          className="hover:text-[#1e40af] hover:underline"
        >
          {L("Copyright information", "ข้อมูลลิขสิทธิ์")}
        </button>
      </p>

      {openPolicy && (
        <ListingPolicyPopup
          policyId={openPolicy}
          onClose={() => setOpenPolicy(null)}
        />
      )}

      {openWhatsIncluded && (
        <ListingWhatsIncludedPopup onClose={() => setOpenWhatsIncluded(false)} />
      )}
    </div>
  );
}
