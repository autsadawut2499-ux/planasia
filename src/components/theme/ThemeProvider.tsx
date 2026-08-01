"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, type ReactNode } from "react";

type ThemeId = "workspace" | "store" | "landing";

export function themeForPath(pathname: string): ThemeId {
  if (pathname.startsWith("/store")) return "store";
  return "landing";
}

export function applyDocumentTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "workspace");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    applyDocumentTheme(themeForPath(pathname));
  }, [pathname]);

  return children;
}
