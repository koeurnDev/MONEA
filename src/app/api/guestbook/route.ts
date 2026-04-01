export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { queryRaw } from "@/lib/prisma";
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
            
            weddingId = user.weddingId || null;
            if (!weddingId) {
                const results = await queryRaw('SELECT id FROM "Wedding" WHERE "userId" = $1 LIMIT 1', user.userId);
                weddingId = results[0]?.id || null;
            }
        }

        if (!weddingId) {
            return NextResponse.json({ error: 'Wedding ID is required or Wedding not found' }, { status: 400 });
        }

        const wishes = await queryRaw('SELECT * FROM "GuestbookEntry" WHERE "weddingId" = $1 ORDER BY "createdAt" DESC', weddingId);

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

        // Verify Wedding existence using Raw SQL
        const weddings = await queryRaw('SELECT id FROM "Wedding" WHERE id = $1 LIMIT 1', weddingId);
        if (!weddings.length) return errorResponse("Wedding not found", 404);

        const results = await queryRaw(`
            INSERT INTO "GuestbookEntry" ("guestName", message, "weddingId", "createdAt")
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `, guestName, message, weddingId);

        return NextResponse.json(results[0]);
    } catch (error) {
        console.error('Error adding wish:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
