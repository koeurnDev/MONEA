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
        const [
            blacklistedIPs,
            failedLoginsUsers,
            failedLoginsStaff,
            lockedUsers,
            lockedStaff
        ] = await Promise.all([
            prisma.blacklistedIP.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.user.findMany({ where: { failedAttempts: { gt: 0 } }, select: { id: true, email: true, name: true, failedAttempts: true, lockedUntil: true } }),
            prisma.staff.findMany({ where: { failedAttempts: { gt: 0 } }, select: { id: true, email: true, name: true, failedAttempts: true, lockedUntil: true } }),
            prisma.user.count({ where: { lockedUntil: { gt: new Date() } } }),
            prisma.staff.count({ where: { lockedUntil: { gt: new Date() } } })
        ]);

        const failedAccounts = [
            ...failedLoginsUsers.map(u => ({ ...u, type: "Admin" })),
            ...failedLoginsStaff.map(s => ({ ...s, type: "Staff" }))
        ].sort((a, b) => b.failedAttempts - a.failedAttempts);

        return NextResponse.json({
            blacklistedIPs,
            blacklistedIPsCount: blacklistedIPs.length,
            failedAccounts,
            failedLoginsCount: failedAccounts.length,
            lockedAccountsCount: lockedUsers + lockedStaff
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
