"use client";

import { CreditCard, QrCode, X, Download, Layers, Home } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { formatPrice } from "@/lib/i18n";
import type { StoreListing } from "@/lib/store/db";

interface StoreQuickViewProps {
  listing: StoreListing;
  onClose: () => void;
  onBuy: (listing: StoreListing) => void;
  onAddToCart?: (listing: StoreListing) => void;
  inCart?: boolean;
}

export function StoreQuickView({ listing, onClose, onBuy, onAddToCart, inCart }: StoreQuickViewProps) {
  const { locale, translate } = useApp();
  const localized = useStoreListingCopy(listing);
  const [view, setView] = useState<"exterior" | "floor">("exterior");
  const [floorIndex, setFloorIndex] = useState(0);

  const floorUrls = listing.floorPlanUrls?.length
    ? listing.floorPlanUrls
    : ["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e40af]">
              {translate("store.communityBadge")}
            </p>
            <h2 className="text-lg font-bold text-text-primary">{localized.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-raised">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-2">
          <div className="border-b border-border bg-[#f5f6f8] md:border-b-0 md:border-r">
            <div className="flex gap-1 border-b border-border p-2">
              <button
                type="button"
                onClick={() => setView("exterior")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                  view === "exterior" ? "bg-[#1e40af] text-white" : "text-text-muted"
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                {translate("store.viewExterior")}
              </button>
              <button
                type="button"
                onClick={() => setView("floor")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                  view === "floor" ? "bg-[#1e40af] text-white" : "text-text-muted"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                {translate("store.viewFloorPlan")}
              </button>
            </div>

            <div className="relative aspect-[4/3] p-4">
              <img
                src={view === "exterior" ? listing.image : floorUrls[floorIndex]}
                alt={listing.name}
                className="h-full w-full rounded-lg object-contain"
              />
              {view === "floor" && floorUrls.length > 1 && (
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1">
                  {floorUrls.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFloorIndex(i)}
                      className={`h-2 w-2 rounded-full ${i === floorIndex ? "bg-[#1e40af]" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col overflow-y-auto p-5">
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">{localized.description}</p>

            <div className="mb-4 grid grid-cols-4 gap-2 text-center">
              {[
                { label: translate("store.specSqft"), value: listing.area.replace(/[^0-9.]/g, "") || "—" },
                { label: translate("store.specBeds"), value: String(listing.beds) },
                { label: translate("store.specBaths"), value: String(listing.baths) },
                { label: translate("store.specStories"), value: String(listing.floors) },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-surface-raised py-2">
                  <p className="text-[9px] font-bold uppercase text-text-muted">{s.label}</p>
                  <p className="text-sm font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto border-t border-border pt-4">
              <p className="text-xs text-text-muted">{translate("store.startingAt")}</p>
              <p className="text-2xl font-bold text-[#1e40af]">
                {formatPrice(listing.price, listing.priceBreakdown?.currency ?? "THB", locale)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(listing)}
                    disabled={inCart}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-semibold uppercase tracking-wide text-text-primary hover:bg-surface-raised disabled:opacity-50"
                  >
                    {inCart ? translate("store.cartInCart") : translate("store.addToCart")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onBuy(listing)}
                  className={`flex items-center justify-center gap-2 rounded-lg bg-[#1e40af] py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#1d4ed8] ${onAddToCart ? "" : "col-span-2"}`}
                >
                  <Download className="h-4 w-4" />
                  {translate("store.buyNow")}
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
}

export function StoreCheckoutModal({
  listing,
  open,
  onClose,
  onSuccess,
  viewerHeaders,
  buyerId,
}: StoreCheckoutModalProps) {
  const { country, locale, translate } = useApp();
  const localized = useStoreListingCopy(listing);
  const [method, setMethod] = useState<"stripe" | "promptpay">("promptpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...viewerHeaders() },
        body: JSON.stringify({
          listingId: listing.id,
          format: "pdf",
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">{translate("store.checkoutTitle")}</h2>
          <button type="button" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">{localized.name}</p>
          <p className="text-2xl font-bold text-[#1e40af]">
            {formatPrice(listing.price, country.currency, locale)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod("promptpay")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${
                method === "promptpay" ? "border-[#1e40af] bg-blue-50" : "border-border"
              }`}
            >
              <QrCode className="h-6 w-6" />
              <span className="text-xs font-medium">{translate("payment.promptpay")}</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("stripe")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${
                method === "stripe" ? "border-[#1e40af] bg-blue-50" : "border-border"
              }`}
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-xs font-medium">{translate("payment.card")}</span>
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex gap-3 border-t border-border p-5">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            {translate("workflow.cancel")}
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-60"
          >
            {loading ? translate("payment.processing") : translate("payment.payNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
