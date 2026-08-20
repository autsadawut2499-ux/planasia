"use client";

import { useEffect } from "react";
import "@/lib/pwa/install-events";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev: never register — a stale SW serves /offline.html when Next is down
    // and hides the real "connection refused" error during local preview.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      if ("caches" in window) {
        void caches.keys().then((keys) => {
          for (const key of keys) {
            if (key.startsWith("planasia-pwa")) void caches.delete(key);
          }
        });
      }
      return;
    }

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        registration.update().catch(() => undefined);
      })
      .catch(() => {
        /* registration optional in unsupported contexts */
      });
  }, []);

  return null;
}
