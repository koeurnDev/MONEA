export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
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
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
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

        return NextResponse.json(config);
    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
