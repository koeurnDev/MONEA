import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { COOKIE_NAMES, JWT_CONFIG, ROLES } from "./constants";

import redis from "./redis";
import { prisma } from "./prisma";
import { getIP } from "./utils";


const JWT_SECRET_DEV_FALLBACK = "monea-dev-secret-do-not-use-in-prod-1234567890";
const SECRET_STR = process.env.JWT_SECRET || (process.env.NODE_ENV === "development" ? JWT_SECRET_DEV_FALLBACK : "");
const SECRET = new TextEncoder().encode(SECRET_STR);

if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET) {
    console.error("[CRITICAL] JWT_SECRET is missing in production environment!");
  } else if (process.env.JWT_SECRET.length < 32) {
    console.error(`[CRITICAL] JWT_SECRET is too weak (length: ${process.env.JWT_SECRET.length}). Must be at least 32 characters in production.`);
  }
}

/**
 * Checks if a token JTI is in the revocation list.
 */
export async function revokeToken(jti: string, exp: number) {
  const now = Math.floor(Date.now() / 1000);
  const ttl = exp - now;
  if (ttl > 0) {
    await redis.set(`revoked:${jti}`, "1", { ex: ttl });
  }
}

/**
 * Checks if a token JTI is in the revocation list.
 */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  try {
    const res = await redis.get(`revoked:${jti}`);
    return !!res;
  } catch (e) {
    console.error("[Auth] Redis revocation check failed (fail-safe to false):", e);
    return false;
  }
}

/**
 * Generates a pair of short-lived access token and long-lived refresh token.
 */
export async function generateTokenPair(payload: any, options: { 
  audience: string; 
  issuer: string; 
  fingerprint: string;
}) {
  const jti = crypto.randomUUID();
  
  const accessToken = await new SignJWT({ ...payload, fingerprint: options.fingerprint })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setIssuer(options.issuer)
    .setAudience(options.audience)
    .setExpirationTime("15m") // Short-lived
    .sign(SECRET);

  const refreshToken = await new SignJWT({ jti, userId: payload.userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(options.issuer)
    .setAudience(options.audience)
    .setExpirationTime("7d") // Long-lived
    .sign(SECRET);

  return { accessToken, refreshToken, jti };
}

/**
 * Generates a cryptographic fingerprint hash for the current request (User-Agent + IP).
 * Standardized between login route and middleware for consistent token binding.
 */
export async function generateFingerprint(req: any): Promise<string> {
    const headers = req.headers instanceof Headers ? req.headers : new Headers(req.headers || {});
    const userAgent = headers.get("user-agent") || "unknown";
    const ip = getIP(req);

    const data = new TextEncoder().encode(`${userAgent}|${ip}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

/**
 * Signs a JWT token with the application's secret.
 */
export async function signToken(payload: any, options: { fingerprint?: string; expiresIn?: string | number } = {}) {
    const secret = new TextEncoder().encode(SECRET_STR);
    
    // Standardize audience based on role
    let audience: string = JWT_CONFIG.AUDIENCE.USER;
    if (payload.role === ROLES.EVENT_STAFF) {
        audience = JWT_CONFIG.AUDIENCE.STAFF;
    } else if (payload.role === ROLES.EVENT_MANAGER || payload.role === ROLES.PLATFORM_OWNER) {
        audience = JWT_CONFIG.AUDIENCE.ADMIN;
    }

    const token = await new SignJWT({ ...payload, ...(options.fingerprint ? { fingerprint: options.fingerprint } : {}) })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer(JWT_CONFIG.ISSUER)
        .setAudience(audience)
        .setExpirationTime(options.expiresIn || "7d")
        .sign(secret);
    return token;
}

/**
 * Checks if the request should use secure cookies based on protocol and environment.
 */
export function isSecureCookie(req: Request | any): boolean {
    const headers = req instanceof Request ? req.headers : new Headers(req.headers);
    const host = headers.get("host") || "";
    
    // In development, allow HTTP on localhost
    if (host.includes("localhost") || host.includes("127.0.0.1")) return false;

    if (process.env.NODE_ENV === "production") return true;

    const proto = headers.get("x-forwarded-proto");
    return proto === "https";
}

import { AuthUser } from "@/types/auth";

/**
 * Retrieves the current authenticated user from cookies.
 *
 * CF Workers / Edge compatible — reads cookies from a standard Request object.
 * Falls back to Next.js `cookies()` only in Node.js runtime (Next.js SSR).
 *
 * @param req  Pass `c.req.raw` from a Hono handler (CF Workers / Edge).
 *             Omit or pass `undefined` when calling from a Next.js Server Component.
 */
export async function getServerUser(req?: Request): Promise<AuthUser | null> {
    let token: string | undefined;

    if (req) {
        // ── CF Workers / Hono path — read cookie from Request header ──────
        const cookieHeader = req.headers.get("cookie") || "";
        const parseCookie = (name: string) => {
            const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
            return match ? decodeURIComponent(match[1]) : undefined;
        };
        token = parseCookie(COOKIE_NAMES.TOKEN) || parseCookie(COOKIE_NAMES.STAFF_TOKEN);
    } else {
        // ── Next.js Node.js runtime path — dynamic import to avoid CF Workers crash ──
        try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            token = cookieStore.get(COOKIE_NAMES.TOKEN)?.value
                 || cookieStore.get(COOKIE_NAMES.STAFF_TOKEN)?.value;
        } catch {
            return null;
        }
    }

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(SECRET_STR);
        const { payload } = await jwtVerify(token, secret, {
            issuer: JWT_CONFIG.ISSUER,
        });

        // Anti-replay fingerprint validation — skip in CF Workers (no reliable IP header chain)
        if (payload.fingerprint && process.env.NODE_ENV !== "development" && !req) {
            try {
                const { headers } = await import("next/headers");
                const fingerprint = await generateFingerprint({ headers: headers() });
                if (payload.fingerprint !== fingerprint) {
                    console.warn(`[Auth] Fingerprint mismatch detected in getServerUser.`);
                    return null;
                }
            } catch {
                // CF Workers — skip fingerprint check, rely on JWT signature alone
            }
        }

        const userId = (payload.userId || payload.id || payload.staffId) as string;
        const iat    = payload.iat ? new Date(payload.iat * 1000) : null;

        let dbUser: any = null;
        try {
            if (payload.staffId) {
                const results: any[] = await prisma.$queryRaw`SELECT "sessionsRevokedAt", role FROM "Staff" WHERE id = ${userId} LIMIT 1`;
                dbUser = results[0];
            } else {
                const results: any[] = await prisma.$queryRaw`SELECT "sessionsRevokedAt", role FROM "User" WHERE id = ${userId} LIMIT 1`;
                dbUser = results[0];
            }
        } catch (e: any) {
            console.error("[Auth] Database check failed (Raw SQL):", e.message);
            return null;
        }

        if (!dbUser) return null;

        if (dbUser.sessionsRevokedAt && iat && iat < new Date(dbUser.sessionsRevokedAt)) {
            return null;
        }

        const currentRole = dbUser.role || payload.role;
        let userType: "admin" | "user" | "staff" = "user";
        if (currentRole === ROLES.PLATFORM_OWNER)  userType = "admin";
        else if (currentRole === ROLES.EVENT_STAFF) userType = "staff";

        return {
            id:       userId,
            userId:   userId,
            email:    payload.email as string,
            name:     (payload.name as string) || null,
            role:     currentRole as string,
            weddingId: payload.weddingId as string | undefined,
            type:     userType,
        };
    } catch {
        return null;
    }
}
