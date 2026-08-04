"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Package } from "lucide-react";
import { useSession } from "next-auth/react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { CheckoutGoogleGate } from "@/components/store/CheckoutGoogleGate";
import { useApp } from "@/context/AppContext";

type PurchaseDownload = {
  token: string;
  planId: string;
  label: string;
  filename?: string;
  downloadUrl: string;
  fileKind: string;
};

export default function PurchasesPage() {
  const { uiLocale } = useApp();
  const thai = uiLocale === "th";
  const { status } = useSession();
  const [downloads, setDownloads] = useState<PurchaseDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    void fetch(`/api/account/purchases?locale=${thai ? "th" : "en"}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        if (active) setDownloads(data.downloads ?? []);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, thai]);

  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">
          {thai ? "การซื้อของฉัน" : "My purchases"}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {thai
            ? "เข้าสู่ระบบด้วย Google เพื่อดาวน์โหลดไฟล์และรับเอกสารอีกครั้งได้ทุกเมื่อ"
            : "Sign in with Google to download files and receive documents again anytime."}
        </p>

        {status !== "authenticated" ? (
          <div className="mt-8">
            <CheckoutGoogleGate
              thai={thai}
              callbackUrl="/purchases"
              title={
                thai
                  ? "เข้าสู่ระบบเพื่อดูการซื้อของฉัน"
                  : "Sign in to view your purchases"
              }
            />
          </div>
        ) : loading ? (
          <p className="mt-8 text-sm text-text-muted">
            {thai ? "กำลังโหลด…" : "Loading…"}
          </p>
        ) : error ? (
          <p className="mt-8 text-sm text-red-600">{error}</p>
        ) : downloads.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-white p-6 text-center">
            <Package className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-3 text-sm text-text-secondary">
              {thai
                ? "ยังไม่มีไฟล์ที่ซื้อ — เลือกแบบบ้านจากร้านแล้วชำระเงินเพื่อเริ่มดาวน์โหลด"
                : "No purchases yet — choose a plan from the store and checkout to start downloading."}
            </p>
            <Link
              href="/store"
              className="mt-4 inline-flex text-sm font-semibold text-[#1e40af] hover:underline"
            >
              {thai ? "ไปที่ร้านแบบบ้าน" : "Browse the store"}
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {downloads.map((d) => (
              <li
                key={d.token}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1e3a5f]">
                    {d.filename || d.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {d.planId}
                    {d.fileKind ? ` · ${d.fileKind}` : ""}
                  </p>
                </div>
                <a
                  href={d.downloadUrl}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-4 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
                  download={d.filename}
                >
                  <Download className="h-4 w-4" />
                  {d.label?.startsWith("Download ")
                    ? d.label
                    : `Download ${d.filename || d.planId}`}
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
