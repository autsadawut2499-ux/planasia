"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ToastContainer } from "@/components/ui/ToastContainer";

export type ToastType = "info" | "success" | "loading" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => string;
  loading: (message: string) => string;
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: string) => void;
  update: (id: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);

    if (type !== "loading") {
      setTimeout(() => dismiss(id), type === "error" ? 5000 : 3500);
    }

    return id;
  }, [dismiss]);

  const update = useCallback((id: string, message: string, type: ToastType = "success") => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, type } : t)));
    if (type !== "loading") {
      setTimeout(() => dismiss(id), 3500);
    }
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: addToast,
      loading: (msg) => addToast(msg, "loading"),
      success: (msg) => addToast(msg, "success"),
      error: (msg) => addToast(msg, "error"),
      dismiss,
      update,
    }),
    [addToast, dismiss, update],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
