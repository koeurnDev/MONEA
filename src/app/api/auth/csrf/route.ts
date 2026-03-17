export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/csrf";
import { getServerUser } from "@/lib/auth";

/**
 * GET /api/auth/csrf
 * Provides a signed CSRF token for the frontend to use in mutable requests.
 * The token is tied to the user's session fingerprint.
 */
export async function GET() {
    try {
        const user = await getServerUser();
        
        // We use the userId as the session identifier for the CSRF token.
        // If not logged in, we use a constant for "anonymous" sessions if needed, 
        // but MONEA mostly requires auth for mutable actions.
        const sessionId = user?.userId || "anonymous";
        
        const token = await generateCSRFToken(sessionId);
        
        return NextResponse.json({ 
            token,
            headerName: "X-CSRF-Token"
        });
    } catch (error) {
        console.error("[CSRF Route] Error:", error);
        return NextResponse.json({ error: "Failed to generate CSRF token" }, { status: 500 });
    }
}
