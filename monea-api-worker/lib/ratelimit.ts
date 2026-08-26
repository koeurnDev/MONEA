/**
 * Fast in-memory Rate Limiter
 */
class MemoryLimiter {
  private cache = new Map<string, { count: number; reset: number }>();
  private readonly MAX_SIZE = 1000;

  async limit(key: string, max: number, windowMs: number) {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry || now > entry.reset) {
      this.cache.set(key, { count: 1, reset: now + windowMs });
      if (this.cache.size > this.MAX_SIZE) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) this.cache.delete(firstKey);
      }
      return { success: true, limit: max, remaining: max - 1, reset: Math.ceil((now + windowMs) / 1000) };
    }

    if (entry.count >= max) {
      return { success: false, limit: max, remaining: 0, reset: Math.ceil(entry.reset / 1000) };
    }

    entry.count++;
    return { success: true, limit: max, remaining: max - entry.count, reset: Math.ceil(entry.reset / 1000) };
  }
}

const memoryLimiter = new MemoryLimiter();

export class ResilientRatelimit {
  private redisLimiter: any = null;

  constructor(private prefix: string, private max: number, private windowMs: number) {}

  private async getRedisLimiter() {
    if (this.redisLimiter) return this.redisLimiter;
    if (process.env.NODE_ENV !== "production" || !process.env.UPSTASH_REDIS_REST_URL) {
      return null;
    }
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const redis = (await import("./redis")).default;
      this.redisLimiter = new Ratelimit({
        redis: redis as any,
        limiter: Ratelimit.slidingWindow(this.max, `${Math.ceil(this.windowMs / 1000)} s` as any),
        prefix: this.prefix
      });
      return this.redisLimiter;
    } catch {
      return null;
    }
  }

  async limit(key: string) {
    if (process.env.NODE_ENV !== "production" || !process.env.UPSTASH_REDIS_REST_URL) {
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    }

    try {
      const limiter = await this.getRedisLimiter();
      if (limiter) {
        // Race Redis against a 150ms timeout for instant user experience
        const redisPromise = limiter.limit(key);
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 150));
        const result = await Promise.race([redisPromise, timeoutPromise]);
        if (result) return result;
      }
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    } catch {
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    }
  }
}

export const authLimiter = new ResilientRatelimit("@monea/ratelimit/auth", 5, 10 * 60 * 1000);
export const publicLimiter = new ResilientRatelimit("@monea/ratelimit/public", 10, 60 * 1000);
export const standardLimiter = new ResilientRatelimit("@monea/ratelimit/api", 100, 60 * 1000);

import { getIP } from "./utils";
export { getIP };
