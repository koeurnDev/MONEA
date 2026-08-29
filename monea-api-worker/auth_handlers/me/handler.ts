export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

// Helper function to create CORS-compliant Response
function createCorsResponse(body: any, status: number, origin?: string): Response {
    const response = Response.json(body, { status });
    
    // Set CORS headers
    if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
        response.headers.set('Access-Control-Allow-Origin', '*');
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    
    return response;
}

export async function OPTIONS(req: Request) {
    const origin = req.headers.get('origin') || undefined;
    return createCorsResponse(null, 204, origin);
}

export async function GET(req: Request) {
    const origin = req.headers.get('origin') || undefined;
    console.log(`[Auth /me] Starting GET request from origin: ${origin}`);
    
    try {
        console.log('[Auth /me] Attempting to get server user...');
        const user = await getServerUser(req);
        
        if (!user) {
            console.log("[Auth /me] No valid user session found");
            return createCorsResponse({ error: "Unauthorized" }, 401, origin);
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
            return createCorsResponse({ ...staffData, user: staffData }, 200, origin);
        }

        console.log(`[Auth /me] Querying database for user: ${user.userId}`);

        // Check if prisma is available
        if (!prisma) {
            console.error('[Auth /me] Prisma client not available');
            return createCorsResponse({ error: "Database connection not available" }, 500, origin);
        }

        // Single parallel query: user + wedding at the same time
        const [dbUser, firstWedding] = await Promise.all([
            prisma.user.findUnique({
                where: { id: user.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    twoFactorEnabled: true,
                }
            }).catch(err => {
                console.error('[Auth /me] Prisma user query failed:', err);
                throw err;
            }),
            prisma.wedding.findFirst({
                where: { userId: user.userId },
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    groomName: true,
                    brideName: true,
                    date: true,
                    location: true,
                    status: true,
                    packageType: true,
                    eventType: true,
                    templateId: true,
                    themeSettings: true,
                    createdAt: true,
                },
            }).catch(err => {
                console.error('[Auth /me] Prisma wedding query failed:', err);
                throw err;
            }),
        ]);

        if (!dbUser) {
            console.warn(`[Auth /me] User ${user.userId} not found in database`);
            return createCorsResponse({ error: "User not found" }, 404, origin);
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
        return createCorsResponse({ ...userData, user: userData }, 200, origin);
    } catch (error: any) {
        console.error("[Auth /me] Full error:", error);
        console.error("[Auth /me] Error message:", error?.message);
        console.error("[Auth /me] Error stack:", error?.stack);
        console.error("[Auth /me] Error code:", error?.code);
        
        return createCorsResponse({ 
            error: "Internal Server Error",
            details: error?.message || 'Unknown error'
        }, 500, origin);
    }
}

export async function PUT(req: Request) {
    const origin = req.headers.get('origin') || undefined;
    
    try {
        const user = await getServerUser(req);
        if (!user || (!user.userId && !user.id)) {
            return createCorsResponse({ error: "Unauthorized" }, 401, origin);
        }

        const { name, email } = await req.json();
        const targetUserId = user.userId || user.id;

        const updateData: any = {};
        if (name && typeof name === "string") updateData.name = name.trim();
        if (email && typeof email === "string" && email.includes("@")) {
            const cleanEmail = email.toLowerCase().trim();
            const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
            if (existing && existing.id !== targetUserId) {
                return createCorsResponse({ error: "Email នេះត្រូវបានប្រើប្រាស់រួចហើយ" }, 400, origin);
            }
            updateData.email = cleanEmail;
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        });

        return createCorsResponse({ success: true, user: updatedUser }, 200, origin);
    } catch (e) {
        console.error("[Auth /me PUT] Error:", e);
        return createCorsResponse({ error: "Internal Server Error" }, 500, origin);
    }
}
