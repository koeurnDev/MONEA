const url = process.env.UPSTASH_REDIS_REST_URL || "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "";

/**
 * MONEA Resilient Redis Client
 * Automatically catches all quota/connection errors to prevent lag and request stalls.
 */
class ResilientRedis {
  private nativeInstance: any = null;

  async get(key: string) {
    try {
      if (process.env.NEXT_RUNTIME === "edge") {
        return await this.edgeFetch("get", key);
      }
      const client = await this.getNativeClient();
      return client ? await client.get(key) : await this.edgeFetch("get", key);
    } catch (e) {
      return null;
    }
  }

  async set(key: string, value: any, options?: { ex?: number }) {
    try {
      if (process.env.NEXT_RUNTIME === "edge") {
        const body = ["SET", key, typeof value === 'string' ? value : JSON.stringify(value)];
        if (options?.ex) body.push("EX", options.ex.toString());
        return await this.edgePost(body);
      }
      const client = await this.getNativeClient();
      return client ? await client.set(key, value, options) : await this.edgePost(["SET", key, value, ...(options?.ex ? ["EX", options.ex.toString()] : [])]);
    } catch (e) {
      return null;
    }
  }

  async del(key: string) {
    try {
      if (process.env.NEXT_RUNTIME === "edge") return await this.edgeFetch("del", key);
      const client = await this.getNativeClient();
      return client ? await client.del(key) : await this.edgeFetch("del", key);
    } catch (e) {
      return null;
    }
  }

  async incr(key: string) {
    try {
      if (process.env.NEXT_RUNTIME === "edge") return await this.edgeFetch("incr", key);
      const client = await this.getNativeClient();
      return client ? await client.incr(key) : await this.edgeFetch("incr", key);
    } catch (e) {
      return 1;
    }
  }

  private async getNativeClient() {
    if (this.nativeInstance) return this.nativeInstance;
    if (typeof window !== "undefined") return null;
    
    try {
      const { Redis } = await import("@upstash/redis");
      this.nativeInstance = new Redis({ url, token });
      return this.nativeInstance;
    } catch (e) {
      return null;
    }
  }

  private async edgeFetch(cmd: string, key: string) {
    try {
      if (!url || !token) return null;
      const res = await fetch(`${url}/${cmd}/${key}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(1000)
      });
      const data = await res.json();
      return data.result;
    } catch (e) {
      return null;
    }
  }

  private async edgePost(body: any[]) {
    try {
      if (!url || !token) return null;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(1000)
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
