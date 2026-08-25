/**
 * Neon Serverless HTTP Driver for Cloudflare Workers
 * 
 * This uses HTTP-based queries instead of WebSocket/TCP connections.
 * Perfect for Cloudflare Workers - no connection pooling issues!
 */
import { neon } from '@neondatabase/serverless';

// Singleton HTTP client (safe for Workers because it's stateless HTTP)
let _sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('[DB] DATABASE_URL is required');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Helper type for query results
export type DbQueryResult<T> = T[];
