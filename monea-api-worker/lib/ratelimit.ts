/**
 * Fast in-memory Rate Limiter
 */
class MemoryLimiter {
  private cache = new Map<string, { count: number; reset: number }>();
  private readonly MAX_SIZE = 1000;

  async limit(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
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

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type DistributedLimiter = {
  limit(key: string): Promise<RateLimitResult>;
};

function isProductionEnvironment() {
  return process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";
}

export class ResilientRatelimit {
  private redisLimiter: DistributedLimiter | null = null;
  private readonly prefix: string;
  private readonly max: number;
  private readonly windowMs: number;
  private readonly redisLimiterFactory?: () => Promise<DistributedLimiter | null>;

  constructor(
    prefix: string,
    max: number,
    windowMs: number,
    redisLimiterFactory?: () => Promise<DistributedLimiter | null>,
  ) {
    this.prefix = prefix;
    this.max = max;
    this.windowMs = windowMs;
    this.redisLimiterFactory = redisLimiterFactory;
  }

  private async getRedisLimiter() {
    if (this.redisLimiter) return this.redisLimiter;
    if (this.redisLimiterFactory) {
      this.redisLimiter = await this.redisLimiterFactory();
      return this.redisLimiter;
    }
    if (!isProductionEnvironment() || !process.env.UPSTASH_REDIS_REST_URL) {
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

  async limit(key: string): Promise<RateLimitResult> {
    if (!isProductionEnvironment() || !process.env.UPSTASH_REDIS_REST_URL) {
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    }

    try {
      const limiter = await this.getRedisLimiter();
      if (limiter) {
        // Race Redis against a 150ms timeout for instant user experience
        const redisPromise = limiter.limit(key);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 150));
        const result = await Promise.race([redisPromise, timeoutPromise]);
        if (result) return result;
      }
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    } catch {
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    }
  }

  async limitStrict(key: string): Promise<RateLimitResult> {
    if (!isProductionEnvironment()) {
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    }

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Distributed rate limiting is not configured.");
    }

    const limiter = await this.getRedisLimiter();
    if (!limiter) {
      throw new Error("Distributed rate limiting is unavailable.");
    }
    return await limiter.limit(key);
  }
}

export const authLimiter = new ResilientRatelimit("@monea/ratelimit/auth", 5, 10 * 60 * 1000);
export const signupEmailLimiter = new ResilientRatelimit("@monea/ratelimit/signup-email", 3, 60 * 60 * 1000);
export const publicLimiter = new ResilientRatelimit("@monea/ratelimit/public", 10, 60 * 1000);
export const publicWeddingSeoLimiter = new ResilientRatelimit("@monea/ratelimit/public-wedding-seo", 120, 60 * 1000);
export const standardLimiter = new ResilientRatelimit("@monea/ratelimit/api", 100, 60 * 1000);

import { getIP } from "./utils.ts";
export { getIP };
