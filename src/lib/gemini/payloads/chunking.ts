/**
 * Pagination / chunking for Gemini translation requests.
 * Keeps each API call under token-safe limits while preserving order.
 */

export type ChunkMode = "page" | "section" | "batch";

export interface TranslationChunkingOptions {
  /**
   * How to split a long document:
   * - page: split on page breaks (form-feed / ---page--- / "Page N")
   * - section: split on blank-line paragraphs / headings, then pack by size
   * - batch: treat whole document as one stream packed by maxChars only
   */
  mode?: ChunkMode;
  /** Pages (or sections) processed per Gemini call. Default 1 (page-by-page). */
  pagesPerBatch?: number;
  /** Max text strings per Gemini call when translating `texts[]`. Default 8. */
  textsPerBatch?: number;
  /**
   * Soft max characters of source content per Gemini call (document chunks).
   * Defaults to ~6k chars to leave room for system instruction + unit document.
   */
  maxCharsPerChunk?: number;
}

export interface DocumentPage {
  index: number;
  text: string;
}

export interface ContentChunk {
  /** Zero-based chunk order across the whole job. */
  chunkIndex: number;
  /** Page/section indexes included (document mode). */
  pageIndexes: number[];
  texts: string[];
  /** True when this chunk is a document page batch (not marketplace string batch). */
  isDocument: boolean;
}

export const DEFAULT_CHUNKING: Required<TranslationChunkingOptions> = {
  mode: "page",
  pagesPerBatch: 1,
  textsPerBatch: 8,
  maxCharsPerChunk: 6000,
};

export function resolveChunkingOptions(
  options?: TranslationChunkingOptions | null,
): Required<TranslationChunkingOptions> {
  return {
    mode: options?.mode ?? DEFAULT_CHUNKING.mode,
    pagesPerBatch: Math.max(1, Math.min(10, options?.pagesPerBatch ?? DEFAULT_CHUNKING.pagesPerBatch)),
    textsPerBatch: Math.max(1, Math.min(20, options?.textsPerBatch ?? DEFAULT_CHUNKING.textsPerBatch)),
    maxCharsPerChunk: Math.max(
      1000,
      Math.min(12000, options?.maxCharsPerChunk ?? DEFAULT_CHUNKING.maxCharsPerChunk),
    ),
  };
}

/**
 * Split a document into pages/sections.
 * Recognizes form-feed, explicit markers, and "Page N" headings; otherwise
 * falls back to paragraph packing for `section` / `batch` modes.
 */
export function splitDocumentIntoPages(
  document: string,
  mode: ChunkMode = "page",
): DocumentPage[] {
  const raw = document.replace(/\r\n/g, "\n").trim();
  if (!raw) return [];

  const pageBreakSplit = raw.split(/\n*\f\n*|\n*-{3,}page-{3,}\n*|\n*\[PAGE_BREAK\]\n*/i);
  if (pageBreakSplit.length > 1) {
    return pageBreakSplit
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, index) => ({ index, text }));
  }

  if (mode === "page") {
    const re = /(?:^|\n)(?:Page|หน้า)\s*\d+\s*[:.\-]?\s*\n/gi;
    if (re.test(raw)) {
      re.lastIndex = 0;
      const parts: string[] = [];
      let last = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(raw)) !== null) {
        if (match.index > last) {
          const slice = raw.slice(last, match.index).trim();
          if (slice) parts.push(slice);
        }
        last = match.index + match[0].length;
      }
      const tail = raw.slice(last).trim();
      if (tail) parts.push(tail);
      if (parts.length > 1) {
        return parts.map((text, index) => ({ index, text }));
      }
    }
  }

  if (mode === "batch") {
    return [{ index: 0, text: raw }];
  }

  const blocks = raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length <= 1) {
    return [{ index: 0, text: raw }];
  }

  return blocks.map((text, index) => ({ index, text }));
}

function sliceByChars(text: string, maxChars: number): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + maxChars, text.length);
    if (end < text.length) {
      const breakAt = text.lastIndexOf("\n", end);
      if (breakAt > i + Math.floor(maxChars * 0.5)) end = breakAt;
    }
    const slice = text.slice(i, end).trim();
    if (slice) out.push(slice);
    i = end;
  }
  return out;
}

/** Pack pages into batches of `pagesPerBatch`, splitting further if over maxChars. */
export function packPagesIntoChunks(
  pages: DocumentPage[],
  options: Required<TranslationChunkingOptions>,
): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let chunkIndex = 0;
  let i = 0;

  while (i < pages.length) {
    const page = pages[i];

    if (page.text.length > options.maxCharsPerChunk) {
      for (const slice of sliceByChars(page.text, options.maxCharsPerChunk)) {
        chunks.push({
          chunkIndex: chunkIndex++,
          pageIndexes: [page.index],
          texts: [slice],
          isDocument: true,
        });
      }
      i += 1;
      continue;
    }

    const batchPages: DocumentPage[] = [page];
    let chars = page.text.length;
    i += 1;

    while (
      i < pages.length &&
      batchPages.length < options.pagesPerBatch &&
      chars + pages[i].text.length <= options.maxCharsPerChunk &&
      pages[i].text.length <= options.maxCharsPerChunk
    ) {
      batchPages.push(pages[i]);
      chars += pages[i].text.length;
      i += 1;
    }

    chunks.push({
      chunkIndex: chunkIndex++,
      pageIndexes: batchPages.map((p) => p.index),
      texts: batchPages.map((p) => p.text),
      isDocument: true,
    });
  }

  return chunks;
}

/** Pack marketplace `texts[]` into batches. */
export function packTextsIntoChunks(
  texts: string[],
  options: Required<TranslationChunkingOptions>,
): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let chunkIndex = 0;
  let i = 0;

  while (i < texts.length) {
    const item = texts[i];

    if (item.length > options.maxCharsPerChunk) {
      for (const slice of sliceByChars(item, options.maxCharsPerChunk)) {
        chunks.push({
          chunkIndex: chunkIndex++,
          pageIndexes: [],
          texts: [slice],
          isDocument: false,
        });
      }
      i += 1;
      continue;
    }

    const batch: string[] = [item];
    let chars = item.length;
    i += 1;

    while (
      i < texts.length &&
      batch.length < options.textsPerBatch &&
      chars + texts[i].length <= options.maxCharsPerChunk &&
      texts[i].length <= options.maxCharsPerChunk
    ) {
      batch.push(texts[i]);
      chars += texts[i].length;
      i += 1;
    }

    chunks.push({
      chunkIndex: chunkIndex++,
      pageIndexes: [],
      texts: batch,
      isDocument: false,
    });
  }

  return chunks;
}

/**
 * Build ordered content chunks for a translation job.
 * Document pages are processed first (preserving page order), then leftover texts.
 */
export function buildTranslationChunks(params: {
  texts?: string[];
  document?: string;
  chunking?: TranslationChunkingOptions | null;
}): ContentChunk[] {
  const options = resolveChunkingOptions(params.chunking);
  const texts = (params.texts ?? []).map((t) => String(t).trim()).filter(Boolean);
  const document = params.document?.trim();

  const chunks: ContentChunk[] = [];

  if (document) {
    const pages = splitDocumentIntoPages(document, options.mode);
    chunks.push(...packPagesIntoChunks(pages, options));
  }

  if (texts.length) {
    const textChunks = packTextsIntoChunks(texts, options);
    const base = chunks.length;
    for (const c of textChunks) {
      chunks.push({ ...c, chunkIndex: base + c.chunkIndex });
    }
  }

  return chunks;
}
