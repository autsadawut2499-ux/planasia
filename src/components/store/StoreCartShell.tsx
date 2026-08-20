"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StoreCartDrawer } from "@/components/store/StoreCartDrawer";
import { OrderSuccessModal } from "@/components/store/OrderSuccessModal";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import type { StoreListing } from "@/lib/store/db";

/** Global store cart drawer + post-payment success modal for all storefront routes. */
export function StoreCartShell() {
  const { translate, uiLocale } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();
  const { clearCart, drawerOpen, itemCount } = useStoreCart();
  const viewer = useStoreViewer();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<StoreListing[]>([]);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const loadListings = useCallback(async () => {
    if (!viewer.ready || loadedRef.current) return;
    try {
      const res = await fetch("/api/store", { headers: viewer.headers() });
      const data = await res.json();
      setListings(data.listings ?? []);
      loadedRef.current = true;
    } catch {
      setListings([]);
    }
  }, [viewer]);

  useEffect(() => {
    if (drawerOpen || itemCount > 0) {
      void loadListings();
    }
  }, [drawerOpen, itemCount, loadListings]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const cartOrderId = searchParams.get("cartOrderId");
    const locale = searchParams.get("locale") || uiLocale;

    if (paymentStatus === "success" && searchParams.get("session_id")) {
      toastError(
        locale === "th"
          ? "ระบบชำระเงินแบบเดิมถูกปิดแล้ว — กรุณาชำระด้วยโอนเงินและอัปโหลดสลิป"
          : "Legacy card checkout is disabled — please pay by bank transfer and upload your slip",
      );
      return;
    }

    if (paymentStatus === "success" && cartOrderId) {
      setSuccessOrderId(cartOrderId);
      toastSuccess(translate("store.cartCheckoutSuccess"));
    } else if (paymentStatus === "success") {
      setSuccessOrderId("ok");
      toastSuccess(translate("store.purchaseSuccess"));
    }
  }, [searchParams, toastSuccess, toastError, translate, uiLocale]);

  return (
    <>
      <StoreCartDrawer
        listings={listings}
        viewerHeaders={viewer.headers}
        buyerId={viewer.primaryId}
        onCheckoutComplete={(_downloads, meta) => {
          setSuccessOrderId(meta?.orderId || "ok");
        }}
      />
      {successOrderId ? (
        <OrderSuccessModal
          orderId={successOrderId === "ok" ? undefined : successOrderId}
          onClose={() => setSuccessOrderId(null)}
        />
      ) : null}
    </>
  );
}
