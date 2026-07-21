import type { DesignEditorState } from "./editor-types";
import type { ProjectInput } from "@/lib/ai/types";
import {
  deleteDesignDraft as supabaseDeleteDesignDraft,
  loadDesignDraft as supabaseLoadDesignDraft,
  saveDesignDraft as supabaseSaveDesignDraft,
} from "@/lib/supabase/drafts";

export interface DesignDraftRecord {
  id: string;
  ownerKey: string;
  workspaceSessionId?: string;
  project: ProjectInput;
  editorState: DesignEditorState;
  previewUrl?: string;
  updatedAt: string;
}

function ownerDocId(ownerKey: string): string {
  return ownerKey.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function draftFilePath(ownerKey: string): string {
  return `design-drafts/${ownerDocId(ownerKey)}.json`;
}

export async function saveDesignDraft(record: DesignDraftRecord): Promise<void> {
  await supabaseSaveDesignDraft(record);
}

export async function loadDesignDraft(ownerKey: string): Promise<DesignDraftRecord | null> {
  return supabaseLoadDesignDraft(ownerKey);
}

export async function deleteDesignDraft(ownerKey: string): Promise<void> {
  await supabaseDeleteDesignDraft(ownerKey);
}

export function createDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
