"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, MapPin, Ruler, Search } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { useBilingual } from "@/components/landing/useBilingual";
import { withMediaCacheBust } from "@/lib/media/cache-bust";
import type { DraftsmanCard } from "@/lib/vendors/directory";

export default function DraftsmenPageClient() {
  const t = useBilingual();
  const [cards, setCards] = useState<DraftsmanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/draftsmen", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setCards(data.draftsmen ?? []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cards.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.displayName.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.specialties.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-canvas">
      <LandingHeader />
      <main>
        <section className="border-b border-border bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] py-16 text-white md:py-20">
          <div className="mx-auto max-w-[1400px] px-5 md:px-8">
            <h1 className="text-3xl font-bold md:text-4xl">
              {t("Find Architects & Designers", "หาสถาปนิกและนักออกแบบ")}
            </h1>
            <p className="mt-3 max-w-2xl text-blue-100">
              {t(
                "Browse verified architects and designers, view their work, and hire them directly.",
                "ค้นหาสถาปนิกและนักออกแบบ ดูผลงาน และติดต่อจ้างงานได้โดยตรง",
              )}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex w-full max-w-xl items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
                <Search className="h-5 w-5 text-text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Search by name, area, or specialty", "ค้นหาจากชื่อ พื้นที่ หรือความเชี่ยวชาญ")}
                  className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                />
              </div>
              <Link
                href="/dashboard/draftsman"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
              >
                {t("Become a seller", "เปิดร้านขายแบบบ้าน")}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-surface-raised" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-[var(--color-card,#fff)] py-24 text-center">
              <p className="text-text-muted">
                {t("No architects or designers found yet.", "ยังไม่มีสถาปนิกและนักออกแบบในระบบ")}
              </p>
              <Link
                href="/dashboard/draftsman"
                className="mt-4 inline-block rounded-full bg-[#1e40af] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                {t("Become a seller", "สมัครเป็นสถาปนิกและนักออกแบบ")}
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-text-secondary">
                {t(
                  `${filtered.length} architects & designers`,
                  `พบสถาปนิกและนักออกแบบ ${filtered.length} คน`,
                )}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                {filtered.map((card) => (
                  <DraftsmanCardView key={card.ownerKey} card={card} t={t} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function draftsmanCoverSrc(card: DraftsmanCard): string | undefined {
  // Prefer explicit cover; only fall back when the vendor never set one.
  const raw =
    card.coverUrl ||
    card.galleryUrls[0] ||
    card.sampleImages[0] ||
    card.brandImageUrl ||
    undefined;
  if (!raw) return undefined;
  return withMediaCacheBust(raw, card.updatedAt ?? card.coverUrl);
}

function DraftsmanCardView({
  card,
  t,
}: {
  card: DraftsmanCard;
  t: (en: string, th: string) => string;
}) {
  const initials = card.displayName.replace(/[^a-zA-Z0-9ก-๙]/g, "").slice(0, 2).toUpperCase();
  const coverSrc = draftsmanCoverSrc(card);
  const profileHref = `/draftsmen/${encodeURIComponent(card.ownerKey)}`;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-[var(--color-card,#fff)] shadow-sm transition-shadow hover:shadow-md">
      {/* Full-width cover (Facebook-style) — uses vendor cover or existing uploaded plan image */}
      <Link href={profileHref} className="relative block aspect-[16/7] overflow-hidden bg-surface-raised">
        {coverSrc ? (
          <img
            key={coverSrc}
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] hover:scale-[1.02]"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#3b82f6]"
          />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent"
        />
      </Link>

      <div className="relative px-5 pb-5 pt-0">
        <div className="-mt-7 flex items-end gap-3">
          {card.avatarUrl ? (
            <img
              src={card.avatarUrl}
              alt={card.displayName}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-white"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e40af]/10 text-sm font-bold text-[#1e40af] ring-4 ring-white">
              {initials}
            </span>
          )}
          <div className="min-w-0 pb-0.5 pt-8">
            <Link
              href={profileHref}
              className="flex items-center gap-1 truncate text-sm font-bold text-text-primary hover:text-[#1e40af]"
            >
              {card.displayName}
              {card.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-[#1e40af]" />}
            </Link>
            {card.location && (
              <p className="flex items-center gap-1 text-xs text-text-muted">
                <MapPin className="h-3 w-3" />
                {card.location}
              </p>
            )}
          </div>
        </div>

        {card.headline && (
          <p className="mt-3 line-clamp-2 text-xs text-text-secondary">{card.headline}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-text-secondary">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" />
            {t(`${card.planCount} plans`, `${card.planCount} แบบ`)}
          </span>
          <Link
            href={profileHref}
            className="rounded-full bg-[#1e40af] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
          >
            {t("View profile", "ดูโปรไฟล์")}
          </Link>
        </div>
      </div>
    </article>
  );
}
