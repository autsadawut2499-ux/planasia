"use client";

import { CreditCard, QrCode, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { CartLineDisplay } from "@/components/store/CartLineDisplay";
import { PreCheckoutReview } from "@/components/store/PreCheckoutReview";
import {
  PreCheckoutWizard,
  defaultPreCheckoutSelections,
  isPreCheckoutValid,
  type PreCheckoutSelections,
} from "@/components/store/PreCheckoutWizard";
import { EMPTY_SHIPPING_ADDRESS } from "@/lib/store/shipping-address";
import { computeCheckoutTotal } from "@/lib/store/cart-pricing";
import {
  defaultDocumentLanguage,
  localizationSurchargeThb,
} from "@/lib/store/document-languages";
import { checkoutCurrencyFor, formatMoney as formatMoneyInCurrency } from "@/lib/currency";
import type { StoreListing } from "@/lib/store/db";
import { StoreUpsellSection } from "@/components/store/StoreUpsellSection";
import {
  availablePaymentMethods,
  defaultPaymentMethod,
  type PaymentMethodId,
} from "@/lib/payments/methods";
import type { CheckoutPreview } from "@/lib/checkout/preview-types";

interface StoreCartDrawerProps {
  listings: StoreListing[];
  viewerHeaders: () => HeadersInit;
  buyerId?: string;
  onCheckoutComplete: (
    downloads: {
      token: string;
      planId: string;
      format: string;
      downloadUrl?: string;
      docLang?: string;
      targetCountry?: string;
    }[],
  ) => void;
}

export function StoreCartDrawer({
  listings,
  viewerHeaders,
  buyerId,
  onCheckoutComplete,
}: StoreCartDrawerProps) {
  const { country, uiLocale, unitSystem, translate } = useApp();
  const { success: toastSuccess } = useToast();
  const {
    items,
    addons,
    drawerOpen,
    setDrawerOpen,
    removeItem,
    toggleAddon,
    clearCart,
  } = useStoreCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preCheckout, setPreCheckout] = useState<PreCheckoutSelections>(() =>
    defaultPreCheckoutSelections(
      defaultDocumentLanguage(uiLocale),
      addons.includes("hardcopy-3sets"),
      addons.includes("boq-bundle"),
      country.code,
    ),
  );

  // TH target + Thai visitor → THB; foreign target or international visitor → USD.
  const checkoutCurrency = useMemo(
    () => checkoutCurrencyFor(preCheckout.targetCountry, country.code),
    [preCheckout.targetCountry, country.code],
  );
  const formatCheckoutMoney = useMemo(
    () => (amountThb: number) => formatMoneyInCurrency(amountThb, checkoutCurrency),
    [checkoutCurrency],
  );
  const paymentMethods = useMemo(
    () =>
      availablePaymentMethods(
        checkoutCurrency,
        checkoutCurrency === "THB" ? "TH" : preCheckout.targetCountry,
      ),
    [checkoutCurrency, preCheckout.targetCountry],
  );
  const [method, setMethod] = useState<PaymentMethodId>(() =>
    defaultPaymentMethod(checkoutCurrency, checkoutCurrency === "THB" ? "TH" : country.code),
  );

  useEffect(() => {
    const next = defaultPaymentMethod(
      checkoutCurrency,
      checkoutCurrency === "THB" ? "TH" : preCheckout.targetCountry,
    );
    if (!paymentMethods.some((m) => m.id === method && m.available)) {
      setMethod(next);
    }
  }, [checkoutCurrency, preCheckout.targetCountry, method, paymentMethods]);

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
        countryCode: country.code,
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

  // Keep selection valid when currency/country flips (THB↔USD).
  const activeMethod =
    paymentMethods.find((m) => m.id === method && m.available)?.id ??
    defaultPaymentMethod(
      checkoutCurrency,
      checkoutCurrency === "THB" ? "TH" : preCheckout.targetCountry,
    );

  const checkoutPricing = useMemo(
    () =>
      computeCheckoutTotal(
        items,
        addons,
        localizationSurchargeThb(preCheckout.targetCountry),
      ),
    [items, addons, preCheckout.targetCountry],
  );

  const canPay =
    !previewLoading &&
    !!preview?.readyForCheckout &&
    reviewConfirmed &&
    !previewError &&
    isPreCheckoutValid(preCheckout);

  const L = (en: string, th: string) => (uiLocale === "th" ? th : en);
  const thai = uiLocale === "th";

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
          target_country: preCheckout.targetCountry,
          currency: checkoutCurrency,
          uiLocale,
          userId: buyerId,
          documentLanguage: preCheckout.documentLanguage,
          buyerName: preCheckout.buyerName.trim(),
          buyerEmail: preCheckout.buyerEmail.trim(),
          shippingAddress: preCheckout.hardcopyAddon
            ? preCheckout.shippingAddress ?? EMPTY_SHIPPING_ADDRESS
            : undefined,
        }),
      });
      const data = await res.json();

      if (data.requiresCheckout && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.success && data.downloads?.length) {
        clearCart();
        setDrawerOpen(false);
        toastSuccess(translate("store.cartCheckoutSuccess"));
        onCheckoutComplete(data.downloads);
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
              <PreCheckoutWizard
                thai={thai}
                formatMoney={formatCheckoutMoney}
                selections={preCheckout}
                visitorCountryCode={country.code}
                onChange={(next) => {
                  setPreCheckout(next);
                  const hasBoq = addons.includes("boq-bundle");
                  const hasHardcopy = addons.includes("hardcopy-3sets");
                  if (next.boqAddon !== hasBoq) toggleAddon("boq-bundle");
                  if (next.hardcopyAddon !== hasHardcopy) toggleAddon("hardcopy-3sets");
                }}
                basePlanLabel={
                  items.length === 1
                    ? items[0].name
                    : thai
                      ? `แบบบ้าน ${items.length} รายการ`
                      : `${items.length} house plans`
                }
                basePlanPrice={checkoutPricing.subtotal}
                extraLines={
                  checkoutPricing.discount > 0
                    ? [
                        {
                          label: translate("store.cartDiscount"),
                          amount: -checkoutPricing.discount,
                          tone: "green",
                        },
                      ]
                    : []
                }
              />

              <PreCheckoutReview
                preview={preview}
                loading={previewLoading}
                error={previewError}
                confirmed={reviewConfirmed}
                onConfirmChange={setReviewConfirmed}
                L={L}
              />

              <div>
                <h3 className="mb-2 text-sm font-bold text-text-primary">
                  {thai ? "ช่องทางชำระเงิน" : "Payment method"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!m.available || !canPay}
                      title={thai ? m.reasonUnavailableTh : m.reasonUnavailable}
                      onClick={() => m.available && setMethod(m.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 disabled:cursor-not-allowed disabled:opacity-40 ${
                        activeMethod === m.id ? "border-[#1e40af] bg-blue-50" : "border-border"
                      }`}
                    >
                      {m.id === "promptpay" ? <QrCode className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                      <span className="text-[10px] font-medium">
                        {m.id === "promptpay"
                          ? translate("payment.promptpay")
                          : thai
                            ? m.labelTh
                            : translate("payment.card")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

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
          <div className="border-t border-border px-4 pt-4 sm:px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {!canPay && !previewLoading && (
              <p className="mb-2 text-center text-[11px] text-text-muted">
                {L(
                  "Complete buyer details, accept the Terms & Refund Policy, and confirm the review to enable payment",
                  "กรอกข้อมูลผู้ซื้อ ยอมรับข้อกำหนดและนโยบายคืนเงิน และยืนยันการตรวจสอบด้านบน จึงจะชำระเงินได้",
                )}
              </p>
            )}
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
                  : `${thai ? "ไปชำระเงิน" : "Proceed to payment"} · ${formatCheckoutMoney(checkoutPricing.total)}`}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
