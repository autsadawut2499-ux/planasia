/** In-memory sliding-window rate limiter (per server instance). */

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
  remaining: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

/** Route-specific limits for expensive API endpoints. */
export function rateLimitConfigForPath(pathname: string): RateLimitConfig {
  if (pathname.startsWith("/api/webhooks/") || pathname.startsWith("/api/auth/")) {
    return { limit: 500, windowMs: 60_000 };
  }
  if (
    pathname.startsWith("/api/generate") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/translate") ||
    pathname.startsWith("/api/design/export")
  ) {
    return { limit: 20, windowMs: 60_000 };
  }
  if (pathname.startsWith("/api/payment") || pathname.startsWith("/api/store/cart/checkout")) {
    return { limit: 30, windowMs: 60_000 };
  }
  return { limit: 80, windowMs: 60_000 };
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true, remaining: config.limit - 1 };
  }

  if (bucket.count >= config.limit) {
    return {
      success: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  bucket.count += 1;
  return { success: true, remaining: config.limit - bucket.count };
}

/** Periodic cleanup to avoid unbounded memory growth. */
let lastCleanup = Date.now();
export function maybeCleanupRateLimitStore() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [key, bucket] of store) {
    if (now >= bucket.resetAt) store.delete(key);
  }
}
