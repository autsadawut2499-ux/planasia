import { NextRequest, NextResponse } from "next/server";
import type { UiLocale } from "@/lib/geo/countries";
import {
  isGeminiTranslationReady,
  previewGeminiTranslationChunks,
  runGeminiTranslationWorkflow,
} from "@/lib/gemini";
import type { TranslationChunkingOptions } from "@/lib/gemini/payloads/chunking";

export const dynamic = "force-dynamic";

function parseChunking(body: Record<string, unknown>): TranslationChunkingOptions | undefined {
  const raw = (body.chunking ?? body.pagination) as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== "object") {
    // Top-level shortcuts
    if (
      body.pagesPerBatch != null ||
      body.textsPerBatch != null ||
      body.mode != null ||
      body.maxCharsPerChunk != null
    ) {
      return {
        mode: body.mode as TranslationChunkingOptions["mode"],
        pagesPerBatch: body.pagesPerBatch != null ? Number(body.pagesPerBatch) : undefined,
        textsPerBatch: body.textsPerBatch != null ? Number(body.textsPerBatch) : undefined,
        maxCharsPerChunk:
          body.maxCharsPerChunk != null ? Number(body.maxCharsPerChunk) : undefined,
      };
    }
    return undefined;
  }
  return {
    mode: raw.mode as TranslationChunkingOptions["mode"],
    pagesPerBatch: raw.pagesPerBatch != null ? Number(raw.pagesPerBatch) : undefined,
    textsPerBatch: raw.textsPerBatch != null ? Number(raw.textsPerBatch) : undefined,
    maxCharsPerChunk: raw.maxCharsPerChunk != null ? Number(raw.maxCharsPerChunk) : undefined,
  };
}

/**
 * Gemini translation workflow with document pagination / chunking.
 *
 * Body:
 * {
 *   content: { texts?, document? },
 *   target_country,
 *   target_locale?,
 *   chunking?: { mode: "page"|"section"|"batch", pagesPerBatch?, textsPerBatch?, maxCharsPerChunk? },
 *   preview_chunks?: true  // return planned payloads without calling Gemini
 * }
 */
export async function POST(request: NextRequest) {
  if (!isGeminiTranslationReady()) {
    return NextResponse.json(
      { error: "Gemini translation not ready — set GEMINI_API_KEY (and GEMINI_ENABLED≠false)" },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON body required" }, { status: 400 });
  }

  const content = (body.content as { texts?: unknown; document?: unknown } | undefined) ?? {
    texts: Array.isArray(body.texts) ? body.texts : [],
    document: typeof body.document === "string" ? body.document : undefined,
  };

  const target_country =
    body.target_country ?? body.targetCountry ?? (body.context as { target_country?: string } | undefined)?.target_country;

  if (!target_country) {
    return NextResponse.json(
      {
        error:
          "target_country is required — every translation payload must include content + target_country + system_instruction",
      },
      { status: 400 },
    );
  }

  const texts = Array.isArray(content.texts) ? content.texts : [];
  if (!texts.length && !content.document) {
    return NextResponse.json(
      { error: "content.texts or content.document is required" },
      { status: 400 },
    );
  }

  const input = {
    content: {
      texts: texts.map((t: unknown) => String(t)),
      document: typeof content.document === "string" ? content.document : undefined,
    },
    target_country: String(target_country),
    target_locale: (body.target_locale ?? body.targetLocale ?? "en") as UiLocale,
    source_locale: (body.source_locale ?? body.sourceLocale) as UiLocale | undefined,
    chunking: parseChunking(body),
  };

  try {
    if (body.preview_chunks === true) {
      const payloads = previewGeminiTranslationChunks(input);
      return NextResponse.json({
        totalChunks: payloads.length,
        chunks: payloads.map((p) => ({
          chunkIndex: p.pagination?.chunkIndex,
          totalChunks: p.pagination?.totalChunks,
          pageIndexes: p.pagination?.pageIndexes,
          isDocument: p.pagination?.isDocument,
          target_country: p.target_country,
          textsCount: p.content.texts.length,
          chars: p.content.texts.reduce((n, t) => n + t.length, 0),
          system_instruction_preview: p.system_instruction.slice(0, 240) + "…",
        })),
      });
    }

    const result = await runGeminiTranslationWorkflow(input);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini translation failed";
    const status = message.includes("required") ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
