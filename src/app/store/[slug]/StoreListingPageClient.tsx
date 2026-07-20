"use client";

import { Download, Home, Layers } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StoreGlobalLanguageBanner } from "@/components/store/StoreGlobalLanguageBanner";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreCheckoutModal } from "@/components/store/StoreQuickView";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import { formatPrice } from "@/lib/i18n";
import type { StoreListing } from "@/lib/store/db";

interface StoreListingPageClientProps {
  listing: StoreListing;
}

export default function StoreListingPageClient({ listing }: StoreListingPageClientProps) {
  const router = useRouter();
  const { country, locale, translate } = useApp();
  const { success: toastSuccess } = useToast();
  const { addItem, isInCart } = useStoreCart();
  const viewer = useStoreViewer();
  const copy = useStoreListingCopy(listing);

  const [view, setView] = useState<"exterior" | "floor">("exterior");
  const [floorIndex, setFloorIndex] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const floorUrls = listing.floorPlanUrls?.length
    ? listing.floorPlanUrls
    : ["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"];

  const checkVisibility = useCallback(async () => {
    if (!viewer.ready) return;
    const res = await fetch(`/api/store/${listing.id}`, { headers: viewer.headers() });
    if (res.status === 403) setHidden(true);
  }, [listing.id, viewer]);

  useEffect(() => {
    void checkVisibility();
  }, [checkVisibility]);

  const inCart = isInCart(listing.id);

  const handleAddToCart = () => {
    addItem(listing);
    toastSuccess(translate("store.cartAdded"));
  };

  const handlePurchaseSuccess = (downloadToken: string) => {
    setCheckoutOpen(false);
    toastSuccess(translate("store.purchaseSuccess"));
    window.open(`/api/download?token=${downloadToken}&format=pdf`, "_blank");
  };

  if (hidden) {
    return (
      <>
        <StoreHeader />
        <StoreGlobalLanguageBanner />
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-text-muted">{translate("store.empty")}</p>
          <Link href="/store" className="mt-4 inline-block text-[#1e40af] underline">
            {translate("nav.store")}
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <StoreHeader />
      <StoreGlobalLanguageBanner />
      <main className="min-h-screen bg-[#f5f6f8]">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
          <button
            type="button"
            onClick={() => router.push("/store")}
            className="mb-4 text-sm text-[#1e40af] hover:underline"
          >
            ← {translate("nav.store")}
          </button>

          <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-border bg-[#f5f6f8] lg:border-b-0 lg:border-r">
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
                    alt={copy.name}
                    className="h-full w-full rounded-lg object-contain"
                  />
                </div>
              </div>

              <div className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e40af]">
                  {translate("store.communityBadge")}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-text-primary">{copy.name}</h1>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{copy.description}</p>

                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: translate("store.specSqft"), value: copy.area.replace(/[^0-9.]/g, "") || "—" },
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

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-xs text-text-muted">{translate("store.startingAt")}</p>
                  <p className="text-3xl font-bold text-[#1e40af]">
                    {formatPrice(listing.price, country.currency, locale)}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={inCart}
                      className="rounded-lg border border-border py-3 text-sm font-semibold uppercase disabled:opacity-50"
                    >
                      {inCart ? translate("store.cartInCart") : translate("store.addToCart")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#1e40af] py-3 text-sm font-semibold uppercase text-white hover:bg-[#1d4ed8]"
                    >
                      <Download className="h-4 w-4" />
                      {translate("store.buyNow")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <StoreCheckoutModal
        listing={listing}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handlePurchaseSuccess}
        viewerHeaders={viewer.headers}
        buyerId={viewer.primaryId}
      />
    </>
  );
}
