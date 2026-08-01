import "server-only";

import type { DownloadGrant } from "@/lib/payments/tokens";
import type { CartOrder } from "@/lib/store/cart-orders";
import { isDocumentLanguage, type DocumentLanguage } from "@/lib/store/document-languages";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

export interface TranslatedBlueprintDownload {
  translatedStorageRef: string;
  translatedFilename: string;
  mimeType?: string;
  provider?: string;
}

type TranslationBlueprint = {
  sourceFilename?: unknown;
  sourceUrl?: unknown;
  translatedFilename?: unknown;
  translatedStorageRef?: unknown;
  translatedBytes?: unknown;
  mimeType?: unknown;
  provider?: unknown;
  error?: unknown;
};

type TranslationListing = {
  listingId?: unknown;
  planId?: unknown;
  blueprints?: unknown;
};

type TranslationResult = {
  status?: unknown;
  blueprints?: unknown;
  listings?: unknown;
};

export function parseDocumentLanguage(value: string | null): DocumentLanguage | undefined {
  return isDocumentLanguage(value) ? value : undefined;
}

export function shouldAttemptTranslatedDownload(opts: {
  format: "pdf" | "cad";
  docLang?: DocumentLanguage;
  variant?: string | null;
}): boolean {
  if (THAI_DOMESTIC_MARKET) return false;
  if (opts.format !== "pdf") return false;
  if (opts.variant === "original") return false;
  if (opts.variant === "translated") return true;
  return Boolean(opts.docLang && opts.docLang !== "th");
}

export function resolveTranslatedBlueprintForGrant(opts: {
  order: CartOrder | null;
  grant: DownloadGrant;
  sourceUrl?: string;
  sourceFilename?: string;
}): TranslatedBlueprintDownload | null {
  const order = opts.order;
  if (!order?.translationResult) return null;
  if (
    order.translationStatus &&
    order.translationStatus !== "completed" &&
    order.translationStatus !== "skipped"
  ) {
    return null;
  }

  const result = order.translationResult as TranslationResult;
  if (result.status && result.status !== "completed") return null;

  const candidates = collectCandidates(result);
  const sourceUrl = normalize(opts.sourceUrl);
  const sourceFilename = normalize(opts.sourceFilename).toLowerCase();
  const listingId = normalize(opts.grant.listingId);
  const planId = normalize(opts.grant.planId).toLowerCase();

  const scored = candidates
    .map((candidate, index) => ({
      candidate,
      index,
      score: scoreCandidate(candidate, {
        sourceUrl,
        sourceFilename,
        listingId,
        planId,
      }),
    }))
    .filter(({ candidate, score }) => score > 0 && isUsableTranslatedPack(candidate.blueprint))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const best = scored[0]?.candidate.blueprint;
  if (!best || typeof best.translatedStorageRef !== "string") return null;

  return {
    translatedStorageRef: best.translatedStorageRef,
    translatedFilename:
      typeof best.translatedFilename === "string" && best.translatedFilename.trim()
        ? best.translatedFilename.trim()
        : "translated-blueprint.pdf",
    mimeType: typeof best.mimeType === "string" ? best.mimeType : undefined,
    provider: typeof best.provider === "string" ? best.provider : undefined,
  };
}

function collectCandidates(result: TranslationResult): Array<{
  listingId?: string;
  planId?: string;
  blueprint: TranslationBlueprint;
}> {
  const out: Array<{ listingId?: string; planId?: string; blueprint: TranslationBlueprint }> = [];

  if (Array.isArray(result.listings)) {
    for (const rawListing of result.listings) {
      const listing = rawListing as TranslationListing;
      if (!Array.isArray(listing.blueprints)) continue;
      for (const rawBlueprint of listing.blueprints) {
        if (!isRecord(rawBlueprint)) continue;
        out.push({
          listingId: typeof listing.listingId === "string" ? listing.listingId : undefined,
          planId: typeof listing.planId === "string" ? listing.planId : undefined,
          blueprint: rawBlueprint as TranslationBlueprint,
        });
      }
    }
  }

  if (Array.isArray(result.blueprints)) {
    for (const rawBlueprint of result.blueprints) {
      if (!isRecord(rawBlueprint)) continue;
      out.push({ blueprint: rawBlueprint as TranslationBlueprint });
    }
  }

  return out;
}

function scoreCandidate(
  candidate: { listingId?: string; planId?: string; blueprint: TranslationBlueprint },
  target: {
    sourceUrl: string;
    sourceFilename: string;
    listingId: string;
    planId: string;
  },
): number {
  let score = 0;
  const candidateUrl = normalize(candidate.blueprint.sourceUrl);
  const candidateFilename = normalize(candidate.blueprint.sourceFilename).toLowerCase();
  const candidateListingId = normalize(candidate.listingId);
  const candidatePlanId = normalize(candidate.planId).toLowerCase();

  if (target.sourceUrl && candidateUrl && candidateUrl === target.sourceUrl) score += 100;
  if (target.sourceFilename && candidateFilename && candidateFilename === target.sourceFilename) {
    score += 40;
  }
  if (target.listingId && candidateListingId && candidateListingId === target.listingId) {
    score += 20;
  }
  if (target.planId && candidatePlanId && candidatePlanId === target.planId) score += 10;

  return score;
}

function isUsableTranslatedPack(pack: TranslationBlueprint): boolean {
  const translatedBytes =
    typeof pack.translatedBytes === "number" ? pack.translatedBytes : undefined;
  return (
    !pack.error &&
    typeof pack.translatedStorageRef === "string" &&
    pack.translatedStorageRef.trim().length > 0 &&
    translatedBytes !== 0
  );
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
