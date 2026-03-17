import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { COOKIE_NAMES, JWT_CONFIG, ROLES } from "./constants";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const JWT_SECRET_DEV_FALLBACK = "monea-dev-secret-do-not-use-in-prod-1234567890";
const SECRET_STR = process.env.JWT_SECRET || (process.env.NODE_ENV === "development" ? JWT_SECRET_DEV_FALLBACK : "");
const SECRET = new TextEncoder().encode(SECRET_STR);

if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    console.error("[CRITICAL] JWT_SECRET is missing or too weak in production!");
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
  const res = await redis.get(`revoked:${jti}`);
  return !!res;
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
export async function generateFingerprint(req: { headers: Headers; ip: string } | any): Promise<string> {
    const headers = req.headers instanceof Headers ? req.headers : new Headers(req.headers || {});
    const userAgent = headers.get("user-agent") || "unknown";
    let ip = req.ip || "unknown";

    // Normalize IPv6 localhost to IPv4 for consistency in local development
    if (process.env.NODE_ENV === "development") {
        if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";
    }

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
    if (process.env.NODE_ENV === "production") return true;
    
    // In development, allow HTTP on localhost
    const host = req.headers.get("host") || "";
    if (host.includes("localhost") || host.includes("127.0.0.1")) return false;

    const proto = req.headers.get("x-forwarded-proto");
    return proto === "https";
}

/**
 * Retrieves the current authenticated user from cookies (Server-side).
 */
export async function getServerUser() {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAMES.TOKEN)?.value;
    
    if (!token) {
        if (process.env.NODE_ENV === "development") console.log("[Auth Debug] getServerUser: No token found in cookies.");
        return null;
    }

    try {
        const secret = new TextEncoder().encode(SECRET_STR);
        const { payload } = await jwtVerify(token, secret, {
            issuer: JWT_CONFIG.ISSUER,
        });

        return {
            id: payload.userId as string,
            userId: payload.userId as string,
            email: payload.email as string,
            name: (payload.name as string) || null,
            role: payload.role as string,
            weddingId: payload.weddingId as string | undefined,
            type: payload.role === ROLES.PLATFORM_OWNER ? "admin" : "user"
        };
    } catch (error) {
        return null;
    }
}
