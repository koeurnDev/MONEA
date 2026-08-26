import { Hono } from 'hono';
import { prisma } from "@/lib/prisma";

const broadcastRouter = new Hono();

/**
 * GET /api/broadcast
 * Retrieves all currently active and valid broadcast announcements
 */
broadcastRouter.get('/', async (c) => {
    try {
        // Fetch active broadcasts ensuring correct time validity (scheduled and expiration check)
        const broadcasts = await prisma.$queryRawUnsafe(`
            SELECT * FROM "Broadcast"
            WHERE active = true
            AND ( "scheduledAt" IS NULL OR "scheduledAt" <= NOW() )
            AND ( "expiresAt" IS NULL OR "expiresAt" > NOW() )
            ORDER BY "createdAt" DESC
        `);

        return c.json(broadcasts || []);
    } catch (error: any) {
        console.error("[Broadcast Fetch Error]:", error?.message || error);
        
        // Return empty array with 500 status or fallback graceful error handling
        return c.json([], 500);
    }
});

export default broadcastRouter;