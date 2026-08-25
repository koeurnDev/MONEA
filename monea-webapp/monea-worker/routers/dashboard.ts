import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"

const dashboardRouter = new Hono()

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

        // Get weddingId from query params or user
        const weddingId = c.req.query('weddingId') || user.weddingId;
        
        if (!weddingId) {
            // If no weddingId, try to find user's first wedding
            const wedding = await prisma.wedding.findFirst({ 
                where: { userId: user.userId || user.id } 
            });
            
            if (!wedding) {
                console.log(`[Dashboard Stats] No wedding found for user ${user.userId || user.id}`);
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
        }

        const effectiveWeddingId = weddingId || (await prisma.wedding.findFirst({ 
            where: { userId: user.userId || user.id } 
        }))?.id;

        if (!effectiveWeddingId) {
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

        // Fetch all stats in parallel
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

        // Format recent activities
        const recentActivities = [
            ...recentGifts.map(gift => ({
                type: 'gift',
                message: `${gift.guest?.name || 'Anonymous'} sent a gift of ${gift.amount} ${gift.currency}`,
                timestamp: gift.createdAt
            })),
            ...recentWishes.map(wish => ({
                type: 'wish',
                message: `${wish.guestName || 'Anonymous'} left a message`,
                timestamp: wish.createdAt
            })),
            ...recentGuests.map(guest => ({
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

        console.log(`[Dashboard Stats] Successfully fetched stats:`, { 
            totalGuests, 
            checkInCount, 
            giftsCount,
            userId: user.userId || user.id 
        });

        return c.json({ data: stats });
    } catch (error: any) {
        console.error('[Dashboard Stats] Error:', error);
        return c.json({ 
            error: "Failed to fetch dashboard statistics",
            details: error.message 
        }, 500);
    }
});

export default dashboardRouter;
