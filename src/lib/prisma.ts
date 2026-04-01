import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : [],
    });

if (process.env.NODE_ENV !== "production" || !globalForPrisma.prisma) {
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
