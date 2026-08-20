"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCapturedInstallPrompt,
  subscribePwaInstallEvents,
  takeCapturedInstallPrompt,
  wasAppInstalledEvent,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install-events";

const DISMISS_KEY = "planasia-pwa-install-dismissed";
const DISMISS_UNTIL_KEY = "planasia-pwa-install-dismiss-until";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function ua(): string {
  return typeof navigator === "undefined" ? "" : navigator.userAgent || "";
}

/** LINE / Facebook / Instagram / Android WebView — no native install prompt. */
export function isInAppBrowser(): boolean {
  const s = ua();
  return /FBAN|FBAV|Instagram|Line\/|KAKAOTALK|MicroMessenger|Snapchat|Twitter|LinkedInApp|; wv\)|;wv\)/i.test(
    s,
  );
}

function isIpadOs(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS 13+ often reports as Macintosh + touch.
  return /macintosh/i.test(ua()) && navigator.maxTouchPoints > 1;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(ua()) || isIpadOs();
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/android|iphone|ipod|ipad|webos|blackberry|opera mini|iemobile|mobile/i.test(ua())) {
    return true;
  }
  if (isIpadOs()) return true;
  if (isInAppBrowser()) return true;
  if (typeof window === "undefined") return false;
  const touch =
    navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
  // Landscape phones / small tablets exceed 768px; 1180 covers iPhone landscape + iPad mini.
  const compact = window.matchMedia("(max-width: 1180px)").matches;
  return touch && compact;
}

function isDismissed(): boolean {
  try {
    if (localStorage.getItem(DISMISS_KEY) === "1") return true;
    const until = localStorage.getItem(DISMISS_UNTIL_KEY);
    if (until && Date.now() < Number(until)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [ios, setIos] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    const sync = () => {
      setInstalled(isStandalone() || wasAppInstalledEvent());
      setIos(isIos());
      setMobile(isMobileDevice());
      setInApp(isInAppBrowser());
      setDeferredPrompt(getCapturedInstallPrompt());
    };

    sync();
    const unsub = subscribePwaInstallEvents(sync);
    window.addEventListener("resize", sync);
    return () => {
      unsub();
      window.removeEventListener("resize", sync);
    };
  }, []);

  const canPrompt =
    !installed && !isDismissed() && (Boolean(deferredPrompt) || ios || mobile || inApp);

  const install = useCallback(async (): Promise<boolean> => {
    if (installed) return false;
    const event = getCapturedInstallPrompt() ?? deferredPrompt;
    if (!event) return false;

    setInstalling(true);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      takeCapturedInstallPrompt();
      setDeferredPrompt(null);
      if (choice.outcome === "accepted") {
        setInstalled(true);
        return true;
      }
    } finally {
      setInstalling(false);
    }
    return false;
  }, [deferredPrompt, installed]);

  const dismiss = useCallback((permanent = false) => {
    try {
      if (permanent) {
        localStorage.setItem(DISMISS_KEY, "1");
      } else {
        const week = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem(DISMISS_UNTIL_KEY, String(week));
      }
    } catch {
      /* ignore */
    }
  }, []);

  return {
    canPrompt,
    installed,
    installing,
    ios,
    mobile,
    inApp,
    hasNativePrompt: Boolean(deferredPrompt),
    install,
    dismiss,
  };
}
