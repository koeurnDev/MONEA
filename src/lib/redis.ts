const url = process.env.UPSTASH_REDIS_REST_URL || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";

let redis: any;

/**
 * MONEA Resilient Redis Client
 * Automatically switches between native @upstash/redis (Node.js) 
 * and manual fetch-based REST (Edge/Middleware) to resolve runtime conflicts.
 */
if (process.env.NEXT_RUNTIME === "edge") {
  // --- Edge Runtime (Middleware) Path ---
  // Uses direct fetch to avoid Node.js-specific dependency leaks from @upstash/redis
  redis = {
    get: async (key: string) => {
      try {
        const res = await fetch(`${url}/get/${key}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        return data.result;
      } catch (e) {
        console.error("[Redis Edge] GET failure:", e);
        return null;
      }
    },
    set: async (key: string, value: any, options?: { ex?: number }) => {
      try {
        const body = ["SET", key, typeof value === 'string' ? value : JSON.stringify(value)];
        if (options?.ex) {
          body.push("EX", options.ex.toString());
        }
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        return data.result;
      } catch (e) {
        console.error("[Redis Edge] SET failure:", e);
        return "ERROR";
      }
    },
    del: async (key: string) => {
      try {
        const res = await fetch(`${url}/del/${key}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        return data.result;
      } catch (e) {
        return 0;
      }
    },
    incr: async (key: string) => {
      try {
        const res = await fetch(`${url}/incr/${key}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        return data.result;
      } catch (e) {
        return 1;
      }
    }
  };
} else {
  // --- Node.js Runtime Path ---
  // We use require to avoid the primary Edge bundler path from following this import
  try {
    const { Redis } = require("@upstash/redis");
    redis = new Redis({ url, token });
  } catch (e) {
    // Fallback if require is not available in ESM (Next.js will handle this correctly in Node)
    // or if we are in development without Redis
    if (process.env.NODE_ENV === "development" && (!url || !token)) {
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
      };
    } else {
        const { Redis } = require("@upstash/redis");
        redis = new Redis({ url: url || "", token: token || "" });
    }
  }
}

export default redis;
