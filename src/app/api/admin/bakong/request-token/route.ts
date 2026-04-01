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

        const { email, organization, project } = await req.json();
        console.log("[Bakong Request] Body:", { email, organization, project });

        if (!email || !organization || !project) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Call Bakong API to request token
        // According to Section 1.2 of the Implementation Guideline
        const response = await fetch("https://api-bakong.nbc.gov.kh/v1/request_token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, organization, project })
        });

        const result = await response.json();
        console.log("[Bakong Request] Response:", result);

        if (result.responseCode !== 0) {
            return NextResponse.json({ 
                error: result.responseMessage || "Failed to request token from Bakong",
                details: result
            }, { status: 400 });
        }

        // 2. Save partial config to DB
        await (prisma as any).systemConfig.update({
            where: { id: "GLOBAL" },
            data: {
                bakongConfig: {
                    email,
                    organization,
                    project,
                    lastRequestedAt: new Date().toISOString()
                }
            }
        });

        return NextResponse.json({ message: "Verification code sent to email" });
    } catch (error: any) {
        console.error("[Bakong Request Token] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
