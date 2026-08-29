import { Hono } from 'hono'
import { getDb } from "@/lib/drizzle"
import { weddings, activities, galleryItems, guests, invitationAnalytics } from "@/drizzle/schema"
import { eq, desc, and } from "drizzle-orm"
import { getServerUser } from "@/lib/auth"
import { sanitizeObject, sanitize } from "@/lib/sanitize"
import { encrypt, decrypt } from "@/lib/encryption"
import { ROLES } from "@/lib/constants"
import { weddingSchema, weddingUpdateSchema } from "@/lib/validations/wedding"
import { isEditingLocked } from "@/lib/permissions"
import { cloudinaryDelete } from "@/lib/cloudinary-edge"
import { publicLimiter, getIP } from "@/lib/ratelimit"
import { getUserWeddingFull, getWeddingByIdFull, generateId } from "@/lib/drizzle-helpers"
import { queryRaw } from "@/lib/prisma"
import { z } from "zod"

const weddingRouter = new Hono()


weddingRouter.get('/analytics/stats', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            console.log("[Wedding Analytics Stats] No authenticated user found");
            return c.json({ error: "Unauthorized" }, 401);
        }

        const weddingId = c.req.query("weddingId");

        if (!weddingId) {
            return c.json({ error: "Missing weddingId" }, 400);
        }

        if (user.role === "STAFF") {
            if ((user as any).weddingId !== weddingId) {
                return c.json({ error: "Forbidden: You do not have access to this wedding" }, 403);
            }
        } else {
            const db = getDb(c.env);
            const weddingCheck = await db.select({ userId: weddings.userId })
                .from(weddings)
                .where(eq(weddings.id, weddingId))
                .limit(1);
            
            if (!weddingCheck.length || weddingCheck[0].userId !== user.userId) {
                return c.json({ error: "Forbidden: You do not own this wedding" }, 403);
            }
        }

        const stats = await Promise.allSettled([
            queryRaw(`
                SELECT type, COUNT(*) as "_count"
                FROM "InvitationAnalytics"
                WHERE "weddingId" = $1
                GROUP BY type
            `, weddingId),
            queryRaw(`
                SELECT "deviceType", COUNT(*) as "_count"
                FROM "InvitationAnalytics"
                WHERE "weddingId" = $1 AND type = 'VIEW'
                GROUP BY "deviceType"
            `, weddingId)
        ]);

        const rawTypeStats = stats[0].status === 'fulfilled' ? (stats[0].value as any[]) : [];
        const rawDeviceStats = stats[1].status === 'fulfilled' ? (stats[1].value as any[]) : [];

        const getCount = (type: string) => {
            const stat = rawTypeStats.find((s: any) => s.type === type);
            return stat ? Number(stat._count || 0) : 0;
        };

        const totalViews = getCount("VIEW");
        const mapClicks = getCount("MAP_CLICK");
        const saveDateClicks = getCount("SAVE_DATE");
        const rsvpOpens = getCount("RSVP_OPEN");
        const rsvpSubmits = getCount("RSVP_SUBMIT");

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 21);

        let dailyTrendRaw: any[] = [];
        try {
            dailyTrendRaw = await queryRaw(`
                SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count
                FROM "InvitationAnalytics"
                WHERE "weddingId" = $1
                  AND "type" = 'VIEW'
                  AND "createdAt" >= $2
                GROUP BY day
                ORDER BY day ASC
            `, weddingId, sevenDaysAgo);
        } catch (e: any) {
            console.error("[Stats] Failed to query daily trend:", e.message);
        }

        const trendMap = new Map();
        for (let i = 20; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            trendMap.set(d.toISOString().split('T')[0], 0);
        }

        if (Array.isArray(dailyTrendRaw)) {
            dailyTrendRaw.forEach((item) => {
                if (item?.day) {
                    const dayStr = (item.day instanceof Date ? item.day : new Date(item.day)).toISOString().split('T')[0];
                    trendMap.set(dayStr, Number(item.count || 0));
                }
            });
        }

        const formattedTrend = Array.from(trendMap.entries())
            .map(([date, count]) => ({ date, count }));

        return c.json({
            totalViews,
            mapClicks,
            saveDateClicks,
            rsvpOpens,
            rsvpSubmits,
            deviceStats: (rawDeviceStats as any[]).map((s: any) => ({
                type: s.deviceType || 'UNKNOWN',
                count: typeof s._count === 'object' ? (s._count._all || 0) : (s._count || 0)
            })),
            dailyTrend: formattedTrend
        });
    } catch (error) {
        console.error("Analytics Fetch Error:", error);
        return c.json({
            error: "Internal Server Error",
            totalViews: 0,
            mapClicks: 0,
            saveDateClicks: 0,
            deviceStats: [],
            dailyTrend: []
        }, 500);
    }
});

weddingRouter.post('/analytics', async (c) => {
    try {
        const { weddingId, type } = await c.req.json();

        console.log(`[Analytics] POST body: weddingId=${weddingId}, type=${type}`);

        if (!weddingId || !type) {
            console.warn(`[Analytics] 400: Missing required fields. Body: ${JSON.stringify({ weddingId, type })}`);
            return c.json({ error: "Missing required fields" }, 400);
        }

        const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
        const userAgent = c.req.header("user-agent") || "unknown";

        // Web Crypto compatible hash (no Node crypto.createHash)
        const ipHashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
        const ipHash    = btoa(Array.from(new Uint8Array(ipHashBuf)).map(b => String.fromCharCode(b)).join("")).slice(0, 16);

        const isMobile = userAgent.toLowerCase().includes("mobile") || userAgent.toLowerCase().includes("android") || userAgent.toLowerCase().includes("iphone");
        const deviceType = isMobile ? "MOBILE" : "DESKTOP";

        const db = getDb(c.env);
        await db.insert(invitationAnalytics).values({
            id: globalThis.crypto.randomUUID(),
            weddingId,
            type,
            ipHash,
            userAgent: userAgent.slice(0, 255),
            deviceType
        });

        return c.json({ success: true });
    } catch (error) {
        console.error("Analytics Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

weddingRouter.get('/notes', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const wedding = await getDb(c.env).select({ notes: weddings.notes })
        .from(weddings)
        .where(eq(weddings.userId, user.userId))
        .limit(1)
        .then(r => r[0]);

    if (!wedding) return c.json({ error: "Wedding not found" }, 404);

    return c.json({ notes: wedding.notes || "" });
});

weddingRouter.patch('/notes', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    const { notes } = sanitizeObject<any>(body);

    const wedding = await getDb(c.env).select()
        .from(weddings)
        .where(eq(weddings.userId, user.userId))
        .limit(1)
        .then(r => r[0]);

    if (!wedding) return c.json({ error: "Wedding not found" }, 404);

    await getDb(c.env).update(weddings)
        .set({ notes })
        .where(eq(weddings.id, wedding.id));

    return c.json({ notes });
});

weddingRouter.post('/rsvp', async (c) => {
    const ip = getIP(c.req.raw as any);
    const { success } = await publicLimiter.limit(ip);
    if (!success) {
        console.warn(`[RateLimit] RSVP spam blocked for IP: ${ip}`);
        return c.json({ error: "Too many requests. Please slow down." }, 429);
    }

    try {
        const body = await c.req.json();
        const { guestId, weddingId, rsvpStatus, adultsCount, childrenCount, rsvpNotes, website, cfTurnstileResponse } = body;

        if (website) {
            console.warn(`[BOT_DETECTION] RSVP Honeypot triggered. Payload:`, { guestId, weddingId, website });
            return c.json({ success: true }); 
        }

        // Verify Turnstile CAPTCHA
        if (!cfTurnstileResponse) {
            return c.json({ error: "Missing CAPTCHA response" }, 400);
        }

        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
        const formData = new FormData();
        formData.append('secret', turnstileSecret);
        formData.append('response', cfTurnstileResponse);
        formData.append('remoteip', ip);

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const outcome = await verifyRes.json();
        if (!outcome.success) {
            console.warn(`[BOT_DETECTION] Turnstile failed for IP: ${ip}. Error:`, outcome['error-codes']);
            return c.json({ error: "CAPTCHA verification failed. Please try again." }, 403);
        }

        if (!weddingId || !rsvpStatus) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const sanitizedNotes = rsvpNotes ? sanitize(rsvpNotes) : null;

        if (guestId) {
            const db = getDb(c.env);
            const existingGuest = await db.select({ weddingId: guests.weddingId })
                .from(guests)
                .where(eq(guests.id, guestId))
                .limit(1);

            if (!existingGuest.length) return c.json({ error: "Guest not found" }, 404);
            if (existingGuest[0].weddingId !== weddingId) {
                console.error(`[Security] BOLA Attempt: Guest ${guestId} does not belong to wedding ${weddingId}`);
                return c.json({ error: "Access denied" }, 403);
            }

            const [updatedGuest] = await db.update(guests)
                .set({
                    rsvpStatus,
                    adultsCount: adultsCount || 1,
                    childrenCount: childrenCount || 0,
                    rsvpNotes: sanitizedNotes,
                    rsvpAt: new Date(),
                })
                .where(eq(guests.id, guestId))
                .returning();
            
            return c.json({ success: true, guest: updatedGuest });
        }

        const db = getDb(c.env);
        const weddingExists = await db.select({ id: weddings.id })
            .from(weddings)
            .where(eq(weddings.id, weddingId))
            .limit(1);
        
        if (!weddingExists.length) {
            console.warn(`[Security] Invalid weddingId provided for anonymous RSVP: ${weddingId}`);
            return c.json({ error: "Wedding not found" }, 404);
        }

        const [newGuest] = await db.insert(guests).values({
            id: globalThis.crypto.randomUUID(),
            weddingId,
            name: rsvpNotes?.startsWith("Name: ") ? rsvpNotes.replace("Name: ", "").substring(0, 50) : "General Guest",
            rsvpStatus,
            adultsCount: adultsCount || 1,
            childrenCount: childrenCount || 0,
            rsvpNotes: rsvpNotes || "General RSVP",
            rsvpAt: new Date(),
            source: "WEBSITE_RSVP"
        }).returning();

        return c.json({ success: true, guest: newGuest });

    } catch (error) {
        console.error("RSVP Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

weddingRouter.get('/', async (c) => {
    console.log("[Wedding API] GET Request received");
    try {
        const user = await getServerUser(c.req.raw);
        console.log(`[Wedding API Debug] GET. UserRole: ${user?.role}, UserId: ${user?.userId}`);

        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const id = c.req.query("id");
        const full = c.req.query("full") === "true";

        let wedding: any;
        
        if (user.role === "STAFF") {
            const staffWeddingId = (user as any).weddingId;
            wedding = full 
                ? await getWeddingByIdFull(staffWeddingId, c.env)
                : await getDb(c.env).select().from(weddings).where(eq(weddings.id, staffWeddingId)).limit(1).then(r => r[0]);
        } else if (id) {
            // ✅ SECURITY: Verify ownership before fetching full data
            const tempWedding = await getDb(c.env).select().from(weddings).where(eq(weddings.id, id)).limit(1).then(r => r[0]);
            
            if (!tempWedding) {
                return c.json({ error: "Wedding not found" }, 404);
            }
            
            if (tempWedding.userId !== user.userId) {
                console.error(`[SECURITY] IDOR attempt: User ${user.userId} tried to access wedding ${id} owned by ${tempWedding.userId}`);
                return c.json({ error: "Forbidden: You do not own this wedding" }, 403);
            }
            
            wedding = full ? await getWeddingByIdFull(id, c.env) : tempWedding;
        } else {
            wedding = full 
                ? await getUserWeddingFull(user.userId, c.env)
                : await getDb(c.env).select().from(weddings).where(eq(weddings.userId, user.userId)).orderBy(desc(weddings.createdAt)).limit(1).then(r => r[0]);
        }

        if (!wedding) {
            console.log(`[Wedding API Debug] GET. No wedding found for user ${user.userId}`);
            return c.json({});
        }

        const safeWedding = { ...wedding };
        delete safeWedding.paymentInfo;
        
        try {
            if (wedding.paymentInfo) {
                safeWedding.paymentInfo = await decrypt(wedding.paymentInfo);
            }
        } catch (e: any) {
            console.error(`[Wedding API Debug] Decryption failure: ${e.message}`);
        }

        let responseData: any = safeWedding;
        if (wedding.themeSettings) {
            try {
                const parsed = typeof wedding.themeSettings === 'string' 
                    ? JSON.parse(wedding.themeSettings) 
                    : wedding.themeSettings;
                responseData = { ...safeWedding, themeSettings: parsed };
            } catch (e) {
                responseData = { ...safeWedding, themeSettings: {} };
            }
        }

        console.log(`[Wedding API Debug] GET Success. Returning wedding with date: ${responseData.date}`);
        return c.json(responseData);
    } catch (error: any) {
        console.error(`[Wedding GET ERROR] ${error.message}`, { stack: error.stack });
        return c.json({ error: "Internal Server Error in Wedding GET", details: error.message }, 500);
    }
});

weddingRouter.post('/', async (c) => {
    console.log("[Wedding API] POST Request received");
    try {
        const user = await getServerUser(c.req.raw);
        console.log(`[Wedding API Debug] POST. UserRole: ${user?.role}`);

        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const existingWedding = await getDb(c.env).select().from(weddings)
            .where(eq(weddings.userId, user.userId))
            .limit(1)
            .then(r => r[0]);
        
        if (existingWedding) {
            return c.json({ error: "Wedding already exists" }, 409);
        }

        let body;
        try {
            body = await c.req.json();
        } catch (e) {
            return c.json({ error: "Invalid JSON" }, 400);
        }

        const validated = weddingSchema.safeParse(body);
        if (!validated.success) return c.json({ error: validated.error.issues }, 400);

        const sanitizedData = sanitizeObject<any>(validated.data);
        const { groomName, brideName, date, location, eventType, paymentInfo } = sanitizedData;

        const newWedding = await getDb(c.env).insert(weddings).values({
            id: generateId(),
            userId: user.userId,
            groomName: groomName || "Groom",
            brideName: brideName || "Bride",
            date: date ? new Date(date) : new Date(),
            location: location || "",
            status: "ACTIVE",
            eventType: eventType || "wedding",
            paymentInfo: paymentInfo ? await encrypt(paymentInfo) : null,
            themeSettings: JSON.stringify(sanitizedData.themeSettings || {}),
        }).returning();

        const wedding = newWedding[0];
        
        const responseWedding: any = { ...wedding };
        if (wedding.paymentInfo) {
            responseWedding.paymentInfo = await decrypt(wedding.paymentInfo);
        }
        
        // Parse themeSettings back to object for response
        if (typeof responseWedding.themeSettings === 'string') {
            try {
                responseWedding.themeSettings = JSON.parse(responseWedding.themeSettings);
            } catch (e) {
                responseWedding.themeSettings = {};
            }
        }

        console.log(`[Wedding API Debug] POST Success. WeddingId: ${wedding.id}`);
        return c.json(responseWedding);
    } catch (error: any) {
        console.error(`[Wedding API Debug] POST CRASH: ${error.message}`, error);
        return c.json({ error: "Internal Server Error in Wedding POST", details: error.message }, 500);
    }
});

weddingRouter.put('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        console.log(`[Wedding API Debug] PUT. UserRole: ${user?.role}`);

        if (!user) return c.json({ error: "Unauthorized" }, 401);

        let body;
        try {
            body = await c.req.json();
        } catch (e) {
            return c.json({ error: "Invalid JSON" }, 400);
        }

        const validated = weddingUpdateSchema.safeParse(body);
        if (!validated.success) return c.json({ error: validated.error.issues }, 400);

        const sanitizedBody = sanitizeObject<any>(validated.data);
        const { status, templateId, groomName, brideName, location, date, eventType, paymentInfo, weddingId } = sanitizedBody;

        let wedding: any;
        if (user.role === "STAFF") {
            wedding = await getWeddingByIdFull((user as any).weddingId, c.env);
        } else if (weddingId) {
            const tempWedding = await getDb(c.env).select().from(weddings)
                .where(and(eq(weddings.id, weddingId), eq(weddings.userId, user.userId)))
                .limit(1)
                .then(r => r[0]);
            if (tempWedding) {
                wedding = await getWeddingByIdFull(weddingId, c.env);
            }
        }

        // Fallback: If weddingId wasn't provided or didn't match, find the user's latest wedding
        if (!wedding && user.userId) {
            wedding = await getUserWeddingFull(user.userId, c.env);
        }

        let currentTheme = {};
        if (wedding && wedding.themeSettings) {
            try {
                currentTheme = typeof wedding.themeSettings === 'string'
                    ? JSON.parse(wedding.themeSettings)
                    : wedding.themeSettings;
            } catch (e) {
                console.error("[Wedding API] Failed to parse existing themeSettings", e);
            }
        }

        const mergedTheme = sanitizedBody.themeSettings !== undefined ? {
            ...(sanitizedBody.themeSettings || {}),
            ...(sanitizedBody.galleryItems ? { galleryItems: sanitizedBody.galleryItems } : {})
        } : currentTheme;

        // If user still has no wedding in database, CREATE one automatically
        if (!wedding && user.userId) {
            const newWedding = await getDb(c.env).insert(weddings).values({
                id: generateId(),
                userId: user.userId,
                groomName: groomName || "Groom",
                brideName: brideName || "Bride",
                date: date ? new Date(date) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                location: location || "",
                status: status || "ACTIVE",
                templateId: templateId || "khmer-legacy",
                eventType: eventType || "wedding",
                themeSettings: JSON.stringify(mergedTheme),
            }).returning();
            
            wedding = await getWeddingByIdFull(newWedding[0].id, c.env);
            console.log(`[Wedding API Debug] Auto-created new wedding for user ${user.userId}. WeddingId: ${wedding.id}`);
        }

        if (!wedding) {
            return c.json({ error: "Wedding not found or access denied" }, 404);
        }

        if (isEditingLocked(wedding as any) && user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Editing is locked for this wedding. Please upgrade or contact support." }, 403);
        }

        const isPremium = wedding.packageType === "PREMIUM";
        
        if (templateId && templateId.toLowerCase().includes("premium") && !isPremium) {
            return c.json({ error: "The selected template requires a Premium package." }, 403);
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (templateId) updateData.templateId = templateId;
        if (groomName !== undefined) updateData.groomName = groomName || "";
        if (brideName !== undefined) updateData.brideName = brideName || "";
        if (location !== undefined) updateData.location = location || "";
        if (date && !isNaN(new Date(date).getTime())) updateData.date = new Date(date);
        if (eventType) updateData.eventType = eventType;
        if (paymentInfo) updateData.paymentInfo = await encrypt(paymentInfo);
        updateData.themeSettings = JSON.stringify(mergedTheme);
        
        console.log("[Wedding API] Merged Theme to save:", mergedTheme);

        if (sanitizedBody.themeSettings) {
            const oldHeroPublicId = (currentTheme as any)?.heroImagePublicId;
            const newHeroPublicId = sanitizedBody.themeSettings.heroImagePublicId;
            if (oldHeroPublicId && newHeroPublicId && oldHeroPublicId !== newHeroPublicId) {
                try {
                    await cloudinaryDelete(oldHeroPublicId, 'image');
                    console.log(`[Cloudinary] Deleted old hero image: ${oldHeroPublicId}`);
                } catch (e: any) {
                    console.error(`[Cloudinary] Failed to delete old hero image:`, e.message);
                }
            }

            const oldMusicPublicId = (currentTheme as any)?.musicUrlPublicId;
            const newMusicPublicId = sanitizedBody.themeSettings.musicUrlPublicId;
            if (oldMusicPublicId && newMusicPublicId && oldMusicPublicId !== newMusicPublicId) {
                try {
                    await cloudinaryDelete(oldMusicPublicId, 'video');
                    console.log(`[Cloudinary] Deleted old music file: ${oldMusicPublicId}`);
                } catch (e: any) {
                    console.error(`[Cloudinary] Failed to delete old music file:`, e.message);
                }
            }
        }

        if (sanitizedBody.galleryItems) {
            const incomingPublicIds = sanitizedBody.galleryItems.map((item: any) => item?.publicId).filter(Boolean);
            const deletedGalleryItems = (wedding.galleryItems || []).filter((item: any) => item.publicId && !incomingPublicIds.includes(item.publicId));
            
            for (const item of deletedGalleryItems) {
                try {
                    await cloudinaryDelete(item.publicId, item.type === 'VIDEO' ? 'video' : 'image');
                    console.log(`[Cloudinary] Deleted orphaned gallery item: ${item.publicId}`);
                } catch (e: any) {
                    console.error(`[Cloudinary] Failed to delete orphaned gallery item ${item.publicId}:`, e.message);
                }
            }

            // Delete old gallery items
            await getDb(c.env).delete(galleryItems).where(eq(galleryItems.weddingId, wedding.id));
            
            // Insert new gallery items
            const newGalleryItems = sanitizedBody.galleryItems
                .map((item: any, idx: number) => ({
                    id: generateId(),
                    weddingId: wedding.id,
                    url: item?.url || "",
                    publicId: item?.publicId || null,
                    type: item?.type || 'IMAGE',
                    caption: item?.caption || `slot:${idx}`
                }))
                .filter((item: any) => item.url || item.publicId);
            
            if (newGalleryItems.length > 0) {
                await getDb(c.env).insert(galleryItems).values(newGalleryItems);
            }
        }

        if (sanitizedBody.activities) {
            const incomingActivityPublicIds = sanitizedBody.activities.map((item: any) => item.publicId).filter(Boolean);
            const deletedActivities = (wedding.activities || []).filter((item: any) => item.publicId && !incomingActivityPublicIds.includes(item.publicId));
            
            for (const item of deletedActivities) {
                try {
                    await cloudinaryDelete(item.publicId, 'image');
                    console.log(`[Cloudinary] Deleted orphaned activity image: ${item.publicId}`);
                } catch (e: any) {
                    console.error(`[Cloudinary] Failed to delete orphaned activity image ${item.publicId}:`, e.message);
                }
            }

            // Delete old activities
            await getDb(c.env).delete(activities).where(eq(activities.weddingId, wedding.id));
            
            // Insert new activities
            const newActivities = sanitizedBody.activities.map((item: any) => ({
                id: generateId(),
                weddingId: wedding.id,
                title: item.title || "Activity",
                time: item.time || "",
                description: item.description || "",
                icon: item.icon || null,
                publicId: item.publicId || null,
                order: item.order || 0
            }));
            
            if (newActivities.length > 0) {
                await getDb(c.env).insert(activities).values(newActivities);
            }
        }

        // Update the wedding
        await getDb(c.env).update(weddings)
            .set(updateData)
            .where(eq(weddings.id, wedding.id));

        // Fetch updated wedding with relations
        const updatedWedding = await getWeddingByIdFull(wedding.id, c.env);

        if (!updatedWedding) {
            return c.json({ error: "Failed to fetch updated wedding" }, 500);
        }

        if (updatedWedding.paymentInfo) {
            updatedWedding.paymentInfo = await decrypt(updatedWedding.paymentInfo);
        }

        console.log(`[Wedding API Debug] PUT Success. WeddingId: ${updatedWedding.id}`);
        return c.json(updatedWedding);
    } catch (error: any) {
        console.error(`[Wedding API Debug] PUT CRASH: ${error.message}`, error);
        return c.json({ error: "Internal Server Error in Wedding PUT", details: error.message }, 500);
    }
});

// Public endpoint for wedding lookup (for static export)
weddingRouter.get('/:id', async (c) => {
    try {
        const weddingId = c.req.param("id");
        
        const wedding = await getWeddingByIdFull(weddingId, c.env);

        if (!wedding) {
            return c.json({ error: "Wedding not found" }, 404);
        }

        // Enable edge caching for 60 seconds (Cloudflare will serve from cache to prevent DB overload)
        c.header('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');

        let parsedThemeSettings: any = wedding.themeSettings;
        if (typeof parsedThemeSettings === 'string') {
            try {
                parsedThemeSettings = JSON.parse(parsedThemeSettings);
            } catch (e) {
                parsedThemeSettings = {};
            }
        }

        let galleryItemsList: any[] = wedding.galleryItems || [];
        if (parsedThemeSettings?.galleryItems && Array.isArray(parsedThemeSettings.galleryItems)) {
            galleryItemsList = parsedThemeSettings.galleryItems;
        } else if (galleryItemsList && Array.isArray(galleryItemsList)) {
            const reconstructed: any[] = [];
            galleryItemsList.forEach((item: any, idx: number) => {
                if (item.caption?.startsWith("slot:")) {
                    const slotIdx = parseInt(item.caption.replace("slot:", ""), 10);
                    if (!isNaN(slotIdx)) {
                        reconstructed[slotIdx] = item;
                        return;
                    }
                }
                reconstructed[idx] = item;
            });
            galleryItemsList = reconstructed;
        }

        // Return only public fields
        return c.json({
            id: wedding.id,
            groomName: wedding.groomName,
            brideName: wedding.brideName,
            date: wedding.date,
            location: wedding.location,
            eventType: wedding.eventType,
            templateId: wedding.templateId,
            themeSettings: parsedThemeSettings || {},
            activities: wedding.activities || [],
            galleryItems: galleryItemsList,
        });
    } catch (error: any) {
        console.error("[Wedding GET]", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

export default weddingRouter;
