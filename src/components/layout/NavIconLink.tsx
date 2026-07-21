"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface NavIconLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  variant?: "dark" | "light";
}

export function NavIconLink({
  href,
  label,
  icon: Icon,
  active,
  variant = "dark",
}: NavIconLinkProps) {
  const isLight = variant === "light";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
        active
          ? isLight
            ? "border-[#1e40af]/30 bg-[#1e40af]/10 text-[#1e40af] shadow-sm"
            : "border-indigo-400/40 bg-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          : isLight
            ? "border-border bg-white text-text-primary hover:border-[#1e40af]/30 hover:bg-[#1e40af]/5 hover:text-[#1e40af]"
            : "border-white/15 bg-white/8 text-white/90 hover:border-white/25 hover:bg-white/12 hover:text-white"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          active
            ? isLight
              ? "bg-[#1e40af] text-white"
              : "bg-indigo-500 text-white"
            : isLight
              ? "bg-surface-raised text-[#1e40af]"
              : "bg-white/10 text-indigo-200"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
