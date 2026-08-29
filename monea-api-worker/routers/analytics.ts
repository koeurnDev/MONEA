import { Hono } from 'hono';
import { getDb } from "@/lib/drizzle";
import { weddings, guests, invitationAnalytics } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getServerUser } from "@/lib/auth";
import { queryRaw } from "@/lib/prisma";

const analyticsRouter = new Hono();

/**
 * Helper to resolve weddingId safely from authenticated user context
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

analyticsRouter.post('/track', async (c) => {
    try {
        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.text("Invalid JSON format", 400);
        }

        const { weddingId, type, guestId } = body;

        if (!weddingId || !type) {
            return c.text("Missing weddingId or type", 400);
        }

        const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
        const userAgent = c.req.header("user-agent") || "unknown";
        
        // Cryptographically hash IP for privacy compliance
        const ipBytes = new TextEncoder().encode(ip);
        const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', ipBytes);
        const ipHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('').substring(0, 16);

        const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
        const deviceType = isMobile ? "MOBILE" : "DESKTOP";

        const db = getDb(c.env);
        await db.insert(invitationAnalytics).values({
            id: globalThis.crypto.randomUUID(),
            weddingId,
            type,
            ipHash,
            userAgent: userAgent.substring(0, 255),
            deviceType
        });

        if (type === "VIEW" && guestId) {
            try {
                // Use raw SQL for increment operation
                await queryRaw(
                    'UPDATE "Guest" SET views = views + 1 WHERE id = $1',
                    guestId
                );
            } catch (e: any) {
                console.warn("[Analytics Track] Failed to increment guest view:", e?.message || e);
            }
        }

        return c.text("OK", 200);
    } catch (error: any) {
        console.error("[Tracking Error]:", error?.message || error);
        return c.text("Internal Server Error", 500);
    }
});

analyticsRouter.get('/summary', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const weddingId = await resolveWeddingId(c.env, user);
        if (!weddingId) {
            return c.json({ 
                stats: { totalGuests: 0, checkInCount: 0, totalGiftsUsd: 0, totalGiftsKhr: 0, giftsCount: 0, wishesCount: 0 },
                sourceStats: []
            });
        }

        // Use optimized raw SQL for analytics summary
        const analyticsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM "Guest" WHERE "weddingId" = $1) as "totalGuests",
                (SELECT COUNT(*) FROM "Guest" WHERE "weddingId" = $1 AND "hasArrived" = true) as "checkInCount",
                (SELECT COUNT(*) FROM "Gift" WHERE "weddingId" = $1) as "giftsCount",
                (SELECT COALESCE(SUM("amount"), 0) FROM "Gift" WHERE "weddingId" = $1 AND "currency" = 'USD') as "totalGiftsUsd",
                (SELECT COALESCE(SUM("amount"), 0) FROM "Gift" WHERE "weddingId" = $1 AND "currency" = 'KHR') as "totalGiftsKhr",
                (SELECT COUNT(*) FROM "GuestbookEntry" WHERE "weddingId" = $1) as "wishesCount"
        `;

        const sourceStatsQuery = `
            SELECT 
                COALESCE(g.source, g."group", 'មិនបានបញ្ជាក់') as source,
                COUNT(DISTINCT g.id) as guests,
                COALESCE(SUM(CASE WHEN gi.currency = 'USD' THEN gi.amount ELSE 0 END), 0) as usd,
                COALESCE(SUM(CASE WHEN gi.currency = 'KHR' THEN gi.amount ELSE 0 END), 0) as khr
            FROM "Guest" g
            LEFT JOIN "Gift" gi ON gi."guestId" = g.id AND gi."weddingId" = $1
            WHERE g."weddingId" = $1
            GROUP BY COALESCE(g.source, g."group", 'មិនបានបញ្ជាក់')
            ORDER BY COUNT(DISTINCT g.id) DESC
            LIMIT 5
        `;

        const [statsResult, sourceStats] = await Promise.all([
            queryRaw(analyticsQuery, weddingId),
            queryRaw(sourceStatsQuery, weddingId)
        ]);

        const stats = (statsResult as any[])[0];

        // Add caching for analytics (60 seconds)
        c.header('Cache-Control', 'private, max-age=60, s-maxage=0');

        return c.json({
            stats: {
                totalGuests: Number(stats.totalGuests || 0),
                checkInCount: Number(stats.checkInCount || 0),
                totalGiftsUsd: Number(stats.totalGiftsUsd || 0),
                totalGiftsKhr: Number(stats.totalGiftsKhr || 0),
                giftsCount: Number(stats.giftsCount || 0),
                wishesCount: Number(stats.wishesCount || 0)
            },
            sourceStats: sourceStats || []
        });
    } catch (error: any) {
        console.error(`[Analytics API] GET Error:`, error?.message || error);
        return c.json({ error: "Failed to fetch analytics" }, 500);
    }
});

export default analyticsRouter;