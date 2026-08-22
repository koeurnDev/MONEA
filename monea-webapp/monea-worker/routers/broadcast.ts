import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"

const broadcastRouter = new Hono()

broadcastRouter.get('/', async (c) => {
    try {
        const broadcasts = await (prisma as any).$queryRawUnsafe(`
            SELECT * FROM "Broadcast"
            WHERE active = true
            AND ( "scheduledAt" IS NULL OR "scheduledAt" <= NOW() )
            AND ( "expiresAt" IS NULL OR "expiresAt" > NOW() )
            ORDER BY "createdAt" DESC
        `);

        return c.json(broadcasts);
    } catch (error) {
        console.error("Broadcast Fetch Error:", error);
        return c.json([], 500);
    }
});

export default broadcastRouter;
