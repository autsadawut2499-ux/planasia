"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

interface FireflySidebarItemProps {
  icon: LucideIcon;
  label: string;
  summary?: string;
  active: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

/** Firefly-style nav row: icon + label, white left bar when active */
export function FireflySidebarItem({
  icon: Icon,
  label,
  summary,
  active,
  onSelect,
  children,
}: FireflySidebarItemProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onSelect}
        className={`group relative flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
          active
            ? "bg-white/[0.08] text-white"
            : "text-white/65 hover:bg-white/[0.04] hover:text-white/90"
        }`}
      >
        {active && (
          <span
            className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r-full bg-white"
            aria-hidden
          />
        )}
        <Icon
          className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-white/55 group-hover:text-white/75"}`}
          strokeWidth={1.75}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] leading-none">{label}</span>
        {!active && summary ? (
          <span className="max-w-[4.5rem] truncate text-[11px] text-white/35">{summary}</span>
        ) : null}
      </button>
      {active && children ? (
        <div className="border-l border-white/8 px-3 pb-2.5 pl-[2.65rem]">{children}</div>
      ) : null}
    </div>
  );
}

export function FireflySidebarDivider() {
  return <div className="my-1.5 border-t border-white/[0.08]" role="separator" />;
}

/** Collapsible dropdown section — Firefly-style grouped menu */
export function FireflySidebarGroup({
  icon: Icon,
  label,
  summary,
  defaultOpen = false,
  children,
}: {
  icon: LucideIcon;
  label: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
      >
        <Icon className="h-4 w-4 shrink-0 text-white/50" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-white/75">{label}</span>
        {!open && summary ? (
          <span className="max-w-[4rem] truncate text-[10px] text-white/30">{summary}</span>
        ) : null}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-white/35 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? <div className="space-y-2.5 px-3 pb-3">{children}</div> : null}
    </div>
  );
}

export function FireflyField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-medium text-white/45">{label}</span>
      {children}
    </label>
  );
}

interface FireflySidebarShellProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** ~220px rail matching Adobe Firefly sidebar width */
export function FireflySidebarShell({
  collapsed,
  onToggleCollapsed,
  headerAction,
  children,
  footer,
}: FireflySidebarShellProps) {
  if (collapsed) {
    return (
      <aside className="flex h-full w-11 shrink-0 flex-col border-r border-white/[0.06] bg-[#141414]">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex h-12 w-full items-center justify-center text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#141414]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-2 py-2">
        {headerAction ? <div className="min-w-0 flex-1 px-1">{headerAction}</div> : <span className="px-2 text-[11px] font-medium text-white/40">Planasia</span>}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="rounded-md p-1.5 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>

      {footer ? <div className="shrink-0 border-t border-white/[0.08] p-3">{footer}</div> : null}
    </aside>
  );
}

export function useFireflySidebarSelection(defaultId?: string | null) {
  const [activeId, setActiveId] = useState<string | null>(defaultId ?? null);

  const select = (id: string) => {
    setActiveId((cur) => (cur === id ? null : id));
  };

  const isActive = (id: string) => activeId === id;

  return { activeId, select, isActive };
}

export const fireflyInputClass =
  "w-full rounded-md border border-white/12 bg-[#252525] px-2.5 py-1.5 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30";

export const fireflySelectClass =
  "w-full rounded-md border border-white/12 bg-[#252525] px-2 py-1.5 text-[12px] text-white outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30";
