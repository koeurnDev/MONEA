import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { COOKIE_NAMES, JWT_CONFIG, ROLES } from "./constants";

import { getPrisma } from "./prisma";
import { getIP } from "./utils";
import { isTokenRevoked, revokeToken } from "./token-revocation";
export {
  isTokenRevoked,
  revokeToken,
  TokenRevocationStoreUnavailableError,
} from "./token-revocation";
import {
  createExchangeTicket as createSingleUseExchangeTicket,
  verifyExchangeTicket as verifySingleUseExchangeTicket,
} from "./exchange-ticket";

// Edge-compatible storage - simplified no-op for Cloudflare Workers
// In CF Workers, we don't use AsyncLocalStorage - pass Request explicitly instead
export const requestStorage = {
  getStore: () => undefined,
  run: (_store: any, callback: any) => callback()
};


/**
 * Returns the JWT signing secret.
 *
 * SECURITY (fail-closed): outside development a missing JWT_SECRET must be a hard
 * error. Previously this returned an empty string, which made `jose` sign/verify
 * with an empty key — a total authentication bypass for anyone who noticed.
 * The development-only fallback keeps local work frictionless and is never used
 * when NODE_ENV is "production" (Cloudflare deploys set ENVIRONMENT=production).
 */
export const getSecretStr = () => {
  const configured = process.env.JWT_SECRET;
  if (configured) return configured;

  const isProduction =
    process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";

  if (isProduction) {
    throw new Error("[CRITICAL] JWT_SECRET is not configured. Refusing to sign or verify tokens.");
  }

  return "monea-dev-secret-do-not-use-in-prod-1234567890";
};
export const getSecret = () => new TextEncoder().encode(getSecretStr());

export async function createExchangeTicket(sessionToken: string): Promise<string> {
  return createSingleUseExchangeTicket(sessionToken, getSecret());
}

export async function verifyExchangeTicket(ticket: string): Promise<string | null> {
  return verifySingleUseExchangeTicket(ticket, getSecret());
}

export async function getOwnerMfaSetupUser(req: Request): Promise<AuthUser | null> {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAMES.OWNER_MFA_SETUP}=([^;]*)`));
    if (!match) return null;

    try {
        const token = decodeURIComponent(match[1]);
        const { payload } = await jwtVerify(token, getSecret(), {
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE.ADMIN,
        });
        if (payload.purpose !== "owner_mfa_setup" ||
            typeof payload.userId !== "string" ||
            typeof payload.email !== "string" ||
            payload.role !== ROLES.PLATFORM_OWNER) {
            return null;
        }

        const user = await getPrisma().user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true, deletedAt: true },
        });
        if (!user ||
            user.role !== ROLES.PLATFORM_OWNER ||
            user.twoFactorEnabled ||
            user.deletedAt) {
            return null;
        }

        return {
            id: user.id,
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            type: "admin",
        };
    } catch (error) {
        console.warn("[Auth] Owner MFA setup token could not be validated:", error);
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
    
    // Production cross-origin cookies: 
    // - SameSite=None + Secure required for cross-origin
    // - NO Partitioned attribute (can cause issues with credential inclusion)
    // - NO Domain attribute (browser will use current domain = api.moneoez.com)
    return `${name}=${value}; HttpOnly; Secure; Path=/; SameSite=None; Max-Age=${maxAgeSeconds}`;
}

export function getSessionTokenFromRequest(req?: Request): string | undefined {
    const effectiveReq = req || requestStorage.getStore();
    if (!effectiveReq) return undefined;

    const authorization = effectiveReq.headers.get("authorization") || "";
    if (authorization.startsWith("Bearer ")) {
        const bearerToken = authorization.substring(7).trim();
        if (bearerToken) return bearerToken;
    }

    const cookieHeader = effectiveReq.headers.get("cookie") || "";
    const parseCookie = (name: string) => {
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
        if (!match) return undefined;
        try {
            return decodeURIComponent(match[1]);
        } catch {
            return undefined;
        }
    };
    return parseCookie(COOKIE_NAMES.TOKEN) || parseCookie(COOKIE_NAMES.STAFF_TOKEN);
}

export async function revokePresentedSession(req: Request): Promise<void> {
    const token = getSessionTokenFromRequest(req);
    if (!token) return;

    let payload: JWTPayload;
    try {
        ({ payload } = await jwtVerify(token, getSecret(), { issuer: JWT_CONFIG.ISSUER }));
    } catch {
        return;
    }

    if (payload.type !== undefined || payload.purpose !== undefined) return;

    const isStaffToken = typeof payload.staffId === "string" && payload.staffId.length > 0;
    const role = payload.role;
    const expectedAudience = isStaffToken
        ? JWT_CONFIG.AUDIENCE.STAFF
        : role === ROLES.PLATFORM_OWNER || role === ROLES.EVENT_MANAGER
            ? JWT_CONFIG.AUDIENCE.ADMIN
            : JWT_CONFIG.AUDIENCE.USER;
    const audiences = Array.isArray(payload.aud)
        ? payload.aud
        : typeof payload.aud === "string"
            ? [payload.aud]
            : [];
    if (!audiences.includes(expectedAudience)) return;

    if (typeof payload.jti === "string" && payload.jti && typeof payload.exp === "number") {
        await revokeToken(payload.jti, payload.exp);
        return;
    }

    const userId = isStaffToken ? payload.staffId : payload.userId ?? payload.id;
    if (typeof userId !== "string" || !userId) return;

    const prisma = getPrisma();
    const sessionsRevokedAt = new Date();
    if (isStaffToken) {
        await prisma.staff.updateMany({
            where: { id: userId },
            data: { sessionsRevokedAt },
        });
    } else {
        await prisma.user.updateMany({
            where: { id: userId },
            data: { sessionsRevokedAt },
        });
    }
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
        .setJti(crypto.randomUUID())
        .setIssuedAt()
        .setIssuer(JWT_CONFIG.ISSUER)
        .setAudience(audience)
        .setExpirationTime(options.expiresIn || "30d")
        .sign(secret);
    return token;
}

export async function createOwnerMfaSetupCookies(
    req: Request,
    user: { id: string; email: string; role: string },
): Promise<string[]> {
    if (user.role !== ROLES.PLATFORM_OWNER) {
        throw new Error("Owner MFA setup tokens can only be issued to the Platform Owner.");
    }
    const setupToken = await signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        purpose: "owner_mfa_setup",
    }, { expiresIn: "10m" });
    return [
        getCookieHeader(COOKIE_NAMES.TOKEN, "", req, 0),
        getCookieHeader(COOKIE_NAMES.OWNER_MFA_SETUP, setupToken, req, 10 * 60),
    ];
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
    console.log('[Auth] getServerUser called');
    
    let token: string | undefined;
    const effectiveReq = req || requestStorage.getStore();

    if (effectiveReq) {
        // 1. Check Authorization: Bearer <token> header (reliable for cross-origin SPA)
        const authHeader = effectiveReq.headers.get("authorization") || "";
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
            console.log('[Auth] Found Bearer token in Authorization header');
        }

        // 2. Fallback to HttpOnly cookie
        if (!token) {
            const cookieHeader = effectiveReq.headers.get("cookie") || "";
            const parseCookie = (name: string) => {
                const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
                return match ? decodeURIComponent(match[1]) : undefined;
            };
            token = parseCookie(COOKIE_NAMES.TOKEN) || parseCookie(COOKIE_NAMES.STAFF_TOKEN);
            if (token) {
                console.log('[Auth] Found token in cookies');
            }
        }
    }

    if (!token) {
        console.log("[Auth] No token found in Authorization header or cookies");
        return null;
    }

    try {
        console.log('[Auth] Verifying JWT token...');
        const secret = getSecret();
        const { payload } = await jwtVerify(token, secret, {
            issuer: JWT_CONFIG.ISSUER,
        });

        if (payload.type !== undefined || payload.purpose !== undefined) {
            console.warn("[Auth] Rejecting a non-session token in an authenticated session.");
            return null;
        }

        if (payload.jti !== undefined) {
            if (typeof payload.jti !== "string" || payload.jti.length === 0) {
                console.warn("[Auth] Rejecting a session with an invalid token ID.");
                return null;
            }
            if (await isTokenRevoked(payload.jti)) {
                console.warn("[Auth] Rejecting a revoked session token.");
                return null;
            }
        }

        console.log(`[Auth] JWT verified successfully for user: ${payload.userId || payload.id || payload.staffId}`);

        // Anti-replay fingerprint validation — relaxed for cross-origin SSO flows
        // Skip fingerprint check entirely to allow Google OAuth redirects
        if (payload.fingerprint && req && process.env.NODE_ENV !== "development") {
            const currentFingerprint = await generateFingerprint(req);
            if (payload.fingerprint !== currentFingerprint) {
                console.warn("[Auth] Fingerprint mismatch detected");
                // Log but don't block - SSO redirects cause legitimate mismatches
                console.log("[Auth] Fingerprint check relaxed for SSO compatibility");
            }
        }

        const staffId = payload.staffId;
        const isStaffToken = typeof staffId === "string" && staffId.length > 0;
        if (
            (staffId !== undefined && !isStaffToken) ||
            (isStaffToken &&
                (typeof payload.weddingId !== "string" ||
                    payload.weddingId.length === 0 ||
                    payload.role !== ROLES.EVENT_STAFF ||
                    payload.userId !== undefined ||
                    payload.id !== undefined))
        ) {
            console.warn("[Auth] Rejecting malformed staff session claims.");
            return null;
        }

        const userIdClaim = isStaffToken ? staffId : payload.userId ?? payload.id;
        if (typeof userIdClaim !== "string" || userIdClaim.length === 0) {
            console.warn("[Auth] Rejecting session without a valid user identifier.");
            return null;
        }
        const userId = userIdClaim;
        const iat    = payload.iat ? new Date(payload.iat * 1000) : null;

        let dbUser: any = null;
        try {
            console.log(`[Auth] Checking database for user: ${userId}`);
            
            // Create fresh Prisma client to avoid I/O context issues
            const prisma = getPrisma();
            
            if (!prisma) {
                console.error('[Auth] Prisma client not available');
                return null;
            }

            if (payload.staffId) {
                console.log('[Auth] Querying Staff table...');
                const results: any[] = await prisma.$queryRaw`SELECT "sessionsRevokedAt", role, "weddingId" FROM "Staff" WHERE id = ${userId} LIMIT 1`;
                dbUser = results[0];
                console.log(`[Auth] Staff query result: ${dbUser ? 'found' : 'not found'}`);
            } else {
                console.log('[Auth] Querying User table...');
                const results: any[] = await prisma.$queryRaw`SELECT "sessionsRevokedAt", role, "twoFactorEnabled", "deletedAt" FROM "User" WHERE id = ${userId} LIMIT 1`;
                dbUser = results[0];
                console.log(`[Auth] User query result: ${dbUser ? 'found' : 'not found'}`);
            }
        } catch (e: any) {
            console.error("[Auth] Database check failed (Raw SQL):", e.message);
            console.error("[Auth] Database error details:", e);
            return null;
        }

        if (!dbUser) {
            console.warn(`[Auth] User ${userId} not found in database`);
            return null;
        }

        if (dbUser.deletedAt) {
            console.warn(`[Auth] Blocking session for deleted user ${userId}`);
            return null;
        }

        if (isStaffToken && dbUser.weddingId !== payload.weddingId) {
            console.warn(`[Auth] Blocking staff session with stale wedding assignment for ${userId}`);
            return null;
        }

        if (dbUser.sessionsRevokedAt && iat && iat < new Date(dbUser.sessionsRevokedAt)) {
            console.warn(`[Auth] Token issued before session revocation for user ${userId}`);
            return null;
        }

        const currentRole = dbUser.role || payload.role;
        const expectedAudience = isStaffToken
            ? JWT_CONFIG.AUDIENCE.STAFF
            : currentRole === ROLES.PLATFORM_OWNER || currentRole === ROLES.EVENT_MANAGER
                ? JWT_CONFIG.AUDIENCE.ADMIN
                : JWT_CONFIG.AUDIENCE.USER;
        const tokenAudiences = Array.isArray(payload.aud)
            ? payload.aud
            : typeof payload.aud === "string"
                ? [payload.aud]
                : [];
        if (!tokenAudiences.includes(expectedAudience)) {
            console.warn(`[Auth] Rejecting token with an audience that does not match user role ${currentRole}`);
            return null;
        }

        if (currentRole === ROLES.PLATFORM_OWNER && !dbUser.twoFactorEnabled) {
            console.warn(`[Auth] Blocking Platform Owner ${userId} session until 2FA enrollment is complete.`);
            return null;
        }

        let userType: "admin" | "user" | "staff" = "user";
        if (isStaffToken) userType = "staff";
        else if (currentRole === ROLES.PLATFORM_OWNER) userType = "admin";

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
        console.error("[Auth] Token verification error details:", error);
        return null;
    }
}
