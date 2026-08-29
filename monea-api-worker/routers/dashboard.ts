import { Hono } from 'hono';
import { getDb } from "@/lib/drizzle";
import { weddings } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getServerUser } from "@/lib/auth";
import { queryRaw } from "@/lib/prisma";

const dashboardRouter = new Hono();

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics for the authenticated user's wedding
 */
dashboardRouter.get('/stats', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            console.log("[Dashboard Stats] No authenticated user found");
            return c.json({ error: "Unauthorized" }, 401);
        }

        const userId = user.userId || user.id;

        // Get weddingId from query params or user context
        let weddingId = c.req.query('weddingId') || (user as any).weddingId;
        
        if (!weddingId && userId) {
            const db = getDb(c.env);
            const result = await db.select({ id: weddings.id })
                .from(weddings)
                .where(eq(weddings.userId, userId))
                .limit(1);
            weddingId = result.length > 0 ? result[0].id : null;
        }

        const effectiveWeddingId = weddingId;

        if (!effectiveWeddingId) {
            console.log(`[Dashboard Stats] No wedding found for user ${userId}`);
            return c.json({ 
                data: {
                    totalGuests: 0,
                    checkInCount: 0,
                    totalGiftsUsd: 0,
                    totalGiftsKhr: 0,
                    giftsCount: 0,
                    wishesCount: 0,
                    recentActivities: []
                }
            });
        }

        console.log(`[Dashboard Stats] Fetching optimized stats for wedding ${effectiveWeddingId}`);

        // Use raw SQL for better performance - single optimized query
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM "Guest" WHERE "weddingId" = $1) as "totalGuests",
                (SELECT COUNT(*) FROM "Guest" WHERE "weddingId" = $1 AND "hasArrived" = true) as "checkInCount",
                (SELECT COALESCE(SUM("amount"), 0) FROM "Gift" WHERE "weddingId" = $1 AND "currency" = 'USD') as "totalGiftsUsd",
                (SELECT COALESCE(SUM("amount"), 0) FROM "Gift" WHERE "weddingId" = $1 AND "currency" = 'KHR') as "totalGiftsKhr",
                (SELECT COUNT(*) FROM "Gift" WHERE "weddingId" = $1) as "giftsCount",
                (SELECT COUNT(*) FROM "GuestbookEntry" WHERE "weddingId" = $1) as "wishesCount"
        `;

        const [statsResult] = await queryRaw(statsQuery, effectiveWeddingId);

        // Get recent activities with a single optimized query
        const recentActivitiesQuery = `
            (SELECT 'gift' as type, 
                    CONCAT(g.name, ' sent a gift of ', gi.amount, ' ', gi.currency) as message,
                    gi."createdAt" as timestamp
             FROM "Gift" gi 
             LEFT JOIN "Guest" g ON gi."guestId" = g.id 
             WHERE gi."weddingId" = $1 
             ORDER BY gi."createdAt" DESC LIMIT 5)
            UNION ALL
            (SELECT 'wish' as type,
                    CONCAT(ge."guestName", ' left a message') as message,
                    ge."createdAt" as timestamp
             FROM "GuestbookEntry" ge
             WHERE ge."weddingId" = $1
             ORDER BY ge."createdAt" DESC LIMIT 3)
            UNION ALL
            (SELECT 'checkin' as type,
                    CONCAT(g.name, ' checked in') as message,
                    g."updatedAt" as timestamp
             FROM "Guest" g
             WHERE g."weddingId" = $1 AND g."hasArrived" = true
             ORDER BY g."updatedAt" DESC LIMIT 3)
            ORDER BY timestamp DESC LIMIT 10
        `;

        const recentActivities = await queryRaw(recentActivitiesQuery, effectiveWeddingId);

        const stats = {
            totalGuests: Number((statsResult as any).total_guests || 0),
            checkInCount: Number((statsResult as any).checkin_count || 0),
            totalGiftsUsd: Number((statsResult as any).total_usd || 0),
            totalGiftsKhr: Number((statsResult as any).total_khr || 0),
            giftsCount: Number((statsResult as any).gifts_count || 0),
            wishesCount: Number((statsResult as any).wishes_count || 0),
            recentActivities: [] // Simplified for ultra performance
        };

        console.log(`[Dashboard Stats] Ultra-fast stats fetched:`, { 
            totalGuests: stats.totalGuests, 
            checkInCount: stats.checkInCount, 
            giftsCount: stats.giftsCount,
            userId 
        });

        // Add streaming-friendly headers
        c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=240');
        c.header('CDN-Cache-Control', 'max-age=60');
        c.header('X-Content-Type-Options', 'nosniff');

        return c.json({ data: stats });
    } catch (error: any) {
        console.error('[Dashboard Stats Error]:', error?.message || error);
        return c.json({ 
            error: "Failed to fetch dashboard statistics",
            details: error?.message || "Internal Server Error"
        }, 500);
    }
});

export default dashboardRouter;