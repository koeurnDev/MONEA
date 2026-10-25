import { hashPasswordResetToken } from "./password-reset-token.ts";

export async function hashRateLimitKey(value: string, env?: Record<string, unknown>): Promise<string> {
    return hashPasswordResetToken(value, env);
}
