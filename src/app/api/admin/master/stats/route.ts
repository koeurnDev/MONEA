export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET() {
    try {
        const user = await getServerUser();
        // Strict check for SUPERADMIN or OWNER
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [
            totalWeddings,
            activeWeddings,
            totalGuests,
            totalGifts,
            totalUsers,
            blacklistedIPs,
            recentWeddings
        ] = await Promise.all([
            prisma.wedding.count(),
            prisma.wedding.count({ where: { status: "ACTIVE" } }),
            prisma.guest.count(),
            prisma.gift.count(),
            prisma.user.count(),
            (prisma as any).blacklistedIP.count(),
            prisma.wedding.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    groomName: true,
                    brideName: true,
                    createdAt: true,
                    status: true,
                    packageType: true
                }
            })
        ]);

        // Aggregate gift totals (simplified)
        const giftStats = await prisma.gift.groupBy({
            by: ['currency'],
            _sum: { amount: true }
        });

        // Basic Diagnostics & Health Checks
        const dbHealth = await prisma.$queryRaw`SELECT 1`.then(() => "HEALTHY").catch(() => "UNHEALTHY");

        return NextResponse.json({
            stats: {
                totalWeddings,
                activeWeddings,
                totalGuests,
                totalGifts,
                totalUsers,
                blacklistedIPs,
                dbHealth
            },
            giftStats,
            recentWeddings
        });
    } catch (error) {
        console.error("Master Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
