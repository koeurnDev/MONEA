/**
 * Neon Serverless HTTP Driver for Cloudflare Workers
 * 
 * Uses HTTP-based queries instead of WebSocket/TCP connections.
 * Stateless and highly optimized for Cloudflare Workers Edge Runtime.
 */
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Client cache map indexed by database connection string
const clientCache = new Map<string, NeonQueryFunction<false, false>>();

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
 * Retrieves a Neon HTTP SQL client instance bound to the request environment.
 * Safe for Cloudflare Workers, Next.js Edge, and Node.js runtimes.
 */
export function getDb(env?: any): NeonQueryFunction<false, false> {
  const dbUrl = getDatabaseUrl(env);

  if (!dbUrl) {
    throw new Error('[DB Error] DATABASE_URL environment variable is missing.');
  }

  // Return cached Neon client if already initialized for this connection string
  if (clientCache.has(dbUrl)) {
    return clientCache.get(dbUrl)!;
  }

  // Create new Neon HTTP client instance
  const sql = neon(dbUrl);
  clientCache.set(dbUrl, sql);

  return sql;
}

// Helper type for typed query results
export type DbQueryResult<T> = T[];