import type { HousePlanDocument } from "./schema";
import { readDocument, writeDocument } from "@/lib/storage/runtime";

export async function savePlanDocument(doc: HousePlanDocument): Promise<void> {
  await writeDocument("plans", doc.id, doc);
}

export async function loadPlanDocument(id: string): Promise<HousePlanDocument | null> {
  return readDocument<HousePlanDocument>("plans", id);
}

export function createPlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
