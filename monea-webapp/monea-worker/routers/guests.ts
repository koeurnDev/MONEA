import { Hono } from 'hono'
import { prisma, queryRaw, executeRaw } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"
import { sanitizeObject } from "@/lib/sanitize"
import { encrypt } from "@/lib/encryption"
import { ROLES } from "@/lib/constants"
import { createLog } from "@/lib/audit-utils"
import { z } from "zod"
import { guestSchema } from "@/lib/validations/guest"
import { standardLimiter, getIP } from "@/lib/ratelimit"
import { GuestService } from "@/services/GuestService"

const guestsRouter = new Hono()

guestsRouter.post('/bulk', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
        const body = await c.req.json();
        const { guests } = body;

        if (!Array.isArray(guests)) {
            return c.json({ error: "Invalid data format" }, 400);
        }

        if (guests.length > 500) {
            return c.json({ error: "Too many guests at once (Max 500)" }, 400);
        }

        let weddingId = null;
        if (user.type === "staff") {
            weddingId = user.weddingId!;
        } else {
            const results = await queryRaw('SELECT id FROM "Wedding" WHERE "userId" = $1 LIMIT 1', user.userId);
            if (!results.length) {
                return c.json({ error: "Please create a wedding profile first" }, 403);
            }
            weddingId = results[0].id;
        }

        console.log(`[BulkImport] User ${user.userId} importing ${guests.length} guests for wedding ${weddingId}`);

        if (!weddingId) {
            return c.json({ error: "Wedding ID not found" }, 400);
        }

        const counts = await queryRaw('SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = $1', weddingId);
        const currentCount = counts[0]?.count || 0;

        const values: any[] = [];
        let placeholderIdx = 1;
        const encryptedPhones = await Promise.all(
            guests.map((g: any) => {
                const sanitized = sanitizeObject<any>(g);
                return sanitized.phone ? encrypt(sanitized.phone) : Promise.resolve("");
            })
        );
        const valueStrings = guests.map((g: any, index: number) => {
            const sanitized = sanitizeObject<any>(g);
            const id = globalThis.crypto.randomUUID();
            const name = sanitized.name || "Guest";
            const phone = encryptedPhones[index];
            const group = sanitized.group || "Friend";
            const sequenceNum = currentCount + index + 1;
            
            const startIdx = placeholderIdx;
            placeholderIdx += 6;
            values.push(id, name, phone, group, weddingId, sequenceNum);
            
            return `($${startIdx}, $${startIdx + 1}, $${startIdx + 2}, $${startIdx + 3}, $${startIdx + 4}, $${startIdx + 5})`;
        });

        const sql = `
            INSERT INTO "Guest" (id, name, phone, "group", "weddingId", "sequenceNumber")
            VALUES ${valueStrings.join(", ")}
        `;

        const count = await executeRaw(sql, ...values);
        return c.json({ success: true, count });
    } catch (error: any) {
        console.error("[BulkImport] CRITICAL Error:", error);
        return c.json({ 
            error: "Failed to import guests", 
            message: error.message
        }, 500);
    }
});

guestsRouter.get('/bulk', async (c) => {
    return c.json({ message: "GUESTS BULK API ACTIVE" });
});

guestsRouter.post('/checkin', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { guestId, weddingId } = await c.req.json();

        if (!guestId || !weddingId) {
            return c.json({ error: "Missing guestId or weddingId" }, 400);
        }

        if (user.type === "staff") {
            if (user.weddingId !== weddingId) {
                return c.json({ error: "Access Denied: Staff mismatch" }, 403);
            }
        } else if (user.role !== ROLES.PLATFORM_OWNER) {
            const wedding = await prisma.wedding.findFirst({
                where: { id: weddingId, userId: user.userId }
            });
            if (!wedding) {
                return c.json({ error: "Access Denied: Wedding ownership mismatch" }, 403);
            }
        }

        const guest = await prisma.guest.update({
            where: { id: guestId, weddingId: weddingId },
            data: {
                hasArrived: true,
                arrivedAt: new Date()
            },
            select: { name: true, group: true }
        });

        await prisma.log.create({
            data: {
                action: "CHECK_IN",
                description: `Guest ${guest.name} checked in`,
                actorName: user.name || user.email || "Unknown Actor",
                weddingId: weddingId,
                ip: c.req.header("x-forwarded-for") || "unknown"
            }
        });

        return c.json({
            success: true,
            guest: {
                name: guest.name,
                group: guest.group
            }
        });

    } catch (error: any) {
        console.error("Check-in Error:", error);
        return c.json({
            error: "Failed to check in guest",
            details: error.message
        }, 500);
    }
});

guestsRouter.get('/latest', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;
        if (!weddingId) return c.json({ error: "No wedding found" }, 404);

        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            select: { groomName: true, brideName: true, eventType: true }
        });

        const latestGuest = await prisma.guest.findFirst({
            where: { weddingId, hasArrived: true, arrivedAt: { not: null } },
            orderBy: { arrivedAt: 'desc' },
            select: { id: true, name: true, group: true, arrivedAt: true }
        });

        return c.json({
            wedding,
            latestGuest
        });
    } catch (error: any) {
        return c.json({ error: "Failed to fetch latest guest" }, 500);
    }
});

guestsRouter.options('/view', async (c) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return c.text('', 200);
});

guestsRouter.post('/view', async (c) => {
    try {
        let body;
        try {
            body = await c.req.json();
        } catch (e) {
            return c.json({ error: "Invalid request body" }, 400);
        }

        const { guestId } = body;

        if (!guestId) {
            return c.json({ error: "Guest ID is required" }, 400);
        }

        const guest = await prisma.guest.findUnique({ where: { id: guestId } });
        if (!guest) return c.json({ error: "Guest not found" }, 404);

        await prisma.guest.update({
            where: { id: guestId },
            data: {
                views: { increment: 1 }
            }
        });

        return c.json({ success: true });
    } catch (error) {
        console.error("View Update Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

guestsRouter.get('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const ip = getIP(c.req.raw as any); 
        const { success } = await standardLimiter.limit(ip);
        if (!success) return c.json({ error: "Too many requests" }, 429);

        const limit = parseInt(c.req.query("limit") || "50");
        const offset = parseInt(c.req.query("offset") || "0");

        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;
        if (!weddingId) return c.json({ items: [], pagination: { total: 0, limit, offset, hasMore: false } });

        console.log(`[Guests GET] weddingId=${weddingId} limit=${limit} offset=${offset}`);
        const result = await GuestService.getGuests(weddingId, { limit, offset });
        console.log(`[Guests GET] Success: ${result.items.length} items`);
        return c.json(result);
    } catch (error: any) {
        console.error(`[Guests GET] ERROR: ${error?.message}`);
        console.error(`[Guests GET] STACK: ${error?.stack}`);
        return c.json({ error: "Failed to fetch guests", message: error?.message }, 500);
    }
});

guestsRouter.post('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        let data;
        try {
            data = await c.req.json();
        } catch (e) {
            return c.json({ error: "Invalid JSON" }, 400);
        }

        const validated = guestSchema.safeParse(data);
        if (!validated.success) return c.json({ error: validated.error.issues }, 400);
        
        const sanitizedData = sanitizeObject<any>(validated.data);
        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;

        if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

        const guest = await GuestService.createGuest(weddingId, sanitizedData);
        await createLog(weddingId, "CREATE", `Added guest: ${guest.name}`, user.email || user.role);

        return c.json(guest);
    } catch (error: any) {
        console.error(`[Guests API] POST Error: ${error.message}`);
        return c.json({ error: `Failed to create guest: ${error.message}` }, 500);
    }
});

guestsRouter.patch('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        let data;
        try {
            data = await c.req.json();
        } catch (e) {
            return c.json({ error: "Invalid JSON" }, 400);
        }

        const validated = guestSchema.partial().extend({ id: z.string() }).safeParse(data);
        if (!validated.success) return c.json({ error: validated.error.issues }, 400);

        const { id, ...updateFields } = validated.data;
        const sanitizedFields = sanitizeObject<any>(updateFields);
        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;

        if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

        const guest = await GuestService.updateGuest(id, weddingId, sanitizedFields);
        await createLog(weddingId, "UPDATE", `Updated guest: ${guest.name}`, user.email || user.role);

        return c.json(guest);
    } catch (error: any) {
        console.error(`[Guests API] PATCH Error: ${error.message}`);
        return c.json({ error: error.message || "Failed to update guest" }, 500);
    }
});

guestsRouter.delete('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const id = c.req.query("id");
        if (!id) return c.json({ error: "ID required" }, 400);

        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;
        if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

        const guest = await GuestService.deleteGuest(id, weddingId);
        await createLog(weddingId, "DELETE", `Deleted guest: ${guest.name}`, user.email || user.role);

        return c.json({ success: true });
    } catch (error: any) {
        console.error(`[Guests API] DELETE Error: ${error.message}`);
        return c.json({ error: error.message || "Failed to delete guest" }, 500);
    }
});

export default guestsRouter;
