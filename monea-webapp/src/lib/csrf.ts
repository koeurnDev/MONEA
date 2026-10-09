import { SignJWT, jwtVerify } from "jose";

/**
 * Resolves the CSRF signing secret.
 *
 * SECURITY (fail-closed): the previous literal fallback
 * "monea-default-csrf-secret-change-me" is published in this repository, so
 * anyone could mint valid tokens whenever CSRF_SECRET was unset. Refuse to
 * operate in production without a real secret.
 */
function resolveCsrfSecret(): string {
    const secret = process.env.CSRF_SECRET;

    if (!secret || secret === "monea-default-csrf-secret-change-me" || secret === "default-csrf-secret") {
        const isProduction =
            process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";
        if (isProduction) {
            throw new Error("[CRITICAL] CSRF_SECRET is not configured. Refusing to issue/validate CSRF tokens.");
        }
        return "dev-only-csrf-secret-not-for-production";
    }

    return secret;
}

const ENCODED_SECRET = new TextEncoder().encode(resolveCsrfSecret());

/**
 * Generates a CSRF token tied to a specific session/fingerprint.
 */
export async function generateCSRFToken(sessionId: string): Promise<string> {
    return await new SignJWT({ sid: sessionId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(ENCODED_SECRET);
}

/**
 * Validates a CSRF token signature only.
 */
export async function isValidCSRFToken(token: string): Promise<boolean> {
    try {
        await jwtVerify(token, ENCODED_SECRET);
        return true;
    } catch (e) {
        return false;
    }
}
