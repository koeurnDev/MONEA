export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        const bakongConfig = (config?.bakongConfig as any) || {};

        return NextResponse.json({
            email: bakongConfig.email || "",
            organization: bakongConfig.organization || "",
            project: bakongConfig.project || "",
            isConnected: !!bakongConfig.token,
            updatedAt: config?.updatedAt
        });
    } catch (error: any) {
        console.error("[Bakong Status] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
