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

        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
        }

        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        const bakongData = (config?.bakongConfig as any) || {};

        // 1. Call Bakong API to verify code and get token
        // According to Section 2.2 of the Implementation Guideline
        const response = await fetch("https://api-bakong.nbc.gov.kh/v1/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });

        const result = await response.json();

        if (result.responseCode !== 0 || !result.data?.token) {
            return NextResponse.json({ 
                error: result.responseMessage || "Failed to verify token with Bakong",
                details: result
            }, { status: 400 });
        }

        // 2. Save full config and token to DB
        await (prisma as any).systemConfig.update({
            where: { id: "GLOBAL" },
            data: {
                bakongConfig: {
                    ...bakongData,
                    token: result.data.token,
                    verifiedAt: new Date().toISOString()
                }
            }
        });

        return NextResponse.json({ message: "Bakong API Connected successfully", token: result.data.token });
    } catch (error: any) {
        console.error("[Bakong Verify Token] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
