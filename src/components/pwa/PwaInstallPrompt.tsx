"use client";

import { Download, Share, Smartphone, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { usePwaInstall } from "@/hooks/usePwaInstall";

interface PwaInstallPromptProps {
  open: boolean;
  onClose: () => void;
}

export function PwaInstallPrompt({ open, onClose }: PwaInstallPromptProps) {
  const { translate } = useApp();
  const { ios, hasNativePrompt, installing, install, dismiss } = usePwaInstall();

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
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="pwa-install-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] px-6 pb-8 pt-6 text-white">
          <button
            type="button"
            onClick={handleLater}
            className="absolute right-3 top-3 rounded-full p-2 hover:bg-white/10"
            aria-label={translate("workflow.cancel")}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Smartphone className="h-8 w-8" />
          </div>
          <h2 id="pwa-install-title" className="text-center text-xl font-bold">
            {translate("pwa.installTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-blue-100">{translate("pwa.installSubtitle")}</p>
        </div>

        <div className="space-y-4 p-6">
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-2">
              <span className="text-[#1e40af]">✓</span>
              {translate("pwa.benefit1")}
            </li>
            <li className="flex gap-2">
              <span className="text-[#1e40af]">✓</span>
              {translate("pwa.benefit2")}
            </li>
            <li className="flex gap-2">
              <span className="text-[#1e40af]">✓</span>
              {translate("pwa.benefit3")}
            </li>
          </ul>

          {ios && !hasNativePrompt ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="mb-2 flex items-center gap-2 font-semibold">
                <Share className="h-4 w-4" />
                {translate("pwa.iosTitle")}
              </p>
              <p className="leading-relaxed">{translate("pwa.iosSteps")}</p>
            </div>
          ) : !hasNativePrompt ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="leading-relaxed">{translate("pwa.androidHint")}</p>
            </div>
          ) : null}

          {hasNativePrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] py-3.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {installing ? translate("pwa.installing") : translate("pwa.installNow")}
            </button>
          ) : ios ? (
            <button
              type="button"
              onClick={handleLater}
              className="w-full rounded-xl bg-[#1e40af] py-3.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              {translate("pwa.gotIt")}
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
            <button type="button" onClick={handleLater} className="btn-ghost flex-1 text-sm">
              {translate("pwa.later")}
            </button>
            <button
              type="button"
              onClick={handleNever}
              className="flex-1 text-sm text-text-muted hover:text-text-secondary"
            >
              {translate("pwa.neverAsk")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
