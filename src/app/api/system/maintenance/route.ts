import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });
        return NextResponse.json({ maintenanceMode: config?.maintenanceMode || false });
    } catch (error) {
        return NextResponse.json({ maintenanceMode: false });
    }
}
