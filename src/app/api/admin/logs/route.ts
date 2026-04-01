export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: Request) {
    const user = await getServerUser();
    if (!user || (user.role !== ROLES.EVENT_MANAGER && user.role !== ROLES.PLATFORM_OWNER)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "ACTIVITY";
    const action = searchParams.get("action");

    try {
        if (user.role === ROLES.PLATFORM_OWNER) {
            if (type === "SECURITY") {
                const logs = await prisma.securityLog.findMany({
                    orderBy: { createdAt: "desc" },
                    take: limit
                });
                
                // Demo fallback if empty
                if (logs.length === 0) {
                    return NextResponse.json([
                        { id: '1', event: 'LOGIN_SUCCESS', email: 'superadmin@monea.app', ip: '192.168.1.1', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
                        { id: '2', event: 'TWOFA_VERIFY', email: 'superadmin@monea.app', ip: '192.168.1.1', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
                        { id: '3', event: 'LOGIN_FAILED', email: 'unknown@attacker.com', ip: '45.12.33.1', createdAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString() }
                    ]);
                }
                return NextResponse.json(logs);
            }
            if (type === "GOVERNANCE") {
                const logs = await prisma.governanceLog.findMany({
                    orderBy: { createdAt: "desc" },
                    take: limit
                });

                // Demo fallback if empty
                if (logs.length === 0) {
                    return NextResponse.json([
                        { id: '1', action: 'CONFIG_UPDATE', actorName: 'SuperAdmin', details: { mode: 'Maintenance' }, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
                        { id: '2', action: 'ROLLBACK', actorName: 'SuperAdmin', details: { version: 'v2.0' }, createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString() }
                    ]);
                }
                return NextResponse.json(logs);
            }
            // For now, Superadmins don't see wedding activities to avoid noise
            return NextResponse.json([]);
        }

        let whereClause: any = action ? { action } : {};

        if (user.role === ROLES.EVENT_MANAGER) {
            // Admins should only see logs for weddings they own
            const userWeddings = await prisma.wedding.findMany({
                where: { userId: (user as any).id },
                select: { id: true }
            });
            const weddingIds = userWeddings.map(w => w.id);

            whereClause = {
                ...whereClause,
                weddingId: { in: weddingIds }
            };
        }

        const logs = await prisma.log.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
