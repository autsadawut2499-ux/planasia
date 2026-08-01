"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export interface MobileNavLink {
  href: string;
  label: string;
  anchor?: boolean;
  /** External URL — opens in a new tab. */
  external?: boolean;
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  links: MobileNavLink[];
  variant?: "dark" | "light";
  footer?: React.ReactNode;
}

export function MobileNavDrawer({
  open,
  onClose,
  links,
  variant = "light",
  footer,
}: MobileNavDrawerProps) {
  const { translate } = useApp();

  if (!open) return null;

  const isDark = variant === "dark";
  const panelClass = isDark
    ? "bg-[#0a0a0f] text-white border-white/10"
    : "bg-white text-text-primary border-border";
  const linkClass = isDark
    ? "text-white hover:bg-white/10"
    : "text-[#1e3a5f] hover:bg-surface-raised hover:text-[#1e40af]";

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/40"
        aria-label={translate("nav.closeMenu")}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[61] flex w-full max-w-xs flex-col border-l shadow-2xl pt-[env(safe-area-inset-top)] ${panelClass}`}
        role="dialog"
        aria-modal="true"
        aria-label={translate("nav.menu")}
      >
        <div className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? "border-white/10" : "border-border"}`}>
          <span className="text-sm font-semibold">{translate("nav.menu")}</span>
          <button
            type="button"
            onClick={onClose}
            className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-surface-raised"}`}
            aria-label={translate("nav.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                {link.anchor || link.external ? (
                  <a
                    href={link.href}
                    onClick={onClose}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={`block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold ${linkClass}`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold ${linkClass}`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {footer && (
          <div
            className={`border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${isDark ? "border-white/10" : "border-border"}`}
          >
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
