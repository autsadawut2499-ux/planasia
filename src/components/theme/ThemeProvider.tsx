"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, type ReactNode } from "react";

type ThemeId = "workspace" | "store" | "landing";

export function themeForPath(pathname: string): ThemeId {
  if (pathname.startsWith("/store")) return "store";
  return "landing";
}

/** Wide app chrome (admin / vendor dashboards) should not get the storefront max-width. */
export function isCappedStorefrontPath(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/dashboard")) return false;
  return true;
}

export function applyDocumentTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "workspace");
}

export function applyStorefrontCap(enabled: boolean) {
  if (enabled) {
    document.documentElement.setAttribute("data-storefront-cap", "");
  } else {
    document.documentElement.removeAttribute("data-storefront-cap");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    applyDocumentTheme(themeForPath(pathname));
    applyStorefrontCap(isCappedStorefrontPath(pathname));
  }, [pathname]);

  return children;
}
