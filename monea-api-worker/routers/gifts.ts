import { Hono } from 'hono';
import { getDb } from "@/lib/drizzle";
import { weddings } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";
import { giftSchema } from "@/lib/validations/gift";
import { GiftServiceDrizzle } from "@/lib/GiftServiceDrizzle";

function logError(api: string, error: any, context?: any) {
    console.error(`[${new Date().toISOString()}] ${api} ERROR: ${error?.message || error}`, {
        stack: error?.stack,
        context: context || {},
    });
}

const giftsRouter = new Hono();

/**
 * Helper to resolve weddingId safely from authenticated user or staff context
 */
async function resolveWeddingId(env: any, user: any): Promise<string | null> {
    if (user?.weddingId) return user.weddingId;
    const userId = user?.userId || user?.id;
    if (!userId) return null;
    
    const db = getDb(env);
    const result = await db.select({ id: weddings.id })
        .from(weddings)
        .where(eq(weddings.userId, userId))
        .limit(1);
    
    return result.length > 0 ? result[0].id : null;
}

giftsRouter.get('/stats', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const weddingId = await resolveWeddingId(c.env, user);
        if (!weddingId) return c.json({ guests: { total: 0, arrived: 0 } });

        const db = getDb(c.env);
        const { guests } = await import("@/drizzle/schema");
        const { and } = await import("drizzle-orm");

        const totalResult = await db.select({ count: guests.id })
            .from(guests)
            .where(eq(guests.weddingId, weddingId));
        
        const arrivedResult = await db.select({ count: guests.id })
            .from(guests)
            .where(and(
                eq(guests.weddingId, weddingId),
                eq(guests.hasArrived, true)
            ));

        return c.json({
            guests: {
                total: totalResult.length,
                arrived: arrivedResult.length
            }
        });
    } catch (error: any) {
        console.error("Live Stats Error:", error?.message || error);
        return c.json({ error: "Failed to fetch live stats" }, 500);
    }
});

giftsRouter.get('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const limit = parseInt(c.req.query("limit") || "50", 10);
        const offset = parseInt(c.req.query("offset") || "0", 10);

        const weddingId = await resolveWeddingId(c.env, user);
        if (!weddingId) {
            return c.json({ 
                items: [], 
                pagination: { total: 0, limit, offset, hasMore: false }, 
                role: user.role 
            });
        }

        const result = await GiftServiceDrizzle.getGifts(c.env, weddingId, { limit, offset });
        return c.json({ ...result, role: user.role });
    } catch (error: any) {
        console.error(`[Gifts API] GET ERROR:`, error?.message || error);
        return c.json({ error: "Failed to fetch gifts" }, 500);
    }
});

giftsRouter.post('/', async (c) => {
    let user: any = null;
    let body: any = null;
    try {
        user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON format" }, 400);
        }

        const validated = giftSchema.safeParse(body);
        if (!validated.success) {
            return c.json({ error: validated.error.issues }, 400);
        }

        const sanitized = sanitizeObject<any>(validated.data);
        const weddingId = await resolveWeddingId(c.env, user);

        if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

        const gift = await GiftServiceDrizzle.createGift(c.env, weddingId, sanitized);
        return c.json(gift, 201);
    } catch (error: any) {
        console.error(`[Gifts API] POST ERROR:`, error?.message || error);
        logError("Gifts POST", error, { userId: user?.userId || user?.id, body });
        return c.json({ error: "Failed to save gift", details: error?.message || "Internal Server Error" }, 500);
    }
});

export default giftsRouter;