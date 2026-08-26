import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Safe AsyncLocalStorage fallback for environments without Node async_hooks
let AsyncLocalStorageClass: any;
try {
  AsyncLocalStorageClass = require("node:async_hooks").AsyncLocalStorage;
} catch {
  AsyncLocalStorageClass = class {
    getStore() {
      return null;
    }
    run(_store: any, callback: () => any) {
      return callback();
    }
  };
}

export const prismaStorage = new AsyncLocalStorageClass();

// Dynamic Prisma instance cache map
const prismaCache = new Map<string, PrismaClient>();
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Universal Environment Variable Extractor for Cloudflare Worker & Node.js
 */
function getDatabaseUrl(env?: any): string {
  if (env && env.DATABASE_URL) return env.DATABASE_URL;
  if (typeof process !== "undefined" && process.env && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL || "";
  }
  return "";
}

/**
 * Creates or retrieves a cached Prisma Client bound to Neon Driver Adapter.
 * Safe for Cloudflare Workers, Next.js Edge, and Node.js runtimes.
 */
export function getPrisma(env?: any): PrismaClient {
  const dbUrl = getDatabaseUrl(env);

  if (!dbUrl) {
    console.warn("[Prisma Error] DATABASE_URL is missing from environment variables.");
  }

  // Reuse global Prisma instance in development (Hot-reloading safety)
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;
  }

  if (prismaCache.has(dbUrl)) {
    return prismaCache.get(dbUrl)!;
  }

  // Create Neon Serverless Connection Pool
  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaNeon(pool);

  const isDev =
    (env && env.NODE_ENV === "development") ||
    (typeof process !== "undefined" && process.env?.NODE_ENV === "development");

  const client = new PrismaClient({
    adapter,
    log: isDev ? ["error", "warn"] : [],
  });

  if (dbUrl) {
    prismaCache.set(dbUrl, client);
  }

  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

/**
 * Prisma Client Proxy
 * Transparently resolves client instance via AsyncLocalStorage or dynamic env resolution.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const storeClient = prismaStorage.getStore();
    if (storeClient) {
      return (storeClient as any)[prop];
    }
    const defaultClient = getPrisma();
    return (defaultClient as any)[prop];
  },
});

/**
 * Stable Raw SQL Query Helper
 */
export async function queryRaw<T = any>(query: string, ...values: any[]): Promise<T[]> {
  try {
    return await (prisma as any).$queryRawUnsafe(query, ...values);
  } catch (error: any) {
    console.error(`[Prisma Raw Query Error] ${query}`, error?.message || error);
    throw error;
  }
}

/**
 * Stable Raw SQL Execution Helper
 */
export async function executeRaw(query: string, ...values: any[]): Promise<number> {
  try {
    return await (prisma as any).$executeRawUnsafe(query, ...values);
  } catch (error: any) {
    console.error(`[Prisma Raw Exec Error] ${query}`, error?.message || error);
    throw error;
  }
}