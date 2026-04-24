// In-memory sliding-window rate limiter.
// NOTE: On serverless (Vercel), each function instance has its own Map — limits are
// per-instance and approximate. For strict multi-instance enforcement, replace with
// @upstash/ratelimit + @upstash/redis (free tier available at upstash.com).

type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

// Evict stale entries every 10 minutes to avoid unbounded memory growth
const cleanup = setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key)
  }
}, 10 * 60 * 1000)

// Prevent the interval from keeping the process alive in test environments
if (typeof cleanup === "object" && "unref" in cleanup) {
  (cleanup as NodeJS.Timeout).unref()
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check whether a key is within its allowed rate limit.
 * @param key     Unique identifier (e.g. "login:1.2.3.4")
 * @param limit   Max requests per window
 * @param windowMs Window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}