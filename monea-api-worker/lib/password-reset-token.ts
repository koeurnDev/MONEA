type TokenHashEnvironment = Record<string, unknown>;

function getResetTokenPepper(env?: TokenHashEnvironment): string {
    const bindingPepper = env?.SECURITY_PEPPER;
    const pepper = typeof bindingPepper === "string" ? bindingPepper : process.env.SECURITY_PEPPER;
    const isProduction =
        env?.NODE_ENV === "production" ||
        env?.ENVIRONMENT === "production" ||
        process.env.NODE_ENV === "production" ||
        process.env.ENVIRONMENT === "production";
    if (isProduction && (!pepper || pepper.length < 32 || pepper === "monea-default-pepper-ch4ng3-me")) {
        throw new Error("[CRITICAL] A strong SECURITY_PEPPER is required to hash password-reset tokens.");
    }
    return pepper || "monea-dev-fallback-pepper";
}

export function isHashedPasswordResetToken(value: string): boolean {
    return value.startsWith("hmac-sha256:");
}

export async function hashPasswordResetToken(token: string, env?: TokenHashEnvironment): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(getResetTokenPepper(env)),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(token));
    const digestHex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    return `hmac-sha256:${digestHex}`;
}
