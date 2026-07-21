import { mkdir, readFile, writeFile, access } from "fs/promises";
import path from "path";
import { isRedisKvEnabled, redisGetJson, redisKvKey, redisSetJson } from "@/lib/storage/redis-kv";

/**
 * Detect serverless/read-only filesystem at runtime.
 * process.cwd() is evaluated at request time (not build time), unlike process.env.VERCEL
 * which may be inlined when building locally before deploying to Vercel.
 */
export function useMemoryPersistence(): boolean {
  if (process.env.PLANASIA_DISK_STORE === "1") return false;
  if (process.env.PLANASIA_MEMORY_STORE === "1") return true;

  const cwd = process.cwd();
  if (cwd.startsWith("/var/task") || cwd.includes("/var/task")) return true;

  if (process.env["VERCEL"] || process.env["VERCEL_ENV"]) return true;
  if (process.env["AWS_LAMBDA_FUNCTION_NAME"]) return true;

  return false;
}

interface MemoryBackend {
  jsonBlobs: Map<string, unknown>;
  documents: Map<string, string>;
  binaries: Map<string, Buffer>;
  queues: Map<string, string[]>;
}

function memory(): MemoryBackend {
  const g = globalThis as typeof globalThis & { __planasiaMemoryStore?: MemoryBackend };
  if (!g.__planasiaMemoryStore) {
    g.__planasiaMemoryStore = {
      jsonBlobs: new Map(),
      documents: new Map(),
      binaries: new Map(),
      queues: new Map(),
    };
  }
  return g.__planasiaMemoryStore;
}

function dataPath(...segments: string[]): string {
  return path.join(process.cwd(), "data", ...segments);
}

async function ensureDirFor(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
}

function shouldUseDisk(): boolean {
  return !useMemoryPersistence() && !isRedisKvEnabled();
}

/** Read a single JSON file from data/ (e.g. store-listings.json). */
export async function readJsonBlob<T>(filename: string, fallback: T): Promise<T> {
  if (isRedisKvEnabled()) {
    const fromRedis = await redisGetJson<T>(redisKvKey(filename));
    if (fromRedis !== null) return fromRedis;
  }

  if (useMemoryPersistence()) {
    const hit = memory().jsonBlobs.get(filename);
    return (hit as T | undefined) ?? fallback;
  }

  if (!shouldUseDisk()) {
    return fallback;
  }

  try {
    const raw = await readFile(dataPath(filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Write a single JSON file under data/. */
export async function writeJsonBlob(filename: string, data: unknown): Promise<void> {
  if (isRedisKvEnabled()) {
    await redisSetJson(redisKvKey(filename), data);
  }

  if (useMemoryPersistence()) {
    memory().jsonBlobs.set(filename, data);
    return;
  }

  if (!shouldUseDisk()) return;

  try {
    const filePath = dataPath(filename);
    await ensureDirFor(filePath);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    memory().jsonBlobs.set(filename, data);
  }
}

/** Read a JSON document from data/{subdir}/{id}.json */
export async function readDocument<T>(subdir: string, id: string): Promise<T | null> {
  const key = `${subdir}/${id}.json`;
  const redisKey = redisKvKey(key);

  if (isRedisKvEnabled()) {
    const fromRedis = await redisGetJson<T>(redisKey);
    if (fromRedis !== null) return fromRedis;
  }

  if (useMemoryPersistence()) {
    const raw = memory().documents.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  if (!shouldUseDisk()) return null;

  try {
    const raw = await readFile(dataPath(subdir, `${id}.json`), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Write a JSON document to data/{subdir}/{id}.json */
export async function writeDocument(subdir: string, id: string, data: unknown): Promise<void> {
  const key = `${subdir}/${id}.json`;
  const serialized = JSON.stringify(data, null, 2);

  if (isRedisKvEnabled()) {
    await redisSetJson(redisKvKey(key), data);
  }

  if (useMemoryPersistence()) {
    memory().documents.set(key, serialized);
    return;
  }

  if (!shouldUseDisk()) return;

  try {
    const filePath = dataPath(subdir, `${id}.json`);
    await ensureDirFor(filePath);
    await writeFile(filePath, serialized, "utf-8");
  } catch {
    memory().documents.set(key, serialized);
  }
}

/** Delete a JSON document from data/{subdir}/{id}.json */
export async function deleteDocument(subdir: string, id: string): Promise<void> {
  const key = `${subdir}/${id}.json`;

  if (useMemoryPersistence()) {
    memory().documents.delete(key);
  }

  if (!shouldUseDisk()) return;

  const { unlink } = await import("fs/promises");
  try {
    await unlink(dataPath(subdir, `${id}.json`));
  } catch {
    /* already removed */
  }
}

export async function readBinary(subdir: string, filename: string): Promise<Buffer | null> {
  const key = `${subdir}/${filename}`;

  if (useMemoryPersistence()) {
    return memory().binaries.get(key) ?? null;
  }

  if (!shouldUseDisk()) return null;

  try {
    return await readFile(dataPath(subdir, filename));
  } catch {
    return null;
  }
}

export async function writeBinary(
  subdir: string,
  filename: string,
  data: Buffer | Uint8Array | string,
): Promise<void> {
  const key = `${subdir}/${filename}`;
  const buf = typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);

  if (useMemoryPersistence()) {
    memory().binaries.set(key, buf);
    return;
  }

  if (!shouldUseDisk()) return;

  try {
    const filePath = dataPath(subdir, filename);
    await ensureDirFor(filePath);
    if (typeof data === "string") {
      await writeFile(filePath, data, "utf-8");
    } else {
      await writeFile(filePath, buf);
    }
  } catch {
    memory().binaries.set(key, buf);
  }
}

export async function binaryExists(subdir: string, filename: string): Promise<boolean> {
  if (useMemoryPersistence()) {
    return memory().binaries.has(`${subdir}/${filename}`);
  }

  if (!shouldUseDisk()) return false;

  try {
    await access(dataPath(subdir, filename));
    return true;
  } catch {
    return false;
  }
}

export async function readQueue(name: string): Promise<string[]> {
  if (isRedisKvEnabled()) {
    const fromRedis = await redisGetJson<string[]>(redisKvKey(`queue:${name}`));
    if (fromRedis !== null) return fromRedis;
  }

  if (useMemoryPersistence()) {
    return [...(memory().queues.get(name) ?? [])];
  }

  if (!shouldUseDisk()) return [];

  try {
    const raw = await readFile(dataPath(name), "utf-8");
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function writeQueue(name: string, ids: string[]): Promise<void> {
  if (isRedisKvEnabled()) {
    await redisSetJson(redisKvKey(`queue:${name}`), ids);
  }

  if (useMemoryPersistence()) {
    memory().queues.set(name, [...ids]);
    return;
  }

  if (!shouldUseDisk()) return;

  try {
    const filePath = dataPath(name);
    await ensureDirFor(filePath);
    await writeFile(filePath, JSON.stringify(ids, null, 2), "utf-8");
  } catch {
    memory().queues.set(name, [...ids]);
  }
}
