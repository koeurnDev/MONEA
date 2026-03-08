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
    "/api/auth/signin",
    "/api/auth/signup",
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
    try {
        const userAgent = request.headers.get("user-agent") || "unknown";
        const ip = request.ip || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        const path = request.nextUrl.pathname;

        console.log(`[Middleware Debug] Request: ${request.method} ${path} from ${ip}`);

        // ANTI-SCRAPING: Block common bots
        const userAgentLower = userAgent.toLowerCase();
        if (BLOCKED_BOTS.some(bot => userAgentLower.includes(bot))) {
            console.warn(`[Security] Blocked bot: ${userAgent}`);
            return NextResponse.json({ error: "Automated access is not allowed." }, { status: 403 });
        }

        // 0. Rate Limiting for API routes
        if (path.startsWith("/api")) {
            const now = Date.now();
            const isSensitive = request.method !== "GET" && SENSITIVE_WRITE_PATHS.some(p => path.startsWith(p));
            const limitKey = isSensitive ? `${ip}:${path}` : ip;
            const maxRequests = isSensitive ? STRICT_RATE_LIMIT : RATE_LIMIT_REQUESTS;

            const limitInfo = rateLimitMap.get(limitKey);
            if (!limitInfo || now > limitInfo.resetTime) {
                rateLimitMap.set(limitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
            } else {
                limitInfo.count++;
                if (limitInfo.count > maxRequests) {
                    console.warn(`[Security] Rate Limit hit: ${ip} on ${path}`);
                    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
                }
            }
        }

        // 1. Token validation
        const token = request.cookies.get("token")?.value;
        const staffToken = request.cookies.get("staff_token")?.value;
        const secret = new TextEncoder().encode(SECRET);

        let response: NextResponse = NextResponse.next();

        // Protected Routes (Dashboard)
        if (path.startsWith("/dashboard")) {
            // Staff Exception
            if (path.startsWith("/dashboard/gifts") && staffToken) {
                try {
                    await jwtVerify(staffToken, secret);
                    return response;
                } catch (e) { }
            }

            if (!token) {
                console.log(`[Middleware Debug] Redirecting to /login from ${path} (No Token)`);
                return NextResponse.redirect(new URL("/login", request.url));
            }
            try {
                await jwtVerify(token, secret);
            } catch (error) {
                console.log(`[Middleware Debug] Redirecting to /login from ${path} (Invalid Token)`);
                const res = NextResponse.redirect(new URL("/login", request.url));
                res.cookies.delete("token");
                return res;
            }
        }

        // Admin Routes
        else if (path.startsWith("/admin")) {
            if (!token) return NextResponse.redirect(new URL("/login", request.url));
            try {
                const { payload } = await jwtVerify(token, secret);
                if (payload.role !== ROLES.PLATFORM_OWNER && (path.startsWith("/admin/governance") || path.startsWith("/admin/master"))) {
                    return NextResponse.redirect(new URL("/dashboard", request.url));
                }
            } catch (e) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }

        // Apply Security Headers
        const securityHeaders = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        };

        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error: any) {
        console.error(`[Middleware Debug] CRITICAL CRASH: ${error.message}`, error);
        // On middleware crash, allow request to proceed but log the error
        return NextResponse.next();
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/staff/dashboard/:path*", "/admin/:path*", "/api/:path*"],
};
