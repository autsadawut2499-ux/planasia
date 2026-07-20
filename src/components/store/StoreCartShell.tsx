"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StoreCartDrawer } from "@/components/store/StoreCartDrawer";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import type { StoreListing } from "@/lib/store/db";

/** Global store cart drawer + payment return handling for all /store routes. */
export function StoreCartShell() {
  const { translate } = useApp();
  const { success: toastSuccess } = useToast();
  const { clearCart } = useStoreCart();
  const viewer = useStoreViewer();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<StoreListing[]>([]);

  const loadListings = useCallback(async () => {
    if (!viewer.ready) return;
    try {
      const res = await fetch("/api/store", { headers: viewer.headers() });
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      setListings([]);
    }
  }, [viewer]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const openDownloads = useCallback((downloads: { token: string; format: string }[]) => {
    for (const d of downloads) {
      window.open(`/api/download?token=${d.token}&format=${d.format}`, "_blank");
    }
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const stripeSessionId = searchParams.get("session_id");
    const format = searchParams.get("format") as "pdf" | "cad" | null;
    const cartOrderId = searchParams.get("cartOrderId");

    if (paymentStatus === "success" && stripeSessionId) {
      void fetch(`/api/payment/confirm?session_id=${stripeSessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.cart && data.downloads?.length) {
            clearCart();
            toastSuccess(translate("store.cartCheckoutSuccess"));
            openDownloads(data.downloads);
            return;
          }
          if (data.downloadToken) {
            toastSuccess(translate("store.purchaseSuccess"));
            window.open(`/api/download?token=${data.downloadToken}&format=${format ?? "pdf"}`, "_blank");
          }
        });
      return;
    }

    if (paymentStatus === "success" && cartOrderId) {
      toastSuccess(translate("store.cartCheckoutSuccess"));
    } else if (paymentStatus === "success") {
      toastSuccess(translate("store.purchaseSuccess"));
    }
  }, [searchParams, toastSuccess, translate, clearCart, openDownloads]);

  return (
    <StoreCartDrawer
      listings={listings}
      viewerHeaders={viewer.headers}
      buyerId={viewer.primaryId}
      onCheckoutComplete={openDownloads}
    />
  );
}
