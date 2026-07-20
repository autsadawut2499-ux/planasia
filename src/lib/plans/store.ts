import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { HousePlanDocument } from "./schema";

const PLANS_DIR = path.join(process.cwd(), "data", "plans");

async function ensureDir() {
  await mkdir(PLANS_DIR, { recursive: true });
}

function planPath(id: string) {
  return path.join(PLANS_DIR, `${id}.json`);
}

export async function savePlanDocument(doc: HousePlanDocument): Promise<void> {
  await ensureDir();
  await writeFile(planPath(doc.id), JSON.stringify(doc, null, 2), "utf-8");
}

export async function loadPlanDocument(id: string): Promise<HousePlanDocument | null> {
  try {
    const raw = await readFile(planPath(id), "utf-8");
    return JSON.parse(raw) as HousePlanDocument;
  } catch {
    return null;
  }
}

export function createPlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
