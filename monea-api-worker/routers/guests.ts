import { Hono } from 'hono';
import { getDb } from "@/lib/drizzle";
import { weddings, guests, logs } from "@/drizzle/schema";
import { eq, desc, count, sql, and } from "drizzle-orm";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";
import { encrypt } from "@/lib/encryption";
import { ROLES } from "@/lib/constants";
import { createLog } from "@/lib/audit-utils";
import { z } from "zod";
import { guestSchema } from "@/lib/validations/guest";
import { standardLimiter, getIP } from "@/lib/ratelimit";
import { GuestServiceDrizzle } from "@/lib/GuestServiceDrizzle";
import { generateId } from "@/lib/drizzle-helpers";

const guestsRouter = new Hono();

/**
 * Helper to resolve weddingId safely from authenticated user or staff context
 */
async function resolveWeddingId(user: any, env: any): Promise<string | null> {
    if (user?.weddingId) return user.weddingId;
    const userId = user?.userId || user?.id;
    if (!userId) return null;
    
    const db = getDb(env);
    const wedding = await db.select({ id: weddings.id })
        .from(weddings)
        .where(eq(weddings.userId, userId))
        .limit(1)
        .then(r => r[0]);
    
    return wedding?.id || null;
}

guestsRouter.post('/bulk', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON format" }, 400);
        }

        const { guests: guestsData } = body;

        if (!Array.isArray(guestsData)) {
            return c.json({ error: "Invalid data format" }, 400);
        }

        if (guestsData.length > 500) {
            return c.json({ error: "Too many guests at once (Max 500)" }, 400);
        }

        let weddingId: string | null = null;
        const db = getDb(c.env);
        
        if (user.type === "staff") {
            weddingId = user.weddingId || null;
        } else {
            const weddingResult = await db.select({ id: weddings.id })
                .from(weddings)
                .where(eq(weddings.userId, user.userId || user.id))
                .limit(1)
                .then(r => r[0]);
            
            if (!weddingResult) {
                return c.json({ error: "Please create a wedding profile first" }, 403);
            }
            weddingId = weddingResult.id;
        }

        if (!weddingId) {
            return c.json({ error: "Wedding ID not found" }, 400);
        }

        console.log(`[BulkImport] User ${user.userId || user.id} importing ${guestsData.length} guests for wedding ${weddingId}`);

        // Get current count
        const countResult = await db.select({ count: count() })
            .from(guests)
            .where(eq(guests.weddingId, weddingId))
            .then(r => r[0]);
        
        const currentCount = countResult?.count || 0;

        // Prepare bulk insert data
        const encryptedPhones = await Promise.all(
            guestsData.map((g: any) => {
                const sanitized = sanitizeObject<any>(g);
                return sanitized.phone ? encrypt(sanitized.phone) : Promise.resolve(null);
            })
        );

        const bulkData = guestsData.map((g: any, index: number) => {
            const sanitized = sanitizeObject<any>(g);
            return {
                id: generateId(),
                name: sanitized.name || "Guest",
                phone: encryptedPhones[index],
                group: sanitized.group || "Friend",
                weddingId: weddingId!,
                sequenceNumber: currentCount + index + 1,
                guestCode: `G${String(currentCount + index + 1).padStart(3, "0")}`,
                source: "BULK_IMPORT" as const
            };
        });

        // Insert all guests
        await db.insert(guests).values(bulkData);

        return c.json({ success: true, count: bulkData.length });
    } catch (error: any) {
        console.error("[BulkImport] CRITICAL Error:", error?.message || error);
        return c.json({ 
            error: "Failed to import guests", 
            message: error?.message || "Internal Server Error"
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

        const body = await c.req.json().catch(() => ({}));
        const { guestId, weddingId } = body;

        if (!guestId || !weddingId) {
            return c.json({ error: "Missing guestId or weddingId" }, 400);
        }

        const currentUserId = user.userId || user.id;
        const db = getDb(c.env);

        if (user.type === "staff") {
            if (user.weddingId !== weddingId) {
                return c.json({ error: "Access Denied: Staff mismatch" }, 403);
            }
        } else if (user.role !== ROLES.PLATFORM_OWNER && user.role !== "SUPERADMIN") {
            const wedding = await db.select()
                .from(weddings)
                .where(and(
                    eq(weddings.id, weddingId),
                    eq(weddings.userId, currentUserId)
                ))
                .limit(1)
                .then((r: any) => r[0]);
            
            if (!wedding) {
                return c.json({ error: "Access Denied: Wedding ownership mismatch" }, 403);
            }
        }

        const updatedGuest = await db.update(guests)
            .set({
                hasArrived: true,
                arrivedAt: new Date()
            })
            .where(and(
                eq(guests.id, guestId),
                eq(guests.weddingId, weddingId)
            ))
            .returning({ name: guests.name, group: guests.group });

        if (!updatedGuest[0]) {
            return c.json({ error: "Guest not found" }, 404);
        }

        const guest = updatedGuest[0];

        await db.insert(logs).values({
            id: generateId(),
            action: "CHECK_IN",
            description: `Guest ${guest.name} checked in`,
            actorName: user.name || user.email || "Unknown Actor",
            weddingId: weddingId,
            ip: c.req.header("x-forwarded-for") || "unknown"
        });

        return c.json({
            success: true,
            guest: {
                name: guest.name,
                group: guest.group
            }
        });

    } catch (error: any) {
        console.error("Check-in Error:", error?.message || error);
        return c.json({
            error: "Failed to check in guest",
            details: error?.message || "Internal Server Error"
        }, 500);
    }
});

guestsRouter.get('/latest', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const weddingId = await resolveWeddingId(user, c.env);
        if (!weddingId) return c.json({ error: "No wedding found" }, 404);

        const db = getDb(c.env);

        const wedding = await db.select({
            groomName: weddings.groomName,
            brideName: weddings.brideName,
            eventType: weddings.eventType
        })
            .from(weddings)
            .where(eq(weddings.id, weddingId))
            .limit(1)
            .then(r => r[0]);

        const latestGuest = await db.select({
            id: guests.id,
            name: guests.name,
            group: guests.group,
            arrivedAt: guests.arrivedAt
        })
            .from(guests)
            .where(and(
                eq(guests.weddingId, weddingId),
                eq(guests.hasArrived, true),
                sql`${guests.arrivedAt} IS NOT NULL`
            ))
            .orderBy(desc(guests.arrivedAt))
            .limit(1)
            .then((r: any) => r[0] || null);

        return c.json({
            wedding,
            latestGuest
        });
    } catch (error: any) {
        console.error("Latest Guest Error:", error?.message || error);
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
        } catch {
            return c.json({ error: "Invalid request body" }, 400);
        }

        const { guestId } = body;

        if (!guestId) {
            return c.json({ error: "Guest ID is required" }, 400);
        }

        const db = getDb(c.env);
        const guest = await db.select()
            .from(guests)
            .where(eq(guests.id, guestId))
            .limit(1)
            .then(r => r[0]);
        
        if (!guest) return c.json({ error: "Guest not found" }, 404);

        await db.update(guests)
            .set({ views: sql`${guests.views} + 1` })
            .where(eq(guests.id, guestId));

        return c.json({ success: true });
    } catch (error: any) {
        console.error("View Update Error:", error?.message || error);
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

        const limit = parseInt(c.req.query("limit") || "50", 10);
        const offset = parseInt(c.req.query("offset") || "0", 10);

        const weddingId = await resolveWeddingId(user, c.env);
        if (!weddingId) return c.json({ items: [], pagination: { total: 0, limit, offset, hasMore: false } });

        console.log(`[Guests GET] Fetching guests for wedding ${weddingId}, limit=${limit}, offset=${offset}`);
        const result = await GuestServiceDrizzle.getGuests(weddingId, c.env, { limit, offset });
        console.log(`[Guests GET] Success: ${result.items.length} guests returned`);
        return c.json(result);
    } catch (error: any) {
        console.error("[Guests GET] CRITICAL ERROR:", error);
        console.error("[Guests GET] Error stack:", error?.stack);
        console.error("[Guests GET] Error message:", error?.message);
        return c.json({ error: "Failed to fetch guests", details: error?.message }, 500);
    }
});

guestsRouter.post('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        let data;
        try {
            data = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON format" }, 400);
        }

        const validated = guestSchema.safeParse(data);
        if (!validated.success) return c.json({ error: validated.error.issues }, 400);
        
        const sanitizedData = sanitizeObject<any>(validated.data);
        const weddingId = await resolveWeddingId(user, c.env);

        if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

        const guest = await GuestServiceDrizzle.createGuest(weddingId, c.env, sanitizedData);
        await createLog(weddingId, "CREATE", `Added guest: ${guest.name}`, user.email || user.role || "system");

        return c.json(guest, 201);
    } catch (error: any) {
        console.error(`[Guests API] POST Error:`, error?.message || error);
        return c.json({ error: `Failed to create guest: ${error?.message || "Internal Server Error"}` }, 500);
    }
});

guestsRouter.patch('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        let data;
        try {
            data = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON format" }, 400);
        }

        const validated = guestSchema.partial().extend({ id: z.string() }).safeParse(data);
        if (!validated.success) return c.json({ error: validated.error.issues }, 400);

        const { id, ...updateFields } = validated.data;
        const sanitizedFields = sanitizeObject<any>(updateFields);
        const weddingId = await resolveWeddingId(user, c.env);

        if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

        const guest = await GuestServiceDrizzle.updateGuest(id, weddingId, c.env, sanitizedFields);
        await createLog(weddingId, "UPDATE", `Updated guest: ${guest.name}`, user.email || user.role || "system");

        return c.json(guest);
    } catch (error: any) {
        console.error(`[Guests API] PATCH Error:`, error?.message || error);
        return c.json({ error: error?.message || "Failed to update guest" }, 500);
    }
});

guestsRouter.delete('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const id = c.req.query("id");
        if (!id) return c.json({ error: "ID required" }, 400);

        const weddingId = await resolveWeddingId(user, c.env);
        if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

        const guest = await GuestServiceDrizzle.deleteGuest(id, weddingId, c.env);
        await createLog(weddingId, "DELETE", `Deleted guest: ${guest.name}`, user.email || user.role || "system");

        return c.json({ success: true });
    } catch (error: any) {
        console.error(`[Guests API] DELETE Error:`, error?.message || error);
        return c.json({ error: error?.message || "Failed to delete guest" }, 500);
    }
});

export default guestsRouter;