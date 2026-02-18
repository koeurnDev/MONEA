export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "OWNER" && user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [failures, blacklistedCount, lockouts] = await Promise.all([
            prisma.log.count({ where: { action: "LOGIN_FAILURE" } }),
            (prisma as any).blacklistedIP.count(),
            prisma.user.count({ where: { lockedUntil: { gt: new Date() } } } as any)
        ]);

        // Get top failing IPs
        const topFailingIPs = await prisma.log.groupBy({
            by: ['ip'],
            where: { action: "LOGIN_FAILURE" },
            _count: { ip: true },
            orderBy: { _count: { ip: "desc" } },
            take: 5
        });

        return NextResponse.json({
            failures,
            blacklistedCount,
            activeLockouts: lockouts,
            topFailingIPs
        });
    } catch (error) {
        console.error("Security Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
