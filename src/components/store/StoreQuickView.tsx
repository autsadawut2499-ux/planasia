"use client";

import { CreditCard, QrCode, X, Download, Layers, Home } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  CheckoutGoogleGate,
  useCheckoutBuyer,
} from "@/components/store/CheckoutGoogleGate";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import {
  ListingImageCarousel,
  buildListingGalleryUrls,
} from "@/components/store/ListingImageCarousel";
import type { StoreListing } from "@/lib/store/db";
import {
  PreCheckoutWizard,
  defaultPreCheckoutSelections,
  isPreCheckoutValid,
  type PreCheckoutSelections,
} from "@/components/store/PreCheckoutWizard";
import { defaultDocumentLanguage } from "@/lib/store/document-languages";
import { formatMoney as formatMoneyInCurrency } from "@/lib/currency";
import {
  availablePaymentMethods,
  defaultPaymentMethod,
  type PaymentMethodId,
} from "@/lib/payments/methods";
import { isListingPurchasable } from "@/lib/store/listing-purchase";
import { useBilingual } from "@/components/landing/useBilingual";
import {
  boqDocumentLabel,
  calcDocumentLabel,
  resolveBoqPrice,
  resolveCalcPrice,
} from "@/lib/store/listing-packages";
import { HARDCOPY_3SETS_PRICE } from "@/lib/store/cart-pricing";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

interface StoreQuickViewProps {
  listing: StoreListing;
  onClose: () => void;
  onBuy: (listing: StoreListing) => void;
  onAddToCart?: (listing: StoreListing) => void;
  inCart?: boolean;
}

export function StoreQuickView({ listing, onClose, onBuy, onAddToCart, inCart }: StoreQuickViewProps) {
  const { formatMoney, translate } = useApp();
  const L = useBilingual();
  const localized = useStoreListingCopy(listing);
  const canPurchase = isListingPurchasable(listing);
  const [view, setView] = useState<"exterior" | "floor">("exterior");
  const [floorIndex, setFloorIndex] = useState(0);

  const floorUrls = listing.floorPlanUrls?.length ? listing.floorPlanUrls : [];
  const galleryUrls = useMemo(() => buildListingGalleryUrls(listing), [listing]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92dvh] sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-border px-3 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e40af]">
              {translate("store.communityBadge")}
            </p>
            <h2 className="truncate text-base font-bold text-text-primary sm:text-lg">{localized.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface-raised"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid-cols-2 md:overflow-hidden">
          <div className="border-b border-border bg-[#f5f6f8] md:border-b-0 md:border-r md:overflow-y-auto">
            <div className="flex gap-1 overflow-x-auto border-b border-border p-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setView("exterior")}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold uppercase ${
                  view === "exterior" ? "bg-[#1e40af] text-white" : "text-text-muted"
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                {translate("store.viewExterior")}
              </button>
              <button
                type="button"
                onClick={() => setView("floor")}
                className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold uppercase ${
                  view === "floor" ? "bg-[#1e40af] text-white" : "text-text-muted"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                {translate("store.viewFloorPlan")}
              </button>
            </div>

            {view === "exterior" ? (
              <ListingImageCarousel
                images={galleryUrls}
                alt={listing.name}
                frameClassName="relative aspect-[4/3] touch-pan-y bg-[#f5f6f8] p-2 sm:p-4"
                imgClassName="h-full w-full select-none rounded-lg object-contain"
              />
            ) : (
              <div className="relative aspect-[4/3] p-2 sm:p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={floorUrls[floorIndex] || listing.image}
                  alt={listing.name}
                  className="h-full w-full rounded-lg object-contain"
                />
                {floorUrls.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-full bg-black/35 px-1 py-1">
                    {floorUrls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFloorIndex(i)}
                        className="flex h-8 w-8 items-center justify-center"
                        aria-label={`Floor ${i + 1}`}
                      >
                        <span
                          className={`block h-2.5 w-2.5 rounded-full ${
                            i === floorIndex ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col p-4 sm:p-5 md:overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">{localized.description}</p>

            <div className="mb-4 grid grid-cols-4 gap-1.5 text-center sm:gap-2">
              {[
                { label: translate("store.specSqft"), value: listing.area.replace(/[^0-9.]/g, "") || "—" },
                { label: translate("store.specBeds"), value: String(listing.beds) },
                { label: translate("store.specBaths"), value: String(listing.baths) },
                { label: translate("store.specStories"), value: String(listing.floors) },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-surface-raised px-1 py-2.5">
                  <p className="truncate text-[9px] font-bold uppercase text-text-muted">{s.label}</p>
                  <p className="font-price text-sm font-bold tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto border-t border-border pt-4">
              <p className="text-xs text-text-muted">{translate("store.startingAt")}</p>
              <p className="font-price text-2xl font-bold tabular-nums text-[#1e40af]">
                {formatMoney(listing.price)}
              </p>
              {!canPurchase && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  {L(
                    "This plan is visible for browsing. Purchase unlocks after admin approval.",
                    "แบบบ้านนี้ดูรายละเอียดได้แล้ว แต่ยังไม่เปิดให้ซื้อ — รอแอดมินอนุมัติ",
                  )}
                </p>
              )}
              <div className="mt-4 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(listing)}
                    disabled={inCart || !canPurchase}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-text-primary hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!canPurchase
                      ? L("Locked", "ยังไม่เปิดขาย")
                      : inCart
                        ? translate("store.cartInCart")
                        : translate("store.addToCart")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onBuy(listing)}
                  disabled={!canPurchase}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1e40af] py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 ${onAddToCart ? "" : "col-span-full"}`}
                >
                  <Download className="h-4 w-4" />
                  {!canPurchase ? L("Pending approval", "รออนุมัติ") : translate("store.buyNow")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StoreCheckoutModalProps {
  listing: StoreListing;
  open: boolean;
  onClose: () => void;
  onSuccess: (downloadToken: string, planId: string) => void;
  viewerHeaders: () => HeadersInit;
  buyerId?: string;
  /** Prefill from listing detail package picker. */
  initialFormat?: "pdf" | "cad";
  initialHardcopy?: boolean;
  initialBoq?: boolean;
  initialCalcSheet?: boolean;
  /** Display price for the base line (includes CAD surcharge when format=cad). */
  basePlanPrice?: number;
}

export function StoreCheckoutModal({
  listing,
  open,
  onClose,
  onSuccess,
  viewerHeaders,
  buyerId,
  initialFormat = "pdf",
  initialHardcopy = false,
  initialBoq = false,
  initialCalcSheet = false,
  basePlanPrice,
}: StoreCheckoutModalProps) {
  const { country, currency, geoCountryCode, translate, uiLocale } = useApp();
  const { authReady, sessionPrefill } = useCheckoutBuyer();
  const localized = useStoreListingCopy(listing);
  const thai = uiLocale === "th";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<"pdf" | "cad">(initialFormat);
  const [hardcopy, setHardcopy] = useState(initialHardcopy);
  const [boq, setBoq] = useState(initialBoq);
  const [calcSheet, setCalcSheet] = useState(initialCalcSheet);
  const [selections, setSelections] = useState<PreCheckoutSelections>(() =>
    defaultPreCheckoutSelections(
      defaultDocumentLanguage(uiLocale),
      false,
      false,
      country.code,
    ),
  );

  useEffect(() => {
    if (!open) return;
    setFormat(initialFormat);
    setHardcopy(initialHardcopy);
    setBoq(initialBoq);
    setCalcSheet(initialCalcSheet);
    setSelections(
      defaultPreCheckoutSelections(
        defaultDocumentLanguage(uiLocale),
        false,
        false,
        country.code,
      ),
    );
    setError(null);
  }, [
    open,
    initialFormat,
    initialHardcopy,
    initialBoq,
    initialCalcSheet,
    uiLocale,
    country.code,
  ]);

  const checkoutExtraLines = useMemo(() => {
    const lines: { label: string; amount: number }[] = [];
    if (hardcopy) {
      lines.push({
        label: thai
          ? "ถ่ายเอกสาร 3 ชุด (A3)"
          : "Photocopy 3 sets (A3)",
        amount: HARDCOPY_3SETS_PRICE,
      });
    }
    if (boq) {
      lines.push({
        label: boqDocumentLabel(thai),
        amount: resolveBoqPrice(listing),
      });
    }
    if (calcSheet) {
      lines.push({
        label: calcDocumentLabel(thai),
        amount: resolveCalcPrice(listing),
      });
    }
    return lines;
  }, [boq, calcSheet, hardcopy, listing, thai]);

  const checkoutCurrency = currency;
  const formatCheckoutMoney = useMemo(
    () => (amountThb: number) => formatMoneyInCurrency(amountThb, checkoutCurrency),
    [checkoutCurrency],
  );
  const paymentMethods = useMemo(
    () => availablePaymentMethods(checkoutCurrency, geoCountryCode),
    [checkoutCurrency, geoCountryCode],
  );
  const [method, setMethod] = useState<PaymentMethodId>(() =>
    defaultPaymentMethod(checkoutCurrency, geoCountryCode),
  );

  useEffect(() => {
    const next = defaultPaymentMethod(checkoutCurrency, geoCountryCode);
    if (!paymentMethods.some((m) => m.id === method && m.available)) {
      setMethod(next);
    }
  }, [checkoutCurrency, geoCountryCode, method, paymentMethods]);

  if (!open) return null;

  const requiresShipping = hardcopy;
  const canPay =
    authReady && isPreCheckoutValid(selections, { requiresShipping });
  // Buyer (+ shipping when physical) then payment.
  const payStep = THAI_DOMESTIC_MARKET
    ? requiresShipping
      ? "3"
      : "2"
    : requiresShipping
      ? "4"
      : "3";

  const handlePay = async () => {
    if (!authReady) {
      setError(
        thai
          ? "เข้าสู่ระบบด้วย Google เพื่อดาวน์โหลดไฟล์และรับเอกสาร"
          : "Sign in with Google to download files and receive documents.",
      );
      return;
    }
    if (!canPay) {
      setError(
        thai
          ? requiresShipping
            ? "กรุณากรอกที่อยู่จัดส่งและยอมรับข้อกำหนด/นโยบายคืนเงิน (เบอร์โทรไม่บังคับ)"
            : "กรุณายอมรับข้อกำหนด/นโยบายคืนเงิน (เบอร์โทรไม่บังคับ)"
          : requiresShipping
            ? "Please complete the shipping address and accept the Terms & Refund Policy (phone optional)"
            : "Please accept the Terms & Refund Policy (phone optional)",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const addons = [
        ...(hardcopy ? (["hardcopy-3sets"] as const) : []),
        ...(boq ? (["boq-bundle"] as const) : []),
        ...(calcSheet ? (["calc-sheet"] as const) : []),
      ];
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...viewerHeaders() },
        body: JSON.stringify({
          listingId: listing.id,
          format,
          method,
          countryCode: country.code,
          visitorCountryCode: geoCountryCode,
          target_country: selections.targetCountry,
          currency: checkoutCurrency,
          userId: buyerId,
          documentLanguage: selections.documentLanguage,
          addons,
          buyerName: selections.buyerName.trim(),
          buyerEmail: selections.buyerEmail.trim(),
          buyerPhone: selections.buyerPhone.trim(),
          shippingAddress: requiresShipping
            ? selections.shippingAddress
            : undefined,
          uiLocale,
        }),
      });
      const data = await res.json();

      if (data.requiresCheckout && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.success && data.downloadToken) {
        onSuccess(data.downloadToken, data.planId);
        return;
      }

      setError(data.error ?? translate("payment.failed"));
    } catch {
      setError(translate("payment.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg font-bold text-text-primary">
              {thai ? "ก่อนชำระเงิน" : "Before payment"}
            </h2>
            <p className="text-xs text-text-secondary line-clamp-1">{localized.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface-raised"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <CheckoutGoogleGate thai={thai} />

          {authReady && (
            <PreCheckoutWizard
              thai={thai}
              formatMoney={formatCheckoutMoney}
              selections={selections}
              visitorCountryCode={geoCountryCode}
              onChange={setSelections}
              requiresShipping={requiresShipping}
              sessionPrefill={sessionPrefill}
              basePlanLabel={
                format === "cad"
                  ? `${localized.name} (AutoCAD / DWG)`
                  : localized.name
              }
              basePlanPrice={basePlanPrice ?? listing.price}
              extraLines={checkoutExtraLines}
            />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="sticky bottom-0 shrink-0 border-t border-border bg-white px-3 pt-3 sm:px-5 sm:pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <h3 className="text-sm font-bold text-text-primary">
            {thai ? `${payStep}. ช่องทางชำระเงิน` : `${payStep}. Payment method`}
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={!m.available}
                title={thai ? m.reasonUnavailableTh : m.reasonUnavailable}
                onClick={() => m.available && setMethod(m.id)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 disabled:cursor-not-allowed disabled:opacity-40 ${
                  method === m.id ? "border-[#1e40af] bg-blue-50" : "border-border"
                }`}
              >
                {m.id === "promptpay" ? (
                  <QrCode className="h-5 w-5" />
                ) : (
                  <CreditCard className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">
                  {m.id === "promptpay"
                    ? translate("payment.promptpay")
                    : thai
                      ? m.labelTh
                      : translate("payment.card")}
                </span>
              </button>
            ))}
          </div>
          {!authReady ? (
            <p className="mt-2 text-center text-[11px] text-text-muted">
              {thai
                ? "เข้าสู่ระบบด้วย Google เพื่อดาวน์โหลดไฟล์และรับเอกสาร"
                : "Sign in with Google to download files and receive documents."}
            </p>
          ) : !canPay ? (
            <p className="mt-2 text-center text-[11px] text-text-muted">
              {thai
                ? requiresShipping
                  ? "กรอกที่อยู่จัดส่งและยอมรับข้อกำหนด จึงจะกดชำระเงินได้ (เบอร์โทรไม่บังคับ)"
                  : "ยอมรับข้อกำหนดด้านบน จึงจะกดชำระเงินได้ (เบอร์โทรไม่บังคับ)"
                : requiresShipping
                  ? "Complete shipping address and accept the terms to enable payment (phone optional)"
                  : "Accept the terms above to enable payment (phone optional)"}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2 sm:gap-3">
            <button type="button" onClick={onClose} className="btn-ghost min-h-12 flex-1 text-sm">
              {translate("workflow.cancel")}
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={loading || !canPay}
              className="btn-primary min-h-12 flex-[1.35] text-sm disabled:opacity-60"
            >
              {loading
                ? translate("payment.processing")
                : thai
                  ? "ไปชำระเงิน"
                  : "Proceed to payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
