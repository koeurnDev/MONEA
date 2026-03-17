export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";
import { verifyTurnstile } from "@/lib/turnstile";
import { revalidateTag } from "next/cache";
import { ROLES } from "@/lib/constants";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    try {
        const { packageType, turnstileToken } = await req.json(); // "PRO" or "PREMIUM"

        if (!packageType) return errorResponse("Package required", 400);

        // Turnstile check
        if (!turnstileToken) return errorResponse("Please verify CAPTCHA", 428);
        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) return errorResponse("CAPTCHA verification failed", 400);

        let wedding;
        if (user.role === ROLES.PLATFORM_OWNER || user.role === ROLES.EVENT_STAFF) {
            wedding = await prisma.wedding.findUnique({ where: { id: (user as any).weddingId } });
        } else {
            wedding = await prisma.wedding.findFirst({ 
                where: { userId: user.userId },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (!wedding) {
            console.log("Payment Info: No wedding found for userId", user.id, ". Creating one...");
            wedding = await prisma.wedding.create({
                data: {
                    userId: user.id,
                    groomName: "Groom",
                    brideName: "Bride",
                    date: new Date(),
                    location: "",
                    status: "ACTIVE",
                    packageType: "FREE"
                }
            });
        }

        // DUPLICATE/SPAM PROTECTION: Check if already pending verification
        if (wedding.paymentStatus === "AWAITING_VERIFICATION") {
            return NextResponse.json({ 
                error: "សម្នើសុំដំឡើងរបស់អ្នកកំពុងស្ថិតក្នុងការពិនិត្យ។ (Already awaiting verification)" 
            }, { status: 429 });
        }

        // Logic for expiration
        let expiresAt = null;
        if (packageType === "PRO") {
            const date = new Date();
            date.setDate(date.getDate() + 30); // 30 days
            expiresAt = date;
        } else if (packageType === "PREMIUM") {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 100);
            expiresAt = date;
        }

        const updated = await prisma.wedding.update({
            where: { id: wedding.id },
            data: {
                packageType,
                paymentStatus: "AWAITING_VERIFICATION", // Require admin review
                expiresAt,
                status: "ACTIVE"
            }
        });

        const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
        const ua = req.headers.get("user-agent") || "unknown";
        console.warn(`[Payment] Upgrade requested for wedding ${wedding.id} to ${packageType} by User ${user.id}. IP: ${ip}, UA: ${ua}`);

        // Purge Next.js Cache for the public invitation
        revalidateTag(`wedding-${wedding.id}`);

        return NextResponse.json({ success: true, wedding: updated });

    } catch (error) {
        console.error("Payment Server Error:", error);
        return NextResponse.json({ error: "មានបញ្ហាបច្ចេកទេស (Internal Server Error)" }, { status: 500 });
    }
}
