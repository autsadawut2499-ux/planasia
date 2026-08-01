/**
 * Load Standard Template Blocks for external AI vector generation.
 * Platform prepares block definitions; agents render geometry per blockId.
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const BLOCKS_DIR = join(process.cwd(), "templates", "standards", "template-blocks");

function loadBlockJson<T>(filename: string): T {
  const path = join(BLOCKS_DIR, filename);
  if (!existsSync(path)) {
    throw new Error(`Template block config not found: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export interface TemplateBlockCategory {
  id: string;
  label: string;
  labelTh: string;
  path: string;
  blockCount: number;
}

export interface TemplateBlocksManifest {
  id: string;
  version: string;
  purpose: string;
  authority: string;
  categories: TemplateBlockCategory[];
  usage: Record<string, string>;
}

export interface TemplateBlockFile {
  version: string;
  category: string;
  label: string;
  labelTh: string;
  authority: string;
  blocks: Record<string, unknown>[];
  [key: string]: unknown;
}

export type TemplateBlockCategoryId =
  | "line-standards"
  | "plan-skeletons"
  | "recurring-details"
  | "general-notes"
  | "symbols-markers";

const CATEGORY_FILES: Record<TemplateBlockCategoryId, string> = {
  "line-standards": "line-standards.json",
  "plan-skeletons": "plan-skeletons.json",
  "recurring-details": "recurring-details.json",
  "general-notes": "general-notes.json",
  "symbols-markers": "symbols-markers.json",
};

let _manifest: TemplateBlocksManifest | null = null;
const _cache: Partial<Record<TemplateBlockCategoryId, TemplateBlockFile>> = {};

export function getTemplateBlocksManifest(): TemplateBlocksManifest {
  if (!_manifest) _manifest = loadBlockJson("manifest.json");
  return _manifest!;
}

export function getTemplateBlockCategory(id: TemplateBlockCategoryId): TemplateBlockFile {
  if (!_cache[id]) _cache[id] = loadBlockJson(CATEGORY_FILES[id]);
  return _cache[id]!;
}

export function getAllTemplateBlockCategories(): TemplateBlockFile[] {
  return (Object.keys(CATEGORY_FILES) as TemplateBlockCategoryId[]).map(getTemplateBlockCategory);
}

export function getTemplateBlockById(blockId: string): {
  blockId: string;
  category: TemplateBlockCategoryId;
  block: Record<string, unknown>;
} | undefined {
  for (const categoryId of Object.keys(CATEGORY_FILES) as TemplateBlockCategoryId[]) {
    const file = getTemplateBlockCategory(categoryId);
    const block = file.blocks.find(
      (b) => (b as { blockId?: string }).blockId === blockId,
    ) as Record<string, unknown> | undefined;
    if (block) return { blockId, category: categoryId, block };
  }
  return undefined;
}

export function buildTemplateBlocksBundle(): {
  manifest: TemplateBlocksManifest;
  categories: Record<TemplateBlockCategoryId, TemplateBlockFile>;
} {
  const categories = {} as Record<TemplateBlockCategoryId, TemplateBlockFile>;
  for (const id of Object.keys(CATEGORY_FILES) as TemplateBlockCategoryId[]) {
    categories[id] = getTemplateBlockCategory(id);
  }
  return { manifest: getTemplateBlocksManifest(), categories };
}

/** Flat index of all blockIds for agent lookup. */
export function listTemplateBlockIds(): { blockId: string; category: TemplateBlockCategoryId; name: string }[] {
  const result: { blockId: string; category: TemplateBlockCategoryId; name: string }[] = [];
  for (const categoryId of Object.keys(CATEGORY_FILES) as TemplateBlockCategoryId[]) {
    const file = getTemplateBlockCategory(categoryId);
    for (const block of file.blocks) {
      const b = block as { blockId: string; name: string };
      result.push({ blockId: b.blockId, category: categoryId, name: b.name });
    }
  }
  return result;
}

export function reloadTemplateBlocks(): void {
  _manifest = null;
  for (const key of Object.keys(_cache)) delete _cache[key as TemplateBlockCategoryId];
}

/** AI prompt context summarizing available template blocks. */
export function buildTemplateBlocksContext(): string {
  const ids = listTemplateBlockIds();
  const byCategory = getTemplateBlocksManifest().categories
    .map((c) => `- ${c.label}: ${c.blockCount} blocks (${c.id})`)
    .join("\n");

  return `STANDARD TEMPLATE BLOCKS (reference by blockId — do not invent alternatives):

Categories:
${byCategory}

All blocks (${ids.length} total): ${ids.map((b) => b.blockId).join(", ")}

Config root: templates/standards/template-blocks/
API: /api/standards/drawing-spec?blocks={categoryId}`;
}
