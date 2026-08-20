"use client";

import { Building2, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import {
  BankTransferPaymentPanel,
  type BankTransferBankInfo,
} from "@/components/store/BankTransferPaymentPanel";
import { CartLineDisplay } from "@/components/store/CartLineDisplay";
import {
  CheckoutGoogleGate,
  useCheckoutBuyer,
} from "@/components/store/CheckoutGoogleGate";
import { PreCheckoutReview } from "@/components/store/PreCheckoutReview";
import {
  PreCheckoutWizard,
  defaultPreCheckoutSelections,
  isPreCheckoutValid,
  type PreCheckoutSelections,
} from "@/components/store/PreCheckoutWizard";
import {
  BOQ_BUNDLE_PRICE,
  CALC_SHEET_PRICE,
  HARDCOPY_3SETS_PRICE,
  SITE_PLAN_ADDON_PRICE,
  computeCheckoutTotal,
} from "@/lib/store/cart-pricing";
import {
  defaultDocumentLanguage,
  localizationSurchargeThb,
} from "@/lib/store/document-languages";
import { formatMoney as formatMoneyInCurrency } from "@/lib/currency";
import type { StoreListing } from "@/lib/store/db";
import { StoreUpsellSection } from "@/components/store/StoreUpsellSection";
import { defaultPaymentMethod } from "@/lib/payments/methods";
import type { CheckoutPreview } from "@/lib/checkout/preview-types";
import {
  boqDocumentLabel,
  calcDocumentLabel,
  sitePlanDocumentLabel,
  resolveBoqPrice,
  resolveCalcPrice,
  resolveSitePlanPrice,
} from "@/lib/store/listing-packages";

interface StoreCartDrawerProps {
  listings: StoreListing[];
  viewerHeaders: () => HeadersInit;
  buyerId?: string;
  onCheckoutComplete: (
    downloads: {
      token: string;
      planId: string;
      format: string;
      fileKind?: string;
      label?: string;
      filename?: string;
      downloadUrl?: string;
      docLang?: string;
      targetCountry?: string;
    }[],
    meta?: { orderId?: string },
  ) => void;
}


export function StoreCartDrawer({
  listings,
  viewerHeaders,
  buyerId,
  onCheckoutComplete,
}: StoreCartDrawerProps) {
  const { country, currency, geoCountryCode, uiLocale, unitSystem, translate } = useApp();
  const { success: toastSuccess } = useToast();
  const { sessionPrefill } = useCheckoutBuyer();
  const {
    items,
    addons,
    drawerOpen,
    setDrawerOpen,
    removeItem,
    clearCart,
  } = useStoreCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankCheckout, setBankCheckout] = useState<{
    orderId: string;
    amountThb: number;
    bank: BankTransferBankInfo;
  } | null>(null);
  const [preCheckout, setPreCheckout] = useState<PreCheckoutSelections>(() =>
    defaultPreCheckoutSelections(
      defaultDocumentLanguage(uiLocale),
      false,
      false,
      country.code,
    ),
  );

  // Charge / display currency follows visitor geo-IP (not store catalog country).
  const checkoutCurrency = currency;
  const formatCheckoutMoney = useMemo(
    () => (amountThb: number) => formatMoneyInCurrency(amountThb, checkoutCurrency),
    [checkoutCurrency],
  );
  const activeMethod = defaultPaymentMethod(checkoutCurrency, geoCountryCode);

  // Pre-checkout: unit preview for selected country (Gemini runs only after payment).
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const listingIdsKey = useMemo(() => items.map((i) => i.listingId).join(","), [items]);
  const addonsKey = useMemo(() => addons.join(","), [addons]);

  useEffect(() => {
    if (!drawerOpen || !listingIdsKey) {
      setPreview(null);
      setReviewConfirmed(false);
      return;
    }

    const ids = listingIdsKey.split(",").filter(Boolean);
    const addonList = addonsKey ? addonsKey.split(",") : [];

    let active = true;
    setPreviewLoading(true);
    setPreviewError(null);
    setReviewConfirmed(false);

    void fetch("/api/checkout/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingIds: ids,
        uiLocale,
        countryCode: geoCountryCode,
        /** Buyer-selected market for Gemini translate + unit conversion. */
        target_country: preCheckout.targetCountry,
        currency: checkoutCurrency,
        unitSystem,
        addons: addonList,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Preview failed");
        if (active) setPreview(data as CheckoutPreview);
      })
      .catch((err) => {
        if (active) {
          setPreview(null);
          setPreviewError(err instanceof Error ? err.message : "Preview failed");
        }
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    drawerOpen,
    listingIdsKey,
    addonsKey,
    uiLocale,
    country.code,
    checkoutCurrency,
    unitSystem,
    preCheckout.targetCountry,
  ]);

  const thai = uiLocale === "th";
  const L = (en: string, th: string) => (uiLocale === "th" ? th : en);

  const anchorListing = useMemo(
    () => listings.find((l) => items.some((i) => i.listingId === l.id)),
    [items, listings],
  );
  const addonPrices = useMemo(
    () => ({
      boqPrice: anchorListing?.boqPrice ?? null,
      calcPrice: anchorListing?.calcPrice ?? null,
      sitePlanPrice: anchorListing?.sitePlanAddonPrice ?? null,
    }),
    [
      anchorListing?.boqPrice,
      anchorListing?.calcPrice,
      anchorListing?.sitePlanAddonPrice,
    ],
  );

  const checkoutPricing = useMemo(
    () =>
      computeCheckoutTotal(
        items,
        addons,
        localizationSurchargeThb(preCheckout.targetCountry),
        addonPrices,
      ),
    [items, addons, preCheckout.targetCountry, addonPrices],
  );

  /** Add-on fees as separate summary lines (not folded into the base plan price). */
  const checkoutExtraLines = useMemo(() => {
    const lines: { label: string; amount: number; tone?: "muted" | "green" }[] =
      [];
    if (checkoutPricing.discount > 0) {
      lines.push({
        label: translate("store.cartDiscount"),
        amount: -checkoutPricing.discount,
        tone: "green",
      });
    }
    if (addons.includes("hardcopy-3sets") && HARDCOPY_3SETS_PRICE > 0) {
      lines.push({
        label: thai
          ? "เอกสารรูปเล่ม A3 ×3 (รวมในแพ็คเกจหลัก)"
          : "Printed A3 sets ×3 (included in main package)",
        amount: HARDCOPY_3SETS_PRICE,
        tone: "muted",
      });
    }
    if (addons.includes("site-plan")) {
      lines.push({
        label: sitePlanDocumentLabel(thai),
        amount: anchorListing
          ? resolveSitePlanPrice(anchorListing)
          : SITE_PLAN_ADDON_PRICE,
      });
    }
    if (addons.includes("boq-bundle")) {
      lines.push({
        label: boqDocumentLabel(thai),
        amount: anchorListing
          ? resolveBoqPrice(anchorListing)
          : BOQ_BUNDLE_PRICE,
      });
    }
    if (addons.includes("calc-sheet")) {
      lines.push({
        label: calcDocumentLabel(thai),
        amount: anchorListing
          ? resolveCalcPrice(anchorListing)
          : CALC_SHEET_PRICE,
      });
    }
    return lines;
  }, [
    addons,
    anchorListing,
    checkoutPricing.discount,
    thai,
    translate,
  ]);

  const requiresShipping = addons.includes("hardcopy-3sets");
  const requiresSitePlan = addons.includes("site-plan");

  const canPay =
    !previewLoading &&
    !!preview?.readyForCheckout &&
    reviewConfirmed &&
    !previewError &&
    isPreCheckoutValid(preCheckout, { requiresShipping, requiresSitePlan });

  if (!drawerOpen) return null;

  const handleCheckout = async () => {
    if (items.length === 0 || !canPay) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/store/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...viewerHeaders() },
        body: JSON.stringify({
          items,
          addons,
          method: activeMethod,
          countryCode: country.code,
          visitorCountryCode: geoCountryCode,
          target_country: preCheckout.targetCountry,
          currency: checkoutCurrency,
          uiLocale,
          userId: buyerId,
          documentLanguage: preCheckout.documentLanguage,
          buyerName: preCheckout.buyerName.trim() || sessionPrefill?.name?.trim() || undefined,
          buyerEmail: preCheckout.buyerEmail.trim() || sessionPrefill?.email?.trim() || undefined,
          buyerPhone: preCheckout.buyerPhone.trim(),
          shippingAddress: requiresShipping
            ? preCheckout.shippingAddress
            : undefined,
          sitePlanInfo: requiresSitePlan
            ? preCheckout.sitePlanInfo
            : undefined,
        }),
      });
      const data = await res.json();

      if (data.requiresBankTransfer && data.orderId && data.bank) {
        setBankCheckout({
          orderId: data.orderId,
          amountThb: Number(data.amountThb ?? data.amount ?? checkoutPricing.total),
          bank: data.bank,
        });
        return;
      }

      if (data.success && data.downloads?.length) {
        clearCart();
        setDrawerOpen(false);
        setBankCheckout(null);
        toastSuccess(translate("store.cartCheckoutSuccess"));
        onCheckoutComplete(data.downloads, { orderId: data.orderId });
        return;
      }

      const missing =
        Array.isArray(data.missing) && data.missing.length
          ? ` (${data.missing.join(", ")})`
          : "";
      setError((data.error ?? translate("payment.failed")) + missing);
    } catch {
      setError(translate("payment.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[70] bg-black/40"
        aria-label={translate("workflow.cancel")}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-white shadow-2xl pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#1e40af]" />
            <h2 className="text-lg font-bold text-text-primary">{translate("store.cartTitle")}</h2>
            <span className="rounded-full bg-[#1e40af] px-2 py-0.5 text-xs font-bold text-white">
              {items.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg hover:bg-surface-raised"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-text-muted" />
              <p className="text-sm text-text-secondary">{translate("store.cartEmpty")}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border px-5">
              {items.map((item) => {
                const listing = listings.find((l) => l.id === item.listingId);
                return (
                <li key={item.listingId} className="flex gap-3 py-4">
                  <CartLineDisplay item={item} listing={listing} />
                  <button
                    type="button"
                    onClick={() => removeItem(item.listingId)}
                    className="shrink-0 rounded p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600"
                    aria-label={translate("store.cartRemove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && (
            <div className="space-y-4 border-t border-border px-5 py-4">
              <CheckoutGoogleGate thai={thai} />

              <PreCheckoutWizard
                thai={thai}
                formatMoney={formatCheckoutMoney}
                selections={preCheckout}
                visitorCountryCode={geoCountryCode}
                onChange={setPreCheckout}
                requiresShipping={requiresShipping}
                requiresSitePlan={requiresSitePlan}
                sessionPrefill={sessionPrefill}
                basePlanLabel={
                  items.length === 1
                    ? items[0].name
                    : thai
                      ? `แบบบ้าน ${items.length} รายการ`
                      : `${items.length} house plans`
                }
                basePlanPrice={checkoutPricing.subtotal}
                extraLines={checkoutExtraLines}
              />

              <PreCheckoutReview
                preview={preview}
                loading={previewLoading}
                error={previewError}
                confirmed={reviewConfirmed}
                onConfirmChange={setReviewConfirmed}
                L={L}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}

          <StoreUpsellSection
            listings={listings}
            variant="compact"
            className="border-t border-border px-5 py-4"
          />
        </div>

        {items.length > 0 && (
          <div className="shrink-0 border-t border-border bg-white px-4 pt-3 sm:px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {bankCheckout ? (
              <BankTransferPaymentPanel
                orderId={bankCheckout.orderId}
                amountThb={bankCheckout.amountThb}
                bank={bankCheckout.bank}
                thai={thai}
                formatMoney={formatCheckoutMoney}
                onCancel={() => {
                  setBankCheckout(null);
                  setError(null);
                }}
                onPaid={(result) => {
                  clearCart();
                  setDrawerOpen(false);
                  setBankCheckout(null);
                  toastSuccess(translate("store.cartCheckoutSuccess"));
                  onCheckoutComplete(result.downloads ?? [], {
                    orderId: result.orderId,
                  });
                }}
              />
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2 text-sm text-text-secondary">
                  <Building2 className="h-4 w-4 text-[#1e40af]" />
                  <span>
                    {thai
                      ? "ชำระเงินด้วยโอนธนาคาร + อัปโหลดสลิป (ตรวจอัตโนมัติ)"
                      : "Pay by bank transfer + slip upload (auto-verified)"}
                  </span>
                </div>
                {!canPay && !previewLoading ? (
                  <p className="mb-2 text-center text-[11px] text-text-muted">
                {L(
                  requiresShipping || requiresSitePlan
                    ? "Complete required fields (shipping / site plan), accept the Terms & Refund Policy, and confirm the review"
                    : "Accept the Terms & Refund Policy and confirm the review to enable payment",
                  requiresShipping || requiresSitePlan
                    ? "กรอกข้อมูลที่จำเป็น (ที่อยู่จัดส่ง / แผนผังบริเวณ) ยอมรับข้อกำหนด และยืนยันการตรวจสอบด้านบน"
                    : "ยอมรับข้อกำหนด และยืนยันการตรวจสอบด้านบน จึงจะชำระเงินได้",
                )}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading || !canPay}
                  className="min-h-12 w-full rounded-lg bg-[#1e40af] py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#1d4ed8] disabled:opacity-60"
                >
                  {loading
                    ? translate("payment.processing")
                    : previewLoading
                      ? L("Preparing checkout…", "กำลังเตรียมการชำระเงิน…")
                      : `${thai ? "สร้างคำสั่งซื้อ / โอนเงิน" : "Place order / transfer"} · ${formatCheckoutMoney(checkoutPricing.total)}`}
                </button>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
