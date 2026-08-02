"use client";

import Link from "next/link";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";

type BrandLogoVariant = "dark" | "light" | "workspace";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  href?: string;
  className?: string;
  /** Show building mark icon beside the wordmark. */
  markOnly?: boolean;
  /** Center the lockup (footer / hero moments). */
  centered?: boolean;
}

/** Brand palette from the official PLANASIA mark */
export const BRAND_NAVY = "#1A2744";
export const BRAND_TERRACOTTA = "#C45C3A";
/** Full-color lockup (legacy / admin defaults). */
export const BRAND_LOGO_SRC = "/brand/planasia-lockup.png";
/** Official geometric wordmark — white for dark surfaces. */
export const BRAND_WORDMARK_WHITE = "/brand/planasia-wordmark-white.png?v=3";
/** Official geometric wordmark — navy for light surfaces. */
export const BRAND_WORDMARK_NAVY = "/brand/planasia-wordmark-navy.png?v=3";

/**
 * Site logo — PLANASIA wordmark (wide tracking, extralight / 200 weight, apex chevron).
 */
export function BrandLogo({
  variant = "dark",
  href = "/",
  className = "",
  markOnly = false,
  centered = false,
}: BrandLogoProps) {
  const siteConfig = useSiteConfigOptional();
  const raw = (siteConfig?.settings.brand.name ?? "Planasia").trim() || "Planasia";
  const wordmark = (
    raw
      .replace(/\s*House\s*Plans\s*/gi, " ")
      .replace(/\s{2,}/g, " ")
      .trim() || "Planasia"
  ).toUpperCase();

  const isLight = variant === "light";

  const textClass = isLight
    ? "text-[#1A2744]"
    : variant === "workspace"
      ? "text-white/95"
      : "text-white";

  const chevronClass = isLight
    ? "border-[#1A2744]"
    : variant === "workspace"
      ? "border-white/90"
      : "border-white";

  const wordmarkClass = `font-brand whitespace-nowrap text-[17px] font-light uppercase leading-none tracking-[0.16em] sm:text-[18px] md:text-[19px] md:tracking-[0.18em] ${textClass}`;

  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center gap-2 sm:gap-2.5 ${
        centered ? "justify-center" : ""
      } ${className}`}
      aria-label={wordmark}
    >
      {markOnly && <PlanasiaMark className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9" />}
      <span
        className={`relative inline-flex flex-col ${centered ? "items-center" : "items-start"}`}
      >
        <span
          aria-hidden
          className={`mx-auto mb-0.5 h-1.5 w-1.5 rotate-45 border-l-[1.5px] border-t-[1.5px] ${chevronClass}`}
        />
        <span className={wordmarkClass}>{wordmark}</span>
      </span>
    </Link>
  );
}

/**
 * Geometric PLANASIA mark — overlapping vertical “building” panels
 * in terracotta (left) and navy (right) with multiply-style depth.
 * Kept for markOnly / favicon-style usages.
 */
export function PlanasiaMark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} aria-hidden>
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="planasiaMarkBlend" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor={BRAND_TERRACOTTA} />
            <stop offset="0.48" stopColor="#8B4A3A" />
            <stop offset="1" stopColor={BRAND_NAVY} />
          </linearGradient>
        </defs>

        <path
          d="M32 4L54 20V58H10V20L32 4Z"
          fill="url(#planasiaMarkBlend)"
          opacity="0.18"
        />

        <path d="M10 22L20 14V58H10V22Z" fill={BRAND_TERRACOTTA} opacity="0.55" />
        <path d="M16 18L28 9V58H16V18Z" fill={BRAND_TERRACOTTA} opacity="0.72" />
        <path d="M22 14L34 6V58H22V14Z" fill={BRAND_TERRACOTTA} opacity="0.88" />

        <path d="M54 22L44 14V58H54V22Z" fill={BRAND_NAVY} opacity="0.55" />
        <path d="M48 18L36 9V58H48V18Z" fill={BRAND_NAVY} opacity="0.72" />
        <path d="M42 14L30 6V58H42V14Z" fill={BRAND_NAVY} opacity="0.9" />

        <path
          d="M32 10L40 18V34L32 26L24 34V18L32 10Z"
          fill="#6B3D38"
          opacity="0.55"
        />
        <path d="M32 16L38 22V36L32 30L26 36V22L32 16Z" fill="#F4EDE8" opacity="0.35" />
        <path d="M32 22L36 26V40L32 36L28 40V26L32 22Z" fill="#FFFFFF" opacity="0.28" />
      </svg>
    </span>
  );
}
