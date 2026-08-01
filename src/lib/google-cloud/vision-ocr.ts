/**
 * Google Cloud Vision — DOCUMENT_TEXT_DETECTION for scanned blueprint PDFs.
 *
 * Auth (either works):
 *  1. GOOGLE_VISION_API_KEY — REST files:annotate (API key)
 *  2. Service account via GOOGLE_APPLICATION_CREDENTIALS / GOOGLE_SERVICE_ACCOUNT_JSON
 *
 * Sync file annotation supports up to 5 pages per request; we chunk with pdf-lib.
 */

import "server-only";

import vision from "@google-cloud/vision";
import { PDFDocument } from "pdf-lib";
import {
  isGoogleCloudAuthConfigured,
  resolveGoogleCloudAuth,
} from "@/lib/google-cloud/credentials";

const { ImageAnnotatorClient } = vision;

/** Vision sync batchAnnotateFiles / files:annotate page limit. */
const VISION_SYNC_MAX_PAGES = 5;

export interface OcrPageResult {
  pageNumber: number;
  text: string;
}

export interface OcrPdfResult {
  pages: OcrPageResult[];
  /** Full document text with page markers. */
  fullText: string;
  pageCount: number;
  provider: "google-cloud-vision";
  authMode: "api-key" | "service-account";
}

type VisionClient = InstanceType<typeof ImageAnnotatorClient>;

let cachedClient: VisionClient | null = null;

function visionOcrEnabled(): boolean {
  const flag = process.env.GOOGLE_VISION_OCR_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "off") return false;
  return true;
}

export function getVisionApiKey(): string | undefined {
  const key =
    process.env.GOOGLE_VISION_API_KEY?.trim() ||
    process.env.GOOGLE_CLOUD_VISION_API_KEY?.trim();
  return key || undefined;
}

export function isVisionOcrReady(): boolean {
  if (!visionOcrEnabled()) return false;
  return Boolean(getVisionApiKey()) || isGoogleCloudAuthConfigured();
}

function getVisionClient(): VisionClient {
  if (cachedClient) return cachedClient;
  const auth = resolveGoogleCloudAuth();
  cachedClient = new ImageAnnotatorClient({
    projectId: auth.projectId,
    credentials: {
      client_email: auth.credentials.client_email,
      private_key: auth.credentials.private_key,
    },
  });
  return cachedClient;
}

async function extractPdfPageRange(
  pdfBytes: Buffer,
  startPageIndex: number,
  endPageIndexExclusive: number,
): Promise<Buffer> {
  const src = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const indices: number[] = [];
  for (let i = startPageIndex; i < endPageIndexExclusive; i++) indices.push(i);
  const copied = await out.copyPages(src, indices);
  for (const page of copied) out.addPage(page);
  const bytes = await out.save();
  return Buffer.from(bytes);
}

type AnnotationLike = {
  fullTextAnnotation?: { text?: string | null } | null;
  textAnnotations?: Array<{ description?: string | null }> | null;
};

function pagesFromAnnotations(
  annotations: AnnotationLike[],
  pageOffset: number,
): OcrPageResult[] {
  const pages: OcrPageResult[] = [];
  for (let i = 0; i < annotations.length; i++) {
    const ann = annotations[i];
    const text =
      ann?.fullTextAnnotation?.text?.trim() ||
      ann?.textAnnotations?.[0]?.description?.trim() ||
      "";
    pages.push({
      pageNumber: pageOffset + i + 1,
      text,
    });
  }
  return pages;
}

/** REST Vision API with API key (preferred when GOOGLE_VISION_API_KEY is set). */
async function ocrPdfChunkWithApiKey(
  apiKey: string,
  chunkBytes: Buffer,
  pageOffset: number,
  pageCountInChunk: number,
): Promise<OcrPageResult[]> {
  const pages = Array.from({ length: pageCountInChunk }, (_, i) => i + 1);
  const url = `https://vision.googleapis.com/v1/files:annotate?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          inputConfig: {
            content: chunkBytes.toString("base64"),
            mimeType: "application/pdf",
          },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          pages,
        },
      ],
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    responses?: Array<{
      error?: { message?: string };
      responses?: AnnotationLike[];
    }>;
  };

  if (!res.ok) {
    throw new Error(
      `Vision OCR API key request failed (${res.status}): ${data.error?.message || res.statusText}`,
    );
  }

  const fileResp = data.responses?.[0];
  if (fileResp?.error?.message) {
    throw new Error(`Vision OCR failed: ${fileResp.error.message}`);
  }

  const annotations = fileResp?.responses ?? [];
  const parsed = pagesFromAnnotations(annotations, pageOffset);
  if (parsed.length === 0 && annotations[0]) {
    const fallback =
      annotations[0]?.fullTextAnnotation?.text?.trim() ||
      annotations[0]?.textAnnotations?.[0]?.description?.trim();
    if (fallback) {
      return [{ pageNumber: pageOffset + 1, text: fallback }];
    }
  }
  return parsed;
}

async function ocrPdfChunkWithServiceAccount(
  client: VisionClient,
  chunkBytes: Buffer,
  pageOffset: number,
): Promise<OcrPageResult[]> {
  const [response] = await client.batchAnnotateFiles({
    requests: [
      {
        inputConfig: {
          content: chunkBytes,
          mimeType: "application/pdf",
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      },
    ],
  });

  const fileResp = response.responses?.[0];
  if (fileResp?.error?.message) {
    throw new Error(`Vision OCR failed: ${fileResp.error.message}`);
  }

  const annotations = (fileResp?.responses ?? []) as AnnotationLike[];
  const pages = pagesFromAnnotations(annotations, pageOffset);

  if (pages.length === 0) {
    const fallback = annotations[0]?.fullTextAnnotation?.text?.trim();
    if (fallback) {
      return [{ pageNumber: pageOffset + 1, text: fallback }];
    }
  }

  return pages;
}

/**
 * OCR an entire PDF (scanned / image-only). Chunks into ≤5-page Vision requests.
 */
export async function ocrPdfDocument(pdfBytes: Buffer): Promise<OcrPdfResult> {
  if (!isVisionOcrReady()) {
    throw new Error(
      "Google Cloud Vision OCR is not configured (GOOGLE_VISION_API_KEY or service account)",
    );
  }
  if (!pdfBytes?.length) throw new Error("ocrPdfDocument: empty PDF bytes");

  const src = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = src.getPageCount();
  if (pageCount === 0) throw new Error("ocrPdfDocument: PDF has no pages");

  const apiKey = getVisionApiKey();
  const authMode: "api-key" | "service-account" = apiKey ? "api-key" : "service-account";
  const client = apiKey ? null : getVisionClient();
  const pages: OcrPageResult[] = [];

  for (let start = 0; start < pageCount; start += VISION_SYNC_MAX_PAGES) {
    const end = Math.min(start + VISION_SYNC_MAX_PAGES, pageCount);
    const chunk =
      pageCount <= VISION_SYNC_MAX_PAGES && start === 0
        ? pdfBytes
        : await extractPdfPageRange(pdfBytes, start, end);

    console.info("[vision-ocr] annotate chunk", {
      authMode,
      pages: `${start + 1}-${end}`,
      bytes: chunk.length,
    });

    const chunkPages = apiKey
      ? await ocrPdfChunkWithApiKey(apiKey, chunk, start, end - start)
      : await ocrPdfChunkWithServiceAccount(client!, chunk, start);
    pages.push(...chunkPages);
  }

  const byPage = new Map(pages.map((p) => [p.pageNumber, p.text]));
  const normalized: OcrPageResult[] = [];
  for (let p = 1; p <= pageCount; p++) {
    normalized.push({ pageNumber: p, text: byPage.get(p) ?? "" });
  }

  const fullText = normalized
    .map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`.trimEnd())
    .join("\n\n");

  return {
    pages: normalized,
    fullText,
    pageCount,
    provider: "google-cloud-vision",
    authMode,
  };
}
