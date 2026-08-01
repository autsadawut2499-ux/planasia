"use client";

import { useMemo, useState } from "react";
import { Check, Link2 } from "lucide-react";
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
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M14 8.5h2.5V5H14c-2.2 0-4 1.8-4 4v1.5H7.5V14H10v7h3.5v-7H16l.5-3.5H13.5V9c0-.3.2-.5.5-.5z" />
    </svg>
  );
}

function LineGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.7 9.4c0-3.5-3.5-6.4-7.8-6.4S4.1 5.9 4.1 9.4c0 3.2 2.8 5.8 6.6 6.3.26.06.61.17.7.4.08.2.05.52.03.73l-.12.73c-.04.22-.17.86 0 1.03.2.22.85-.08 1.5-.53 3.4-2.26 7-2.26 7-5.66zM8.2 11.1H7.1V8.5h1.1v2.6zm2.6 0H9.7V8.5h1.1v2.6zm2.6 0h-1.1V8.5h1.1v2.6zm3.2 0h-2.1V8.5h2.1v2.6z" />
    </svg>
  );
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.6 3H20l-6.3 7.2L21 21h-5.5l-4.3-6.3L6 21H3.6l6.8-7.8L3 3h5.6l3.9 5.7L17.6 3zm-1 16.3h1.5L7.5 4.6H5.9l10.7 14.7z" />
    </svg>
  );
}

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.6 8.2a6.7 6.7 0 0 1-3.9-1.2v7.1a5.7 5.7 0 1 1-4.9-5.6v2.5a3.2 3.2 0 1 0 2.2 3.1V2.8h2.4a4.4 4.4 0 0 0 4.2 4.2v1.2z" />
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

/**
 * Social share row for listing detail — Facebook, LINE, X, TikTok, and copy link.
 * TikTok has no public web sharer URL; we use the native share sheet when
 * available, otherwise copy the OG-ready page URL for pasting into TikTok.
 */
export function ListingSocialShare({
  listing,
  title,
  description = "",
  className = "",
  hideLabel = false,
  compact = false,
}: ListingSocialShareProps) {
  const L = useBilingual();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  // Always share the canonical public URL so Facebook / LINE / X scrape server OG tags
  // (not localhost, hash fragments, or transient query params).
  const pageUrl = useMemo(() => listingCanonicalUrl(listing), [listing]);

  const encodedUrl = encodeURIComponent(pageUrl);
  const shareTitle = title.includes("| Planasia") ? title : `${title} | Planasia`;
  const encodedTitle = encodeURIComponent(shareTitle);
  const shareText = description ? `${shareTitle} — ${description}` : shareTitle;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast.success(L("Link copied", "คัดลอกลิงก์แล้ว"));
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error(L("Could not copy link", "คัดลอกลิงก์ไม่สำเร็จ"));
    }
  }

  async function shareTikTok() {
    // Prefer OS share sheet (includes TikTok on many phones).
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: pageUrl,
        });
        return;
      } catch (err) {
        // User cancelled — don't fall through as an error.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast.success(
        L("Link copied — paste it in TikTok", "คัดลอกลิงก์แล้ว — วางใน TikTok ได้เลย"),
      );
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error(L("Could not copy link", "คัดลอกลิงก์ไม่สำเร็จ"));
    }
  }

  const btn = compact
    ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-slate-600 transition hover:border-[#1e40af]/35 hover:text-[#1e40af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e40af]/40 sm:h-9 sm:w-9"
    : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-slate-600 transition hover:border-[#1e40af]/35 hover:text-[#1e40af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e40af]/40 sm:h-9 sm:w-9";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${className}`}>
      {!hideLabel && (
        <p className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {L("Share", "แชร์")}
        </p>
      )}

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
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
        <FacebookGlyph className="h-4 w-4" />
      </a>

      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
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
        <LineGlyph className="h-4 w-4" />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="Share on X"
        title="X (Twitter)"
        onClick={(e) => {
          e.preventDefault();
          openSharePopup(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            "x-share",
          );
        }}
      >
        <XGlyph className="h-3.5 w-3.5" />
      </a>

      <button
        type="button"
        onClick={() => void shareTikTok()}
        className={btn}
        aria-label="TikTok"
        title="TikTok"
      >
        <TikTokGlyph className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => void copyLink()}
        className={btn}
        aria-label={L("Copy link", "คัดลอกลิงก์")}
        title={L("Copy link", "คัดลอกลิงก์")}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
