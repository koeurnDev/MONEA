export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma, queryRaw } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET() {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const today = new Date(new Date().setHours(0, 0, 0, 0));

        const [userResults, weddingResults, activeResults, todayResults, giftResults] = await Promise.all([
            queryRaw('SELECT count(*) as count FROM "User"'),
            queryRaw('SELECT count(*) as count FROM "Wedding"'),
            queryRaw('SELECT count(*) as count FROM "Wedding" WHERE status = \'ACTIVE\''),
            queryRaw('SELECT count(*) as count FROM "Wedding" WHERE "createdAt" >= $1', today),
            queryRaw('SELECT currency, SUM(amount) as amount FROM "Gift" GROUP BY currency')
        ]);

        const financialOverview = giftResults.reduce((acc: any, curr: any) => {
            acc[curr.currency] = Number(curr.amount || 0);
            return acc;
        }, { USD: 0, KHR: 0 });

        return NextResponse.json({
            totalUsers: Number(userResults[0]?.count || 0),
            totalWeddings: Number(weddingResults[0]?.count || 0),
            activeWeddings: Number(activeResults[0]?.count || 0),
            newWeddingsToday: Number(todayResults[0]?.count || 0),
            financialOverview
        });
    } catch (error) {
        console.error("[Admin Stats API] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
