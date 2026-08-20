"use client";

import { Download, Share, Smartphone, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { usePwaInstall } from "@/hooks/usePwaInstall";

interface PwaInstallPromptProps {
  open: boolean;
  onClose: () => void;
  /** Stronger first-visit framing (still dismissible — browsers cannot force install). */
  forceAttention?: boolean;
}

export function PwaInstallPrompt({
  open,
  onClose,
  forceAttention = false,
}: PwaInstallPromptProps) {
  const { translate } = useApp();
  const { ios, inApp, hasNativePrompt, installing, install, dismiss } = usePwaInstall();

  if (!open) return null;

  const handleInstall = async () => {
    const ok = await install();
    if (ok) onClose();
  };

  const handleLater = () => {
    dismiss(false);
    onClose();
  };

  const handleNever = () => {
    dismiss(true);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative bg-[#1A2744] px-6 pb-8 pt-6 text-white">
          <button
            type="button"
            onClick={handleLater}
            className="absolute right-3 top-3 rounded-full p-2 hover:bg-white/10"
            aria-label={translate("pwa.later")}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <Smartphone className="h-8 w-8" />
          </div>
          <h2 id="pwa-install-title" className="text-center text-xl font-bold">
            {translate("pwa.installTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-white/85">
            {forceAttention
              ? translate("pwa.firstVisitSubtitle")
              : translate("pwa.installSubtitle")}
          </p>
        </div>

        <div className="space-y-4 p-6">
          <ul className="space-y-2 text-sm text-[#4b5563]">
            <li className="flex gap-2">
              <span className="font-semibold text-[#1e40af]">✓</span>
              {translate("pwa.benefit1")}
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[#1e40af]">✓</span>
              {translate("pwa.benefit2")}
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[#1e40af]">✓</span>
              {translate("pwa.benefit3")}
            </li>
          </ul>

          {inApp && !hasNativePrompt ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="mb-2 font-semibold">{translate("pwa.inAppTitle")}</p>
              <p className="leading-relaxed">{translate("pwa.inAppSteps")}</p>
            </div>
          ) : ios && !hasNativePrompt ? (
            <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-4 text-sm text-[#1e3a8a]">
              <p className="mb-2 flex items-center gap-2 font-semibold">
                <Share className="h-4 w-4 shrink-0" />
                {translate("pwa.iosTitle")}
              </p>
              <p className="leading-relaxed">{translate("pwa.iosSteps")}</p>
            </div>
          ) : !hasNativePrompt ? (
            <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-4 text-sm text-[#1e3a8a]">
              <p className="leading-relaxed">{translate("pwa.androidHint")}</p>
            </div>
          ) : null}

          {hasNativePrompt ? (
            <button
              type="button"
              onClick={() => void handleInstall()}
              disabled={installing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] py-3.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {installing ? translate("pwa.installing") : translate("pwa.installNow")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLater}
              className="w-full rounded-xl bg-[#1e40af] py-3.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              {translate("pwa.gotIt")}
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleLater}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium text-[#4b5563] hover:bg-[#f5f6f8]"
            >
              {translate("pwa.later")}
            </button>
            <button
              type="button"
              onClick={handleNever}
              className="flex-1 rounded-lg py-2.5 text-sm text-[#8b939e] hover:text-[#4b5563]"
            >
              {translate("pwa.neverAsk")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
