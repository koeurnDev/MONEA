import { Hono } from 'hono';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

const analyticsRouter = new Hono();

/**
 * Helper to resolve weddingId safely from authenticated user context
 */
async function resolveWeddingId(user: any): Promise<string | null> {
    if (user?.weddingId) return user.weddingId;
    const userId = user?.userId || user?.id;
    if (!userId) return null;
    const wedding = await prisma.wedding.findFirst({ where: { userId } });
    return wedding?.id || null;
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

        await (prisma as any).invitationAnalytics.create({
            data: {
                weddingId,
                type,
                ipHash,
                userAgent: userAgent.substring(0, 255),
                deviceType
            }
        });

        if (type === "VIEW" && guestId) {
            try {
                await prisma.guest.update({
                    where: { id: guestId },
                    data: { views: { increment: 1 } }
                });
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

        const weddingId = await resolveWeddingId(user);
        if (!weddingId) {
            return c.json({ 
                stats: { totalGuests: 0, checkInCount: 0, totalGiftsUsd: 0, totalGiftsKhr: 0, giftsCount: 0, wishesCount: 0 },
                sourceStats: []
            });
        }

        const [
            guestStats,
            checkInStats,
            giftStats,
            giftUsdStats,
            giftKhrStats,
            wishesStats,
            guestsBySource,
            giftsByGuest
        ] = await Promise.all([
            prisma.guest.count({ where: { weddingId } }),
            prisma.guest.count({ where: { weddingId, hasArrived: true } }),
            prisma.gift.count({ where: { weddingId } }),
            prisma.gift.aggregate({ where: { weddingId, currency: 'USD' }, _sum: { amount: true } }),
            prisma.gift.aggregate({ where: { weddingId, currency: 'KHR' }, _sum: { amount: true } }),
            prisma.guestbookEntry.count({ where: { weddingId } }),
            prisma.guest.groupBy({ by: ['source', 'group'], where: { weddingId }, _count: { id: true } }),
            prisma.gift.findMany({ where: { weddingId }, include: { guest: { select: { source: true, group: true } } } })
        ]);

        const sourceMap: Record<string, { guests: number; usd: number; khr: number }> = {};
        
        guestsBySource.forEach((g: any) => {
            const source = g.source || g.group || "មិនបានបញ្ជាក់";
            if (!sourceMap[source]) sourceMap[source] = { guests: 0, usd: 0, khr: 0 };
            sourceMap[source].guests += g._count.id;
        });

        giftsByGuest.forEach((gift: any) => {
            const source = gift.guest?.source || gift.guest?.group || "មិនបានបញ្ជាក់";
            if (sourceMap[source]) {
                if (gift.currency === 'USD') sourceMap[source].usd += Number(gift.amount || 0);
                if (gift.currency === 'KHR') sourceMap[source].khr += Number(gift.amount || 0);
            }
        });

        const sortedSources = Object.entries(sourceMap)
            .sort((a: any, b: any) => b[1].guests - a[1].guests)
            .slice(0, 5);

        return c.json({
            stats: {
                totalGuests: guestStats,
                checkInCount: checkInStats,
                totalGiftsUsd: Number(giftUsdStats._sum.amount || 0),
                totalGiftsKhr: Number(giftKhrStats._sum.amount || 0),
                giftsCount: giftStats,
                wishesCount: wishesStats
            },
            sourceStats: sortedSources
        });
    } catch (error: any) {
        console.error(`[Analytics API] GET Error:`, error?.message || error);
        return c.json({ error: "Failed to fetch analytics" }, 500);
    }
});

export default analyticsRouter;