"use client";

import { useId, useMemo, useState } from "react";
import { Check, Heart, Link2 } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useToast } from "@/context/ToastContext";
import { listingCanonicalUrl } from "@/lib/seo/metadata";
import type { StoreListing } from "@/lib/store/listing-types";

interface ListingSocialShareProps {
  listing: StoreListing;
  /** Localized display title for share text. */
  title: string;
  /** Short share / OG-style description. */
  description?: string;
  className?: string;
  /** Hide the "Share" label — for header toolbars. */
  hideLabel?: boolean;
  /** Slightly denser icon buttons. */
  compact?: boolean;
  /** Optional wishlist control — rendered once in the same icon row. */
  favorite?: {
    active: boolean;
    onToggle: () => void;
    labelSave: string;
    labelRemove: string;
  };
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

function LineGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108c0-.347.281-.63.63-.63h2.386c.349 0 .63.283.63.63 0 .348-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.63.63 0 0 1 0 1.259h-2.386a.63.63 0 0 1-.63-.629V8.108c0-.347.281-.63.63-.63.348 0 .63.283.63.63v3.771h1.756zm-4.852 0a.63.63 0 0 1 0 1.259H7.926a.63.63 0 0 1-.63-.629V8.108c0-.347.281-.63.63-.63.348 0 .63.283.63.63v3.771h1.102zm-3.78 1.259H4.915a.63.63 0 0 1-.63-.629V8.108c0-.347.281-.63.63-.63.348 0 .63.283.63.63v4.401c0 .346-.282.629-.63.629zM24 10.3C24 4.9 18.627.926 12 .926S0 4.9 0 10.3c0 4.808 4.269 8.838 10.03 9.592.39.084.922.258 1.055.592.12.304.079.78.038 1.086l-.164 1.02c-.05.303-.242 1.186.001 1.42.29.3 1.22-.11 2.14-.76 3.12-2.22 9.9-5.2 9.9-12.95z" />
    </svg>
  );
}

function InstagramGlyph({ className, gradientId }: { className?: string; gradientId: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f9ce34" />
          <stop offset="45%" stopColor="#ee2a7b" />
          <stop offset="100%" stopColor="#6228d7" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M12 2.16c-2.67 0-3.01.01-4.06.06-2.72.12-4.66 2.05-4.78 4.78-.05 1.05-.06 1.39-.06 4.06s.01 3.01.06 4.06c.12 2.72 2.05 4.66 4.78 4.78 1.05.05 1.39.06 4.06.06s3.01-.01 4.06-.06c2.72-.12 4.66-2.05 4.78-4.78.05-1.05.06-1.39.06-4.06s-.01-3.01-.06-4.06c-.12-2.72-2.05-4.66-4.78-4.78-1.05-.05-1.39-.06-4.06-.06zm0 1.62c2.63 0 2.94.01 3.97.06 2.03.09 3.1 1.16 3.19 3.19.05 1.03.06 1.34.06 3.97s-.01 2.94-.06 3.97c-.09 2.03-1.16 3.1-3.19 3.19-1.03.05-1.34.06-3.97.06s-2.94-.01-3.97-.06c-2.03-.09-3.1-1.16-3.19-3.19-.05-1.03-.06-1.34-.06-3.97s.01-2.94.06-3.97c.09-2.03 1.16-3.1 3.19-3.19 1.03-.05 1.34-.06 3.97-.06zM12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.92A3.12 3.12 0 1 1 12 8.88a3.12 3.12 0 0 1 0 6.24zM17.76 6.96a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0z"
      />
    </svg>
  );
}

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.6a6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.8a4.85 4.85 0 0 1-.999-.11z" />
    </svg>
  );
}

function openSharePopup(url: string, name: string) {
  const width = 600;
  const height = 640;
  const left = Math.max(0, Math.round(window.screen.width / 2 - width / 2));
  const top = Math.max(0, Math.round(window.screen.height / 2 - height / 2));
  window.open(
    url,
    name,
    `noopener,noreferrer,width=${width},height=${height},left=${left},top=${top}`,
  );
}

const iconBtnBase =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-[1.04] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e40af]/35 sm:h-9 sm:w-9";

/**
 * Social share row — Facebook, LINE, Instagram, TikTok (+ optional copy link).
 * Instagram / TikTok have no public web sharer; use native share or copy link.
 */
export function ListingSocialShare({
  listing,
  title,
  description = "",
  className = "",
  hideLabel = false,
  compact = false,
  favorite,
}: ListingSocialShareProps) {
  const L = useBilingual();
  const toast = useToast();
  const igGradientId = useId().replace(/:/g, "");
  const [copied, setCopied] = useState(false);

  const pageUrl = useMemo(() => listingCanonicalUrl(listing), [listing]);
  const encodedUrl = encodeURIComponent(pageUrl);
  const shareTitle = title.includes("| Planasia") ? title : `${title} | Planasia`;
  const shareText = description ? `${shareTitle} — ${description}` : shareTitle;
  const btnSize = compact ? "h-9 w-9 sm:h-8 sm:w-8" : "";

  async function copyLink(message?: { en: string; th: string }) {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast.success(L(message?.en ?? "Link copied", message?.th ?? "คัดลอกลิงก์แล้ว"));
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error(L("Could not copy link", "คัดลอกลิงก์ไม่สำเร็จ"));
    }
  }

  async function shareViaNativeOrCopy(opts: {
    labelEn: string;
    labelTh: string;
    pasteHintEn: string;
    pasteHintTh: string;
  }) {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: pageUrl,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await copyLink({
      en: opts.pasteHintEn,
      th: opts.pasteHintTh,
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="group"
      aria-label={L("Share this plan", "แชร์แบบบ้านนี้")}
    >
      {!hideLabel && (
        <p className="mr-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {L("Share", "แชร์")}
        </p>
      )}

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconBtnBase} ${btnSize} border-[#1877F2]/25 text-[#1877F2] hover:bg-[#1877F2]/10`}
        aria-label="Share on Facebook"
        title="Facebook"
        onClick={(e) => {
          e.preventDefault();
          openSharePopup(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            "facebook-share",
          );
        }}
      >
        <FacebookGlyph className="h-[18px] w-[18px]" />
      </a>

      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconBtnBase} ${btnSize} border-[#06C755]/30 text-[#06C755] hover:bg-[#06C755]/10`}
        aria-label="Share on LINE"
        title="LINE"
        onClick={(e) => {
          e.preventDefault();
          openSharePopup(
            `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
            "line-share",
          );
        }}
      >
        <LineGlyph className="h-[18px] w-[18px]" />
      </a>

      <button
        type="button"
        onClick={() =>
          void shareViaNativeOrCopy({
            labelEn: "Instagram",
            labelTh: "Instagram",
            pasteHintEn: "Link copied — paste it in Instagram",
            pasteHintTh: "คัดลอกลิงก์แล้ว — วางใน Instagram ได้เลย",
          })
        }
        className={`${iconBtnBase} ${btnSize} border-pink-300/60 hover:bg-pink-50/80`}
        aria-label="Share on Instagram"
        title="Instagram"
      >
        <InstagramGlyph className="h-[18px] w-[18px]" gradientId={`ig-${igGradientId}`} />
      </button>

      <button
        type="button"
        onClick={() =>
          void shareViaNativeOrCopy({
            labelEn: "TikTok",
            labelTh: "TikTok",
            pasteHintEn: "Link copied — paste it in TikTok",
            pasteHintTh: "คัดลอกลิงก์แล้ว — วางใน TikTok ได้เลย",
          })
        }
        className={`${iconBtnBase} ${btnSize} border-slate-300 text-[#010101] hover:bg-slate-50`}
        aria-label="Share on TikTok"
        title="TikTok"
      >
        <TikTokGlyph className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        onClick={() => void copyLink()}
        className={`${iconBtnBase} ${btnSize} border-slate-200 text-slate-600 hover:border-[#1e40af]/35 hover:text-[#1e40af]`}
        aria-label={L("Copy link", "คัดลอกลิงก์")}
        title={L("Copy link", "คัดลอกลิงก์")}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>

      {favorite && (
        <button
          type="button"
          onClick={favorite.onToggle}
          className={`${iconBtnBase} ${btnSize} border-slate-200 text-red-500 hover:border-red-300 hover:bg-red-50`}
          aria-label={favorite.active ? favorite.labelRemove : favorite.labelSave}
          title={favorite.active ? favorite.labelRemove : favorite.labelSave}
        >
          <Heart
            className={`h-[18px] w-[18px] ${favorite.active ? "fill-red-500 text-red-500" : ""}`}
            strokeWidth={1.75}
          />
        </button>
      )}
    </div>
  );
}
