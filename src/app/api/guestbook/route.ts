export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";
import { errorResponse } from "@/lib/api-utils";

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
    try {
        const body = await req.json();
        const { guestName, message, weddingId } = sanitizeObject<any>(body);

        if (!guestName || !message || !weddingId) {
            return errorResponse('Missing required fields', 400);
        }

        // SPAM Protection: Character limits
        if (guestName.length > 50) return errorResponse("Name too long (Max 50)", 400);
        if (message.length > 500) return errorResponse("Message too long (Max 500)", 400);

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
