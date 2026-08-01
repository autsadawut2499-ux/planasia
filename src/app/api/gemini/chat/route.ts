import { NextRequest, NextResponse } from "next/server";
import type { UiLocale } from "@/lib/geo/countries";
import {
  isPlanChatReady,
  runPlanFinderChat,
  type PlanChatHistoryTurn,
} from "@/lib/gemini/capabilities/plan-chat";
import { getViewerFromRequest, resolvePrimaryUserId } from "@/lib/user/identity";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function parseHistory(raw: unknown): PlanChatHistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: PlanChatHistoryTurn[] = [];
  for (const row of raw.slice(-8)) {
    if (!row || typeof row !== "object") continue;
    const role = (row as { role?: string }).role;
    const content = String((row as { content?: unknown }).content ?? "").trim();
    if ((role === "user" || role === "assistant") && content) {
      out.push({ role, content: content.slice(0, 2000) });
    }
  }
  return out;
}

/**
 * Plan-finder chat — Gemini NLU + catalog recommendations.
 *
 * Body: { message, history?, uiLocale? }
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON body required" }, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "message too long" }, { status: 400 });
  }

  const uiLocale = (body.uiLocale === "en" ? "en" : "th") as UiLocale;
  const history = parseHistory(body.history);
  const viewer = getViewerFromRequest(request);
  const viewerKey = resolvePrimaryUserId(
    viewer.sessionUserId,
    viewer.browserId ?? viewer.primaryId,
  );

  try {
    const result = await runPlanFinderChat({
      message,
      history,
      uiLocale,
      viewerKey: viewerKey || undefined,
      limit: 5,
    });

    return NextResponse.json({
      reply: result.reply,
      filters: result.filters,
      keywords: result.keywords,
      listings: result.listings,
      provider: result.provider,
      geminiReady: isPlanChatReady(),
    });
  } catch (err) {
    console.error("[api/gemini/chat] failed", err);
    return NextResponse.json(
      { error: "Chat failed — please try again" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ready: isPlanChatReady(),
    capability: "plan-finder-chat",
  });
}
