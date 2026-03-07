import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const weddingId = searchParams.get("weddingId");

        if (!weddingId) {
            return NextResponse.json({ error: "Missing weddingId" }, { status: 400 });
        }

        // Aggregate stats in fewer roundtrips
        const stats = await Promise.allSettled([
            (prisma as any).invitationAnalytics.groupBy({
                by: ['type'],
                where: { weddingId },
                _count: true
            }),
            (prisma as any).invitationAnalytics.groupBy({
                by: ['deviceType'],
                where: { weddingId, type: "VIEW" },
                _count: true
            })
        ]);

        const rawTypeStats = stats[0].status === 'fulfilled' ? (stats[0].value as any[]) : [];
        const rawDeviceStats = stats[1].status === 'fulfilled' ? (stats[1].value as any[]) : [];

        const getCount = (type: string) => rawTypeStats.find(s => s.type === type)?._count || 0;

        const totalViews = getCount("VIEW");
        const mapClicks = getCount("MAP_CLICK");
        const saveDateClicks = getCount("SAVE_DATE");

        // Get daily trend for views (last 21 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 21);

        const dailyTrend = await (prisma as any).invitationAnalytics.findMany({
            where: {
                weddingId,
                type: "VIEW",
                createdAt: { gte: sevenDaysAgo }
            },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' }
        }).catch(() => []);

        // Group by day manually
        const trendMap = new Map();

        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            trendMap.set(d.toISOString().split('T')[0], 0);
        }

        dailyTrend.forEach((item: any) => {
            const day = item.createdAt.toISOString().split('T')[0];
            if (trendMap.has(day) || dailyTrend.length < 100) { // Keep focus on recent or include all if low volume
                trendMap.set(day, (trendMap.get(day) || 0) + 1);
            }
        });

        const formattedTrend = Array.from(trendMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({
            totalViews,
            mapClicks,
            saveDateClicks,
            deviceStats: (rawDeviceStats as any[]).map((s: any) => ({
                type: s.deviceType || 'UNKNOWN',
                count: s._count || (s._count === 0 ? 0 : 0)
            })),
            dailyTrend: formattedTrend
        });
    } catch (error) {
        console.error("Analytics Fetch Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            totalViews: 0,
            mapClicks: 0,
            saveDateClicks: 0,
            deviceStats: [],
            dailyTrend: []
        }, { status: 500 });
    }
}
