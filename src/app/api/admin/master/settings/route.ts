export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        if (!config) {
            config = await (prisma as any).systemConfig.create({
                data: { id: "GLOBAL" }
            });
        }

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { maintenanceMode, allowNewSignups, globalCheckIn } = body;

        const config = await (prisma as any).systemConfig.upsert({
            where: { id: "GLOBAL" },
            update: {
                maintenanceMode,
                allowNewSignups,
                globalCheckIn
            },
            create: {
                id: "GLOBAL",
                maintenanceMode,
                allowNewSignups,
                globalCheckIn
            }
        });

        // Audit Logging
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        await SystemGovernance.logAction(
            user.userId,
            (user as any).name || "Admin",
            GOVERNANCE_ACTIONS.CONFIG_UPDATE,
            { maintenanceMode, allowNewSignups, globalCheckIn },
            ip,
            userAgent
        );

        const response = NextResponse.json(config);

        // Sync maintenance mode cookie for fast edge-middleware reads (no blocking fetch needed)
        response.cookies.set("maintenance_mode", maintenanceMode ? "true" : "false", {
            httpOnly: false, // readable by middleware
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "lax"
        });

        return response;
    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
