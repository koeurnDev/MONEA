import { Hono } from 'hono';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

const dashboardCombinedRouter = new Hono();

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

        // ធ្វើ parallel queries ទាំងអស់ក្នុងពេលតែមួយ
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
                SELECT 
                    COUNT(DISTINCT g.id) as "totalGuests",
                    COUNT(DISTINCT gb.id) as "totalGuestbookEntries",
                    COUNT(DISTINCT gift.id) as "totalGifts"
                FROM "Wedding" w
                LEFT JOIN "Guest" g ON w.id = g."weddingId"
                LEFT JOIN "GuestbookEntry" gb ON w.id = gb."weddingId" 
                LEFT JOIN "Gift" gift ON w.id = gift."weddingId"
                WHERE w."userId" = ${user.userId}
                GROUP BY w.id
                LIMIT 1
            ` : []
        ]);

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
            stats: Array.isArray(stats) && stats.length > 0 ? stats[0] : {
                totalGuests: 0,
                totalGuestbookEntries: 0,
                totalGifts: 0
            },
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