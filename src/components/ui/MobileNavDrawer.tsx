"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export interface MobileNavLink {
  href: string;
  label: string;
  anchor?: boolean;
  /** External URL — opens in a new tab. */
  external?: boolean;
  /** When set, renders as a collapsible group (children hidden by default). */
  children?: MobileNavLink[];
}

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  links: MobileNavLink[];
  variant?: "dark" | "light";
  footer?: React.ReactNode;
}

/**
 * Full-viewport mobile menu. Portaled to document.body so it is not clipped
 * by a sticky header with backdrop-filter (which would shrink the fixed panel
 * and leave footer buttons floating over the page with no opaque background).
 */
export function MobileNavDrawer({
  open,
  onClose,
  links,
  variant = "light",
  footer,
}: MobileNavDrawerProps) {
  const { translate } = useApp();
  const [mounted, setMounted] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setExpandedIds({});
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const isDark = variant === "dark";
  const panelBg = isDark ? "bg-[#0a0a0f]" : "bg-[#ffffff]";
  const panelText = isDark ? "text-white" : "text-[#1a2332]";
  const panelBorder = isDark ? "border-white/15" : "border-[#e2e5ea]";
  const linkClass = isDark
    ? "text-white hover:bg-white/10"
    : "text-[#1e3a5f] hover:bg-[#f5f6f8] hover:text-[#1e40af]";
  const childLinkClass = isDark
    ? "text-white/85 hover:bg-white/10"
    : "text-[#334155] hover:bg-[#f5f6f8] hover:text-[#1e40af]";

  const toggleGroup = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLeaf = (link: MobileNavLink, className: string) => {
    if (link.anchor || link.external) {
      return (
        <a
          href={link.href}
          onClick={onClose}
          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={className}
        >
          {link.label}
        </a>
      );
    }
    return (
      <Link href={link.href} onClick={onClose} className={className}>
        {link.label}
      </Link>
    );
  };

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[80] bg-black/50"
        aria-label={translate("nav.closeMenu")}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[81] flex w-[min(100%,20rem)] flex-col border-l shadow-2xl pt-[env(safe-area-inset-top)] ${panelBg} ${panelText} ${panelBorder}`}
        role="dialog"
        aria-modal="true"
        aria-label={translate("nav.menu")}
      >
        <div
          className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${panelBg} ${panelBorder}`}
        >
          <span className="text-sm font-semibold">{translate("nav.menu")}</span>
          <button
            type="button"
            onClick={onClose}
            className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg ${
              isDark ? "hover:bg-white/10" : "hover:bg-[#f5f6f8]"
            }`}
            aria-label={translate("nav.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className={`min-h-0 flex-1 overflow-y-auto p-3 ${panelBg}`}>
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              const children = link.children ?? [];
              if (children.length === 0) {
                return (
                  <li key={link.href}>
                    {renderLeaf(
                      link,
                      `block min-h-11 rounded-lg px-3 py-3 text-sm font-semibold ${linkClass}`,
                    )}
                  </li>
                );
              }

              const groupId = `group-${link.href}`;
              const expanded = Boolean(expandedIds[groupId]);

              return (
                <li key={link.href} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupId)}
                    aria-expanded={expanded}
                    className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold ${linkClass}`}
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        expanded ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {expanded ? (
                    <ul className="mb-1 ml-2 flex flex-col gap-0.5 border-l border-[#e2e5ea] pl-2">
                      {children.map((child) => (
                        <li key={child.href}>
                          {renderLeaf(
                            child,
                            `block min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium ${childLinkClass}`,
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        {footer && (
          <div
            className={`shrink-0 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${panelBg} ${panelBorder}`}
          >
            {footer}
          </div>
        )}
      </aside>
    </>,
    document.body,
  );
}
