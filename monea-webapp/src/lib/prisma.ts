import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
    // CF Workers / Edge: always use Neon HTTP adapter (no TCP sockets)
    // Node.js dev: use Neon adapter too when DATABASE_URL is set (Neon supports it)
    // This makes the client work identically in both runtimes.
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : [],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

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
