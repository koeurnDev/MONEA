export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const weddingId = searchParams.get("weddingId");

        if (!weddingId) {
            return errorResponse("Missing weddingId", 400);
        }

        // Authorization: Ensure user owns this wedding or is staff for it
        if (user.role === "STAFF") {
            if ((user as any).weddingId !== weddingId) {
                return errorResponse("Forbidden: You do not have access to this wedding", 403);
            }
        } else {
            const wedding = await prisma.wedding.findUnique({
                where: { id: weddingId },
                select: { userId: true }
            });
            if (!wedding || wedding.userId !== user.userId) {
                return errorResponse("Forbidden: You do not own this wedding", 403);
            }
        }

        // Aggregate stats in fewer roundtrips
        const stats = await Promise.allSettled([
            (prisma as any).invitationAnalytics.groupBy({
                by: ['type'],
                where: { weddingId },
                _count: { _all: true }
            }),
            (prisma as any).invitationAnalytics.groupBy({
                by: ['deviceType'],
                where: { weddingId, type: "VIEW" },
                _count: { _all: true }
            })
        ]);

        const rawTypeStats = stats[0].status === 'fulfilled' ? (stats[0].value as any[]) : [];
        const rawDeviceStats = stats[1].status === 'fulfilled' ? (stats[1].value as any[]) : [];

        const getCount = (type: string) => {
            const stat = rawTypeStats.find(s => s.type === type);
            if (!stat) return 0;
            return typeof stat._count === 'object' ? (stat._count._all || 0) : (stat._count || 0);
        };

        const totalViews = getCount("VIEW");
        const mapClicks = getCount("MAP_CLICK");
        const saveDateClicks = getCount("SAVE_DATE");
        const rsvpOpens = getCount("RSVP_OPEN");
        const rsvpSubmits = getCount("RSVP_SUBMIT");

        // Get daily trend for views (last 21 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 21);

        // Efficiently group by day using raw SQL for performance
        const dailyTrendRaw: { day: Date, count: bigint }[] = await prisma.$queryRaw`
            SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count
            FROM "InvitationAnalytics"
            WHERE "weddingId" = ${weddingId} 
              AND "type" = 'VIEW'::"AnalyticsType"
              AND "createdAt" >= ${sevenDaysAgo}
            GROUP BY day
            ORDER BY day ASC
        `;

        const trendMap = new Map();
        // Initialize last 21 days with 0 to ensure continuity in chart
        for (let i = 20; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            trendMap.set(d.toISOString().split('T')[0], 0);
        }

        dailyTrendRaw.forEach((item) => {
            const dayStr = item.day.toISOString().split('T')[0];
            trendMap.set(dayStr, Number(item.count));
        });

        const formattedTrend = Array.from(trendMap.entries())
            .map(([date, count]) => ({ date, count }));

        return NextResponse.json({
            totalViews,
            mapClicks,
            saveDateClicks,
            rsvpOpens,
            rsvpSubmits,
            deviceStats: (rawDeviceStats as any[]).map((s: any) => ({
                type: s.deviceType || 'UNKNOWN',
                count: typeof s._count === 'object' ? (s._count._all || 0) : (s._count || 0)
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
