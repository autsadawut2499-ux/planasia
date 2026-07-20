"use client";

import { CreditCard, QrCode, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/i18n";
import type { ProjectInput } from "@/lib/ai/types";
import { useState } from "react";

interface PaymentModalProps {
  open: boolean;
  format: "pdf" | "cad";
  amount: number;
  planId: string;
  project: ProjectInput;
  userId?: string;
  onClose: () => void;
  onSuccess: (format: "pdf" | "cad", downloadToken: string) => void;
}

export function PaymentModal({
  open,
  format,
  amount,
  planId,
  project,
  userId,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { locale, country, translate } = useApp();
  const [method, setMethod] = useState<"stripe" | "promptpay">("promptpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          method,
          countryCode: country.code,
          planId,
          project,
          userId,
        }),
      });
      const data = await res.json();

      if (data.requiresCheckout && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.success && data.downloadToken) {
        onSuccess(format, data.downloadToken);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-raised shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">{translate("payment.title")}</h2>
          <button type="button" onClick={onClose} className="btn-ghost p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-text-secondary">{translate("payment.desc")}</p>
          <p className="text-2xl font-bold">
            {formatPrice(amount, country.currency, locale)}
            <span className="ml-2 text-sm font-normal text-text-muted">
              ({format.toUpperCase()})
            </span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod("promptpay")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                method === "promptpay"
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-border-subtle"
              }`}
            >
              <QrCode className="h-6 w-6" />
              <span className="text-xs font-medium">{translate("payment.promptpay")}</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("stripe")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                method === "stripe"
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-border-subtle"
              }`}
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-xs font-medium">{translate("payment.card")}</span>
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
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
