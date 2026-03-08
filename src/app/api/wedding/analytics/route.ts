import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { weddingId, type } = await req.json();

        console.log(`[Analytics] POST body: weddingId=${weddingId}, type=${type}`);

        if (!weddingId || !type) {
            console.warn(`[Analytics] 400: Missing required fields. Body: ${JSON.stringify({ weddingId, type })}`);
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const headerList = headers();
        const ip = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "unknown";
        const userAgent = headerList.get("user-agent") || "unknown";

        // Simple Hash for IP deduplication
        const ipHash = crypto.createHash('sha256').update(ip).digest('base64').slice(0, 16);

        // Detect device type
        const isMobile = userAgent.toLowerCase().includes("mobile") || userAgent.toLowerCase().includes("android") || userAgent.toLowerCase().includes("iphone");
        const deviceType = isMobile ? "MOBILE" : "DESKTOP";

        // Record interaction
        await (prisma as any).invitationAnalytics.create({
            data: {
                weddingId,
                type,
                ipHash,
                userAgent: userAgent.slice(0, 255),
                deviceType
            }
        });

        // If it's a VIEW, we might also want to increment the global guest count if we have a way to identify them,
        // but for now, generic analytics is fine.

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
