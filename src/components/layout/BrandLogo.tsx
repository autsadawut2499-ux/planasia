"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

type BrandLogoVariant = "dark" | "light" | "workspace";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  href?: string;
  className?: string;
}

export function BrandLogo({ variant = "dark", href = "/", className = "" }: BrandLogoProps) {
  const textClass =
    variant === "light"
      ? "text-xl font-bold text-[#1e3a5f] md:text-2xl"
      : variant === "workspace"
        ? "gradient-text text-xl font-bold md:text-2xl"
        : "text-xl font-bold text-white md:text-2xl";

  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center gap-2.5 ${className}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-[1.02] md:h-11 md:w-11 ${
          variant === "light"
            ? "bg-gradient-to-br from-[#1e40af] to-[#1e3a5f]"
            : "bg-gradient-to-br from-indigo-500 to-violet-600"
        }`}
      >
        <Sparkles className="h-5 w-5 text-white md:h-6 md:w-6" />
      </div>
      <span className={`tracking-tight ${textClass}`}>Planasia</span>
    </Link>
  );
}
