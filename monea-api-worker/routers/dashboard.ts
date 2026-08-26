import { Hono } from 'hono';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

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
            const wedding = await prisma.wedding.findFirst({ 
                where: { userId } 
            });
            weddingId = wedding?.id;
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

        console.log(`[Dashboard Stats] Fetching stats for wedding ${effectiveWeddingId}`);

        // Fetch all stats in parallel for maximum performance
        const [
            totalGuests,
            checkInCount, 
            giftsUsd,
            giftsKhr,
            giftsCount,
            wishesCount,
            recentGifts,
            recentWishes,
            recentGuests
        ] = await Promise.all([
            prisma.guest.count({ where: { weddingId: effectiveWeddingId } }),
            prisma.guest.count({ where: { weddingId: effectiveWeddingId, hasArrived: true } }),
            prisma.gift.aggregate({ 
                where: { weddingId: effectiveWeddingId, currency: 'USD' }, 
                _sum: { amount: true } 
            }),
            prisma.gift.aggregate({ 
                where: { weddingId: effectiveWeddingId, currency: 'KHR' }, 
                _sum: { amount: true } 
            }),
            prisma.gift.count({ where: { weddingId: effectiveWeddingId } }),
            prisma.guestbookEntry.count({ where: { weddingId: effectiveWeddingId } }),
            prisma.gift.findMany({
                where: { weddingId: effectiveWeddingId },
                include: { guest: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.guestbookEntry.findMany({
                where: { weddingId: effectiveWeddingId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { message: true, guestName: true, createdAt: true }
            }),
            prisma.guest.findMany({
                where: { weddingId: effectiveWeddingId, hasArrived: true },
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: { name: true, updatedAt: true }
            })
        ]);

        // Format and merge recent activities
        const recentActivities = [
            ...recentGifts.map((gift: any) => ({
                type: 'gift',
                message: `${gift.guest?.name || 'Anonymous'} sent a gift of ${gift.amount} ${gift.currency}`,
                timestamp: gift.createdAt
            })),
            ...recentWishes.map((wish: any) => ({
                type: 'wish',
                message: `${wish.guestName || 'Anonymous'} left a message`,
                timestamp: wish.createdAt
            })),
            ...recentGuests.map((guest: any) => ({
                type: 'checkin',
                message: `${guest.name} checked in`,
                timestamp: guest.updatedAt
            }))
        ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

        const stats = {
            totalGuests,
            checkInCount,
            totalGiftsUsd: Number(giftsUsd._sum.amount || 0),
            totalGiftsKhr: Number(giftsKhr._sum.amount || 0),
            giftsCount,
            wishesCount,
            recentActivities
        };

        console.log(`[Dashboard Stats] Successfully fetched stats for user:`, { 
            totalGuests, 
            checkInCount, 
            giftsCount,
            userId 
        });

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