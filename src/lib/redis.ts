const url = process.env.UPSTASH_REDIS_REST_URL || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";

/**
 * MONEA Resilient Redis Client
 * Automatically switches between manual fetch-based REST (Edge/Middleware)
 * and native @upstash/redis (Node.js) to resolve runtime and bundling conflicts.
 */
class ResilientRedis {
  private nativeInstance: any = null;

  async get(key: string) {
    if (process.env.NEXT_RUNTIME === "edge") {
      return this.edgeFetch("get", key);
    }
    const client = await this.getNativeClient();
    return client ? client.get(key) : this.edgeFetch("get", key);
  }

  async set(key: string, value: any, options?: { ex?: number }) {
    if (process.env.NEXT_RUNTIME === "edge") {
      const body = ["SET", key, typeof value === 'string' ? value : JSON.stringify(value)];
      if (options?.ex) body.push("EX", options.ex.toString());
      return this.edgePost(body);
    }
    const client = await this.getNativeClient();
    return client ? client.set(key, value, options) : this.edgePost(["SET", key, value, ...(options?.ex ? ["EX", options.ex.toString()] : [])]);
  }

  async del(key: string) {
    if (process.env.NEXT_RUNTIME === "edge") return this.edgeFetch("del", key);
    const client = await this.getNativeClient();
    return client ? client.del(key) : this.edgeFetch("del", key);
  }

  async incr(key: string) {
    if (process.env.NEXT_RUNTIME === "edge") return this.edgeFetch("incr", key);
    const client = await this.getNativeClient();
    return client ? client.incr(key) : this.edgeFetch("incr", key);
  }

  private async getNativeClient() {
    if (this.nativeInstance) return this.nativeInstance;
    if (typeof window !== "undefined") return null; // Safety for client-side
    
    try {
      // Use dynamic import instead of require to stay ESM-clean
      const { Redis } = await import("@upstash/redis");
      this.nativeInstance = new Redis({ url, token });
      return this.nativeInstance;
    } catch (e) {
      // Fallback for missing credentials in dev
      if (process.env.NODE_ENV === "development" && (!url || !token)) return null;
      throw e;
    }
  }

  private async edgeFetch(cmd: string, key: string) {
    try {
      const res = await fetch(`${url}/${cmd}/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return data.result;
    } catch (e) {
      console.error(`[Redis Edge] ${cmd} failure:`, e);
      return null;
    }
  }

  private async edgePost(body: any[]) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return data.result;
    } catch (e) {
      console.error("[Redis Edge] POST failure:", e);
      return "ERROR";
    }
  }
}

const redis = new ResilientRedis();
export default redis;
