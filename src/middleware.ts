import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

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
const RATE_LIMIT_REQUESTS = 60; // Max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window in ms

/**
 * Generates a simple non-cryptographic hash for fingerprinting
 */
function generateFingerprint(userAgent: string, ip: string) {
    return Buffer.from(`${userAgent}|${ip}`).toString('base64').substring(0, 32);
}

export async function middleware(request: NextRequest) {
    const userAgent = request.headers.get("user-agent") || "unknown";
    const ip = request.ip || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const currentFingerprint = generateFingerprint(userAgent, ip);

    // 0. Rate Limiting for API routes
    if (request.nextUrl.pathname.startsWith("/api")) {
        const now = Date.now();
        const limitInfo = rateLimitMap.get(ip);
        // ... keep existing rate limiting logic ...
        if (!limitInfo || now > limitInfo.resetTime) {
            rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        } else {
            limitInfo.count++;
            if (limitInfo.count > RATE_LIMIT_REQUESTS) {
                console.warn(`[Security] Rate Limit exceeded for IP: ${ip}`);
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

    // 0. MAINTENANCE MODE CHECK (Global Kill Switch)
    // We fetch from an internal API because Prisma doesn't run in Edge Middleware
    try {
        const path = request.nextUrl.pathname;
        if (!path.startsWith('/api/system/maintenance') && !path.startsWith('/maintenance') && !path.startsWith('/login') && !path.startsWith('/_next')) {
            const maintenanceRes = await fetch(new URL("/api/system/maintenance", request.url), {
                next: { revalidate: 0 }
            });
            const { maintenanceMode } = await maintenanceRes.json();

            if (maintenanceMode) {
                // Allow ONLY superadmins/owners to enter the platform during maintenance
                const isSuperAdmin = token && (await jwtVerify(token, secret).then(({ payload }) => payload.role === 'SUPERADMIN' || payload.role === 'OWNER').catch(() => false));

                if (!isSuperAdmin) {
                    return NextResponse.redirect(new URL("/maintenance", request.url));
                }
            }
        }
    } catch (e) {
        // Fallback: Continue if check fails
        console.error("Maintenance check failed:", e);
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
                if (role === "SUPERADMIN") {
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

    // 2. Apply Security Headers
    const securityHeaders = {
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://res.cloudinary.com https://upload-widget.cloudinary.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com https://*.googleusercontent.com; connect-src 'self' https://res.cloudinary.com; frame-src 'self' https://upload-widget.cloudinary.com;",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/staff/dashboard/:path*", "/api/:path*"],
};
