import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { ListingCreator } from "@/lib/store/listing-types";

interface ListingCreatorBylineProps {
  creator?: ListingCreator;
  /** sm = compact cards; md = detail; minimal = 32px avatar + text-sm gray name */
  size?: "sm" | "md" | "minimal";
  /** Renders as a plain row instead of a link (inside another <a>). */
  static?: boolean;
  className?: string;
}

const SIZES = {
  sm: {
    box: "h-6 w-6",
    text: "text-[10px]",
    name: "text-[11px] font-medium text-text-secondary",
    badge: "h-3 w-3",
    gap: "gap-1.5",
  },
  md: {
    box: "h-8 w-8",
    text: "text-[11px]",
    name: "text-xs font-medium text-text-secondary",
    badge: "h-3.5 w-3.5",
    gap: "gap-1.5",
  },
  minimal: {
    box: "h-8 w-8 shadow-sm ring-1 ring-black/10",
    text: "text-[11px]",
    name: "text-sm font-normal text-gray-600",
    badge: "h-3.5 w-3.5",
    gap: "gap-2.5",
  },
} as const;

function initials(name: string): string {
  return name.replace(/[^a-zA-Z0-9ก-๙]/g, "").slice(0, 2).toUpperCase() || "?";
}

/**
 * Draftsman portrait + name — used under listing images so every plan is
 * visibly attributed to its designer.
 */
export function ListingCreatorByline({
  creator,
  size = "sm",
  static: isStatic = false,
  className = "",
}: ListingCreatorBylineProps) {
  if (!creator) return null;
  const s = SIZES[size];

  const inner = (
    <>
      {creator.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={creator.avatarUrl}
          alt={creator.displayName}
          loading="lazy"
          decoding="async"
          className={`${s.box} shrink-0 rounded-full object-cover ${
            size === "minimal" ? "" : "ring-1 ring-black/10"
          }`}
        />
      ) : (
        <span
          className={`${s.box} ${s.text} flex shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] font-bold text-white`}
          aria-hidden
        >
          {initials(creator.displayName)}
        </span>
      )}
      <span className={`${s.name} min-w-0 truncate`}>{creator.displayName}</span>
      {creator.isVerified && (
        <BadgeCheck className={`${s.badge} shrink-0 text-[#1e40af]`} aria-label="ยืนยันตัวตนแล้ว" />
      )}
    </>
  );

  const base = `flex items-center ${s.gap} ${className}`;

  if (isStatic || !creator.hasProfile) {
    return <span className={base}>{inner}</span>;
  }

  return (
    <Link
      href={`/draftsmen/${encodeURIComponent(creator.ownerKey)}`}
      className={`${base} transition-colors hover:opacity-90`}
      title={`ดูโปรไฟล์ ${creator.displayName}`}
    >
      {inner}
    </Link>
  );
}
