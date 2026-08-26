export const dynamic = 'force-dynamic';
import { COOKIE_NAMES } from "@/lib/constants";

/**
 * POST /api/auth/signout
 * Clears authentication cookies across client & edge environments safely.
 */
export async function POST(request: Request) {
    const referer = request.headers.get("referer") || request.headers.get("origin") || "";
    const isDev = referer.includes("localhost") || referer.includes("127.0.0.1");

    // Production Cross-Site Handling
    const sameSitePolicy = isDev ? "Lax" : "None";
    const secureFlag = isDev ? "" : "; Secure";

    const headers = new Headers({ 
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate"
    });

    const tokenName = COOKIE_NAMES?.TOKEN || "token";
    const staffTokenName = COOKIE_NAMES?.STAFF_TOKEN || "staff_token";

    // Expire cookies by setting Max-Age=0 and Date in the past
    const cookieOptions = `HttpOnly${secureFlag}; Path=/; SameSite=${sameSitePolicy}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    headers.append("Set-Cookie", `${tokenName}=; ${cookieOptions}`);
    headers.append("Set-Cookie", `${staffTokenName}=; ${cookieOptions}`);

    return new Response(
        JSON.stringify({ 
            success: true, 
            message: "Signed out successfully" 
        }), 
        { status: 200, headers }
    );
}