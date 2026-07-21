/**
 * Optional JSON key-value storage via Upstash Redis REST API.
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to enable durable cloud storage.
 */

const KEY_PREFIX = "planasia:kv:";

function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisCommand<T>(command: unknown[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) {
    throw new Error(`Redis KV command failed: ${res.status}`);
  }
  const data = (await res.json()) as { result: T };
  return data.result;
}

export function isRedisKvEnabled(): boolean {
  return redisConfigured();
}

export function redisKvKey(name: string): string {
  return `${KEY_PREFIX}${name}`;
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  if (!redisConfigured()) return null;
  const raw = await redisCommand<string | null>(["GET", key]);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function redisSetJson(key: string, value: unknown): Promise<void> {
  if (!redisConfigured()) return;
  await redisCommand(["SET", key, JSON.stringify(value)]);
}
