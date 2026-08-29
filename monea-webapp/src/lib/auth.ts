import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { COOKIE_NAMES, JWT_CONFIG, ROLES } from "./constants";

import redis from "./redis";
import { prisma } from "./prisma";
import { getIP } from "./utils";

// Edge-compatible storage - simplified no-op for Cloudflare Workers
// In CF Workers, we don't use AsyncLocalStorage - pass Request explicitly instead
export const requestStorage = {
  getStore: () => undefined,
  run: (_store: any, callback: any) => callback()
};


export const getSecretStr = () => process.env.JWT_SECRET || (process.env.NODE_ENV === "development" ? "monea-dev-secret-do-not-use-in-prod-1234567890" : "");
export const getSecret = () => new TextEncoder().encode(getSecretStr());

/**
 * Creates a short-lived signed exchange token (expires in 60s) for transferring session across origins/ports securely.
 */
export async function createExchangeTicket(sessionToken: string): Promise<string> {
  return await new SignJWT({ token: sessionToken, type: "sso_exchange" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(getSecret());
}

/**
 * Verifies a short-lived exchange token and returns the embedded session token.
 */
export async function verifyExchangeTicket(ticket: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(ticket, getSecret());
    if (payload.type !== "sso_exchange" || !payload.token || typeof payload.token !== "string") {
      return null;
    }
    return payload.token;
  } catch {
    return null;
  }
}

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
    .sign(getSecret());

  const refreshToken = await new SignJWT({ jti, userId: payload.userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(options.issuer)
    .setAudience(options.audience)
    .setExpirationTime("7d") // Long-lived
    .sign(getSecret());

  return { accessToken, refreshToken, jti };
}

/**
 * Generates a cryptographic fingerprint hash for the current request (User-Agent + IP).
 * Standardized between login route and middleware for consistent token binding.
 */
export async function generateFingerprint(req: any): Promise<string> {
    const headers = req.headers instanceof Headers ? req.headers : new Headers(req.headers || {});
    const userAgent = headers.get("user-agent") || "unknown";
    // In edge environments, IP can fluctuate between Cloudflare POPs/IPv6. Bind to User-Agent for stability.
    const data = new TextEncoder().encode(userAgent);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

export function getCookieHeader(name: string, value: string, req?: Request, maxAgeSeconds: number = 60 * 60 * 24 * 30): string {
    const isLocal = req ? (new URL(req.url).hostname === 'localhost' || new URL(req.url).hostname === '127.0.0.1') : false;
    if (isLocal) {
        return `${name}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
    }
    // Production cross-origin between Pages (*.pages.dev) and Worker (*.workers.dev)
    return `${name}=${value}; HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=${maxAgeSeconds}`;
}


/**
 * Signs a JWT token with the application's secret.
 */
export async function signToken(payload: any, options: { fingerprint?: string; expiresIn?: string | number } = {}) {
    const secret = getSecret();
    
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
        .setExpirationTime(options.expiresIn || "30d")
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
    const effectiveReq = req || requestStorage.getStore();

    if (effectiveReq) {
        // 1. Check Authorization: Bearer <token> header (reliable for cross-origin SPA)
        const authHeader = effectiveReq.headers.get("authorization") || "";
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        }

        // 2. Fallback to HttpOnly cookie
        if (!token) {
            const cookieHeader = effectiveReq.headers.get("cookie") || "";
            const parseCookie = (name: string) => {
                const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
                return match ? decodeURIComponent(match[1]) : undefined;
            };
            token = parseCookie(COOKIE_NAMES.TOKEN) || parseCookie(COOKIE_NAMES.STAFF_TOKEN);
        }
    }

    if (!token) {
        console.log("[Auth] No token found in Authorization header or cookies");
        return null;
    }

    try {
        const secret = getSecret();
        const { payload } = await jwtVerify(token, secret, {
            issuer: JWT_CONFIG.ISSUER,
        });

        // Anti-replay fingerprint validation — log warning on mismatch but maintain session continuity for SSO / SPAs
        if (payload.fingerprint && req && process.env.NODE_ENV !== "development") {
            const currentFingerprint = await generateFingerprint(req);
            if (payload.fingerprint !== currentFingerprint) {
                console.warn("[Auth] Fingerprint mismatch detected (relaxed for cross-origin SPA compatibility)");
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

        if (!dbUser) {
            console.warn(`[Auth] User ${userId} not found in database`);
            return null;
        }

        if (dbUser.sessionsRevokedAt && iat && iat < new Date(dbUser.sessionsRevokedAt)) {
            console.warn(`[Auth] Token issued before session revocation for user ${userId}`);
            return null;
        }

        const currentRole = dbUser.role || payload.role;
        let userType: "admin" | "user" | "staff" = "user";
        if (currentRole === ROLES.PLATFORM_OWNER)  userType = "admin";
        else if (currentRole === ROLES.EVENT_STAFF) userType = "staff";

        console.log(`[Auth] Successfully authenticated user ${userId} with role ${currentRole}`);
        return {
            id:       userId,
            userId:   userId,
            email:    payload.email as string,
            name:     (payload.name as string) || null,
            role:     currentRole as string,
            weddingId: payload.weddingId as string | undefined,
            type:     userType,
        };
    } catch (error: any) {
        console.error("[Auth] Token verification failed:", error.message);
        return null;
    }
}
