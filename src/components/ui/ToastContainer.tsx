"use client";

import { CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import type { Toast } from "@/context/ToastContext";

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ICONS = {
  info: Info,
  success: CheckCircle2,
  loading: Loader2,
  error: XCircle,
};

const COLORS = {
  info: "border-blue-500/30 bg-blue-950/90 text-blue-100",
  success: "border-green-500/30 bg-green-950/90 text-green-100",
  loading: "border-indigo-500/30 bg-indigo-950/90 text-indigo-100",
  error: "border-red-500/30 bg-red-950/90 text-red-100",
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${COLORS[t.type]}`}
          >
            <Icon
              className={`mt-0.5 h-4 w-4 shrink-0 ${t.type === "loading" ? "animate-spin" : ""}`}
            />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            {t.type !== "loading" && (
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
