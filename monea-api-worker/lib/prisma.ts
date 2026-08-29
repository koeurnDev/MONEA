import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

let cachedPrisma: PrismaClient | null = null;
let cachedDbUrl = "";

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
 * Prisma over Neon HTTP (fetch). WebSocket Pool connections fail on
 * Cloudflare Workers with HTTP 403 instead of 101 Switching Protocols.
 */
export function getPrisma(env?: any): PrismaClient {
  const dbUrl = getDatabaseUrl(env);

  if (cachedPrisma && cachedDbUrl === dbUrl) {
    return cachedPrisma;
  }

  if (!dbUrl) {
    console.warn("[Prisma Error] DATABASE_URL is missing from environment variables.");
  }

  const sql = neon(dbUrl, {
    arrayMode: false,
    fullResults: false,
  });
  
  const adapter = new PrismaNeonHTTP(sql);

  cachedPrisma = new PrismaClient({
    adapter,
    log: [],
  });
  cachedDbUrl = dbUrl;

  return cachedPrisma;
}

/**
 * Lazy proxy so the client is created after Worker env is available.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
});

import { getRawSql } from "./db-raw";

/**
 * Simple helper functions for raw SQL (legacy compatibility)
 */
export async function queryRaw<T = any>(query: string, ...values: any[]): Promise<T[]> {
  try {
    const sql = getRawSql();
    return await sql(query, values) as T[];
  } catch (error: any) {
    console.error(`[Prisma Raw Query Error] ${query}`, error?.message || error);
    throw error;
  }
}

export async function executeRaw(query: string, ...values: any[]): Promise<number> {
  try {
    const sql = getRawSql();
    const result = await sql(query, values, { fullResults: true }) as any;
    return result.rowCount || 0;
  } catch (error: any) {
    console.error(`[Prisma Raw Exec Error] ${query}`, error?.message || error);
    throw error;
  }
}
