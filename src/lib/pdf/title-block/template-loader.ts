import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { TitleBlockTemplate } from "@/lib/pdf/title-block/schema";
import titanBoxTemplate from "../../../../templates/title-block/titan-box-standard.json";
import legacyDptTemplate from "../../../../templates/title-block/a3-dpt-standard.json";
import {
  TITAN_BOX_DWG_FILENAME,
  TITAN_BOX_PLT_FILENAME,
  getTitleBlockDwgPath,
  getTitleBlockPltPath,
  reloadTitleBlockReferenceCache,
} from "@/lib/pdf/title-block/references";

export { TITAN_BOX_DWG_FILENAME, TITAN_BOX_PLT_FILENAME, getTitleBlockDwgPath, getTitleBlockPltPath };

const TEMPLATE_DIR = join(process.cwd(), "templates", "title-block");

/** Override order: env → custom.json → active.json → Titan Box standard → legacy DPT */
export function loadTitleBlockTemplate(): TitleBlockTemplate {
  const candidates: string[] = [];

  if (process.env.TITLE_BLOCK_TEMPLATE) {
    candidates.push(process.env.TITLE_BLOCK_TEMPLATE);
  }
  candidates.push(join(TEMPLATE_DIR, "custom.json"));
  candidates.push(join(TEMPLATE_DIR, "active.json"));
  candidates.push(join(TEMPLATE_DIR, "titan-box-standard.json"));

  for (const path of candidates) {
    if (existsSync(path)) {
      try {
        const raw = readFileSync(path, "utf-8");
        return JSON.parse(raw) as TitleBlockTemplate;
      } catch {
        /* fall through */
      }
    }
  }

  return titanBoxTemplate as TitleBlockTemplate;
}

let cached: TitleBlockTemplate | null = null;

export function getTitleBlockTemplate(): TitleBlockTemplate {
  if (!cached) cached = loadTitleBlockTemplate();
  return cached;
}

export function reloadTitleBlockTemplate(): TitleBlockTemplate {
  cached = null;
  reloadTitleBlockReferenceCache();
  return getTitleBlockTemplate();
}

export function titleBlockHeightPt(): number {
  return getTitleBlockTemplate().heightPt;
}

export function getLegacyDptTitleBlockTemplate(): TitleBlockTemplate {
  return legacyDptTemplate as TitleBlockTemplate;
}
