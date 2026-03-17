import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";

let redis: Redis;

// In Next.js Edge Runtime, we must ensure we don't use Node.js-only modules.
// The @upstash/redis library is isomorphic, but we ensure it's initialized safely.
if (url && token) {
  redis = new Redis({ url, token });
} else {
  // Fallback for local development without Redis
  if (process.env.NODE_ENV === "development") {
    console.warn("[Redis] Credentials missing. Using in-memory fallback.");
    const memory = new Map<string, any>();
    const expiry = new Map<string, number>();

    redis = {
      get: async (key: string) => {
        const exp = expiry.get(key);
        if (exp && Date.now() > exp) {
          memory.delete(key);
          expiry.delete(key);
          return null;
        }
        return memory.get(key) || null;
      },
      set: async (key: string, value: any, options?: { ex?: number }) => {
        memory.set(key, value);
        if (options?.ex) {
          expiry.set(key, Date.now() + options.ex * 1000);
        }
        return "OK";
      },
      del: async (key: string) => {
        memory.delete(key);
        expiry.delete(key);
        return 1;
      },
      incr: async (key: string) => {
        const val = (memory.get(key) || 0) + 1;
        memory.set(key, val);
        return val;
      }
    } as any;
  } else {
    // In production, we still want to instantiate it so it throws on use if misconfigured
    redis = new Redis({ url: "", token: "" });
  }
}

export default redis;
