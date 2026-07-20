import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { DesignEditorState } from "./editor-types";
import type { ProjectInput } from "@/lib/ai/types";

export interface DesignDraftRecord {
  id: string;
  ownerKey: string;
  workspaceSessionId?: string;
  project: ProjectInput;
  editorState: DesignEditorState;
  previewUrl?: string;
  updatedAt: string;
}

const DRAFTS_DIR = path.join(process.cwd(), "data", "design-drafts");

async function ensureDir() {
  await mkdir(DRAFTS_DIR, { recursive: true });
}

export function draftFilePath(ownerKey: string) {
  const safe = ownerKey.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(DRAFTS_DIR, `${safe}.json`);
}

function draftPath(ownerKey: string) {
  return draftFilePath(ownerKey);
}

export async function saveDesignDraft(record: DesignDraftRecord): Promise<void> {
  await ensureDir();
  await writeFile(draftPath(record.ownerKey), JSON.stringify(record, null, 2), "utf-8");
}

export async function loadDesignDraft(ownerKey: string): Promise<DesignDraftRecord | null> {
  try {
    const raw = await readFile(draftPath(ownerKey), "utf-8");
    return JSON.parse(raw) as DesignDraftRecord;
  } catch {
    return null;
  }
}

export function createDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
