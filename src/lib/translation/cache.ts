import { createHash } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "data", "translation-cache.json");

interface CacheEntry {
  translations: string[];
  updatedAt: string;
}

type CacheStore = Record<string, CacheEntry>;

function cacheKey(targetLocale: string, texts: string[]): string {
  const payload = `${targetLocale}::${texts.join("\u0001")}`;
  return createHash("sha256").update(payload).digest("hex");
}

async function loadCache(): Promise<CacheStore> {
  try {
    const raw = await readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as CacheStore;
  } catch {
    return {};
  }
}

async function saveCache(store: CacheStore): Promise<void> {
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function getCachedTranslations(
  targetLocale: string,
  texts: string[],
): Promise<string[] | null> {
  const store = await loadCache();
  const entry = store[cacheKey(targetLocale, texts)];
  return entry?.translations ?? null;
}

export async function setCachedTranslations(
  targetLocale: string,
  texts: string[],
  translations: string[],
): Promise<void> {
  const store = await loadCache();
  store[cacheKey(targetLocale, texts)] = {
    translations,
    updatedAt: new Date().toISOString(),
  };
  await saveCache(store);
}
