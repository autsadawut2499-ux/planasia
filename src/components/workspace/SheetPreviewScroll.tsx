"use client";

import { useApp } from "@/context/AppContext";
import type { TranslationKey } from "@/lib/i18n";
import type { SheetPreviewItem } from "@/lib/ai/types";
import { DiagonalWatermark } from "@/components/workspace/DiagonalWatermark";

const CATEGORY_LABEL: Record<SheetPreviewItem["category"], TranslationKey> = {
  A: "workspace.sheetArch",
  S: "workspace.sheetStructural",
  SN: "workspace.sheetSanitary",
  E: "workspace.sheetElectrical",
};

interface SheetPreviewScrollProps {
  sheets: SheetPreviewItem[];
  watermarked: boolean;
  generating?: boolean;
  projectName?: string;
}

export function SheetPreviewScroll({
  sheets,
  watermarked,
  generating,
  projectName,
}: SheetPreviewScrollProps) {
  const { locale, translate } = useApp();

  if (generating) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="relative mb-6 h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/30 bg-accent/10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        </div>
        <p className="text-sm font-medium text-text-primary">{translate("workspace.generating")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain scroll-smooth">
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#0a0a0c]/95 px-4 py-3 backdrop-blur-md md:px-6">
        <h2 className="text-sm font-semibold text-text-primary">{translate("workspace.sheetPreviewTitle")}</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          {projectName ? `${projectName} — ` : ""}
          {translate("workspace.sheetPreviewHint")}
        </p>
        {watermarked && (
          <p className="mt-1 text-xs text-amber-200/90">{translate("workspace.watermarkHint")}</p>
        )}
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 pb-24 md:px-6">
        {sheets.map((sheet) => (
          <article
            key={sheet.sheetNo}
            className="overflow-hidden rounded-lg border border-white/10 bg-white shadow-lg"
          >
            {/* Title block */}
            <div className="flex items-start justify-between border-b border-black/10 bg-neutral-50 px-4 py-3 text-black">
              <div>
                <p className="text-xs font-medium text-neutral-500">
                  {translate(CATEGORY_LABEL[sheet.category])}
                </p>
                <h3 className="text-sm font-bold">
                  {locale === "th" ? sheet.titleTh : sheet.title}
                </h3>
                {locale === "th" && (
                  <p className="text-xs text-neutral-600">{sheet.title}</p>
                )}
              </div>
              <div className="text-right text-xs text-neutral-600">
                <p className="font-mono font-bold">{sheet.sheetNo}</p>
                <p>{sheet.scale}</p>
              </div>
            </div>

            {/* Drawing area with watermark */}
            <div className="relative aspect-[1.414/1] w-full bg-white">
              <div
                className="absolute inset-0 p-4"
                dangerouslySetInnerHTML={{ __html: sheet.svg }}
              />
              <DiagonalWatermark active={watermarked} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
