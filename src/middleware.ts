import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";
import { getIP } from "./lib/utils";
import { sendTelegramAlert } from "./lib/telegram";
import { 
    COOKIE_NAMES, 
    AUTH_URLS, 
    JWT_CONFIG, 
    BLOCKED_BOTS, 
    SECURITY_HEADERS,
    ROLES,
    ROLE_LABELS
} from "./lib/constants";
import { isTokenRevoked, generateFingerprint } from "./lib/auth";
import redis from "./lib/redis";
import { isValidCSRFToken } from "./lib/csrf";
import * as Sentry from "@sentry/nextjs";

const SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "development" ? "monea-dev-secret-do-not-use-in-prod-1234567890" : "");
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Security Guard: Fail fast if secrets are missing or weak
if (!SECRET || (process.env.NODE_ENV === "production" && SECRET.length < 32)) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("[CRITICAL] JWT_SECRET is missing or too weak (min 32 chars required for HS256).");
    } else {
        console.warn("[Security] JWT_SECRET is missing or weak. Using fallback for development.");
    }
}
if (process.env.NODE_ENV === "production" && !ENCRYPTION_KEY) {
    throw new Error("[CRITICAL] ENCRYPTION_KEY is missing in production!");
}

const ENCODED_SECRET = new TextEncoder().encode(SECRET);
 
// --- Middleware In-Memory Cache (Short-lived for Performance) ---
let cachedMaintenance: { value: boolean; expires: number } | null = null;
let cachedBlacklist: Map<string, { value: boolean; expires: number }> = new Map();
const MAINTENANCE_CACHE_TTL = 5000; // 5 seconds
const BLACKLIST_CACHE_TTL = 60000; // 60 seconds (1 minute is safe for blacklist)
 
// --- Helpers ---

/**
 * Validates the Origin and Referer against the Host to prevent CSRF on mutable requests.
 * Standardizes on Host check to prevent cross-origin/cross-site mutable operations.
 */
async function validateCSRF(request: NextRequest): Promise<boolean> {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    if (!host) {
        console.error("[Security] CSRF Blocked: Missing Host header.");
        return false;
    }

    // Mutable methods (POST, PUT, DELETE, PATCH) REQUIRE strict validation.
    if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
        // 1. Strict Origin/Referer check
        if (!origin && !referer) {
            console.warn(`[Security] CSRF Blocked: Sensitive ${request.method} missing both Origin and Referer. Path: ${request.nextUrl.pathname}`);
            return false;
        }

        if (origin) {
            try {
                const originUrl = new URL(origin);
                const isLocal = originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1" || originUrl.hostname.endsWith(".localhost");
                
                const hostOnly = host.split(":")[0];
                const originHostOnly = originUrl.hostname;

                if (originUrl.host !== host && !(process.env.NODE_ENV === "development" && isLocal)) {
                    // Robust check for local dev port mismatches or localhost vs 127.0.0.1
                    const bothLocal = (originHostOnly === "localhost" || originHostOnly === "127.0.0.1") && 
                                     (hostOnly === "localhost" || hostOnly === "127.0.0.1");
                    
                    if (!bothLocal) {
                        console.warn(`[Security] CSRF Blocked: Origin host mismatch (${originUrl.host} vs ${host})`);
                        return false;
                    }
                }
            } catch (e) {
                return false;
            }
        } else if (referer) {
            try {
                const refererUrl = new URL(referer);
                const isLocal = refererUrl.hostname === "localhost" || refererUrl.hostname === "127.0.0.1";

                if (refererUrl.host !== host && !(process.env.NODE_ENV === "development" && isLocal)) {
                    console.warn(`[Security] CSRF Blocked: Referer host mismatch (${refererUrl.host} vs ${host})`);
                    return false;
                }
            } catch (e) {
                return false;
            }
        }

        // 2. Anti-Forgery Token Validation (X-CSRF-Token) - MANDATORY for mutable methods in 10/10 build
        // Exception: Public auth routes (signin/signup) may not have a token before initial login
        // Exception: Public auth routes and external integrations
        const isPublicAuthRoute = ["/api/auth/signin", "/api/auth/signup", "/api/auth/csrf"].includes(request.nextUrl.pathname);
        const isSentryTunnel = request.nextUrl.pathname === "/api/sentry-tunnel";
        const csrfToken = request.headers.get("x-csrf-token");
        
        if (!isPublicAuthRoute && !isSentryTunnel) {
            if (!csrfToken || !(await isValidCSRFToken(csrfToken))) {
                console.warn(`[Security] CSRF Blocked: Missing or Invalid Token from ${request.headers.get("x-real-ip") || "unknown"}`);
                return false;
            }
        }
    }

    return true;
}

/**
 * Validates a JWT token against the encoded secret, checks for expiration,
 * and optionally validates the browser fingerprint for anti-replay protection.
 */
async function verifyJWT(token: string, fingerprint: string, options?: { audience?: string | string[]; issuer?: string; checkFingerprint?: boolean }): Promise<JWTPayload> {
    const SECRET_KEY = process.env.JWT_SECRET || (process.env.NODE_ENV === "development" ? "monea-dev-secret-do-not-use-in-prod-1234567890" : "");
    const ENCODED = new TextEncoder().encode(SECRET_KEY);
    
    try {
        // Relax checks for development stability
        const verifyOptions = { ...options };
        if (process.env.NODE_ENV === "development" || options?.issuer === undefined) {
            delete verifyOptions.issuer;
        }

        const { payload } = await jwtVerify(token, ENCODED, verifyOptions);
        
        // 1. Explicit expiration check
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            throw new Error("JWT has expired");
        }

        // 2. Anti-replay fingerprint (Disabled in Dev for robustness)
        const isLowSecurity = process.env.NODE_ENV === "development" || !options?.checkFingerprint;
        if (!isLowSecurity && payload.fingerprint && payload.fingerprint !== fingerprint) {
            console.warn(`[Fingerprint Mismatch] Token: ${payload.fingerprint}, Req: ${fingerprint}`);
            throw new Error("Fingerprint mismatch");
        }

        // 3. JTI Revocation
        if (payload.jti) {
            const isRevoked = await isTokenRevoked(payload.jti);
            if (isRevoked) throw new Error("JWT has been revoked");
        }
        
        return payload;
    } catch (e: any) {
        if (process.env.NODE_ENV === "development") {
            console.error(`[Middleware Fail] ${e.message} (Secret Length: ${SECRET_KEY.length}, Host: ${process.env.NODE_ENV})`);
        }
        throw e;
    }
}

/**
 * Creates a redirect response to the login page and clears the auth cookie with hardened flags.
 */
function redirectToLogin(request: NextRequest): NextResponse {
    const res = NextResponse.redirect(new URL(AUTH_URLS.SIGN_IN, request.url));
    const isProd = process.env.NODE_ENV === "production";
    const host = request.headers.get("host") || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    
    res.cookies.delete({ 
        name: COOKIE_NAMES.TOKEN, 
        path: "/",
        httpOnly: true,
        secure: isProd && !isLocal,
        sameSite: isProd ? "strict" : "lax",
        maxAge: 0, // Force immediate expiry
    });
    return res;
}

/**
 * Centralized error responder for middleware failures.
 * Logs, alerts, and returns a fail-secure 500 response.
 */
async function handleMiddlewareError(error: Error, request: NextRequest, ip: string): Promise<NextResponse> {
    const path = request.nextUrl.pathname;
    
    console.error(`[Middleware Error] CRITICAL: ${error.message} (Path: ${path}, IP: ${ip})`);
    
    try {
        await sendTelegramAlert(
            `<b>CRITICAL: Middleware Failure</b>\n` +
            `<b>Error:</b> ${error.message}\n` +
            `<b>Path:</b> ${path}\n` +
            `<b>IP:</b> ${ip}\n` +
            `<b>Time:</b> ${new Date().toISOString()}`
        );
    } catch (alertError) {
        console.error("[Middleware Error] Failed to send alert:", alertError);
    }

    const errorResponse = new NextResponse(
        JSON.stringify({ 
            error: "Internal Server Error", 
            message: "Security framework operational failure. Administrators have been notified." 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => errorResponse.headers.set(k, v));
    return errorResponse;
}

// --- Middleware Implementation ---

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const userAgent = request.headers.get("user-agent")?.toLowerCase() || "unknown";
    const ip = getIP(request);
    
    try {
        const path = request.nextUrl.pathname;
        const method = request.method;

        // 0. IP Blacklist (Critical Security Layer with Caching)
        if (ip !== "unknown" && ip !== "127.0.0.1" && ip !== "::1") {
            const now = Date.now();
            const cached = cachedBlacklist.get(ip);
            let isBlacklisted = false;

            if (cached && now < cached.expires) {
                isBlacklisted = cached.value;
            } else {
                isBlacklisted = (await redis.get(`blacklist:ip:${ip}`)) === "true";
                cachedBlacklist.set(ip, { value: isBlacklisted, expires: now + BLACKLIST_CACHE_TTL });
                // Cleanup old cache entries occasionally
                if (cachedBlacklist.size > 1000) {
                    const firstKey = cachedBlacklist.keys().next().value;
                    if (firstKey !== undefined) cachedBlacklist.delete(firstKey);
                }
            }

            if (isBlacklisted) {
                console.warn(`[Security] Blocked access from blacklisted IP: ${ip} (Path: ${path})`);
                const blockedResponse = new NextResponse(
                    JSON.stringify({ 
                        error: "Access Denied", 
                        message: "Your IP has been restricted by the system administrator." 
                    }), 
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
                Object.entries(SECURITY_HEADERS).forEach(([k, v]) => blockedResponse.headers.set(k, v));
                return blockedResponse;
            }
        }

        // 1. Bot Protection (Early return)
        const isDev = process.env.NODE_ENV === "development";
        if (userAgent && BLOCKED_BOTS.some(bot => userAgent.includes(bot.toLowerCase()))) {
            // Allow curl/python in development for debugging
            const isDevTool = userAgent.includes("curl") || userAgent.includes("python");
            if (!(isDev && isDevTool)) {
                const botResponse = new NextResponse(null, { status: 403 });
                Object.entries(SECURITY_HEADERS).forEach(([k, v]) => botResponse.headers.set(k, v));
                return botResponse;
            }
        }

        // 2. CSRF Protection (Mutable methods)
        if (!(await validateCSRF(request))) {
            console.warn(`[Security] CSRF Blocked: Host/Origin mismatch. Path: ${path}, IP: ${ip}`);
            Sentry.captureMessage(`[Security] CSRF Violation Blocked`, {
                level: "warning",
                extra: { path, ip, method, origin: request.headers.get("origin") }
            });
            const csrfResponse = new NextResponse(JSON.stringify({ error: "Invalid request origin or cross-site request detected." }), { status: 403, headers: { "Content-Type": "application/json" } });
            Object.entries(SECURITY_HEADERS).forEach(([k, v]) => csrfResponse.headers.set(k, v));
            return csrfResponse;
        }

        // Precompute fingerprint once per request for all downstream auth checks
        const fingerprint = await generateFingerprint({ headers: request.headers, ip });

        // 2.5 Maintenance Mode (System Halt with Caching)
        const now = Date.now();
        let activeMaintenance = false;

        if (cachedMaintenance && now < cachedMaintenance.expires) {
            activeMaintenance = cachedMaintenance.value;
        } else {
            const isMaintenanceMode = await redis.get("GLOBAL_MAINTENANCE") === "true";
            const mStart = await redis.get("MAINTENANCE_START");
            const mEnd = await redis.get("MAINTENANCE_END");
            
            activeMaintenance = isMaintenanceMode;
            if (!activeMaintenance && mStart) {
                const start = parseInt(mStart);
                const end = mEnd ? parseInt(mEnd) : Infinity;
                if (now >= start && now < end) activeMaintenance = true;
            }
            cachedMaintenance = { value: activeMaintenance, expires: now + MAINTENANCE_CACHE_TTL };
        }

        if (activeMaintenance) {
            const isAuthRoute = path.startsWith("/sign-in") || path.startsWith("/api/auth");
            let isSuperAdmin = false;
            
            const tokenTemp = request.cookies.get(COOKIE_NAMES.TOKEN)?.value;
            if (tokenTemp) {
                try {
                    const payload = await verifyJWT(tokenTemp, fingerprint, { issuer: JWT_CONFIG.ISSUER });
                    if (payload.role === ROLES.PLATFORM_OWNER) isSuperAdmin = true;
                } catch (e) { }
            }
            
            if (!isAuthRoute && !isSuperAdmin) {
                if (path.startsWith("/api")) {
                    return new NextResponse(JSON.stringify({ error: "System under maintenance" }), { status: 503, headers: { "Content-Type": "application/json" } });
                }
                const maintenanceHtml = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="refresh" content="30">
                        <title>System Offline | MONEA</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>@import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;700&display=swap');body{font-family:'Kantumruy Pro',sans-serif;}</style>
                    </head>
                    <body class="bg-slate-950 flex items-center justify-center min-h-screen text-center p-6">
                        <div class="max-w-md w-full p-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                            <div class="mx-auto w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" class="animate-pulse" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 6 7.7 7.7"/><path d="m8 6 8 8"/></svg>
                            </div>
                            <div class="space-y-4 relative z-10">
                                <h1 class="text-2xl font-black uppercase tracking-[0.2em] text-white">System Offline</h1>
                                <p class="text-sm font-bold text-slate-400 leading-relaxed">ប្រព័ន្ធត្រូវបានបិទសម្រាប់ការថែទាំបណ្តោះអាសន្ន។<br/><br/>The MONEA platform is currently undergoing scheduled maintenance. Please check back later.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
                return new NextResponse(maintenanceHtml, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "3600" } });
            }
        }

        // 3. Rate Limiting
        if (path.startsWith("/api")) {
            const isLocal = ip === "127.0.0.1" || ip === "::1" || ip === "unknown" || request.nextUrl.hostname === "localhost";
            if (process.env.NODE_ENV !== "development" || !isLocal) {
                const { standardLimiter, getIP: getLimiterIP } = await import("@/lib/ratelimit");
                const ipForLimiter = getLimiterIP(request as any);
                const { success, limit, remaining, reset } = await standardLimiter.limit(ipForLimiter);
                
                if (!success) {
                    console.warn(`[Rate Limit] Exceeded for ${ip} on ${path}`);
                    Sentry.captureMessage(`[Rate Limit] Exceeded`, {
                        level: "info",
                        extra: { ip, path, limit, remaining }
                    });
                    return NextResponse.json({ error: "Too many requests" }, { 
                        status: 429,
                        headers: {
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString()
                        }
                    });
                }
            }
        }

        // 4. Authentication
        const token = request.cookies.get(COOKIE_NAMES.TOKEN)?.value;
        const staffToken = request.cookies.get(COOKIE_NAMES.STAFF_TOKEN)?.value;
        
        const response: NextResponse = NextResponse.next();

        if (path.startsWith("/dashboard")) {
            // Hardened Staff Access: Only allowed for GET requests on /dashboard/gifts
            if (path.startsWith("/dashboard/gifts") && staffToken && method === "GET") {
                try {
                    await verifyJWT(staffToken, fingerprint, { 
                        audience: JWT_CONFIG.AUDIENCE.STAFF, 
                        issuer: JWT_CONFIG.ISSUER,
                        checkFingerprint: true 
                    });
                    return response;
                } catch (e: any) {
                    console.warn(`[Security] Invalid Staff Token attempt for ${path} from ${ip}`);
                }
            }

            if (!token) return redirectToLogin(request);

            try {
                await verifyJWT(token, fingerprint, { 
                    audience: [JWT_CONFIG.AUDIENCE.USER, JWT_CONFIG.AUDIENCE.ADMIN], 
                    issuer: JWT_CONFIG.ISSUER,
                    checkFingerprint: true 
                });
            } catch (error: any) {
                return redirectToLogin(request);
            }
        }

        else if (path.startsWith("/admin")) {
            if (!token) return redirectToLogin(request);
            try {
                const payload = await verifyJWT(token, fingerprint, { 
                    audience: JWT_CONFIG.AUDIENCE.ADMIN, 
                    issuer: JWT_CONFIG.ISSUER,
                    checkFingerprint: true 
                });
                
                if (payload.role !== ROLES.PLATFORM_OWNER && 
                   (path.startsWith("/admin/governance") || path.startsWith("/admin/master"))) {
                    return NextResponse.redirect(new URL(AUTH_URLS.DASHBOARD, request.url));
                }
            } catch (e) {
                return redirectToLogin(request);
            }
        }

        // 5. Global Security Headers
        Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error: any) {
        return handleMiddlewareError(error, request, ip);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - api (serverless functions - covered by middleware logic but excluded for speed if needed)
         * - favicon.ico (favicon file)
         * - images/ or assets/ (public media)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
