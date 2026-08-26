import { Hono } from 'hono';
import { queryRaw } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { guestbookSchema } from "@/lib/validations/guestbook";
import { publicLimiter, getIP } from "@/lib/ratelimit";

const guestbookRouter = new Hono();

// GET: Fetch all wishes for a specific wedding
guestbookRouter.get('/', async (c) => {
    try {
        const req = c.req.raw;
        const searchParams = new URL(req.url).searchParams;
        let weddingId = searchParams.get('weddingId');

        // If no weddingId param, try to infer from session (for Dashboard)
        if (!weddingId) {
            const user = await getServerUser(c.req.raw);
            if (!user) return errorResponse("Unauthorized", 401);
            
            weddingId = (user as any).weddingId || null;
            if (!weddingId) {
                const results: any = await queryRaw('SELECT id FROM "Wedding" WHERE "userId" = $1 LIMIT 1', user.userId || (user as any).id);
                weddingId = results[0]?.id || null;
            }
        }

        if (!weddingId) {
            return c.json({ error: 'Wedding ID is required or Wedding not found' }, 400);
        }

        const wishes = await queryRaw('SELECT * FROM "GuestbookEntry" WHERE "weddingId" = $1 ORDER BY "createdAt" DESC', weddingId);

        return c.json(wishes);
    } catch (error: any) {
        console.error('Error fetching wishes:', error?.message || error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// POST: Add a new wish
guestbookRouter.post('/', async (c) => {
    const req = c.req.raw;
    // Rate Limiting (Public Tier)
    const ip = getIP(req as any);
    const { success } = await publicLimiter.limit(ip);
    if (!success) return errorResponse("Too many requests. Please slow down.", 429);

    try {
        const { data, error } = await validateRequest(req, guestbookSchema);
        if (error) return error;

        const sanitized = sanitizeObject<any>(data!);
        const { guestName, message, weddingId, website } = sanitized;
        
        // Honeypot detection
        if (website) {
            console.warn(`[BOT_DETECTION] Honeypot triggered by ${ip}. Payload:`, { guestName, message, website });
            // Silently return success to the bot to avoid detection of our protection
            return c.json({ id: "dummy", createdAt: new Date() }, 201);
        }

        // Verify Wedding existence using Raw SQL
        const weddings: any = await queryRaw('SELECT id FROM "Wedding" WHERE id = $1 LIMIT 1', weddingId);
        if (!weddings || !weddings.length) return errorResponse("Wedding not found", 404);

        const id = globalThis.crypto.randomUUID();

        const results: any = await queryRaw(`
            INSERT INTO "GuestbookEntry" (id, "guestName", message, "weddingId", "createdAt")
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `, id, guestName, message, weddingId);

        return c.json(results[0], 201);
    } catch (error: any) {
        console.error('Error adding wish:', error?.message || error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// DELETE: Delete a wish by ID (Owner only)
guestbookRouter.delete('/:id', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return errorResponse("Unauthorized", 401);
        const id = c.req.param('id');
        const currentUserId = user.userId || (user as any).id;
        
        // Ownership verification
        const wish: any = await queryRaw(`
            SELECT g.id, w."userId" 
            FROM "GuestbookEntry" g
            JOIN "Wedding" w ON g."weddingId" = w.id
            WHERE g.id = $1 LIMIT 1
        `, id);

        if (!wish || !wish.length) return errorResponse("Wish not found", 404);
        if (wish[0].userId !== currentUserId && user.role !== "PLATFORM_OWNER" && user.role !== "SUPERADMIN") {
            return errorResponse("Forbidden: You do not own this wedding", 403);
        }

        await queryRaw('DELETE FROM "GuestbookEntry" WHERE id = $1', id);
        return c.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting wish:', error?.message || error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

// DELETE: Delete all wishes for a wedding (Owner only)
guestbookRouter.delete('/all/:weddingId', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return errorResponse("Unauthorized", 401);
        const weddingId = c.req.param('weddingId');
        const currentUserId = user.userId || (user as any).id;

        // Ownership verification
        const weddings: any = await queryRaw('SELECT "userId" FROM "Wedding" WHERE id = $1 LIMIT 1', weddingId);
        if (!weddings || !weddings.length) return errorResponse("Wedding not found", 404);
        if (weddings[0].userId !== currentUserId && user.role !== "PLATFORM_OWNER" && user.role !== "SUPERADMIN") {
            return errorResponse("Forbidden: You do not own this wedding", 403);
        }

        await queryRaw('DELETE FROM "GuestbookEntry" WHERE "weddingId" = $1', weddingId);
        return c.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting all wishes:', error?.message || error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export default guestbookRouter;