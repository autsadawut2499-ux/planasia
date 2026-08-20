"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PUBLIC_SELLER_SELF_LISTING_ENABLED } from "@/lib/features/public-seller";

/**
 * Compact Seller entry — sized to match the header Store button.
 * Hidden while public self-listing is closed (admin lists plans instead).
 */
export function SellerEntryButton({ className = "" }: { className?: string }) {
  const { translate } = useApp();

  if (!PUBLIC_SELLER_SELF_LISTING_ENABLED) return null;

  return (
    <Link
      href="/dashboard/draftsman"
      aria-label={translate("nav.sellerAria")}
      title={translate("nav.sellerAria")}
      className={`nav-store-btn header-control shrink-0 text-white ${className}`}
    >
      <PenLine className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
      <span>{translate("nav.seller")}</span>
    </Link>
  );
}
