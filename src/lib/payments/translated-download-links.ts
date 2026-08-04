/**
 * Build buyer-facing download URLs after post-payment translation.
 */

import "server-only";

import type { DownloadGrant } from "@/lib/payments/tokens";
import type { CartOrder } from "@/lib/store/cart-orders";
import type { PostPaymentTranslationResult } from "@/lib/gemini/post-payment-translation";
import { documentLanguageToStampLocale } from "@/lib/store/document-languages";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";
import {
  deliveryKindSortKey,
  resolveDeliveryFileKind,
  standardizedDeliveryFilename,
  standardizedDownloadButtonLabel,
  type DeliveryFileKind,
} from "@/lib/payments/download-filenames";

export type BuyerDownloadLink = {
  token: string;
  planId: string;
  format: string;
  fileKind: DeliveryFileKind;
  /** English standardized label, e.g. Download MOD-008-Architectural-Plans.pdf */
  label: string;
  /** Filename shown / suggested for save-as (without "Download "). */
  filename: string;
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

  let blueprintOrdinal = 0;
  /** Ensures UI labels never collide even if two grants share the same fileIndex. */
  const displayIndexByKey = new Map<string, number>();

  const links: BuyerDownloadLink[] = opts.grants.map((g) => {
    const fileKind = resolveDeliveryFileKind({
      fileKind: g.fileKind,
      format: g.format,
    });
    const key = `${g.planId}::${fileKind}`;
    const displayIndex = displayIndexByKey.get(key) ?? 0;
    displayIndexByKey.set(key, displayIndex + 1);
    const fileIndex =
      typeof g.fileIndex === "number" && g.fileIndex >= 0 ? g.fileIndex : displayIndex;
    const filename = standardizedDeliveryFilename(g.planId, fileKind, displayIndex);
    const label = standardizedDownloadButtonLabel(g.planId, fileKind, displayIndex);

    const originalDownloadUrl = `/api/download?token=${g.token}&format=${g.format}&locale=${stampLocale}${buyer}&docLang=${docLang}&variant=original`;
    const translatedDownloadUrl = `/api/download?token=${g.token}&format=${g.format}&locale=${stampLocale}${buyer}&docLang=${docLang}&variant=translated`;

    let pack:
      | NonNullable<PostPaymentTranslationResult["blueprints"]>[number]
      | undefined;
    if (fileKind === "blueprint") {
      const packIndex = g.fileIndex ?? blueprintOrdinal;
      blueprintOrdinal += 1;
      pack =
        packs.find((b, i) => !b.error && i === packIndex) ||
        packs.filter((b) => !b.error)[packIndex] ||
        packs.find((b) => !b.error);
    }

    const useTranslated =
      fileKind === "blueprint" &&
      wantsTranslated &&
      translationReady &&
      Boolean(pack?.translatedStorageRef || pack?.pdfBase64 || pack?.markdownBase64);

    return {
      token: g.token,
      planId: g.planId,
      format: g.format,
      fileKind,
      label: useTranslated
        ? `Download ${pack?.translatedFilename || filename}`
        : label,
      filename: useTranslated ? pack?.translatedFilename || filename : filename,
      downloadUrl: useTranslated ? translatedDownloadUrl : originalDownloadUrl,
      originalDownloadUrl,
      docLang,
      targetCountry,
      variant: useTranslated ? ("translated" as const) : ("original" as const),
      translatedFilename: pack?.translatedFilename,
      mode: pack?.mode,
    };
  });

  return links.sort((a, b) => {
    if (a.planId !== b.planId) return a.planId.localeCompare(b.planId);
    const kindDiff = deliveryKindSortKey(a.fileKind) - deliveryKindSortKey(b.fileKind);
    if (kindDiff !== 0) return kindDiff;
    return a.filename.localeCompare(b.filename);
  });
}
