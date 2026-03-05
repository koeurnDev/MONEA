import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ROLES } from "./lib/constants";
import { sendTelegramAlert } from "./lib/telegram";

const SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Security Guard: Alert if defaults are used in production
if (process.env.NODE_ENV === "production") {
    if (SECRET === "super-secret-key-change-in-prod") {
        console.error(" [CRITICAL] JWT_SECRET is using the default value in production!");
    }
    if (!ENCRYPTION_KEY) {
        console.error(" [CRITICAL] ENCRYPTION_KEY is missing in production!");
    }
}

// Simple In-Memory Rate Limiter Map
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_REQUESTS = 60; // Max requests per minute
const STRICT_RATE_LIMIT = 5; // Stricter limit for sensitive write ops
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window in ms
const BLOCKED_BOTS = ["python-requests", "curl", "wget", "headlesschrome", "puppeteer", "playwright", "phantomjs", "scrapy", "urllib"];

const SENSITIVE_WRITE_PATHS = [
    "/api/guestbook",
    "/api/auth/login",
    "/api/auth/register",
    "/api/support/ticket",
    "/api/staff/login",
    "/api/guests/view"
];

/**
 * Generates a simple non-cryptographic hash for fingerprinting
 */
async function generateFingerprint(userAgent: string, ip: string) {
    const data = new TextEncoder().encode(`${userAgent}|${ip}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

export async function middleware(request: NextRequest) {
    const userAgent = request.headers.get("user-agent") || "unknown";
    const ip = request.ip || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const currentFingerprint = await generateFingerprint(userAgent, ip);

    // ANTI-SCRAPING: Block common bots and scrapers
    const userAgentLower = userAgent.toLowerCase();
    if (BLOCKED_BOTS.some(bot => userAgentLower.includes(bot))) {
        console.warn(`[Security] Blocked bot User-Agent: ${userAgent} from IP: ${ip}`);
        sendTelegramAlert(`🛑 *Scraper Blocked*\nIP: \`${ip}\`\nUser-Agent: \`${userAgent}\`\nPath: \`${request.nextUrl.pathname}\``);
        return NextResponse.json({ error: "Automated access is not allowed." }, { status: 403 });
    }

    // Protect Rate Limiter Map from unbounded growth
    if (rateLimitMap.size > 5000) {
        rateLimitMap.clear();
    }

    // 0. Rate Limiting for API routes
    if (request.nextUrl.pathname.startsWith("/api")) {
        const now = Date.now();
        const limitKey = `${ip}:${request.nextUrl.pathname}`; // Path-specific for sensitive routes
        const isSensitive = request.method !== "GET" && SENSITIVE_WRITE_PATHS.some(path => request.nextUrl.pathname.startsWith(path));

        const limitInfo = rateLimitMap.get(isSensitive ? limitKey : ip);
        const maxRequests = isSensitive ? STRICT_RATE_LIMIT : RATE_LIMIT_REQUESTS;

        if (!limitInfo || now > limitInfo.resetTime) {
            rateLimitMap.set(isSensitive ? limitKey : ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        } else {
            limitInfo.count++;
            if (limitInfo.count > maxRequests) {
                console.warn(`[Security] Rate Limit exceeded for IP: ${ip} on path: ${request.nextUrl.pathname}`);
                return NextResponse.json(
                    { error: "Too many requests. Please try again later.", retryAfter: Math.ceil((limitInfo.resetTime - now) / 1000) },
                    { status: 429 }
                );
            }
        }
    }

    const token = request.cookies.get("token")?.value;
    const staffToken = request.cookies.get("staff_token")?.value;
    const secret = new TextEncoder().encode(SECRET);

    // 0. MAINTENANCE MODE CHECK (Cookie-based, no blocking fetch)
    const maintenanceCookie = request.cookies.get("maintenance_mode")?.value;
    if (maintenanceCookie === "true") {
        const path = request.nextUrl.pathname;
        if (!path.startsWith('/maintenance') && !path.startsWith('/login') && !path.startsWith('/_next') && !path.startsWith('/api')) {
            // Allow only Platform Owners to bypass
            const isSuperAdmin = token && (await jwtVerify(token, secret)
                .then(({ payload }) => payload.role === ROLES.PLATFORM_OWNER)
                .catch(() => false));
            if (!isSuperAdmin) {
                return NextResponse.redirect(new URL("/maintenance", request.url));
            }
        }
    }

    // 1. Basic CSRF Protection for API routes (non-GET)
    if (request.nextUrl.pathname.startsWith("/api") && request.method !== "GET") {
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");

        // Basic check: Origin must match the Host if present
        if (origin && host) {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
                console.warn(`[Security] CSRF Blocked: Origin ${originHost} does not match Host ${host}`);
                return NextResponse.json({ error: "Invalid Origin" }, { status: 403 });
            }
        }
    }

    let response: NextResponse = NextResponse.next();

    // Protected Routes (Dashboard)
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        // EXCEPTION: Allow Staff to access /dashboard/gifts
        if (request.nextUrl.pathname.startsWith("/dashboard/gifts")) {
            if (staffToken) {
                try {
                    const { payload } = await jwtVerify(staffToken, secret);
                    // FINGERPRINT VALIDATION
                    if (payload.fingerprint && payload.fingerprint !== currentFingerprint) {
                        console.warn(`[Security] Fingerprint Mismatch for Staff! IP: ${ip}`);
                        return NextResponse.redirect(new URL("/login", request.url));
                    }
                    // Continue to headers application
                } catch (e) {
                    // Invalid staff token, continue to normal admin check or fail
                }
            }
        }

        if (!token) {
            response = NextResponse.redirect(new URL("/login", request.url));
        } else {
            try {
                const { payload } = await jwtVerify(token, secret);
                // FINGERPRINT VALIDATION
                if (payload.fingerprint && payload.fingerprint !== currentFingerprint) {
                    console.warn(`[Security] Fingerprint Mismatch for Admin! IP: ${ip}`);
                    response = NextResponse.redirect(new URL("/login", request.url));
                    response.cookies.delete("token");
                    return response;
                }
            } catch (error) {
                response = NextResponse.redirect(new URL("/login", request.url));
                response.cookies.delete("token");
            }
        }
    }

    // Auth Routes (Login/Register)
    else if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
        if (token) {
            try {
                const { payload } = await jwtVerify(token, secret);
                const role = (payload.role as string)?.toUpperCase();
                if (role === ROLES.PLATFORM_OWNER) {
                    response = NextResponse.redirect(new URL("/admin", request.url));
                } else {
                    response = NextResponse.redirect(new URL("/dashboard", request.url));
                }
            } catch (error) {
                response.cookies.delete("token");
            }
        }
    }

    // Staff Routes
    else if (request.nextUrl.pathname.startsWith("/staff/dashboard")) {
        if (!staffToken) {
            response = NextResponse.redirect(new URL("/login", request.url));
        } else {
            try {
                const { payload } = await jwtVerify(staffToken, secret);
                // FINGERPRINT VALIDATION
                if (payload.fingerprint && payload.fingerprint !== currentFingerprint) {
                    console.warn(`[Security] Fingerprint Mismatch for Staff Dashboard! IP: ${ip}`);
                    response = NextResponse.redirect(new URL("/login", request.url));
                    response.cookies.delete("staff_token");
                    return response;
                }
            } catch (error) {
                response = NextResponse.redirect(new URL("/login", request.url));
                response.cookies.delete("staff_token");
            }
        }
    }

    // Admin Routes Protection
    else if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!token) {
            response = NextResponse.redirect(new URL("/login", request.url));
        } else {
            try {
                const { payload } = await jwtVerify(token, secret);
                const role = payload.role as string;

                // Platforms Owner level access only for /admin/governance and /admin/master
                if (request.nextUrl.pathname.startsWith("/admin/governance") || request.nextUrl.pathname.startsWith("/admin/master")) {
                    if (role !== ROLES.PLATFORM_OWNER) {
                        return NextResponse.redirect(new URL("/dashboard", request.url));
                    }
                }

                // FINGERPRINT VALIDATION
                if (payload.fingerprint && payload.fingerprint !== currentFingerprint) {
                    console.warn(`[Security] Fingerprint Mismatch for Admin! IP: ${ip}`);
                    response = NextResponse.redirect(new URL("/login", request.url));
                    response.cookies.delete("token");
                    return response;
                }
            } catch (error) {
                response = NextResponse.redirect(new URL("/login", request.url));
                response.cookies.delete("token");
            }
        }
    }

    // 2. Apply Security Headers
    const securityHeaders = {
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://res.cloudinary.com https://upload-widget.cloudinary.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com https://*.googleusercontent.com; connect-src 'self' https://res.cloudinary.com https://challenges.cloudflare.com; frame-src 'self' https://upload-widget.cloudinary.com https://challenges.cloudflare.com; object-src 'none'; base-uri 'self';",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
        "X-DNS-Prefetch-Control": "on",
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/staff/dashboard/:path*", "/admin/:path*", "/api/:path*"],
};
