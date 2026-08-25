// Lazy getters so env vars are read after Hono middleware polyfills process.env in CF Workers
const getUrl = () => process.env.UPSTASH_REDIS_REST_URL || "";
const getToken = () => process.env.UPSTASH_REDIS_REST_TOKEN || "";

/**
 * MONEA Resilient Redis Client
 * Automatically catches all quota/connection errors to prevent lag and request stalls.
 */
class ResilientRedis {
  private nativeInstance: any = null;

  async get(key: string) {
    try {
      // Always use HTTP REST API in CF Workers (no native Node.js client)
      return await this.edgeFetch("get", key);
    } catch (e) {
      return null;
    }
  }

  async set(key: string, value: any, options?: { ex?: number }) {
    try {
      const body = ["SET", key, typeof value === 'string' ? value : JSON.stringify(value)];
      if (options?.ex) body.push("EX", options.ex.toString());
      return await this.edgePost(body);
    } catch (e) {
      return null;
    }
  }

  async del(key: string) {
    try {
      return await this.edgeFetch("del", key);
    } catch (e) {
      return null;
    }
  }

  async incr(key: string) {
    try {
      return await this.edgeFetch("incr", key);
    } catch (e) {
      return 1;
    }
  }

  private async getNativeClient() {
    if (this.nativeInstance) return this.nativeInstance;
    if (typeof window !== "undefined") return null;
    
    try {
      const { Redis } = await import("@upstash/redis");
      this.nativeInstance = new Redis({ url: getUrl(), token: getToken() });
      return this.nativeInstance;
    } catch (e) {
      return null;
    }
  }

  private async edgeFetch(cmd: string, key: string) {
    try {
      const url = getUrl(); const token = getToken();
      if (!url || !token) return null;
      const res = await fetch(`${url}/${cmd}/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000)
      });
      const data = await res.json();
      return data.result;
    } catch (e) {
      return null;
    }
  }

  private async edgePost(body: any[]) {
    try {
      const url = getUrl(); const token = getToken();
      if (!url || !token) return null;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000)
      });
      const data = await res.json();
      return data.result;
    } catch (e) {
      return null;
    }
  }
}

const redis = new ResilientRedis();
export default redis;
