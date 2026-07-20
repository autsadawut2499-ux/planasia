import { NextRequest, NextResponse } from "next/server";
import { buildEditorExport } from "@/lib/design/export-documentation";
import type { DesignEditorState } from "@/lib/design/editor-types";
import type { ProjectInput } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = body.project as ProjectInput;
  const editorState = body.editorState as DesignEditorState;

  if (!project || !editorState) {
    return NextResponse.json({ error: "project and editorState required" }, { status: 400 });
  }

  const payload = buildEditorExport(editorState, project);
  return NextResponse.json({ export: payload });
}
