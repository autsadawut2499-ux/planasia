/**
 * Optional Redis FIFO queue via Upstash REST API (no npm dependency).
 * Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to enable.
 */
const QUEUE_KEY = "planasia:export:queue";

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
    throw new Error(`Redis command failed: ${res.status}`);
  }
  const data = (await res.json()) as { result: T };
  return data.result;
}

export function isRedisQueueEnabled(): boolean {
  return redisConfigured();
}

/** LPUSH — add to head; we dequeue from tail (RPOP) for FIFO. */
export async function redisEnqueue(jobId: string): Promise<number> {
  await redisCommand(["LPUSH", QUEUE_KEY, jobId]);
  const len = await redisCommand<number>(["LLEN", QUEUE_KEY]);
  return len;
}

export async function redisDequeue(): Promise<string | null> {
  return redisCommand<string | null>(["RPOP", QUEUE_KEY]);
}

export async function redisQueuePosition(jobId: string): Promise<number> {
  const items = await redisCommand<string[]>(["LRANGE", QUEUE_KEY, 0, -1]);
  const idx = items.indexOf(jobId);
  return idx === -1 ? 0 : items.length - idx;
}

export async function redisQueueLength(): Promise<number> {
  return redisCommand<number>(["LLEN", QUEUE_KEY]);
}
