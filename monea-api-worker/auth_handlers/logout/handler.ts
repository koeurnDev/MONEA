export const dynamic = 'force-dynamic';
import { COOKIE_NAMES } from "@/lib/constants";
import { getCookieHeader, revokePresentedSession } from "@/lib/auth";

/**
 * POST /api/auth/signout
 * Clears authentication cookies across client & edge environments safely.
 */
export async function POST(request: Request) {
    const headers = new Headers({ 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
    });

    let status = 200;
    let responseBody = { success: true, message: "Signed out successfully" };
    try {
        await revokePresentedSession(request);
    } catch (error) {
        console.error("[Auth] Failed to revoke session during logout:", error);
        status = 503;
        responseBody = {
            success: false,
            message: "Session invalidation is temporarily unavailable. Please try again.",
        };
    }

    for (const cookieName of [
        COOKIE_NAMES.TOKEN,
        COOKIE_NAMES.STAFF_TOKEN,
        COOKIE_NAMES.REFRESH_TOKEN,
        COOKIE_NAMES.OWNER_MFA_SETUP,
    ]) {
        headers.append("Set-Cookie", getCookieHeader(cookieName, "", request, 0));
    }

    return new Response(
        JSON.stringify(responseBody),
        { status, headers }
    );
}