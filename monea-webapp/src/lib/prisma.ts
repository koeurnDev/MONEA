import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { AsyncLocalStorage } from 'node:async_hooks';

export const prismaStorage = new AsyncLocalStorage<PrismaClient>();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let _prismaClient: PrismaClient | null = null;

/**
 * Creates Prisma Client for Node.js environments
 * Used in development and server-side rendering
 */
function getPrisma() {
    if (!_prismaClient) {
        if (!process.env.DATABASE_URL) {
            console.warn("[Prisma] DATABASE_URL is not set yet.");
        }
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaNeon(pool);
        _prismaClient = new PrismaClient({
            adapter,
            log: process.env.NODE_ENV === "development" ? ["error", "warn"] : [],
        });
        if (process.env.NODE_ENV !== "production") {
            globalForPrisma.prisma = _prismaClient;
        }
    }
    return _prismaClient;
}

/**
 * Prisma Client Proxy
 * Works in Node.js with AsyncLocalStorage support
 * For Cloudflare Workers, use getDb() from @/lib/db instead
 */
export const prisma = new Proxy({} as PrismaClient, {
    get(target, prop) {
        const storeClient = prismaStorage.getStore();
        if (storeClient) {
            return (storeClient as any)[prop];
        }
        return (getPrisma() as any)[prop];
    }
});

/**
 * Stable Raw SQL Query Helper for Windows Development
 * Bypasses Prisma Client synchronization issues by using direct raw queries.
 */
export async function queryRaw<T = any>(query: string, ...values: any[]): Promise<T[]> {
    try {
        // Use $queryRawUnsafe but with a better variable handler for Windows
        return await (prisma as any).$queryRawUnsafe(query, ...values);
    } catch (error: any) {
        console.error(`[Prisma Raw Query Error] ${query}`, error.message);
        throw error;
    }
}

/**
 * Stable Raw SQL Execution Helper for Windows Development
 */
export async function executeRaw(query: string, ...values: any[]): Promise<number> {
    try {
        return await (prisma as any).$executeRawUnsafe(query, ...values);
    } catch (error: any) {
        console.error(`[Prisma Raw Exec Error] ${query}`, error.message);
        throw error;
    }
}
