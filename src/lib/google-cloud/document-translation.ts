/**
 * Cloud Translation Advanced (v3) — Document Translation for blueprint PDFs.
 * Server-only. Uses a service account (not the Basic API key).
 */

import "server-only";

import translate from "@google-cloud/translate";
import {
  isGoogleCloudAuthConfigured,
  resolveGoogleCloudAuth,
} from "@/lib/google-cloud/credentials";
import type { DocumentLanguage } from "@/lib/store/document-languages";

const { TranslationServiceClient } = translate.v3;

export type DocumentTranslationProvider = "google-cloud";

export interface TranslateDocumentPdfInput {
  bytes: Buffer;
  /** BCP-47 / Cloud Translation target, e.g. km, en, vi */
  targetLanguageCode: string;
  /** Optional source; omit to auto-detect. */
  sourceLanguageCode?: string;
  /** Prefer native-PDF page limits when true (default true for CAD exports). */
  nativePdfOnly?: boolean;
  mimeType?: string;
}

export interface TranslateDocumentPdfResult {
  bytes: Buffer;
  mimeType: string;
  model?: string;
  detectedLanguageCode?: string;
  provider: DocumentTranslationProvider;
}

type TranslationClient = InstanceType<typeof TranslationServiceClient>;

let cachedClient: TranslationClient | null = null;
let cachedProjectId: string | null = null;

function documentTranslationEnabled(): boolean {
  const flag = process.env.GOOGLE_DOCUMENT_TRANSLATION_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "off") return false;
  return true;
}

/** Ready for post-payment blueprint Document Translation. */
export function isDocumentTranslationReady(): boolean {
  return documentTranslationEnabled() && isGoogleCloudAuthConfigured();
}

export function getDocumentTranslationLocation(): string {
  return process.env.TRANSLATE_LOCATION?.trim() || "us-central1";
}

/**
 * Map Planasia document-language codes to Cloud Translation language codes.
 * @see https://cloud.google.com/translate/docs/languages
 */
export function toCloudTranslateLanguageCode(
  code: DocumentLanguage | string,
): string {
  switch (code) {
    case "zh":
      return "zh-CN";
    case "tl":
      return "fil";
    default:
      return code;
  }
}

function getClient(): {
  client: TranslationClient;
  projectId: string;
} {
  if (cachedClient && cachedProjectId) {
    return { client: cachedClient, projectId: cachedProjectId };
  }
  const auth = resolveGoogleCloudAuth();
  cachedClient = new TranslationServiceClient({
    projectId: auth.projectId,
    credentials: {
      client_email: auth.credentials.client_email,
      private_key: auth.credentials.private_key,
    },
  });
  cachedProjectId = auth.projectId;
  return { client: cachedClient, projectId: auth.projectId };
}

/**
 * Synchronously translate one PDF via translateDocument (inline bytes).
 * Regional location required (default us-central1).
 */
export async function translateDocumentPdf(
  input: TranslateDocumentPdfInput,
): Promise<TranslateDocumentPdfResult> {
  if (!isDocumentTranslationReady()) {
    throw new Error(
      "Google Cloud Document Translation is not configured (credentials / GOOGLE_DOCUMENT_TRANSLATION_ENABLED)",
    );
  }
  if (!input.bytes?.length) {
    throw new Error("translateDocumentPdf: empty PDF bytes");
  }

  const { client, projectId } = getClient();
  const location = getDocumentTranslationLocation();
  const parent = `projects/${projectId}/locations/${location}`;
  const mimeType = input.mimeType || "application/pdf";

  const request: Record<string, unknown> = {
    parent,
    targetLanguageCode: input.targetLanguageCode,
    documentInputConfig: {
      content: input.bytes,
      mimeType,
    },
  };
  if (input.sourceLanguageCode) {
    request.sourceLanguageCode = input.sourceLanguageCode;
  }
  if (input.nativePdfOnly !== false) {
    request.isTranslateNativePdfOnly = true;
  }

  const [response] = await client.translateDocument(request);
  const outputs = response.documentTranslation?.byteStreamOutputs;
  if (!outputs?.length) {
    throw new Error("translateDocument returned no byteStreamOutputs");
  }

  const raw = outputs[0];
  const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from(raw as Uint8Array);

  return {
    bytes,
    mimeType: response.documentTranslation?.mimeType || mimeType,
    model: response.model || undefined,
    detectedLanguageCode:
      response.documentTranslation?.detectedLanguageCode || undefined,
    provider: "google-cloud",
  };
}
