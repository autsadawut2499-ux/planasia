"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { useApp } from "@/context/AppContext";

/**
 * Compact Seller entry — sized to match the header Store button.
 */
export function SellerEntryButton({ className = "" }: { className?: string }) {
  const { translate } = useApp();

  return (
    <Link
      href="/dashboard/draftsman"
      aria-label={translate("nav.sellerAria")}
      title={translate("nav.sellerAria")}
      className={`nav-store-btn header-control text-white ${className}`}
    >
      <PenLine className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
      <span>{translate("nav.seller")}</span>
    </Link>
  );
}
