export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { guestbookSchema } from "@/lib/validations/guestbook";
import { publicLimiter, getIP } from "@/lib/ratelimit";

// GET: Fetch all wishes for a specific wedding
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let weddingId = searchParams.get('weddingId');

        // If no weddingId param, try to infer from session (for Dashboard)
        if (!weddingId) {
            const user = await getServerUser();
            if (!user) return errorResponse("Unauthorized", 401);

            let wedding;
            if (user.role === "STAFF") {
                wedding = await prisma.wedding.findUnique({ where: { id: (user as any).weddingId } });
            } else {
                wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            }
            if (wedding) weddingId = wedding.id;
        }

        if (!weddingId) {
            return NextResponse.json({ error: 'Wedding ID is required or Wedding not found' }, { status: 400 });
        }

        const wishes = await prisma.guestbookEntry.findMany({
            where: { weddingId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(wishes);
    } catch (error) {
        console.error('Error fetching wishes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Add a new wish
export async function POST(req: Request) {
    // Rate Limiting (Public Tier)
    const ip = getIP(req);
    const { success } = await publicLimiter.limit(ip);
    if (!success) return errorResponse("Too many requests. Please slow down.", 429);

    try {
        const { data, error } = await validateRequest(req, guestbookSchema);
        if (error) return error;

        const { guestName, message, weddingId, website } = sanitizeObject<any>(data!);
        
        // Honeypot detection
        if (website) {
            console.warn(`[BOT_DETECTION] Honeypot triggered by ${ip}. Payload:`, { guestName, message, website });
            // Silently return success to the bot to avoid detection of our protection
            return NextResponse.json({ id: "dummy", createdAt: new Date() });
        }

        // Verify Wedding existence
        const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
        if (!wedding) return errorResponse("Wedding not found", 404);

        const newWish = await prisma.guestbookEntry.create({
            data: {
                guestName,
                message,
                weddingId,
            },
        });

        return NextResponse.json(newWish);
    } catch (error) {
        console.error('Error adding wish:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
