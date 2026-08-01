/**
 * Build buyer-facing download URLs after post-payment translation.
 */

import "server-only";

import type { DownloadGrant } from "@/lib/payments/tokens";
import type { CartOrder } from "@/lib/store/cart-orders";
import type { PostPaymentTranslationResult } from "@/lib/gemini/post-payment-translation";
import { documentLanguageToStampLocale } from "@/lib/store/document-languages";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

export type BuyerDownloadLink = {
  token: string;
  planId: string;
  format: string;
  label: string;
  /** Prefer this for localized orders — serves translated storage when ready. */
  downloadUrl: string;
  /** Original vendor PDF (always available). */
  originalDownloadUrl: string;
  docLang: string;
  targetCountry: string;
  variant: "translated" | "original";
  translatedFilename?: string;
  mode?: string;
};

export function buildBuyerDownloadLinks(opts: {
  order: CartOrder;
  grants: DownloadGrant[];
  translation?: PostPaymentTranslationResult;
}): BuyerDownloadLink[] {
  const docLang = opts.order.documentLanguage ?? "th";
  const stampLocale = documentLanguageToStampLocale(docLang);
  const targetCountry =
    opts.order.targetCountry ?? opts.translation?.target_country ?? "TH";
  const buyer = opts.order.buyerName?.trim()
    ? `&buyer=${encodeURIComponent(opts.order.buyerName.trim())}`
    : "";
  const wantsTranslated =
    !THAI_DOMESTIC_MARKET &&
    docLang !== "th" &&
    targetCountry.toUpperCase() !== "TH";
  const translationReady = opts.translation?.status === "completed";

  const packs = opts.translation?.blueprints ?? [];

  return opts.grants
    .filter((g) => g.format === "pdf")
    .map((g, index) => {
      const packIndex = g.fileIndex ?? index;
      const pack =
        packs.find((b, i) => !b.error && i === packIndex) ||
        packs.filter((b) => !b.error)[packIndex] ||
        packs.find((b) => !b.error);

      const originalDownloadUrl = `/api/download?token=${g.token}&format=${g.format}&locale=${stampLocale}${buyer}&docLang=${docLang}&variant=original`;
      const translatedDownloadUrl = `/api/download?token=${g.token}&format=${g.format}&locale=${stampLocale}${buyer}&docLang=${docLang}&variant=translated`;

      const useTranslated =
        wantsTranslated &&
        translationReady &&
        Boolean(pack?.translatedStorageRef || pack?.pdfBase64 || pack?.markdownBase64);

      return {
        token: g.token,
        planId: g.planId,
        format: g.format,
        label: useTranslated
          ? pack?.translatedFilename || `${g.planId} (translated)`
          : `${g.planId}.pdf`,
        downloadUrl: useTranslated ? translatedDownloadUrl : originalDownloadUrl,
        originalDownloadUrl,
        docLang,
        targetCountry,
        variant: useTranslated ? ("translated" as const) : ("original" as const),
        translatedFilename: pack?.translatedFilename,
        mode: pack?.mode,
      };
    });
}
