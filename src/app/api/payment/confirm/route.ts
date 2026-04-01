export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";
import { verifyTurnstile } from "@/lib/turnstile";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { ROLES } from "@/lib/constants";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    try {
        const body = await req.json();
        const schema = z.object({
            packageType: z.enum(["PRO", "PREMIUM"]),
            turnstileToken: z.string()
        });
        const validated = schema.safeParse(body);
        if (!validated.success) return errorResponse("Invalid package or missing CAPTCHA", 400);

        const { packageType, turnstileToken } = validated.data;

        // Turnstile check
        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) return errorResponse("CAPTCHA verification failed", 400);

        let wedding;
        if (user.role === ROLES.EVENT_STAFF) {
            // Staff can only update the wedding they are assigned to
            if (!user.weddingId) return errorResponse("Staff not assigned to any wedding", 403);
            wedding = await prisma.wedding.findUnique({ where: { id: user.weddingId } });
        } else {
            // Users can only update their own weddings (IDOR Protection)
            wedding = await prisma.wedding.findFirst({ 
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (!wedding) return errorResponse("Wedding not found", 404);

        // DUPLICATE/SPAM PROTECTION: Check if already pending verification
        if (wedding.paymentStatus === "AWAITING_VERIFICATION") {
            return NextResponse.json({ 
                error: "សម្នើសុំដំឡើងរបស់អ្នកកំពុងស្ថិតក្នុងការពិនិត្យ។ (Already awaiting verification)" 
            }, { status: 429 });
        }

        // Logic for expiration
        const date = new Date();
        date.setDate(date.getDate() + 30); // 30 Days (Monthly)
        const expiresAt = date;

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
