import { SignJWT, jwtVerify } from "jose";

const CSRF_SECRET = process.env.CSRF_SECRET || "monea-default-csrf-secret-change-me";
const ENCODED_SECRET = new TextEncoder().encode(CSRF_SECRET);

if (process.env.NODE_ENV === "production" && CSRF_SECRET === "monea-default-csrf-secret-change-me") {
    console.error("[CRITICAL] CSRF_SECRET is missing or using default in production!");
}

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
