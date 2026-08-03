/**
 * Manual / button-triggered blueprint translation with conditional OCR.
 *
 * Upload stays OCR-free. Call this when the user clicks Translate:
 *  - selectable text → Cloud Document Translation (PDF)
 *  - scanned image PDF → Vision OCR → Cloud Translation (markdown)
 *
 * Body (JSON):
 *  {
 *    "sourceUrl"?: string,          // private ref or public URL
 *    "listingId"?: string,          // resolve first blueprint if no sourceUrl
 *    "targetLanguage": "km",
 *    "sourceLanguage"?: "th",
 *    "forceOcr"?: boolean
 *  }
 *
 * Or multipart: file=<pdf> + fields targetLanguage, sourceLanguage, forceOcr
 */

import { NextRequest, NextResponse } from "next/server";
import {
  isConditionalPdfTranslationReady,
  translatePdfConditional,
} from "@/lib/google-cloud/conditional-pdf-translation";
import { toCloudTranslateLanguageCode } from "@/lib/google-cloud/document-translation";
import { analyzePdfTextLayer } from "@/lib/pdf/text-layer";
import {
  filenameFromUrl,
  getListingBlueprintUrls,
} from "@/lib/store/listing-assets";
import { fetchAssetBytes } from "@/lib/supabase/private-assets";
import {
  isDocumentLanguage,
  type DocumentLanguage,
} from "@/lib/store/document-languages";
import { THAI_DOMESTIC_MARKET } from "@/lib/market/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vision OCR on large scanned sets can exceed default limits. */
export const maxDuration = 300;

async function loadPdfFromRequest(
  request: NextRequest,
): Promise<{ bytes: Buffer; filename: string; targetLanguage: string; sourceLanguage?: string; forceOcr: boolean }> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const targetLanguage = String(form.get("targetLanguage") || "").trim();
    const sourceLanguage = String(form.get("sourceLanguage") || "").trim() || undefined;
    const forceOcr = String(form.get("forceOcr") || "").toLowerCase() === "true";
    if (!(file instanceof File)) {
      throw Object.assign(new Error("multipart field `file` (PDF) is required"), { status: 400 });
    }
    if (!targetLanguage) {
      throw Object.assign(new Error("targetLanguage is required"), { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    return {
      bytes,
      filename: file.name || "blueprint.pdf",
      targetLanguage,
      sourceLanguage,
      forceOcr,
    };
  }

  const body = (await request.json()) as {
    sourceUrl?: string;
    listingId?: string;
    targetLanguage?: string;
    sourceLanguage?: string;
    forceOcr?: boolean;
  };

  const targetLanguage = String(body.targetLanguage || "").trim();
  if (!targetLanguage) {
    throw Object.assign(new Error("targetLanguage is required"), { status: 400 });
  }

  let sourceUrl = body.sourceUrl?.trim();
  if (!sourceUrl && body.listingId) {
    const urls = await getListingBlueprintUrls(body.listingId);
    sourceUrl = urls[0];
  }
  if (!sourceUrl) {
    throw Object.assign(
      new Error("Provide sourceUrl, listingId, or multipart file"),
      { status: 400 },
    );
  }

  const asset = await fetchAssetBytes(sourceUrl);
  if (!asset?.bytes?.length) {
    throw Object.assign(new Error("Could not load source PDF"), { status: 502 });
  }

  return {
    bytes: asset.bytes,
    filename: filenameFromUrl(sourceUrl, "blueprint.pdf"),
    targetLanguage,
    sourceLanguage: body.sourceLanguage?.trim() || undefined,
    forceOcr: Boolean(body.forceOcr),
  };
}

export async function POST(request: NextRequest) {
  if (THAI_DOMESTIC_MARKET) {
    return NextResponse.json(
      {
        error:
          "Document translation is disabled — Planasia is running in Thailand-only mode",
      },
      { status: 410 },
    );
  }

  if (!isConditionalPdfTranslationReady()) {
    return NextResponse.json(
      {
        error:
          "Google Cloud Translation/Vision not ready — set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON",
      },
      { status: 503 },
    );
  }

  try {
    const loaded = await loadPdfFromRequest(request);
    const docLang = (
      isDocumentLanguage(loaded.targetLanguage) ? loaded.targetLanguage : "en"
    ) as DocumentLanguage;
    const targetLanguageCode = toCloudTranslateLanguageCode(docLang);

    // Analysis-only preview when ?analyze=1
    if (request.nextUrl.searchParams.get("analyze") === "1") {
      const analysis = await analyzePdfTextLayer(loaded.bytes);
      return NextResponse.json({
        filename: loaded.filename,
        analysis,
        recommendedRoute: analysis.hasSelectableText
          ? "document-translation"
          : "ocr-text-translation",
      });
    }

    const result = await translatePdfConditional({
      bytes: loaded.bytes,
      filename: loaded.filename,
      targetLanguageCode,
      sourceLanguageCode: loaded.sourceLanguage || "th",
      forceOcr: loaded.forceOcr,
    });

    return NextResponse.json({
      ok: true,
      mode: result.mode,
      hasSelectableText: result.hasSelectableText,
      textLayer: result.textLayer,
      mimeType: result.mimeType,
      outputExtension: result.outputExtension,
      model: result.model,
      detectedLanguageCode: result.detectedLanguageCode,
      provider: result.provider,
      /** Base64 of translated PDF or markdown package. */
      contentBase64: result.bytes.toString("base64"),
      byteLength: result.bytes.length,
      previewText:
        result.mode === "ocr-text-translation"
          ? (result.translatedText || "").slice(0, 2000)
          : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    const status = typeof (err as { status?: number })?.status === "number"
      ? (err as { status: number }).status
      : 500;
    console.error("[api/translate/document]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
