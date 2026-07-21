import { mkdir, readFile, writeFile, access } from "fs/promises";
import path from "path";

/** Vercel/AWS Lambda filesystem is read-only except /tmp — use in-memory stores instead. */
export function useMemoryPersistence(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.PLANASIA_MEMORY_STORE === "1",
  );
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

/** Read a single JSON file from data/ (e.g. store-listings.json). */
export async function readJsonBlob<T>(filename: string, fallback: T): Promise<T> {
  if (useMemoryPersistence()) {
    const hit = memory().jsonBlobs.get(filename);
    return (hit as T | undefined) ?? fallback;
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
  if (useMemoryPersistence()) {
    memory().jsonBlobs.set(filename, data);
    return;
  }
  const filePath = dataPath(filename);
  await ensureDirFor(filePath);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/** Read a JSON document from data/{subdir}/{id}.json */
export async function readDocument<T>(subdir: string, id: string): Promise<T | null> {
  const key = `${subdir}/${id}.json`;
  if (useMemoryPersistence()) {
    const raw = memory().documents.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
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
  if (useMemoryPersistence()) {
    memory().documents.set(key, serialized);
    return;
  }
  const filePath = dataPath(subdir, `${id}.json`);
  await ensureDirFor(filePath);
  await writeFile(filePath, serialized, "utf-8");
}

/** Delete a JSON document from data/{subdir}/{id}.json */
export async function deleteDocument(subdir: string, id: string): Promise<void> {
  const key = `${subdir}/${id}.json`;
  if (useMemoryPersistence()) {
    memory().documents.delete(key);
    return;
  }
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
  if (useMemoryPersistence()) {
    const buf =
      typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(data);
    memory().binaries.set(key, buf);
    return;
  }
  const filePath = dataPath(subdir, filename);
  await ensureDirFor(filePath);
  if (typeof data === "string") {
    await writeFile(filePath, data, "utf-8");
  } else {
    await writeFile(filePath, Buffer.from(data));
  }
}

export async function binaryExists(subdir: string, filename: string): Promise<boolean> {
  if (useMemoryPersistence()) {
    return memory().binaries.has(`${subdir}/${filename}`);
  }
  try {
    await access(dataPath(subdir, filename));
    return true;
  } catch {
    return false;
  }
}

export async function readQueue(name: string): Promise<string[]> {
  if (useMemoryPersistence()) {
    return [...(memory().queues.get(name) ?? [])];
  }
  try {
    const raw = await readFile(dataPath(name), "utf-8");
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function writeQueue(name: string, ids: string[]): Promise<void> {
  if (useMemoryPersistence()) {
    memory().queues.set(name, [...ids]);
    return;
  }
  const filePath = dataPath(name);
  await ensureDirFor(filePath);
  await writeFile(filePath, JSON.stringify(ids, null, 2), "utf-8");
}
