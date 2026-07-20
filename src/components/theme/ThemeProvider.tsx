"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, type ReactNode } from "react";

type ThemeId = "workspace" | "store" | "landing";

function themeForPath(pathname: string): ThemeId {
  if (pathname.startsWith("/workspace")) return "workspace";
  if (pathname.startsWith("/store")) return "store";
  return "landing";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const theme = themeForPath(pathname);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "workspace");
  }, [pathname]);

  return children;
}
