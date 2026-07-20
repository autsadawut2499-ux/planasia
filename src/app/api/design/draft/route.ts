import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import {
  createDraftId,
  draftFilePath,
  loadDesignDraft,
  saveDesignDraft,
  type DesignDraftRecord,
} from "@/lib/design/draft-store";
import type { DesignEditorState } from "@/lib/design/editor-types";
import type { ProjectInput } from "@/lib/ai/types";

function ownerKey(request: NextRequest, body?: { ownerKey?: string }): string | null {
  const fromBody = body?.ownerKey;
  if (fromBody) return fromBody;
  const browserId = request.headers.get("x-browser-id");
  if (browserId) return browserId;
  const userId = request.headers.get("x-user-id") ?? request.headers.get("x-session-user-id");
  if (userId) return userId;
  return null;
}

export async function GET(request: NextRequest) {
  const key = ownerKey(request);
  if (!key) {
    return NextResponse.json({ error: "Missing owner identity" }, { status: 401 });
  }

  const draft = await loadDesignDraft(key);
  if (!draft) {
    return NextResponse.json({ draft: null });
  }

  return NextResponse.json({ draft });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const key = ownerKey(request, body);
  if (!key) {
    return NextResponse.json({ error: "Missing owner identity" }, { status: 401 });
  }

  const project = body.project as ProjectInput;
  const editorState = body.editorState as DesignEditorState;
  const workspaceSessionId = body.workspaceSessionId as string | undefined;
  const previewUrl = body.previewUrl as string | undefined;

  if (!project || !editorState) {
    return NextResponse.json({ error: "project and editorState required" }, { status: 400 });
  }

  const existing = await loadDesignDraft(key);
  const record: DesignDraftRecord = {
    id: existing?.id ?? createDraftId(),
    ownerKey: key,
    workspaceSessionId,
    project,
    editorState: { ...editorState, updatedAt: new Date().toISOString() },
    previewUrl,
    updatedAt: new Date().toISOString(),
  };

  await saveDesignDraft(record);
  return NextResponse.json({ ok: true, draft: record });
}

export async function DELETE(request: NextRequest) {
  const key = ownerKey(request);
  if (!key) {
    return NextResponse.json({ error: "Missing owner identity" }, { status: 401 });
  }

  try {
    await unlink(draftFilePath(key));
  } catch {
    /* no draft */
  }

  return NextResponse.json({ ok: true });
}
