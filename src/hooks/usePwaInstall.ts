"use client";

import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "planasia-pwa-install-dismissed";
const DISMISS_UNTIL_KEY = "planasia-pwa-install-dismiss-until";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [ios] = useState(isIos);
  const [mobile] = useState(isMobileDevice);

  useEffect(() => {
    setInstalled(isStandalone());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canPrompt =
    !installed && !isDismissed() && (Boolean(deferredPrompt) || ios || mobile);

  const install = useCallback(async (): Promise<boolean> => {
    if (installed) return false;

    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
          setDeferredPrompt(null);
          return true;
        }
      } finally {
        setInstalling(false);
      }
      return false;
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
    hasNativePrompt: Boolean(deferredPrompt),
    install,
    dismiss,
  };
}
