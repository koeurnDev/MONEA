import { PrismaClient } from "@prisma/client";
import { neon, types as neonTypes, type NeonQueryFunction } from "@neondatabase/serverless";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

let cachedPrisma: PrismaClient | null = null;
let cachedDbUrl = "";

/**
 * `@prisma/adapter-neon` normalises date/time columns itself (`customParsers`):
 * it expects the *raw Postgres text* for DATE / TIMESTAMP and a TIMESTAMPTZ with
 * the "+HH" suffix stripped. The `@neondatabase/serverless` HTTP query path does
 * not do that - it runs pg's text parsers, which turn those columns into `Date`
 * objects - so every Prisma read that touched a date column failed with:
 *
 *   P2023 Inconsistent column data: Conversion failed:
 *   expected a string in column 'updatedAt', found {}
 *
 * That broke `/api/pricing` (which masks the failure by falling back to
 * hard-coded prices), `/api/system/maintenance`, payments, guests, weddings and
 * every admin list. `neon()` in @neondatabase/serverless 0.10.x ignores a
 * client-level `types` option, so the parser map is injected per call instead.
 */
const TEXT_FORMAT = "text";

// pg type OIDs - see https://github.com/brianc/node-pg-types
const OID_DATE = 1082;
const OID_TIMESTAMP = 1114;
const OID_TIMESTAMPTZ = 1184;

const RAW_TEXT_DATE_OIDS = new Set<number>([OID_DATE, OID_TIMESTAMP, OID_TIMESTAMPTZ]);

const defaultGetTypeParser = neonTypes.getTypeParser as unknown as (
  oid: number,
  format?: string
) => (value: any) => any;

/**
 * Mirrors @prisma/adapter-neon's own `customParsers` rules exactly, so the HTTP
 * path behaves like the WS/Pool path the adapter ships tests for.
 */
function prismaGetTypeParser(oid: number, format?: string) {
  if (format === TEXT_FORMAT && RAW_TEXT_DATE_OIDS.has(oid)) {
    return oid === OID_TIMESTAMPTZ
      ? (value: string) => value.split("+")[0]
      : (value: string) => value;
  }
  return defaultGetTypeParser(oid, format);
}

const PRISMA_TYPE_PARSERS = { getTypeParser: prismaGetTypeParser };

/**
 * Prisma's HTTP adapter calls the driver as `sql(text, params, options)` and
 * never passes `types`, so the adapter-compatible parsers are merged into every
 * call. Tagged-template calls (used by nothing in this Worker, but part of the
 * driver's API) are forwarded untouched.
 */
// Note: `ReturnType<typeof neon>` resolves to NeonQueryFunction<boolean, boolean>
// under the project's TypeScript, which is *not* assignable to the concrete
// NeonQueryFunction<false, false> the factory returns, so the driver's own
// generic parameters are used instead.
function toPrismaQueryFunction(sql: NeonQueryFunction<any, any>): NeonQueryFunction<boolean, boolean> {
  const prismaQuery = (...args: unknown[]) => {
    const [first, second, third] = args;
    if (typeof first === "string") {
      return (sql as any)(first, second, {
        ...((third as Record<string, unknown>) ?? {}),
        types: PRISMA_TYPE_PARSERS,
      });
    }
    return (sql as any)(...args);
  };

  return prismaQuery as unknown as NeonQueryFunction<boolean, boolean>;
}

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

  const adapter = new PrismaNeonHTTP(toPrismaQueryFunction(sql));

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
    // neon tagged template function used as a regular function takes (query, params[])
    return await (sql as any)(query, values) as T[];
  } catch (error: any) {
    console.error(`[Prisma Raw Query Error]`, error?.message || error);
    throw error;
  }
}

export async function executeRaw(query: string, ...values: any[]): Promise<number> {
  try {
    const sql = getRawSql();
    const result = await (sql as any)(query, values, { fullResults: true }) as any;
    return result?.rowCount || 0;
  } catch (error: any) {
    console.error(`[Prisma Raw Exec Error]`, error?.message || error);
    throw error;
  }
}
