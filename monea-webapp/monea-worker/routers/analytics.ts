import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"
import crypto from "crypto"

const analyticsRouter = new Hono()

analyticsRouter.post('/track', async (c) => {
    try {
        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.text("Invalid JSON", 400);
        }
        const { weddingId, type } = body;

        if (!weddingId || !type) {
            return c.text("Missing weddingId or type", 400);
        }

        const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
        const userAgent = c.req.header("user-agent") || "unknown";
        
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

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

        if (type === "VIEW" && body.guestId) {
            try {
                await prisma.guest.update({
                    where: { id: body.guestId },
                    data: { views: { increment: 1 } }
                });
            } catch (e) {
                // Silently fail
            }
        }

        return c.text("OK", 200);
    } catch (error) {
        console.error("Tracking Error:", error);
        return c.text("Internal Server Error", 500);
    }
});

analyticsRouter.get('/summary', async (c) => {
    try {
        const user = await getServerUser();
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const weddingId = (user as any).weddingId || (await prisma.wedding.findFirst({ where: { userId: user.userId || (user as any).id } }))?.id;
        if (!weddingId) return c.json({ 
            stats: { totalGuests: 0, checkInCount: 0, totalGiftsUsd: 0, totalGiftsKhr: 0, giftsCount: 0, wishesCount: 0 },
            sourceStats: []
        });

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

        const sourceMap: any = {};
        guestsBySource.forEach(g => {
            const source = g.source || g.group || "មិនបានបញ្ជាក់";
            if (!sourceMap[source]) sourceMap[source] = { guests: 0, usd: 0, khr: 0 };
            sourceMap[source].guests += g._count.id;
        });

        giftsByGuest.forEach(gift => {
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
        console.error(`[Analytics API] GET Error:`, error);
        return c.json({ error: "Failed to fetch analytics" }, 500);
    }
});

export default analyticsRouter;
