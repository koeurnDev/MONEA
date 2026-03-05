export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET() {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [totalUsers, totalWeddings, activeWeddings, newWeddingsToday, giftSummaries] = await Promise.all([
            prisma.user.count(),
            prisma.wedding.count(),
            prisma.wedding.count({ where: { status: "ACTIVE" } }),
            prisma.wedding.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            prisma.gift.groupBy({
                by: ['currency'],
                _sum: {
                    amount: true
                }
            })
        ]);

        const financialOverview = giftSummaries.reduce((acc: any, curr) => {
            acc[curr.currency] = curr._sum.amount || 0;
            return acc;
        }, { USD: 0, KHR: 0 });

        return NextResponse.json({
            totalUsers,
            totalWeddings,
            activeWeddings,
            newWeddingsToday,
            financialOverview
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
