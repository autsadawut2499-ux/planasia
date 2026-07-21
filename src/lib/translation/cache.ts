import { createHash } from "crypto";
import { readJsonBlob, writeJsonBlob } from "@/lib/storage/runtime";

const CACHE_FILE = "translation-cache.json";

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
  return readJsonBlob<CacheStore>(CACHE_FILE, {});
}

async function saveCache(store: CacheStore): Promise<void> {
  await writeJsonBlob(CACHE_FILE, store);
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
