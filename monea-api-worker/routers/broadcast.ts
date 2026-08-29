import { Hono } from 'hono';
import { getPrisma } from "@/lib/prisma";

const broadcastRouter = new Hono();

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

/**
 * GET /api/broadcast
 * Retrieves all currently active and valid broadcast announcements
 */
broadcastRouter.get('/', async (c) => {
    console.log('[Broadcast] Starting broadcast fetch...');
    
    try {
        // Get fresh Prisma client for this request
        const prisma = getPrisma(c.env);
        
        if (!prisma) {
            console.error('[Broadcast] Prisma client not available');
            return createCorsResponse(c, { 
                success: false, 
                error: 'Database connection not available' 
            }, 500);
        }

        console.log('[Broadcast] Prisma client available, executing query...');
        
        // Fetch active broadcasts ensuring correct time validity (scheduled and expiration check)
        const broadcasts = await prisma.$queryRawUnsafe(`
            SELECT * FROM "Broadcast"
            WHERE active = true
            AND ( "scheduledAt" IS NULL OR "scheduledAt" <= NOW() )
            AND ( "expiresAt" IS NULL OR "expiresAt" > NOW() )
            ORDER BY "createdAt" DESC
        `);

        console.log(`[Broadcast] Successfully fetched ${Array.isArray(broadcasts) ? broadcasts.length : 'unknown'} broadcasts`);
        return createCorsResponse(c, broadcasts || []);
        
    } catch (error: any) {
        console.error("[Broadcast Fetch Error] Full error:", error);
        console.error("[Broadcast Fetch Error] Message:", error?.message);
        console.error("[Broadcast Fetch Error] Stack:", error?.stack);
        
        // Return empty array with CORS headers even on error
        return createCorsResponse(c, { 
            success: false, 
            error: error?.message || 'Database query failed',
            broadcasts: []
        }, 500);
    }
});

// OPTIONS handler for CORS preflight
broadcastRouter.options('/', async (c) => {
    return createCorsResponse(c, {}, 200);
});

export default broadcastRouter;