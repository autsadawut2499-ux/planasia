"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const SESSION_SHOWN_KEY = "planasia-pwa-shown-this-session";
const FIRST_VISIT_KEY = "planasia-pwa-first-visit-seen";

function shouldSkipPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/dashboard")
  );
}

/**
 * Prompts first-time mobile visitors to install the PWA (home screen),
 * and also nudges once after login if not already shown this session.
 *
 * Browsers cannot force install — we show a strong modal with Install /
 * iOS instructions, plus Later (7-day snooze) and Don't ask again.
 */
export function PwaMobileInstallWatcher() {
  const pathname = usePathname();
  const { status } = useSession();
  const { canPrompt, installed, mobile, inApp } = usePwaInstall();
  const [open, setOpen] = useState(false);
  const prevStatus = useRef(status);
  const openTimer = useRef<number | null>(null);

  const markSessionShown = () => {
    try {
      sessionStorage.setItem(SESSION_SHOWN_KEY, "1");
      localStorage.setItem(FIRST_VISIT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const alreadyShownThisSession = () => {
    try {
      return sessionStorage.getItem(SESSION_SHOWN_KEY) === "1";
    } catch {
      return false;
    }
  };

  const scheduleOpen = (delayMs: number) => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      setOpen(true);
      markSessionShown();
    }, delayMs);
  };

  // First-time (and returning snoozed) mobile visitors
  useEffect(() => {
    if (shouldSkipPath(pathname)) return;
    if (!(mobile || inApp) || installed || !canPrompt) return;
    if (alreadyShownThisSession()) return;

    // Brief delay so the page paints first, then show the install sheet.
    scheduleOpen(1800);

    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
    };
  }, [pathname, mobile, inApp, installed, canPrompt]);

  // Extra nudge right after Google login (if not shown this session yet)
  useEffect(() => {
    const justLoggedIn =
      prevStatus.current !== "authenticated" && status === "authenticated";
    prevStatus.current = status;

    if (!justLoggedIn || installed || !canPrompt || !(mobile || inApp)) return;
    if (alreadyShownThisSession()) return;
    if (shouldSkipPath(pathname)) return;

    scheduleOpen(600);

    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
    };
  }, [status, canPrompt, installed, mobile, inApp, pathname]);

  if (!mobile && !inApp) return null;

  return (
    <PwaInstallPrompt
      open={open}
      onClose={() => setOpen(false)}
      forceAttention
    />
  );
}
