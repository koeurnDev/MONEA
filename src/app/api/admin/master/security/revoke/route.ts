export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Revoke Staff sessions
        const staffRes = await prisma.staff.updateMany({
            data: { sessionsRevokedAt: new Date() }
        });

        // 2. Revoke User sessions (Wedding owners)
        const userRes = await prisma.user.updateMany({
            data: { sessionsRevokedAt: new Date() }
        });

        const totalRevoked = staffRes.count + userRes.count;

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        await SystemGovernance.logAction(
            user.userId,
            (user as any).name || user.email || "Admin",
            GOVERNANCE_ACTIONS.REVOKE_SESSIONS,
            { revokedCount: totalRevoked, target: "ALL_ACCOUNTS" },
            ip,
            req.headers.get("user-agent") || "unknown"
        );

        return NextResponse.json({ 
            success: true, 
            count: totalRevoked,
            details: { staff: staffRes.count, users: userRes.count }
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
