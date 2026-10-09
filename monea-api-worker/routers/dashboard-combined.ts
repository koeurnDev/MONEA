import { Hono } from 'hono';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

const dashboardCombinedRouter = new Hono();
const emptyStats = {
    totalGuests: 0,
    totalGuestbookEntries: 0,
    totalGifts: 0,
};

/**
 * GET /api/dashboard/init
 * ទាញយកទិន្នន័យទាំងអស់ក្នុងពេលតែមួយ - user, wedding, broadcasts, stats
 */
dashboardCombinedRouter.get('/init', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        
        if (!user) {
            return c.json({ 
                success: false, 
                authenticated: false, 
                message: 'Not authenticated' 
            }, 401);
        }

        // Run independent dashboard reads together; measure their wall time separately
        // from the full Worker request duration emitted by the app middleware.
        const databaseStartedAt = performance.now();
        const [userDetails, wedding, broadcasts, stats] = await Promise.all([
            // User details with wedding
            prisma.user.findUnique({
                where: { id: user.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    twoFactorEnabled: true,
                }
            }),
            
            // Wedding info
            prisma.wedding.findFirst({
                where: { userId: user.userId },
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    groomName: true,
                    brideName: true,
                    date: true,
                    location: true,
                    status: true,
                    packageType: true,
                    eventType: true,
                    templateId: true,
                    themeSettings: true,
                    createdAt: true,
                },
            }),
            
            // Active broadcasts
            prisma.$queryRawUnsafe(`
                SELECT * FROM "Broadcast"
                WHERE active = true
                AND ( "scheduledAt" IS NULL OR "scheduledAt" <= NOW() )
                AND ( "expiresAt" IS NULL OR "expiresAt" > NOW() )
                ORDER BY "createdAt" DESC
            `),
            
            // Quick stats (if user has wedding)
            user.userId ? prisma.$queryRaw`
                WITH primary_wedding AS (
                    SELECT id
                    FROM "Wedding"
                    WHERE "userId" = ${user.userId}
                    ORDER BY "createdAt" ASC
                    LIMIT 1
                ),
                guest_stats AS (
                    SELECT
                        COUNT(*)::int AS "totalGuests"
                    FROM "Guest"
                    WHERE "weddingId" = (SELECT id FROM primary_wedding)
                ),
                guestbook_stats AS (
                    SELECT COUNT(*)::int AS "totalGuestbookEntries"
                    FROM "GuestbookEntry"
                    WHERE "weddingId" = (SELECT id FROM primary_wedding)
                ),
                gift_stats AS (
                    SELECT COUNT(*)::int AS "totalGifts"
                    FROM "Gift"
                    WHERE "weddingId" = (SELECT id FROM primary_wedding)
                )
                SELECT guest_stats.*, guestbook_stats.*, gift_stats.*
                FROM primary_wedding
                CROSS JOIN guest_stats
                CROSS JOIN guestbook_stats
                CROSS JOIN gift_stats
            ` : []
        ]);
        c.header('Server-Timing', `dashboard-db;dur=${(performance.now() - databaseStartedAt).toFixed(1)}`);

        const dashboardData = {
            success: true,
            authenticated: true,
            user: {
                ...userDetails,
                type: "user",
                weddingId: wedding?.id ?? null,
                wedding: wedding ?? null,
                _count: { weddings: wedding ? 1 : 0 },
            },
            broadcasts: broadcasts || [],
            stats: Array.isArray(stats) && stats.length > 0 ? stats[0] : emptyStats,
            timestamp: new Date().toISOString()
        };

        return c.json(dashboardData);
        
    } catch (error: any) {
        console.error("[Dashboard Init] Error:", error);
        return c.json({ 
            success: false,
            error: "Failed to load dashboard data",
            details: error?.message 
        }, 500);
    }
});

export default dashboardCombinedRouter;