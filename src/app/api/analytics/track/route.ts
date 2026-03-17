import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { weddingId, type } = body;

        if (!weddingId || !type) {
            return new NextResponse("Missing weddingId or type", { status: 400 });
        }

        // Get IP and User-Agent from headers
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";
        
        // Basic IP Hashing for privacy (one-way hash)
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

        // Simple Device Detection
        const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
        const deviceType = isMobile ? "MOBILE" : "DESKTOP";

        // Create the analytics entry
        await (prisma as any).invitationAnalytics.create({
            data: {
                weddingId,
                type,
                ipHash,
                userAgent: userAgent.substring(0, 255), // Truncate just in case
                deviceType
            }
        });

        // If it's a VIEW, increment the views count on the guest if provided (optional)
        // Note: For global analytics, we usually just tracked in InvitationAnalytics.
        // But if guestId is passed, we can update the Guest model too.
        if (type === "VIEW" && body.guestId) {
            try {
                await prisma.guest.update({
                    where: { id: body.guestId },
                    data: { views: { increment: 1 } }
                });
            } catch (e) {
                // Silently fail if guest update fails (e.g. invalid guestId)
            }
        }

        return new NextResponse("OK", { status: 200 });

    } catch (error) {
        console.error("Tracking Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
