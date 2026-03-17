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
                const isLocal = originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1";
                
                if (originUrl.host !== host && !(process.env.NODE_ENV === "development" && isLocal)) {
                    console.warn(`[Security] CSRF Blocked: Origin host mismatch (${originUrl.host} vs ${host})`);
                    return false;
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

        // 2. Anti-Forgery Token Validation (X-CSRF-Token)
        const csrfToken = request.headers.get("x-csrf-token");
        if (csrfToken && !(await isValidCSRFToken(csrfToken))) {
            console.warn(`[Security] CSRF Blocked: Invalid CSRF Token from ${request.headers.get("x-real-ip") || "unknown"}`);
            return false;
        }
    }

    return true;
}

/**
 * Validates a JWT token against the encoded secret, checks for expiration,
 * and optionally validates the browser fingerprint for anti-replay protection.
 */
async function verifyJWT(token: string, fingerprint: string, options?: { audience?: string | string[]; issuer?: string; checkFingerprint?: boolean }): Promise<JWTPayload> {
    try {
        const { payload } = await jwtVerify(token, ENCODED_SECRET, options);
        
        // 1. Explicit expiration check
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            console.warn("[Auth Middleware] Token expired");
            throw new Error("JWT has expired");
        }

        // 2. Anti-replay fingerprint check
        if (options?.checkFingerprint && payload.fingerprint) {
            if (payload.fingerprint !== fingerprint) {
                console.warn(`[Auth Middleware] Fingerprint mismatch. Token: ${payload.fingerprint}, Request: ${fingerprint}`);
                throw new Error("JWT fingerprint mismatch");
            }
        }

        // 3. JTI Revocation Check
        if (payload.jti) {
            const isRevoked = await isTokenRevoked(payload.jti);
            if (isRevoked) {
                console.warn(`[Auth Middleware] Token revoked: ${payload.jti}`);
                throw new Error("JWT has been revoked");
            }
        }
        
        return payload;
    } catch (e: any) {
        if (process.env.NODE_ENV === "development") {
            console.error(`[Auth Middleware] JWT Verification Failed: ${e.message}`, {
                expectedAudience: options?.audience,
                expectedIssuer: options?.issuer,
                fingerprintCheck: options?.checkFingerprint
            });
        }
        throw e;
    }
}

/**
 * Creates a redirect response to the login page and clears the auth cookie with hardened flags.
 */
function redirectToLogin(request: NextRequest): NextResponse {
    const res = NextResponse.redirect(new URL(AUTH_URLS.LOGIN, request.url));
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

        // 1. Bot Protection (Early return)
        if (userAgent && BLOCKED_BOTS.some(bot => userAgent.includes(bot.toLowerCase()))) {
            const botResponse = new NextResponse(null, { status: 403 });
            Object.entries(SECURITY_HEADERS).forEach(([k, v]) => botResponse.headers.set(k, v));
            return botResponse;
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
        
        if (process.env.NODE_ENV === "development") {
            console.log(`[Middleware Debug] Path: ${path}, Token Present: ${!!token}, Staff Token Present: ${!!staffToken}`);
        }

        const response: NextResponse = NextResponse.next();

        if (path.startsWith("/dashboard")) {
            if (path.startsWith("/dashboard/gifts") && staffToken) {
                try {
                    await verifyJWT(staffToken, fingerprint, { 
                        audience: JWT_CONFIG.AUDIENCE.STAFF, 
                        issuer: JWT_CONFIG.ISSUER,
                        checkFingerprint: true 
                    });
                    return response;
                } catch (e: any) {}
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
    matcher: ["/dashboard/:path*", "/login", "/register", "/staff/dashboard/:path*", "/admin/:path*", "/api/:path*"],
};
