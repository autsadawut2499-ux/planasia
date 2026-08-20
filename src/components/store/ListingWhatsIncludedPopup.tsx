"use client";

import { Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useApp } from "@/context/AppContext";
import {
  DEFAULT_PLAN_INCLUDES,
  planIncludesBlocks,
  type PlanIncludesContent,
} from "@/lib/content/plan-includes";

interface IncludeItem {
  title: string;
  detail: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Pair heading + following paragraph into checklist rows; skip intro & “how to use”. */
function buildIncludeList(body: string): IncludeItem[] {
  const blocks = planIncludesBlocks(stripHtml(body));
  const items: IncludeItem[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type !== "heading") continue;
    if (/วิธีใช้|how to use/i.test(block.text)) break;
    const next = blocks[i + 1];
    const detail =
      next?.type === "paragraph" ? next.text.replace(/\s+/g, " ").trim() : "";
    if (next?.type === "paragraph") i += 1;
    items.push({ title: block.text, detail });
  }
  return items;
}

/** Fallback checklist when CMS body cannot be parsed into headings. */
const FALLBACK_ITEMS: Array<{ title: { en: string; th: string }; detail: { en: string; th: string } }> = [
  {
    title: { en: "Full printed sets (A3 × 3)", th: "เอกสารรูปเล่ม ฉบับเต็ม 3 ชุด ขนาด A3" },
    detail: {
      en: "Complete hard-copy drawing sets in A3 — three copies included in the main package.",
      th: "ชุดแบบรูปเล่มครบ ขนาด A3 จำนวน 3 ชุด รวมในแพ็กเกจหลัก",
    },
  },
  {
    title: { en: "BOQ for bank loan", th: "ใบ BOQ สำหรับยื่นกู้ธนาคาร" },
    detail: {
      en: "Bill of quantities formatted for bank loan / mortgage applications.",
      th: "ใบรายการปริมาณวัสดุสำหรับใช้ยื่นกู้ธนาคาร",
    },
  },
  {
    title: { en: "Cost estimate sheet", th: "ใบประมาณราคา" },
    detail: {
      en: "Preliminary cost estimate sheet to plan your construction budget.",
      th: "ใบประมาณราคาเบื้องต้นสำหรับวางแผนงบก่อสร้าง",
    },
  },
];

interface ListingWhatsIncludedPopupProps {
  onClose: () => void;
}

export function ListingWhatsIncludedPopup({ onClose }: ListingWhatsIncludedPopupProps) {
  const L = useBilingual();
  const { locale } = useApp();
  const [content, setContent] = useState<PlanIncludesContent>(DEFAULT_PLAN_INCLUDES);

  useEffect(() => {
    let active = true;
    fetch("/api/plan-includes", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { content?: PlanIncludesContent }) => {
        if (active && data.content) setContent(data.content);
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const title = L(content.title.en, content.title.th);
  const intro = L(content.intro.en, content.intro.th);
  const body = L(content.body.en, content.body.th);

  const items = useMemo(() => {
    const parsed = buildIncludeList(body);
    if (parsed.length > 0) return parsed;
    return FALLBACK_ITEMS.map((item) => ({
      title: locale === "th" ? item.title.th : item.title.en,
      detail: locale === "th" ? item.detail.th : item.detail.en,
    }));
  }, [body, locale]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-included-title"
        className="flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div className="min-w-0 pr-2">
            <h2
              id="whats-included-title"
              className="text-base font-bold leading-snug text-[#1e3a5f] sm:text-lg"
            >
              {title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-[13px]">
              {intro}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.title}
                className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e40af]/10 text-[#1e40af]">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1e3a5f]">{item.title}</p>
                  {item.detail ? (
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
