"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  CONSTRUCTION_CONTENT,
  REFUND_CONTENT,
  TERMS_CONTENT,
  type LegalDocument,
} from "@/lib/legal/content";

export type ListingPolicyId = "refund" | "construction" | "copyright";

function copyrightDocument(locale: keyof typeof TERMS_CONTENT): LegalDocument {
  const terms = TERMS_CONTENT[locale] ?? TERMS_CONTENT.en;
  const section =
    terms.sections.find(
      (s) =>
        s.heading.includes("3.3") ||
        s.heading.toLowerCase().includes("copyright") ||
        s.heading.includes("ลิขสิทธิ์"),
    ) ?? terms.sections[2];

  return {
    title:
      locale === "th"
        ? "ข้อมูลลิขสิทธิ์"
        : locale === "vi"
          ? "Thông tin bản quyền"
          : "Copyright information",
    sections: section
      ? [{ heading: section.heading, body: section.body }]
      : [],
  };
}

function getListingPolicyDocument(
  id: ListingPolicyId,
  locale: keyof typeof REFUND_CONTENT,
): LegalDocument {
  if (id === "refund") return REFUND_CONTENT[locale] ?? REFUND_CONTENT.en;
  if (id === "construction") {
    return CONSTRUCTION_CONTENT[locale] ?? CONSTRUCTION_CONTENT.en;
  }
  return copyrightDocument(locale);
}

interface ListingPolicyPopupProps {
  policyId: ListingPolicyId;
  onClose: () => void;
}

export function ListingPolicyPopup({ policyId, onClose }: ListingPolicyPopupProps) {
  const { locale } = useApp();
  const policy = getListingPolicyDocument(policyId, locale);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-policy-title"
        className="flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <h2
            id="listing-policy-title"
            className="min-w-0 pr-2 text-base font-bold leading-snug text-[#1e3a5f] sm:text-lg"
          >
            {policy.title.replace(/^\d+\.\s*/, "")}
          </h2>
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
          <div className="space-y-4">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-sm font-semibold text-[#1e3a5f]">
                  {section.heading.replace(/^\d+(\.\d+)?\s*/, "")}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
