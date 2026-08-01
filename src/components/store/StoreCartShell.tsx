"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StoreCartDrawer } from "@/components/store/StoreCartDrawer";
import {
  PaymentSuccessPanel,
  type PaymentSuccessDownload,
} from "@/components/store/PaymentSuccessPanel";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import type { StoreListing } from "@/lib/store/db";

type DownloadLink = PaymentSuccessDownload & {
  docLang?: string;
  targetCountry?: string;
};

/** Global store cart drawer + payment return handling for all storefront routes. */
export function StoreCartShell() {
  const { translate, uiLocale } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();
  const { clearCart, drawerOpen, itemCount } = useStoreCart();
  const viewer = useStoreViewer();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<StoreListing[]>([]);
  const [successPanel, setSuccessPanel] = useState<{
    downloads: DownloadLink[];
    buyerEmail?: string | null;
    emailSent?: boolean;
  } | null>(null);
  const loadedRef = useRef(false);
  const confirmStartedRef = useRef<string | null>(null);

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

  const presentDownloads = useCallback(
    (
      downloads: DownloadLink[],
      opts?: {
        buyerEmail?: string | null;
        emailSent?: boolean;
      },
    ) => {
      const locale = searchParams.get("locale") || uiLocale;
      const normalized = downloads.map((d) => ({
        ...d,
        downloadUrl: withDownloadParams(
          d.downloadUrl || `/api/download?token=${d.token}&format=${d.format}`,
          { locale, docLang: "th" },
        ),
        originalDownloadUrl: undefined,
        variant: "original" as const,
      }));

      toastSuccess(
        locale === "th"
          ? "ชำระเงินสำเร็จ — ดาวน์โหลดแบบแปลนได้ด้านล่าง"
          : "Payment successful — download your plans below",
      );
      setSuccessPanel({
        downloads: normalized,
        buyerEmail: opts?.buyerEmail,
        emailSent: opts?.emailSent,
      });
    },
    [searchParams, toastSuccess, uiLocale],
  );

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const stripeSessionId = searchParams.get("session_id");
    const format = searchParams.get("format") as "pdf" | "cad" | null;
    const cartOrderId = searchParams.get("cartOrderId");
    const locale = searchParams.get("locale") || uiLocale;

    if (paymentStatus === "success" && stripeSessionId) {
      if (confirmStartedRef.current === stripeSessionId) return;
      confirmStartedRef.current = stripeSessionId;

      void fetch(`/api/payment/confirm?session_id=${stripeSessionId}`)
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || "Payment confirm failed");
          return data;
        })
        .then((data) => {
          if (data.cart && data.downloads?.length) {
            clearCart();
            toastSuccess(translate("store.cartCheckoutSuccess"));
            presentDownloads(data.downloads, {
              buyerEmail: data.buyerEmail,
              emailSent: data.emailSent,
            });
            return;
          }
          if (data.downloadToken || data.downloads?.length) {
            toastSuccess(translate("store.purchaseSuccess"));
            const downloads: DownloadLink[] = data.downloads?.length
              ? data.downloads
              : [
                  {
                    token: data.downloadToken,
                    planId: data.planId || "plan",
                    format: data.format || format || "pdf",
                    label: data.planId || "plan.pdf",
                    downloadUrl: `/api/download?token=${data.downloadToken}&format=${data.format || format || "pdf"}`,
                  },
                ];
            presentDownloads(downloads, {
              buyerEmail: data.buyerEmail,
              emailSent: data.emailSent,
            });
            return;
          }
          if (data.pending || data.status === "unpaid") {
            toastSuccess(translate("store.paymentPending"));
          }
        })
        .catch((err) => {
          console.error("[StoreCartShell] payment confirm failed", err);
          toastError(
            locale === "th"
              ? "ยืนยันการชำระเงินไม่สำเร็จ — ลองรีเฟรชหน้า หรือตรวจอีเมล"
              : "Could not confirm payment — refresh or check your email",
          );
        });
      return;
    }

    if (paymentStatus === "success" && cartOrderId) {
      toastSuccess(translate("store.cartCheckoutSuccess"));
    } else if (paymentStatus === "success") {
      toastSuccess(translate("store.purchaseSuccess"));
    }
  }, [
    searchParams,
    toastSuccess,
    toastError,
    translate,
    clearCart,
    presentDownloads,
    uiLocale,
  ]);

  const locale = searchParams.get("locale") || uiLocale;

  return (
    <>
      <StoreCartDrawer
        listings={listings}
        viewerHeaders={viewer.headers}
        buyerId={viewer.primaryId}
        onCheckoutComplete={(downloads) =>
          presentDownloads(
            downloads.map((d) => ({
              token: d.token,
              planId: d.planId || "plan",
              format: d.format,
              label: d.planId || "plan.pdf",
              downloadUrl: d.downloadUrl || `/api/download?token=${d.token}&format=${d.format}`,
            })),
          )
        }
      />
      {successPanel ? (
        <PaymentSuccessPanel
          locale={locale}
          buyerEmail={successPanel.buyerEmail}
          emailSent={successPanel.emailSent}
          downloads={successPanel.downloads}
          onClose={() => setSuccessPanel(null)}
        />
      ) : null}
    </>
  );
}

function withDownloadParams(
  url: string,
  params: { locale?: string; docLang?: string },
): string {
  const next = new URL(
    url,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (params.locale && !next.searchParams.has("locale")) {
    next.searchParams.set("locale", params.locale);
  }
  if (params.docLang && !next.searchParams.has("docLang")) {
    next.searchParams.set("docLang", params.docLang);
  }
  return `${next.pathname}${next.search}`;
}
