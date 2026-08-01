"use client";

import { Download, Mail, X } from "lucide-react";

export type PaymentSuccessDownload = {
  token: string;
  planId: string;
  format: string;
  label: string;
  downloadUrl: string;
  originalDownloadUrl?: string;
  variant?: "translated" | "original";
  translatedFilename?: string;
};

/**
 * Post-payment delivery panel — Thai domestic: original blueprint downloads + receipt email.
 */
export function PaymentSuccessPanel({
  locale,
  buyerEmail,
  emailSent,
  downloads,
  onClose,
}: {
  locale: string;
  buyerEmail?: string | null;
  emailSent?: boolean;
  /** @deprecated Ignored in Thai domestic mode. */
  translationStatus?: string;
  /** @deprecated Ignored in Thai domestic mode. */
  targetLanguage?: string;
  downloads: PaymentSuccessDownload[];
  onClose: () => void;
}) {
  const thai = locale === "th";

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:max-w-md">
      <div className="rounded-2xl border border-[#1e40af]/25 bg-white p-4 shadow-xl shadow-slate-900/15">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#1e3a8a]">
              {thai ? "ชำระเงินสำเร็จ — ไฟล์พร้อมดาวน์โหลด" : "Payment successful — files ready"}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {thai
                ? "ดาวน์โหลดแบบแปลน PDF ได้จากปุ่มด้านล่าง"
                : "Download your blueprint PDF from the button below"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-[#1e3a8a]">
          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {emailSent
              ? thai
                ? `ส่งใบยืนยันและไฟล์ไปที่ ${buyerEmail || "อีเมลของคุณ"} แล้ว`
                : `Receipt and files were emailed to ${buyerEmail || "your inbox"}`
              : thai
                ? buyerEmail
                  ? `กำลังส่งอีเมลไปที่ ${buyerEmail}`
                  : "หากระบุอีเมลตอนชำระเงิน ระบบจะส่งใบยืนยันทางอีเมล"
                : buyerEmail
                  ? `Emailing receipt to ${buyerEmail}`
                  : "If you entered an email at checkout, a receipt is sent automatically"}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {downloads.map((d) => (
            <a
              key={`${d.token}-${d.label}`}
              href={d.downloadUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
            >
              <Download className="h-4 w-4" />
              {thai ? "ดาวน์โหลด" : "Download"} {d.label || d.planId}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
