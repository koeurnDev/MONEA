import { Redis } from "@upstash/redis";

/**
 * Universal Environment Variable Extractor for Cloudflare Worker & Node.js
 */
function getEnvVar(key: string, env?: any): string {
  if (env && env[key]) return env[key];
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] || "";
  }
  return "";
}

// Client Cache indexed by URL and Token
const redisInstanceCache = new Map<string, Redis>();

/**
 * Creates or retrieves a cached Upstash Redis client bound to the request environment.
 * Native Edge & Cloudflare Worker compatible.
 */
export function getRedis(env?: any): Redis | null {
  const url = getEnvVar("UPSTASH_REDIS_REST_URL", env);
  const token = getEnvVar("UPSTASH_REDIS_REST_TOKEN", env);

  if (!url || !token) {
    return null;
  }

  const cacheKey = `${url}:${token}`;
  if (redisInstanceCache.has(cacheKey)) {
    return redisInstanceCache.get(cacheKey)!;
  }

  try {
    const client = new Redis({
      url,
      token,
      // Automatic retry configuration for Edge runtime resilience
      retry: {
        retries: 2,
        backoff: (retryCount) => Math.exp(retryCount) * 50,
      },
    });

    redisInstanceCache.set(cacheKey, client);
    return client;
  } catch (error) {
    console.error("[Upstash Redis Init Error]:", error);
    return null;
  }
}

/**
 * Lightweight Custom Resilient Wrapper for static Node.js / fallback calls
 */
class ResilientRedisWrapper {
  async get(key: string, env?: any) {
    try {
      const client = getRedis(env);
      return client ? await client.get(key) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, options?: { ex?: number }, env?: any) {
    try {
      const client = getRedis(env);
      if (!client) return null;
      if (options?.ex) {
        return await client.set(key, value, { ex: options.ex });
      }
      return await client.set(key, value);
    } catch {
      return null;
    }
  }

  async del(key: string, env?: any) {
    try {
      const client = getRedis(env);
      return client ? await client.del(key) : null;
    } catch {
      return null;
    }
  }

  async incr(key: string, env?: any) {
    try {
      const client = getRedis(env);
      return client ? await client.incr(key) : 1;
    } catch {
      return 1;
    }
  }
}

const redis = new ResilientRedisWrapper();
export default redis;