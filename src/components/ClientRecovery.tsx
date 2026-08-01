"use client";

import { useEffect } from "react";

const RELOAD_KEY = "planasia-chunk-reload";

function isChunkLoadError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("loading chunk") ||
    lower.includes("chunkloaderror") ||
    lower.includes("failed to fetch dynamically imported module") ||
    lower.includes("importing a module script failed")
  );
}

/** Reload once when a stale JS chunk fails after deployment (common with cached HTML/SW). */
export function ClientRecovery() {
  useEffect(() => {
    const reloadOnce = (reason: string) => {
      try {
        if (sessionStorage.getItem(RELOAD_KEY) === "1") return;
        sessionStorage.setItem(RELOAD_KEY, "1");
        console.warn("[Planasia] Recovering from stale bundle:", reason);
        window.location.reload();
      } catch {
        window.location.reload();
      }
    };

    const onError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || "";
      if (isChunkLoadError(String(message))) reloadOnce(String(message));
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason instanceof Error
            ? reason.message
            : String(reason ?? "");
      if (isChunkLoadError(message)) reloadOnce(message);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
