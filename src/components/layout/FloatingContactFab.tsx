"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import { DEFAULT_SITE_SETTINGS } from "@/lib/admin/defaults";
import {
  OPEN_CONTACT_EVENT,
  shouldHideContactFab,
  shouldHideContactFabTrigger,
} from "@/lib/layout/storefront-chrome";

/** Re-export for existing imports (MobileBottomNav, etc.). */
export { OPEN_CONTACT_EVENT };

function LineIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 01-.63-.629V8.108c0-.347.281-.63.63-.63h2.386c.349 0 .63.283.63.63 0 .348-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.63.63 0 01-.63-.63V8.108c0-.347.282-.63.63-.63.348 0 .63.283.63.63v4.141a.63.63 0 01-.63.63zm-1.598-.006a.605.605 0 01-.55-.348l-2.14-4.595V12.25a.63.63 0 01-.63.629.63.63 0 01-.63-.629V8.108c0-.347.281-.63.63-.63.255 0 .48.15.575.376l2.14 4.595V8.108c0-.347.282-.63.63-.63.349 0 .63.283.63.63v4.141a.626.626 0 01-.625.624zM6.704 12.88H4.868V8.108c0-.347.281-.63.63-.63.348 0 .63.283.63.63v4.141a.63.63 0 01-.63.63h-.001zM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.121.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function resolveContactConfig(footer: {
  contactPhone?: string;
  contactLineUrl?: string;
  socialLinks?: { platform: string; url: string }[];
}) {
  const contactPhone =
    footer.contactPhone?.trim() || DEFAULT_SITE_SETTINGS.footer.contactPhone;
  const phoneTel = contactPhone.replace(/[^\d+]/g, "") || "0616911599";

  const fromField = footer.contactLineUrl?.trim() || "";
  const fromSocial =
    footer.socialLinks?.find((l) => l.platform.toLowerCase() === "line")?.url?.trim() ||
    "";
  const lineUrl = fromField || fromSocial;

  return { contactPhone, phoneTel, lineUrl };
}

/**
 * Premium single FAB — expands to Phone + LINE options.
 * Contact values come from Admin → Footer settings.
 */
export function FloatingContactFab() {
  const pathname = usePathname();
  const siteConfig = useSiteConfigOptional();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const footer = siteConfig?.settings.footer ?? DEFAULT_SITE_SETTINGS.footer;
  const { contactPhone, phoneTel, lineUrl } = resolveContactConfig(footer);
  const hasLine = Boolean(lineUrl && !lineUrl.includes("YOUR_LINE"));

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (event.target instanceof Node && !el.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onOpenContact() {
      setOpen(true);
    }
    window.addEventListener(OPEN_CONTACT_EVENT, onOpenContact);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, onOpenContact);
  }, []);

  if (shouldHideContactFab(pathname)) return null;

  const hideTrigger = shouldHideContactFabTrigger(pathname);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[var(--z-contact-fab)] flex flex-col items-end gap-3 max-lg:bottom-[max(var(--mobile-chrome-stack),calc(env(safe-area-inset-bottom)+4.25rem))] sm:right-5 lg:bottom-8"
    >
      <div
        id={menuId}
        role="menu"
        aria-hidden={!open}
        className={`flex w-[min(calc(100vw-2rem),17.5rem)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-[0_18px_40px_rgba(26,39,68,0.22)] backdrop-blur-md transition-all duration-300 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible absolute bottom-full mb-3 translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            ติดต่อ Planasia
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#1A2744]">เลือกช่องทางที่สะดวก</p>
        </div>

        <a
          role="menuitem"
          href={`tel:${phoneTel}`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A2744] text-white">
            <Phone className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-900">โทรหาเรา</span>
            <span className="block truncate text-xs text-slate-500 tabular-nums">
              {contactPhone}
            </span>
          </span>
        </a>

        {hasLine ? (
          <a
            role="menuitem"
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-t border-slate-100 px-4 py-3.5 transition-colors hover:bg-[#06C755]/[0.06] focus-visible:bg-[#06C755]/[0.06] focus-visible:outline-none"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#06C755] text-white">
              <LineIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">แชทผ่าน LINE</span>
              <span className="block text-xs text-slate-500">ตอบกลับรวดเร็วในเวลาทำการ</span>
            </span>
          </a>
        ) : (
          <div className="border-t border-slate-100 px-4 py-3.5">
            <p className="text-xs leading-relaxed text-slate-400">
              ยังไม่ได้ตั้งค่าลิงก์ LINE — เพิ่มได้ที่ Admin → ส่วนท้ายเว็บ
            </p>
          </div>
        )}
      </div>

      {/* Mobile uses bottom-nav Chat; keep FAB trigger on desktop only. */}
      <button
        type="button"
        aria-label={open ? "ปิดเมนูติดต่อ" : "เปิดเมนูติดต่อ"}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={`pointer-events-auto group relative h-14 w-14 items-center justify-center rounded-full text-white transition duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066FF] active:scale-95 ${
          open
            ? "inline-flex bg-blue-700 shadow-[0_10px_28px_rgba(0,102,255,0.4)]"
            : hideTrigger
              ? "hidden"
              : "hidden bg-[#0066FF] shadow-[0_12px_32px_rgba(0,102,255,0.45)] hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-[0_16px_36px_rgba(0,102,255,0.55)] lg:inline-flex"
        }`}
      >
        <span
          className={`absolute inset-[-3px] rounded-full border border-blue-300/50 transition duration-300 ${
            open ? "scale-90 opacity-0" : "opacity-100"
          }`}
          aria-hidden
        />
        <span className="relative flex h-full w-full items-center justify-center">
          {open ? (
            <X className="h-6 w-6 transition-transform duration-300" strokeWidth={2.25} />
          ) : (
            <MessageCircle
              className="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
              strokeWidth={2.25}
            />
          )}
        </span>
      </button>
    </div>
  );
}
