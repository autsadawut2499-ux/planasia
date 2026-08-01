/**
 * Cloud Translation Advanced (v3) — plain text translateText.
 * Used after Vision OCR for scanned blueprints (no layout PDF rebuild).
 */

import "server-only";

import translate from "@google-cloud/translate";
import {
  isGoogleCloudAuthConfigured,
  resolveGoogleCloudAuth,
} from "@/lib/google-cloud/credentials";
import { getDocumentTranslationLocation } from "@/lib/google-cloud/document-translation";

const { TranslationServiceClient } = translate.v3;

type TranslationClient = InstanceType<typeof TranslationServiceClient>;

let cachedClient: TranslationClient | null = null;
let cachedProjectId: string | null = null;

/** Soft chunk size for translateText (chars). */
const CHUNK_CHARS = 4500;

function getClient(): { client: TranslationClient; projectId: string } {
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

export function isTextTranslationReady(): boolean {
  return isGoogleCloudAuthConfigured();
}

function splitForTranslation(text: string): string[] {
  if (text.length <= CHUNK_CHARS) return [text];
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    if (rest.length <= CHUNK_CHARS) {
      chunks.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n\n", CHUNK_CHARS);
    if (cut < CHUNK_CHARS * 0.4) cut = rest.lastIndexOf("\n", CHUNK_CHARS);
    if (cut < CHUNK_CHARS * 0.4) cut = rest.lastIndexOf(" ", CHUNK_CHARS);
    if (cut < CHUNK_CHARS * 0.4) cut = CHUNK_CHARS;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\s+/, "");
  }
  return chunks;
}

export interface TranslatePlainTextResult {
  translatedText: string;
  detectedLanguageCode?: string;
  model?: string;
  provider: "google-cloud-text";
}

/**
 * Translate OCR / plain text via Translation API v3 translateText.
 */
export async function translatePlainText(opts: {
  text: string;
  targetLanguageCode: string;
  sourceLanguageCode?: string;
}): Promise<TranslatePlainTextResult> {
  if (!isTextTranslationReady()) {
    throw new Error("Google Cloud Translation credentials not configured");
  }
  const raw = opts.text?.trim();
  if (!raw) {
    return {
      translatedText: "",
      provider: "google-cloud-text",
    };
  }

  const { client, projectId } = getClient();
  const location = getDocumentTranslationLocation();
  const parent = `projects/${projectId}/locations/${location}`;
  const chunks = splitForTranslation(raw);

  const translatedParts: string[] = [];
  let detectedLanguageCode: string | undefined;

  for (const chunk of chunks) {
    const request: Record<string, unknown> = {
      parent,
      contents: [chunk],
      mimeType: "text/plain",
      targetLanguageCode: opts.targetLanguageCode,
    };
    if (opts.sourceLanguageCode) {
      request.sourceLanguageCode = opts.sourceLanguageCode;
    }

    const [response] = await client.translateText(request);
    const t = response.translations?.[0];
    translatedParts.push(t?.translatedText ?? "");
    if (!detectedLanguageCode && t?.detectedLanguageCode) {
      detectedLanguageCode = t.detectedLanguageCode;
    }
  }

  return {
    translatedText: translatedParts.join("\n\n"),
    detectedLanguageCode,
    model: `projects/${projectId}/locations/${location}/models/general/nmt`,
    provider: "google-cloud-text",
  };
}
