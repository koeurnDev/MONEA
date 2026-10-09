import { Hono } from 'hono';
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        const requestedWeddingId = c.req.query('weddingId');
        const isPlatformOwner = user.role === 'SUPERADMIN' || user.role === 'PLATFORM_OWNER';
        let weddingId: string | undefined = requestedWeddingId || (user as any).weddingId;

        if (user.role === 'STAFF' || user.role === 'EVENT_STAFF') {
            if (weddingId !== (user as any).weddingId) {
                return c.json({ error: "Forbidden" }, 403);
            }
        } else if (!isPlatformOwner && userId) {
            const wedding = await prisma.wedding.findFirst({
                where: requestedWeddingId
                    ? { id: requestedWeddingId, userId }
                    : { userId },
                select: { id: true },
            });
            weddingId = wedding?.id ?? undefined;
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
                },
            });
        }

        const databaseStartedAt = performance.now();
        const [
            totalGuests,
            checkInCount,
            giftsUsd,
            giftsKhr,
            giftsCount,
            wishesCount,
        ] = await Promise.all([
            prisma.guest.count({ where: { weddingId: effectiveWeddingId } }),
            prisma.guest.count({ where: { weddingId: effectiveWeddingId, hasArrived: true } }),
            prisma.gift.aggregate({
                where: { weddingId: effectiveWeddingId, currency: 'USD' },
                _sum: { amount: true },
            }),
            prisma.gift.aggregate({
                where: { weddingId: effectiveWeddingId, currency: 'KHR' },
                _sum: { amount: true },
            }),
            prisma.gift.count({ where: { weddingId: effectiveWeddingId } }),
            prisma.guestbookEntry.count({ where: { weddingId: effectiveWeddingId } }),
        ]);
        c.header('Server-Timing', `dashboard-db;dur=${(performance.now() - databaseStartedAt).toFixed(1)}`);

        const stats = {
            totalGuests,
            checkInCount,
            totalGiftsUsd: Number(giftsUsd._sum.amount ?? 0),
            totalGiftsKhr: Number(giftsKhr._sum.amount ?? 0),
            giftsCount,
            wishesCount,
        };

        c.header('Cache-Control', 'private, max-age=120, stale-while-revalidate=240');
        c.header('CDN-Cache-Control', 'max-age=60');
        c.header('X-Content-Type-Options', 'nosniff');

        return c.json({ data: stats });
    } catch (error: any) {
        console.error('[Dashboard Stats Error]:', error?.message || error);
        return c.json({
            error: 'Failed to fetch dashboard statistics',
            details: error?.message || 'Internal Server Error',
        }, 500);
    }
});

export default dashboardRouter;