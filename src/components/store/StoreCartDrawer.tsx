"use client";

import { CreditCard, Minus, Plus, QrCode, ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/i18n";
import { CartLineDisplay } from "@/components/store/CartLineDisplay";
import { CAD_BUNDLE_PRICE } from "@/lib/store/cart-pricing";
import type { StoreListing } from "@/lib/store/db";
import { StoreUpsellSection } from "@/components/store/StoreUpsellSection";

interface StoreCartDrawerProps {
  listings: StoreListing[];
  viewerHeaders: () => HeadersInit;
  buyerId?: string;
  onCheckoutComplete: (downloads: { token: string; planId: string; format: string }[]) => void;
}

export function StoreCartDrawer({
  listings,
  viewerHeaders,
  buyerId,
  onCheckoutComplete,
}: StoreCartDrawerProps) {
  const { country, locale, translate } = useApp();
  const { success: toastSuccess } = useToast();
  const {
    items,
    addons,
    drawerOpen,
    setDrawerOpen,
    removeItem,
    toggleAddon,
    clearCart,
    pricing,
  } = useStoreCart();

  const [method, setMethod] = useState<"stripe" | "promptpay">("promptpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!drawerOpen) return null;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/store/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...viewerHeaders() },
        body: JSON.stringify({
          items,
          addons,
          method,
          countryCode: country.code,
          userId: buyerId,
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

  const cadSelected = addons.includes("cad-bundle");

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[70] bg-black/40"
        aria-label={translate("workflow.cancel")}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#1e40af]" />
            <h2 className="text-lg font-bold text-text-primary">{translate("store.cartTitle")}</h2>
            <span className="rounded-full bg-[#1e40af] px-2 py-0.5 text-xs font-bold text-white">
              {items.length}
            </span>
          </div>
          <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 hover:bg-surface-raised">
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
              <div className="rounded-lg border border-dashed border-[#1e40af]/30 bg-blue-50/50 p-3">
                <button
                  type="button"
                  onClick={() => toggleAddon("cad-bundle")}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      cadSelected ? "border-[#1e40af] bg-[#1e40af] text-white" : "border-border bg-white"
                    }`}
                  >
                    {cadSelected ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{translate("store.upsell.cadBundle")}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{translate("store.upsell.cadBundleDesc")}</p>
                    <p className="mt-1 text-sm font-bold text-[#1e40af]">
                      +{formatPrice(CAD_BUNDLE_PRICE, country.currency, locale)}
                    </p>
                  </div>
                </button>
              </div>

              {pricing.discount > 0 && (
                <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-800">
                  {translate("store.cartBundleDiscount")} —{" "}
                  {formatPrice(pricing.discount, country.currency, locale)}
                </p>
              )}

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>{translate("store.cartSubtotal")}</span>
                  <span>{formatPrice(pricing.subtotal, country.currency, locale)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>{translate("store.cartDiscount")}</span>
                    <span>-{formatPrice(pricing.discount, country.currency, locale)}</span>
                  </div>
                )}
                {pricing.addonTotal > 0 && (
                  <div className="flex justify-between text-text-secondary">
                    <span>{translate("store.upsell.cadBundle")}</span>
                    <span>{formatPrice(pricing.addonTotal, country.currency, locale)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-text-primary">
                  <span>{translate("store.cartTotal")}</span>
                  <span className="text-[#1e40af]">{formatPrice(pricing.total, country.currency, locale)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("promptpay")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 ${
                    method === "promptpay" ? "border-[#1e40af] bg-blue-50" : "border-border"
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{translate("payment.promptpay")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("stripe")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 ${
                    method === "stripe" ? "border-[#1e40af] bg-blue-50" : "border-border"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{translate("payment.card")}</span>
                </button>
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
          <div className="border-t border-border p-5">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-lg bg-[#1e40af] py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {loading ? translate("payment.processing") : translate("store.cartCheckout")}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
