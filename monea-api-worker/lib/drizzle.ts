/**
 * Drizzle ORM Database Connection for Cloudflare Workers
 * 
 * Uses @neondatabase/serverless with Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../drizzle/schema';

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let cachedDbUrl = '';

/**
 * Get DATABASE_URL from environment
 */
function getDatabaseUrl(env?: any): string {
  if (env && env.DATABASE_URL) return env.DATABASE_URL;
  if (typeof process !== 'undefined' && process.env && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL || '';
  }
  return '';
}

/**
 * Get Drizzle database instance
 * 
 * @param env - Cloudflare Workers env object (optional)
 * @returns Drizzle database instance
 */
export function getDb(env?: any) {
  const dbUrl = getDatabaseUrl(env);

  // Return cached instance if URL hasn't changed
  if (cachedDb && cachedDbUrl === dbUrl) {
    return cachedDb;
  }

  if (!dbUrl) {
    throw new Error('[Drizzle] DATABASE_URL is missing from environment variables.');
  }

  // Create Neon HTTP client
  const sql = neon(dbUrl, {
    arrayMode: false,
    fullResults: false,
  });

  // Create Drizzle instance with schema
  cachedDb = drizzle(sql, { schema });
  cachedDbUrl = dbUrl;

  return cachedDb;
}

/**
 * Lazy proxy for automatic connection
 * 
 * Usage: import { db } from '@/lib/drizzle'
 */
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

/**
 * Export schema for use in queries
 */
export { schema };

/**
 * Type helper for Drizzle transactions
 */
export type DbTransaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];
