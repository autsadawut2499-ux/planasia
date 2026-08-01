/**
 * Post-payment full construction-blueprint PDF translation.
 *
 * After a foreign-country order is paid:
 *  1. Load vendor blueprint PDF bytes for each listing (no OCR at upload time)
 *  2. Conditional translate: text-layer → Document Translation; scanned → Vision OCR → text Translation
 *  3. Persist outputs in private storage + order.translation_result
 *  4. Caller emails the translated files to the buyer (when size allows)
 */

import "server-only";

import type { CartOrder } from "@/lib/store/cart-orders";
import { getListingById } from "@/lib/store/db";
import {
  filenameFromUrl,
  getListingBlueprintUrls,
} from "@/lib/store/listing-blueprints";
import {
  fetchAssetBytes,
  uploadPrivateBytes,
} from "@/lib/supabase/private-assets";
import {
  getDocumentLanguage,
  type DocumentLanguage,
} from "@/lib/store/document-languages";
import { resolveGeminiMarketCountry } from "@/lib/gemini/regional-units";
import { toCloudTranslateLanguageCode } from "@/lib/google-cloud/document-translation";
import {
  isConditionalPdfTranslationReady,
  translatePdfConditional,
} from "@/lib/google-cloud/conditional-pdf-translation";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export type TranslationJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "skipped";

export interface TranslatedBlueprintFile {
  sourceFilename: string;
  sourceUrl?: string;
  sourceBytes: number;
  /** Attachment / download filename for the translated PDF. */
  translatedFilename: string;
  translatedBytes: number;
  /** Private storage ref for the translated PDF (preferred persistence). */
  translatedStorageRef?: string;
  /**
   * Base64 of translated PDF for email attach when under size budget.
   * Omitted from persisted order JSON when large (see stripHeavyFields).
   */
  pdfBase64?: string;
  mimeType?: string;
  model?: string;
  detectedLanguageCode?: string;
  /** @deprecated Gemini markdown path — kept for older order rows. */
  markdown?: string;
  /** @deprecated Gemini markdown path. */
  markdownBase64?: string;
  /** document-translation | ocr-text-translation */
  mode?: "document-translation" | "ocr-text-translation";
  hasSelectableText?: boolean;
  provider: "google-cloud" | "google-cloud-ocr-text" | "gemini" | "passthrough";
  error?: string;
}

export interface PostPaymentTranslationResult {
  status: TranslationJobStatus;
  target_country: string;
  /** Human-readable language name (e.g. "Khmer"). */
  target_language: string;
  /** Cloud Translation language code (e.g. "km"). */
  target_language_code: string;
  system_instruction_applied: boolean;
  engine:
    | "google-cloud-document-translation"
    | "google-cloud-conditional"
    | "gemini-markdown"
    | "none";
  /** @deprecated Prefer `blueprints` — kept for older email/UI readers. */
  listings: Array<{
    listingId: string;
    planId: string;
    name: string;
    description: string;
    tagline?: string;
    highlights?: string;
    document_translation?: string;
    blueprints?: TranslatedBlueprintFile[];
  }>;
  /** Flat list of all translated blueprint packages for the order. */
  blueprints: TranslatedBlueprintFile[];
  error?: string;
}

const MAX_PDFS_PER_LISTING = 12;

const DOC_LANG_CODES: readonly DocumentLanguage[] = [
  "th",
  "en",
  "lo",
  "km",
  "vi",
  "my",
  "id",
  "zh",
  "hi",
  "es",
  "pt",
  "fr",
  "ar",
  "bn",
  "tl",
] as const;

/** True when the order needs blueprint localization (non-Thailand market). */
export function orderNeedsPostPaymentTranslation(order: CartOrder): boolean {
  const target = resolveGeminiMarketCountry(order.targetCountry ?? "TH");
  return target !== "TH";
}

function resolveDocumentLanguage(order: CartOrder): DocumentLanguage {
  const raw = order.documentLanguage ?? "en";
  return (DOC_LANG_CODES.includes(raw as DocumentLanguage) ? raw : "en") as DocumentLanguage;
}

function resolveTargetLanguageName(order: CartOrder): string {
  return getDocumentLanguage(resolveDocumentLanguage(order)).nameEn;
}

async function updateOrderTranslation(
  orderId: string,
  status: TranslationJobStatus,
  result?: PostPaymentTranslationResult | null,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const patch: Record<string, unknown> = { translation_status: status };
  if (result) patch.translation_result = stripHeavyFields(result);
  const { error } = await getSupabaseAdmin()
    .from("cart_orders")
    .update(patch)
    .eq("id", orderId);
  if (error) {
    console.error("[post-payment-translation] failed to persist status", error.message);
  }
}

/** Drop oversized base64 blobs before writing translation_result jsonb. */
function stripHeavyFields(
  result: PostPaymentTranslationResult,
): PostPaymentTranslationResult {
  const slimBlueprints = result.blueprints.map((b) => slimBlueprint(b));
  return {
    ...result,
    blueprints: slimBlueprints,
    listings: result.listings.map((L) => ({
      ...L,
      document_translation: undefined,
      blueprints: L.blueprints?.map((b) => slimBlueprint(b)),
    })),
  };
}

function slimBlueprint(b: TranslatedBlueprintFile): TranslatedBlueprintFile {
  const out: TranslatedBlueprintFile = { ...b };
  delete out.markdown;
  delete out.markdownBase64;
  // Prefer private storage ref in jsonb — drop heavy base64 when uploaded.
  if (out.translatedStorageRef) delete out.pdfBase64;
  return out;
}

async function loadListingBlueprintPdfs(
  listingId: string,
  planId: string,
): Promise<Array<{ bytes: Buffer; filename: string; url: string }>> {
  const urls = await getListingBlueprintUrls(listingId);
  const out: Array<{ bytes: Buffer; filename: string; url: string }> = [];

  for (const url of urls.slice(0, MAX_PDFS_PER_LISTING)) {
    const asset = await fetchAssetBytes(url);
    if (!asset?.bytes?.length) {
      console.warn("[post-payment-translation] failed to fetch blueprint", {
        listingId,
        planId,
        url: url.slice(0, 80),
      });
      continue;
    }
    const filename = filenameFromUrl(url, `${planId}-${out.length + 1}.pdf`);
    const safeName = filename.toLowerCase().endsWith(".pdf")
      ? filename
      : `${filename}.pdf`;
    out.push({ bytes: asset.bytes, filename: safeName, url });
  }

  return out;
}

function toTranslatedFilename(
  planId: string,
  sourceFilename: string,
  country: string,
  langCode: string,
  ext: "pdf" | "md" = "pdf",
): string {
  const stem = sourceFilename.replace(/\.pdf$/i, "").replace(/[^\w.\-()+ ]+/g, "_");
  return `translated-${planId}-${country}-${langCode}-${stem}.${ext}`;
}

/**
 * After payment: translate purchased blueprint PDFs with Cloud Document Translation.
 * Idempotent — skips when already completed or when target is Thailand.
 */
export async function runPostPaymentTranslation(
  order: CartOrder,
): Promise<PostPaymentTranslationResult> {
  const target_country = resolveGeminiMarketCountry(order.targetCountry ?? "TH");
  const docLang = resolveDocumentLanguage(order);
  const target_language = resolveTargetLanguageName(order);
  const target_language_code = toCloudTranslateLanguageCode(docLang);

  if (order.translationStatus === "completed" && order.translationResult) {
    return order.translationResult as unknown as PostPaymentTranslationResult;
  }

  if (target_country === "TH") {
    const skipped: PostPaymentTranslationResult = {
      status: "skipped",
      target_country,
      target_language,
      target_language_code,
      system_instruction_applied: false,
      engine: "none",
      listings: [],
      blueprints: [],
      error: "Thailand market — blueprint localization not required",
    };
    await updateOrderTranslation(order.id, "skipped", skipped);
    return skipped;
  }

  if (!isConditionalPdfTranslationReady()) {
    const skipped: PostPaymentTranslationResult = {
      status: "skipped",
      target_country,
      target_language,
      target_language_code,
      system_instruction_applied: false,
      engine: "none",
      listings: [],
      blueprints: [],
      error:
        "Google Cloud Translation / Vision not configured — set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON",
    };
    await updateOrderTranslation(order.id, "skipped", skipped);
    return skipped;
  }

  await updateOrderTranslation(order.id, "processing");

  const listingsOut: PostPaymentTranslationResult["listings"] = [];
  const blueprintsOut: TranslatedBlueprintFile[] = [];

  try {
    for (const item of order.items) {
      const listing = await getListingById(item.listingId);
      if (!listing) continue;

      const planId = listing.planCode || listing.planId || item.planId;
      const pdfs = await loadListingBlueprintPdfs(listing.id, planId);

      if (pdfs.length === 0) {
        console.warn("[post-payment-translation] no blueprint PDFs for listing", {
          listingId: listing.id,
          planId,
        });
        listingsOut.push({
          listingId: listing.id,
          planId,
          name: listing.name,
          description: listing.description,
          document_translation: undefined,
          blueprints: [],
        });
        continue;
      }

      const listingBlueprints: TranslatedBlueprintFile[] = [];

      for (const pdf of pdfs) {
        let pack: TranslatedBlueprintFile;
        try {
          const translated = await translatePdfConditional({
            bytes: pdf.bytes,
            filename: pdf.filename,
            targetLanguageCode: target_language_code,
            sourceLanguageCode: "th",
          });

          const translatedFilename = toTranslatedFilename(
            planId,
            pdf.filename,
            target_country,
            docLang,
            translated.outputExtension,
          );

          const storagePath = `translations/${order.id}/${translatedFilename}`;
          const translatedStorageRef = await uploadPrivateBytes({
            path: storagePath,
            bytes: translated.bytes,
            contentType: translated.mimeType || "application/pdf",
            upsert: true,
          });

          const isPdf = translated.outputExtension === "pdf";
          pack = {
            sourceFilename: pdf.filename,
            sourceUrl: pdf.url,
            sourceBytes: pdf.bytes.length,
            translatedFilename,
            translatedBytes: translated.bytes.length,
            translatedStorageRef: translatedStorageRef ?? undefined,
            pdfBase64: isPdf ? translated.bytes.toString("base64") : undefined,
            markdown: !isPdf ? translated.translatedText : undefined,
            markdownBase64: !isPdf ? translated.bytes.toString("base64") : undefined,
            mimeType: translated.mimeType,
            model: translated.model,
            detectedLanguageCode: translated.detectedLanguageCode,
            mode: translated.mode,
            hasSelectableText: translated.hasSelectableText,
            provider: translated.provider,
          };

          if (!translatedStorageRef) {
            console.warn(
              "[post-payment-translation] storage upload failed — keeping in-memory payload only",
              { orderId: order.id, translatedFilename },
            );
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "PDF translation failed";
          console.error(
            "[post-payment-translation] PDF failed",
            planId,
            pdf.filename,
            message,
          );
          pack = {
            sourceFilename: pdf.filename,
            sourceUrl: pdf.url,
            sourceBytes: pdf.bytes.length,
            translatedFilename: toTranslatedFilename(
              planId,
              pdf.filename,
              target_country,
              docLang,
              "pdf",
            ),
            translatedBytes: 0,
            provider: "passthrough",
            error: message,
          };
        }

        listingBlueprints.push(pack);
        blueprintsOut.push(pack);
      }

      listingsOut.push({
        listingId: listing.id,
        planId,
        name: listing.name,
        description: listing.description,
        blueprints: listingBlueprints,
      });
    }

    if (blueprintsOut.length === 0) {
      throw new Error(
        "No blueprint PDF files could be loaded for translation — seller may not have uploaded PDFs",
      );
    }

    const anyOk = blueprintsOut.some(
      (b) =>
        (b.provider === "google-cloud" || b.provider === "google-cloud-ocr-text") &&
        !b.error,
    );
    const completed: PostPaymentTranslationResult = {
      status: anyOk ? "completed" : "failed",
      target_country,
      target_language,
      target_language_code,
      system_instruction_applied: true,
      engine: "google-cloud-conditional",
      listings: listingsOut,
      blueprints: blueprintsOut,
      error: anyOk
        ? undefined
        : "All blueprint PDF translations failed or returned passthrough",
    };

    await updateOrderTranslation(order.id, completed.status, completed);
    console.info(
      "[post-payment-translation] done",
      order.id,
      target_country,
      target_language_code,
      `${blueprintsOut.length} PDF(s)`,
      completed.status,
      "google-cloud",
    );
    return completed;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    const failed: PostPaymentTranslationResult = {
      status: "failed",
      target_country,
      target_language,
      target_language_code,
      system_instruction_applied: true,
      engine: "google-cloud-conditional",
      listings: listingsOut,
      blueprints: blueprintsOut,
      error: message,
    };
    await updateOrderTranslation(order.id, "failed", failed);
    console.error("[post-payment-translation]", order.id, message);
    return failed;
  }
}
