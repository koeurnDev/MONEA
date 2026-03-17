import { Ratelimit } from "@upstash/ratelimit";
import * as Sentry from "@sentry/nextjs";
import redis from "./redis";

/**
 * Basic in-memory fallback limiter (LRU-like behavior using size-limited Map)
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

/**
 * Wraps Upstash Ratelimit with an in-memory fallback
 */
export class ResilientRatelimit {
  constructor(private redisLimiter: Ratelimit, private max: number, private windowMs: number) {}

  async limit(key: string) {
    try {
      return await this.redisLimiter.limit(key);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { type: "ratelimit_failure", mechanism: "redis" }
      });
      console.error("[Rate Limit] Redis failure, falling back to in-memory:", error);
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    }
  }
}

export const authLimiter = new ResilientRatelimit(
  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 m"), analytics: true, prefix: "@monea/ratelimit/auth" }),
  5, 10 * 60 * 1000
);

export const publicLimiter = new ResilientRatelimit(
  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m"), analytics: true, prefix: "@monea/ratelimit/public" }),
  10, 60 * 1000
);

export const standardLimiter = new ResilientRatelimit(
  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, "1 m"), analytics: true, prefix: "@monea/ratelimit/api" }),
  100, 60 * 1000
);

import { getIP } from "./utils";

export { getIP };
