"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { useApp } from "@/context/AppContext";

/**
 * Compact Seller entry — architects / draftsmen portal.
 * Solid brand blue to match the platform primary CTA.
 */
export function SellerEntryButton({ className = "" }: { className?: string }) {
  const { translate } = useApp();

  return (
    <Link
      href="/dashboard/draftsman"
      aria-label={translate("nav.sellerAria")}
      title={translate("nav.sellerAria")}
      className={`nav-store-btn relative inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-white ${className}`}
    >
      <PenLine className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      <span className="text-[12px] font-semibold tracking-[0.02em]">{translate("nav.seller")}</span>
    </Link>
  );
}
