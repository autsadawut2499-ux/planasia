"use client";

import { Building2, CheckCircle2, Copy, Upload, XCircle } from "lucide-react";
import { useRef, useState } from "react";

export type BankTransferBankInfo = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  promptPayId: string;
  qrCodeImageUrl?: string;
  transferNote: string;
};

export type SlipPaidResult = {
  orderId: string;
  downloadToken?: string;
  planId?: string;
  downloads?: {
    token: string;
    planId: string;
    format: string;
  }[];
};

interface BankTransferPaymentPanelProps {
  orderId: string;
  amountThb: number;
  bank: BankTransferBankInfo;
  thai: boolean;
  formatMoney: (amountThb: number) => string;
  onPaid: (result: SlipPaidResult) => void;
  onCancel?: () => void;
}

type Phase = "transfer" | "uploading" | "failed" | "paid" | "pending_review";

export function BankTransferPaymentPanel({
  orderId,
  amountThb,
  bank,
  thai,
  formatMoney,
  onPaid,
  onCancel,
}: BankTransferPaymentPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("transfer");
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyText(label: string, value: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  async function uploadSlip(file: File) {
    setPhase("uploading");
    setMessage(null);
    console.info("[slip-upload] starting", {
      name: file.name,
      type: file.type || "(empty)",
      size: file.size,
      orderId,
    });
    try {
      const form = new FormData();
      form.append("orderId", orderId);
      form.append("slip", file);
      const res = await fetch("/api/payments/slip", {
        method: "POST",
        body: form,
      });
      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch (parseErr) {
        console.error("[slip-upload] response JSON parse failed", {
          status: res.status,
          statusText: res.statusText,
          parseErr,
        });
        setPhase("failed");
        setMessage(
          thai
            ? `อัปโหลดสลิปไม่สำเร็จ (HTTP ${res.status})`
            : `Slip upload failed (HTTP ${res.status})`,
        );
        return;
      }

      console.info("[slip-upload] response", {
        httpStatus: res.status,
        ok: data.ok,
        status: data.status,
        verified: data.verified,
        error: data.error,
        reason: data.reason,
        message: data.message,
        detail: data.detail,
      });

      if (data.ok && (data.verified || data.alreadyPaid || data.status === "paid")) {
        setPhase("paid");
        setMessage(
          String(
            data.message ??
              (thai
                ? "ยืนยันสลิปสำเร็จ — คำสั่งซื้อชำระเงินแล้ว"
                : "Slip verified — order paid"),
          ),
        );
        onPaid({
          orderId,
          downloadToken: data.downloadToken as string | undefined,
          planId: data.planId as string | undefined,
          downloads: data.downloads as SlipPaidResult["downloads"],
        });
        return;
      }

      const failText = String(
        data.reason ??
          data.message ??
          data.error ??
          data.detail ??
          (thai
            ? "โอนเงินไม่ถูกต้อง — กรุณาอัปโหลดสลิปใหม่"
            : "Invalid transfer — please re-upload your slip"),
      );

      if (data.status === "failed" || data.ok === false) {
        console.error("[slip-upload] rejected", failText, data);
        setPhase("failed");
        // SlipMate format errors — clarify that our upload worked but verifier rejected bytes.
        const isFormatReject = /invalid image format|only jpg|jpeg|png|jfif|webp/i.test(
          failText,
        );
        setMessage(
          isFormatReject
            ? thai
              ? "SlipMate อ่านไฟล์รูปไม่สำเร็จ — ลองบันทึกสลิปใหม่เป็น JPG/PNG แล้วอัปโหลดอีกครั้ง (ถ่ายจากมือถือแนะนำให้ใช้ “บันทึกรูป” ไม่ใช่ screenshot PDF)"
              : "SlipMate could not read this image — re-save as JPG/PNG and try again"
            : failText,
        );
        return;
      }

      if (data.pendingReview) {
        setPhase("pending_review");
        setMessage(
          String(
            data.message ??
              (thai
                ? "รับสลิปแล้ว — เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 24 ชั่วโมง"
                : "Slip received — our team will review and contact you within 24 hours"),
          ),
        );
        return;
      }

      console.error("[slip-upload] unexpected failure", {
        httpStatus: res.status,
        data,
      });
      setPhase("failed");
      setMessage(failText);
    } catch (err) {
      console.error("[slip-upload] network/exception", err);
      setPhase("failed");
      setMessage(
        thai
          ? `อัปโหลดสลิปไม่สำเร็จ: ${err instanceof Error ? err.message : String(err)}`
          : `Slip upload failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-raised/40 p-3 sm:p-4">
      <div className="flex items-start gap-2">
        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1e40af]" />
        <div>
          <h3 className="text-sm font-bold text-text-primary">
            {thai ? "โอนเงินเข้าบัญชี" : "Bank transfer"}
          </h3>
          <p className="text-xs text-text-secondary">
            {thai
              ? "โอนตามยอดด้านล่าง แล้วอัปโหลดสลิปเพื่อยืนยันอัตโนมัติ"
              : "Transfer the exact amount, then upload your slip for automatic verification"}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white px-3 py-2.5 text-sm">
        <p className="text-xs text-text-muted">{thai ? "ยอดที่ต้องโอน" : "Amount due"}</p>
        <p className="text-lg font-bold text-[#1e40af]">{formatMoney(amountThb)}</p>
        <p className="mt-1 text-[11px] text-text-muted">
          {thai ? "รหัสคำสั่งซื้อ" : "Order"} · {orderId}
        </p>
      </div>

      {bank.qrCodeImageUrl ? (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-white px-3 py-3">
          <p className="text-xs font-medium text-text-secondary">
            {thai ? "สแกน QR Code เพื่อโอนเงิน" : "Scan QR Code to transfer"}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bank.qrCodeImageUrl}
            alt={thai ? "QR Code รับโอน" : "Bank transfer QR Code"}
            className="h-44 w-44 rounded-lg border border-border bg-white object-contain p-2 sm:h-52 sm:w-52"
          />
        </div>
      ) : null}

      <dl className="space-y-2 text-sm">
        {bank.bankName ? (
          <Row
            label={thai ? "ชื่อธนาคาร" : "Bank name"}
            value={bank.bankName}
            onCopy={() => void copyText("bank", bank.bankName)}
            copied={copied === "bank"}
            thai={thai}
          />
        ) : null}
        {bank.accountName ? (
          <Row
            label={thai ? "ชื่อบัญชี" : "Account name"}
            value={bank.accountName}
            onCopy={() => void copyText("name", bank.accountName)}
            copied={copied === "name"}
            thai={thai}
          />
        ) : null}
        {bank.accountNumber ? (
          <Row
            label={thai ? "เลขบัญชี" : "Account number"}
            value={bank.accountNumber}
            onCopy={() => void copyText("acct", bank.accountNumber)}
            copied={copied === "acct"}
            thai={thai}
            emphasize
          />
        ) : null}
        {bank.promptPayId ? (
          <Row
            label={thai ? "พร้อมเพย์" : "PromptPay"}
            value={bank.promptPayId}
            onCopy={() => void copyText("pp", bank.promptPayId)}
            copied={copied === "pp"}
            thai={thai}
            emphasize
          />
        ) : null}
      </dl>

      {bank.transferNote ? (
        <p className="text-[11px] leading-relaxed text-text-secondary">{bank.transferNote}</p>
      ) : null}

      {phase === "paid" || phase === "pending_review" ? (
        <div
          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
            phase === "paid"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-900"
          }`}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : (
        <>
          {(phase === "failed" || message) && (
            <div
              className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                phase === "failed"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {phase === "failed" ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : null}
              <span>{message}</span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              // No extension/MIME gating — phones and desktops often send empty
              // or non-standard types (.JPG, HEIC, image/jpg, etc.).
              void uploadSlip(file);
            }}
          />

          <button
            type="button"
            disabled={phase === "uploading"}
            onClick={() => inputRef.current?.click()}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1e40af] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {phase === "uploading"
              ? thai
                ? "กำลังตรวจสอบสลิป…"
                : "Verifying slip…"
              : phase === "failed"
                ? thai
                  ? "อัปโหลดสลิปใหม่"
                  : "Re-upload slip"
                : thai
                  ? "อัปโหลดสลิปโอนเงิน"
                  : "Upload transfer slip"}
          </button>

          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={phase === "uploading"}
              className="w-full text-center text-xs text-text-muted hover:text-text-secondary disabled:opacity-50"
            >
              {thai ? "ยกเลิก / สร้างคำสั่งซื้อใหม่" : "Cancel / start over"}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  copied,
  thai,
  emphasize,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  thai: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
      <div className="min-w-0">
        <dt className="text-[10px] uppercase tracking-wide text-text-muted">{label}</dt>
        <dd
          className={`truncate font-medium text-text-primary ${
            emphasize ? "font-mono text-base tracking-wide" : ""
          }`}
        >
          {value}
        </dd>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary hover:bg-surface-raised"
      >
        <Copy className="h-3 w-3" />
        {copied ? (thai ? "คัดลอกแล้ว" : "Copied") : thai ? "คัดลอก" : "Copy"}
      </button>
    </div>
  );
}
