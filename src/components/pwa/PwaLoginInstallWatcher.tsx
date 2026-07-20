"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const SESSION_SHOWN_KEY = "planasia-pwa-shown-this-session";

/** Shows the PWA install prompt once after a successful login. */
export function PwaLoginInstallWatcher() {
  const { status } = useSession();
  const { canPrompt, installed } = usePwaInstall();
  const [open, setOpen] = useState(false);
  const prevStatus = useRef(status);

  useEffect(() => {
    const justLoggedIn =
      prevStatus.current !== "authenticated" && status === "authenticated";
    prevStatus.current = status;

    if (!justLoggedIn || installed || !canPrompt) return;

    try {
      if (sessionStorage.getItem(SESSION_SHOWN_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(SESSION_SHOWN_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [status, canPrompt, installed]);

  return <PwaInstallPrompt open={open} onClose={() => setOpen(false)} />;
}
