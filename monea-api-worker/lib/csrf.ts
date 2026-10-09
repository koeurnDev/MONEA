import { createHash, randomBytes } from "crypto";
import { getCookie } from "hono/cookie";
import type { Context, MiddlewareHandler } from "hono";

/**
 * Resolves the CSRF signing secret.
 *
 * SECURITY (fail-closed): never fall back to a published literal. The previous
 * "default-csrf-secret" fallback is in this repository's public history, so
 * anyone could mint valid CSRF tokens whenever CSRF_SECRET was unset.
 */
function resolveCsrfSecret(explicit?: string, env?: any): string {
  const secret = explicit || env?.CSRF_SECRET || process.env.CSRF_SECRET;

  if (!secret || secret === "default-csrf-secret" || secret === "monea-default-csrf-secret-change-me") {
    const isProduction =
      process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";
    if (isProduction) {
      throw new Error("[CRITICAL] CSRF_SECRET is not configured. Refusing to issue/validate CSRF tokens.");
    }
    return "dev-only-csrf-secret-not-for-production";
  }

  return secret;
}

/**
 * Generate CSRF Token for session protection
 */
export function generateCSRFToken(sessionId: string, secret?: string): string {
  const tokenSecret = resolveCsrfSecret(secret);
  const timestamp = Date.now().toString();
  const randomData = randomBytes(16).toString('hex');
  
  const payload = `${sessionId}:${timestamp}:${randomData}`;
  const hash = createHash('sha256').update(payload + tokenSecret).digest('hex');
  
  return Buffer.from(`${payload}:${hash}`).toString('base64');
}

/**
 * Validate CSRF Token
 */
export async function isValidCSRFToken(token: string | null, sessionId: string, env?: any): Promise<boolean> {
  if (!token) return false;
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 4) return false;
    
    const [tokenSessionId, timestamp, randomData, hash] = parts;
    
    // Verify session ID matches
    if (tokenSessionId !== sessionId) return false;
    
    // Check token age (max 24 hours)
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    if (now - tokenTime > 24 * 60 * 60 * 1000) return false;
    
    // Verify hash
    const tokenSecret = resolveCsrfSecret(undefined, env);
    const payload = `${tokenSessionId}:${timestamp}:${randomData}`;
    const expectedHash = createHash('sha256').update(payload + tokenSecret).digest('hex');
    
    return hash === expectedHash;
  } catch (error) {
    console.error("[CSRF] Token validation error:", error);
    return false;
  }
}

// ─── Enforcement middleware ───────────────────────────────────────────────────
// CSRF tokens were previously *issued* (GET /api/auth/csrf) and *sent* by the SPA
// but never validated server-side: `isValidCSRFToken` had zero call sites. Cookies
// are issued with `SameSite=None` in production (lib/auth.ts#getCookieHeader), so a
// malicious page could drive state-changing requests with the victim's session.

/** HTTP methods that require CSRF validation. */
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Cookies that carry an ambient (browser-attached) session. */
const AUTH_COOKIE_NAMES = ["token", "staff_token"] as const;

/**
 * Pre-authentication endpoints: no session-bound token can exist yet and blocking
 * them would break the very first sign-in. They stay protected by Turnstile and the
 * distributed rate limiters.
 */
const PRE_AUTH_EXEMPT_PREFIXES = [
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/csrf",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/2fa",
  "/api/auth/sso",
  "/api/cron",
  "/api/sentry-tunnel",
];

export type CsrfEnforcementMode = "enforce" | "monitor";

/**
 * `enforce` (default) rejects state-changing cookie-authenticated requests that do
 * not present a valid token. `monitor` only logs violations — available as a staged
 * rollout / emergency valve via `CSRF_ENFORCEMENT=monitor`.
 */
export function resolveCsrfEnforcementMode(): CsrfEnforcementMode {
  return (process.env.CSRF_ENFORCEMENT || "").toLowerCase() === "monitor" ? "monitor" : "enforce";
}

function resolveClientIp(c: Context): string {
  return (
    c.req.header("cf-connecting-ip") ||
    (c.req.header("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

/**
 * Hono middleware enforcing CSRF on state-changing, cookie-authenticated requests.
 */
export function csrfProtection(): MiddlewareHandler {
  return async (c, next) => {
    if (!STATE_CHANGING_METHODS.has(c.req.method.toUpperCase())) {
      return next();
    }

    const path = new URL(c.req.url).pathname;
    if (PRE_AUTH_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next();
    }

    // CSRF only applies to ambient credentials. A Bearer/Authorization header is
    // never attached automatically by the browser, so it cannot be replayed from
    // another origin and does not need CSRF protection.
    const authCookie = AUTH_COOKIE_NAMES.map((name) => getCookie(c, name)).find(Boolean);
    if (!authCookie) {
      return next();
    }

    const headerToken = c.req.header("x-csrf-token") || null;

    let sessionId: string | null = null;
    try {
      const { jwtVerify } = await import("jose");
      const { getSecret } = await import("./auth");
      const { payload } = await jwtVerify(authCookie, getSecret());
      sessionId = (payload.userId || payload.id || payload.staffId || null) as string | null;
    } catch {
      // Invalid/expired session token: let the authentication layer answer 401.
      return next();
    }

    if (!sessionId) {
      return next();
    }

    // Accept tokens bound to the authenticated session, and tokens minted for the
    // same client before authentication (`anon_<ip>`), which the SPA may have cached
    // in sessionStorage before signing in. Either way the value must have been
    // signed with CSRF_SECRET, so an attacker cannot forge one.
    const valid =
      (await isValidCSRFToken(headerToken, sessionId, c.env as any)) ||
      (await isValidCSRFToken(headerToken, `anon_${resolveClientIp(c)}`, c.env as any));

    if (valid) {
      return next();
    }

    if (resolveCsrfEnforcementMode() === "monitor") {
      console.warn(`[CSRF][MONITOR] ${c.req.method} ${path} has no valid X-CSRF-Token (not blocked)`);
      return next();
    }

    console.warn(`[CSRF] Blocked ${c.req.method} ${path}: missing or invalid X-CSRF-Token`);
    return c.json({ error: "Invalid or missing CSRF token", code: "CSRF_TOKEN_INVALID" }, 403);
  };
}
