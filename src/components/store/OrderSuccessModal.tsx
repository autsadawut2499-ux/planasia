"use client";

import { CheckCircle2, X } from "lucide-react";

/** Exact customer-facing success copy after SlipMate verification. */
export const ORDER_SUCCESS_MESSAGE_TH =
  "การสั่งซื้อสำเร็จ เจ้าหน้าที่ จะติดต่อกลับภายใน 24 ชั่วโมง เอกสารของคุณจะถูกส่งภายใน 3-5 วัน";

/**
 * Centered success modal shown after bank-transfer slip verification succeeds.
 */
export function OrderSuccessModal({
  onClose,
  orderId,
}: {
  onClose: () => void;
  orderId?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="ปิด"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2
            id="order-success-title"
            className="text-lg font-bold text-slate-900"
          >
            การสั่งซื้อสำเร็จ
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
            {ORDER_SUCCESS_MESSAGE_TH}
          </p>
          {orderId ? (
            <p className="mt-3 text-[11px] text-slate-400">รหัสคำสั่งซื้อ · {orderId}</p>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 min-h-11 w-full rounded-xl bg-[#1e40af] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
}
