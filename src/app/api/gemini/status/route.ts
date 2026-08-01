import { NextResponse } from "next/server";
import {
  GEMINI_COUNTRY_UNIT_MAP,
  createGeminiRegionalContext,
  getGeminiSystemStatus,
  listGeminiRegionalContexts,
} from "@/lib/gemini";

export const dynamic = "force-dynamic";

/** Lightweight readiness endpoint — no secrets returned. */
export async function GET() {
  return NextResponse.json({
    ...getGeminiSystemStatus(),
    regional_context_example: createGeminiRegionalContext("TH"),
    markets: GEMINI_COUNTRY_UNIT_MAP,
    regional_contexts: listGeminiRegionalContexts(),
  });
}
