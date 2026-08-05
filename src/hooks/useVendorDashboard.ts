"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import type { VendorProfile, VendorPayout, VerificationStatus, KycInfo } from "@/lib/supabase/vendors";
import type { VendorEarningsSummary } from "@/lib/commerce/earnings-types";
import type { VendorListing } from "@/lib/store/listing-types";

export interface VendorDashboardData {
  ownerKey: string;
  profile: VendorProfile | null;
  payout: VendorPayout;
  verificationStatus: VerificationStatus;
  verification: { documents: string[]; note?: string };
  kyc: KycInfo | null;
  verificationRejectReason: string | null;
  kycApproved: boolean;
  listings: VendorListing[];
  stats: {
    total: number;
    published: number;
    pending: number;
    salesCount?: number;
    vendorEarnedThb?: number;
    availableThb?: number;
    paidOutThb?: number;
  };
  commission?: {
    vendorShare: number;
    platformShare: number;
    earnings: VendorEarningsSummary;
  };
}

export interface KycSubmitPayload {
  kyc: KycInfo;
  documents: string[];
  note?: string;
}

export type UploadKind =
  | "avatar"
  | "cover"
  | "render"
  | "floorplan"
  | "pdf"
  | "document"
  | "boq"
  | "cad"
  | "calc"
  /** KYC identity photos (front / back / selfie) — images only, not PDF. */
  | "kyc";

/** A hung network request must not leave the dashboard on "กำลังโหลด…" forever. */
const REQUEST_TIMEOUT_MS = 15_000;

export function useVendorDashboard() {
  const viewer = useStoreViewer();
  const { ready: viewerReady, headers: viewerHeaders } = viewer;
  const [data, setData] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const jsonHeaders = useCallback(
    (): HeadersInit => ({ "Content-Type": "application/json", ...viewerHeaders() }),
    [viewerHeaders],
  );

  const refresh = useCallback(
    async (opts?: { quiet?: boolean }) => {
      if (!viewerReady || inFlight.current) return;
      inFlight.current = true;
      if (!opts?.quiet) setLoading(true);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch("/api/vendor/me", {
          headers: viewerHeaders(),
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? `โหลดข้อมูลไม่สำเร็จ (HTTP ${res.status})`);
        if (!json) throw new Error("เซิร์ฟเวอร์ส่งข้อมูลไม่ถูกต้อง");
        setData(json as VendorDashboardData);
        setError(null);
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        setError(
          aborted
            ? "เชื่อมต่อเซิร์ฟเวอร์นานเกินไป กรุณาลองใหม่อีกครั้ง"
            : err instanceof Error
              ? err.message
              : "โหลดข้อมูลไม่สำเร็จ",
        );
      } finally {
        clearTimeout(timer);
        inFlight.current = false;
        setLoading(false);
      }
    },
    [viewerReady, viewerHeaders],
  );

  useEffect(() => {
    if (viewerReady) {
      void refresh();
      return;
    }
    // Identity resolves on the first client effect; if it never does, surface an
    // error rather than leaving the page on the loading skeleton forever.
    const timer = setTimeout(() => {
      setLoading(false);
      setError("ไม่สามารถระบุผู้ใช้ในเบราว์เซอร์นี้ได้ กรุณารีเฟรชหน้าอีกครั้ง");
    }, REQUEST_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [viewerReady, refresh]);

  const uploadFile = useCallback(
    async (file: File, kind: UploadKind): Promise<string> => {
      const isDoc =
        kind === "pdf" ||
        kind === "document" ||
        kind === "boq" ||
        kind === "cad" ||
        kind === "calc";

      // Compress images in the browser before upload (smaller payload + faster storefront).
      let payload = file;
      if (!isDoc) {
        const { compressImageFile, isImageUploadKind } = await import(
          "@/lib/uploads/compress-image-client"
        );
        if (isImageUploadKind(kind)) {
          payload = await compressImageFile(file);
        }
      }

      // PDF plan docs (and any file > 8MB) use a signed direct upload to Supabase
      // so Next.js middleware body limits cannot truncate large files.
      const useSigned = isDoc || payload.size > 8 * 1024 * 1024;

      if (useSigned) {
        const signRes = await fetch("/api/vendor/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...viewer.headers(),
          },
          body: JSON.stringify({
            mode: "sign",
            kind,
            fileName: payload.name,
            sizeBytes: payload.size,
            contentType: payload.type || (isDoc ? "application/pdf" : undefined),
          }),
        });
        const signJson = await signRes.json().catch(() => null);
        if (!signRes.ok) {
          throw new Error(signJson?.error ?? "สร้างลิงก์อัปโหลดไม่สำเร็จ");
        }

        const contentType =
          (signJson?.contentType as string | undefined) ||
          payload.type ||
          (isDoc ? "application/pdf" : "application/octet-stream");
        const signedUrl = signJson?.signedUrl as string | undefined;
        const publicUrl = signJson?.publicUrl as string | undefined;
        if (!signedUrl || !publicUrl) {
          throw new Error("เซิร์ฟเวอร์ไม่ได้ส่งลิงก์อัปโหลด");
        }

        const putRes = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
            "x-upsert": "true",
          },
          body: payload,
        });
        if (!putRes.ok) {
          const detail = await putRes.text().catch(() => "");
          throw new Error(
            detail
              ? `อัปโหลดไปยังคลังไฟล์ไม่สำเร็จ: ${detail.slice(0, 180)}`
              : `อัปโหลดไปยังคลังไฟล์ไม่สำเร็จ (HTTP ${putRes.status})`,
          );
        }
        return publicUrl;
      }

      const fd = new FormData();
      fd.append("file", payload);
      fd.append("kind", kind);
      const res = await fetch("/api/vendor/upload", {
        method: "POST",
        headers: viewer.headers(),
        body: fd,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "อัปโหลดไม่สำเร็จ");
      return json.publicUrl as string;
    },
    [viewer],
  );

  const saveProfile = useCallback(
    async (payload: Record<string, unknown>): Promise<VendorProfile> => {
      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setData((prev) => (prev ? { ...prev, profile: json.profile } : prev));
      return json.profile;
    },
    [jsonHeaders],
  );

  const savePayout = useCallback(
    async (payout: VendorPayout): Promise<void> => {
      const res = await fetch("/api/vendor/payout", {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(payout),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setData((prev) => (prev ? { ...prev, payout: json.payout } : prev));
    },
    [jsonHeaders],
  );

  const submitVerification = useCallback(
    async (documents: string[], note?: string): Promise<void> => {
      const res = await fetch("/api/vendor/verification", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ documents, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submit failed");
      setData((prev) =>
        prev
          ? { ...prev, verificationStatus: json.verificationStatus, verification: json.verification }
          : prev,
      );
    },
    [jsonHeaders],
  );

  const submitKyc = useCallback(
    async (
      payload: KycSubmitPayload,
    ): Promise<{
      verificationStatus: VerificationStatus;
      reasons: string[];
      /** Drafts that went live the moment identity verification passed. */
      publishedCount: number;
    }> => {
      const res = await fetch("/api/vendor/verification", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ส่งข้อมูลยืนยันตัวตนไม่สำเร็จ");
      const status = (json.verificationStatus ?? "rejected") as VerificationStatus;
      const approved = status === "approved";
      const reasons: string[] = Array.isArray(json.aiDecision?.reasons)
        ? json.aiDecision.reasons.map(String)
        : json.message
          ? [String(json.message)]
          : [];
      setData((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: status,
              verification: json.verification,
              kyc: json.kyc ?? prev.kyc,
              kycApproved: approved,
              verificationRejectReason: approved
                ? null
                : reasons.join("; ") || "ไม่ผ่านการยืนยันตัวตน",
            }
          : prev,
      );
      const publishedCount = Number(json.publishedCount ?? 0);
      // Approval flips drafts to live server-side — pull the fresh stats in.
      if (approved) void refresh({ quiet: true });
      return { verificationStatus: status, reasons, publishedCount };
    },
    [jsonHeaders, refresh],
  );

  const saveListing = useCallback(
    async (
      payload: Record<string, unknown>,
    ): Promise<{
      listing: VendorListing;
      published: boolean;
      /** Auto-published when verified + AI pass; false when AI rejected. */
      awaitingAdminApproval: boolean;
      awaitingKyc: boolean;
      reasons: string[];
    }> => {
      const res = await fetch("/api/vendor/listings", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? json.error ?? "Save failed");
      await refresh();
      return {
        listing: json.listing,
        published: Boolean(json.published),
        awaitingAdminApproval: Boolean(json.awaitingAdminApproval),
        awaitingKyc: Boolean(json.awaitingKyc),
        reasons: Array.isArray(json.aiScreening?.reasons) ? json.aiScreening.reasons : [],
      };
    },
    [jsonHeaders, refresh],
  );

  const deleteListing = useCallback(
    async (id: string): Promise<void> => {
      const res = await fetch(`/api/vendor/listings/${id}`, {
        method: "DELETE",
        headers: viewer.headers(),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      await refresh({ quiet: true });
    },
    [viewer, refresh],
  );

  const setListingPublished = useCallback(
    async (id: string, isPublished: boolean): Promise<VendorListing> => {
      const res = await fetch(`/api/vendor/listings/${id}`, {
        method: "PATCH",
        headers: jsonHeaders(),
        body: JSON.stringify({ isPublished }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "อัปเดตสถานะไม่สำเร็จ");
      const listing = json?.listing as VendorListing;
      setData((prev) => {
        if (!prev || !listing) return prev;
        return {
          ...prev,
          listings: prev.listings.map((l) => (l.id === id ? { ...l, ...listing } : l)),
        };
      });
      return listing;
    },
    [jsonHeaders],
  );

  return {
    data,
    loading,
    error,
    ready: viewer.ready,
    refresh,
    uploadFile,
    saveProfile,
    savePayout,
    submitVerification,
    submitKyc,
    saveListing,
    deleteListing,
    setListingPublished,
    setData,
  };
}
