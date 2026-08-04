"use client";

import { useEffect, useState } from "react";
import { withMediaCacheBust } from "@/lib/media/cache-bust";

interface DraftsmanCoverBannerProps {
  ownerKey: string;
  initialCoverUrl?: string;
  initialUpdatedAt?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Public profile cover — refetches latest cover_url from the API on mount / focus
 * so uploads from the seller dashboard appear without a hard browser reload.
 */
export function DraftsmanCoverBanner({
  ownerKey,
  initialCoverUrl,
  initialUpdatedAt,
  className = "",
  children,
}: DraftsmanCoverBannerProps) {
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/draftsmen/${encodeURIComponent(ownerKey)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          card?: { coverUrl?: string; updatedAt?: string };
        };
        if (cancelled || !json.card) return;
        if (json.card.coverUrl) setCoverUrl(json.card.coverUrl);
        if (json.card.updatedAt) setUpdatedAt(json.card.updatedAt);
      } catch {
        // Keep SSR/initial cover on network failure.
      }
    }

    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [ownerKey]);

  const src = coverUrl
    ? withMediaCacheBust(coverUrl, updatedAt ?? coverUrl)
    : undefined;

  return (
    <section
      className={`relative border-b border-border bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] py-12 text-white ${className}`}
    >
      {src && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f]/95 to-[#1e40af]/80" />
        </>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
