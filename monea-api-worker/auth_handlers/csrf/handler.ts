export const dynamic = 'force-dynamic';
import { generateCSRFToken } from "@/lib/csrf";
import { getServerUser } from "@/lib/auth";
import { getIP } from "@/lib/utils";

/**
 * GET /api/auth/csrf
 * Provides a signed CSRF token for the frontend to use in mutable requests.
 * Compatible with Cloudflare Workers Edge Runtime & Hono / Next.js API Routes.
 */
export async function GET(req: Request) {
    console.log("[API/CSRF] Generating new token for client...");
    try {
        // 1. Fetch authenticated user using Request context
        const user = await getServerUser(req);
        
        // 2. Determine Session Fingerprint
        // If authenticated -> use userId
        // If anonymous -> tie fingerprint to Client IP to prevent global token reuse
        const clientIp = getIP(req);
        const sessionId = user?.userId || user?.id || `anon_${clientIp}`;
        
        // 3. Generate Signed CSRF Token
        const token = await generateCSRFToken(sessionId);
        
        // 4. Return JSON response with Cache-Control headers disabled
        return Response.json(
            { 
                token,
                headerName: "X-CSRF-Token"
            },
            {
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                }
            }
        );

    } catch (error: any) {
        console.error("[CSRF Route Error]:", error);
        return Response.json({ 
            error: "Failed to generate CSRF token",
            details: error?.message || String(error)
        }, { status: 500 });
    }
}