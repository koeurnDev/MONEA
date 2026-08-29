import { Hono } from 'hono';
import { getServerUser } from "@/lib/auth";
import { getDb } from "@/lib/drizzle";
import { users, weddings } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

const router = new Hono();

// Helper function to create CORS response
function createCorsResponse(c: any, data: any, status: number = 200) {
    const origin = c.req.header('origin');
    
    // Set CORS headers before returning response
    if (origin) {
        c.header('Access-Control-Allow-Origin', origin);
    } else {
        c.header('Access-Control-Allow-Origin', '*');
    }
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    
    return c.json(data, status);
}

router.options('/', async (c) => {
    return createCorsResponse(c, {}, 200);
});

router.get('/', async (c) => {
    console.log('[Auth /me] Starting GET request from Hono router');
    
    try {
        console.log('[Auth /me] Attempting to get server user...');
        const user = await getServerUser(c.req.raw);
        
        if (!user) {
            console.log("[Auth /me] No valid user session found");
            return createCorsResponse(c, { error: "Unauthorized" }, 401);
        }

        console.log(`[Auth /me] User found: ${user.userId}, type: ${user.type}`);

        // For staff users, return minimal data
        if (user.type === "staff") {
            const staffData = {
                id:   user.userId,
                role: user.role,
                name: user.name,
                type: "staff",
                weddingId: user.weddingId,
            };
            console.log(`[Auth /me] Staff user authenticated: ${user.userId}`);
            return createCorsResponse(c, { ...staffData, user: staffData }, 200);
        }

        console.log(`[Auth /me] Querying database for user: ${user.userId}`);

        const db = getDb(c.env);

        // Query user and wedding in parallel
        const [dbUser, firstWedding] = await Promise.all([
            db.select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
                twoFactorEnabled: users.twoFactorEnabled,
            })
                .from(users)
                .where(eq(users.id, user.userId))
                .limit(1)
                .then((r: any) => r[0])
                .catch((err: any) => {
                    console.error('[Auth /me] Drizzle user query failed:', err);
                    return null;
                }),
            db.select({
                id: weddings.id,
                groomName: weddings.groomName,
                brideName: weddings.brideName,
                location: weddings.location,
                status: weddings.status,
                packageType: weddings.packageType,
                eventType: weddings.eventType,
                templateId: weddings.templateId,
                themeSettings: weddings.themeSettings,
            })
                .from(weddings)
                .where(eq(weddings.userId, user.userId))
                .orderBy(desc(weddings.id))
                .limit(1)
                .then((r: any) => r[0])
                .catch((err: any) => {
                    console.error('[Auth /me] Drizzle wedding query failed:', err);
                    return null;
                }),
        ]);

        if (!dbUser) {
            console.warn(`[Auth /me] User ${user.userId} not found in database`);
            return createCorsResponse(c, { error: "User not found" }, 404);
        }

        console.log(`[Auth /me] Database queries successful for user: ${dbUser.id}`);

        const userData = {
            ...dbUser,
            type: "user",
            weddingId: firstWedding?.id ?? null,
            wedding: firstWedding ?? null,
            _count: { weddings: firstWedding ? 1 : 0 },
        };

        console.log(`[Auth /me] User authenticated successfully: ${user.userId}, role: ${dbUser.role}`);
        return createCorsResponse(c, { ...userData, user: userData }, 200);
        
    } catch (error: any) {
        console.error("[Auth /me] Full error:", error);
        console.error("[Auth /me] Error message:", error?.message);
        console.error("[Auth /me] Error stack:", error?.stack);
        
        return createCorsResponse(c, { 
            error: "Internal Server Error",
            details: error?.message || 'Unknown error'
        }, 500);
    }
});

router.put('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user || (!user.userId && !user.id)) {
            return createCorsResponse(c, { error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { name, email } = body;
        const targetUserId = user.userId || user.id;

        const db = getDb(c.env);

        const updateData: any = {};
        if (name && typeof name === "string") updateData.name = name.trim();
        if (email && typeof email === "string" && email.includes("@")) {
            const cleanEmail = email.toLowerCase().trim();
            const existing = await db.select()
                .from(users)
                .where(eq(users.email, cleanEmail))
                .limit(1)
                .then((r: any) => r[0]);
                
            if (existing && existing.id !== targetUserId) {
                return createCorsResponse(c, { error: "Email នេះត្រូវបានប្រើប្រាស់រួចហើយ" }, 400);
            }
            updateData.email = cleanEmail;
        }

        const updatedUser = await db.update(users)
            .set(updateData)
            .where(eq(users.id, targetUserId))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role
            })
            .then((r: any) => r[0]);

        return createCorsResponse(c, { success: true, user: updatedUser }, 200);
    } catch (e: any) {
        console.error("[Auth /me PUT] Error:", e);
        return createCorsResponse(c, { error: "Internal Server Error" }, 500);
    }
});

export default router;