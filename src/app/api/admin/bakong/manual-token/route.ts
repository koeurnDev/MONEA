import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { token } = await req.json();
        console.log("[Bakong Manual Token] Received token:", token?.substring(0, 10) + "...");

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        const bakongData = (config?.bakongConfig as any) || {};

        // Save manual token to DB
        const result = await (prisma as any).systemConfig.update({
            where: { id: "GLOBAL" },
            data: {
                bakongConfig: {
                    ...bakongData,
                    token: token,
                    isManual: true,
                    updatedAt: new Date().toISOString()
                }
            }
        });
        console.log("[Bakong Manual Token] Save Result:", !!result);

        return NextResponse.json({ message: "Bakong Token updated manually" });
    } catch (error: any) {
        console.error("[Bakong Manual Token] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
