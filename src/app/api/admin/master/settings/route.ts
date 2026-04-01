export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";
import redis from "@/lib/redis";

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
        const { maintenanceMode, allowNewSignups, globalCheckIn, stadPrice, proPrice, maintenanceStart, maintenanceEnd } = body;

        const config = await (prisma as any).systemConfig.upsert({
            where: { id: "GLOBAL" },
            update: {
                maintenanceMode,
                maintenanceStart: maintenanceStart ? new Date(maintenanceStart) : null,
                maintenanceEnd: maintenanceEnd ? new Date(maintenanceEnd) : null,
                allowNewSignups,
                globalCheckIn,
                stadPrice: parseFloat(stadPrice),
                proPrice: parseFloat(proPrice)
            },
            create: {
                id: "GLOBAL",
                maintenanceMode,
                maintenanceStart: maintenanceStart ? new Date(maintenanceStart) : null,
                maintenanceEnd: maintenanceEnd ? new Date(maintenanceEnd) : null,
                allowNewSignups,
                globalCheckIn,
                stadPrice: parseFloat(stadPrice),
                proPrice: parseFloat(proPrice)
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

        // Sync maintenance mode to Edge Redis for global middleware enforcement
        await redis.set("GLOBAL_MAINTENANCE", maintenanceMode ? "true" : "false");
        
        if (maintenanceStart) {
            await redis.set("MAINTENANCE_START", new Date(maintenanceStart).getTime().toString());
        } else {
            await redis.del("MAINTENANCE_START");
        }
        
        if (maintenanceEnd) {
            await redis.set("MAINTENANCE_END", new Date(maintenanceEnd).getTime().toString());
        } else {
            await redis.del("MAINTENANCE_END");
        }

        return response;
    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
