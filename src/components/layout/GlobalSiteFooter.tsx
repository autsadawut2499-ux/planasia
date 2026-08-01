"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";

/** Paths that use their own chrome (admin panel) — skip the public storefront footer. */
function shouldHideFooter(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/**
 * Root-layout footer gate: renders SiteFooter on every public page,
 * and hides it inside the admin console.
 */
export function GlobalSiteFooter() {
  const pathname = usePathname();
  if (shouldHideFooter(pathname)) return null;
  return <SiteFooter />;
}
