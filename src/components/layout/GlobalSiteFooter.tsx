"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { shouldHidePublicChrome } from "@/lib/layout/storefront-chrome";

/**
 * Root-layout footer gate: renders SiteFooter on every public page,
 * and hides it inside the admin console.
 */
export function GlobalSiteFooter() {
  const pathname = usePathname();
  if (shouldHidePublicChrome(pathname)) return null;
  return <SiteFooter />;
}
