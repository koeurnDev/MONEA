import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { errorResponse } from "@/lib/api-utils";
import { sendTelegramMessage } from "@/lib/telegram";
import { hashPasswordResetToken } from "@/lib/password-reset-token";
import { getIP, passwordResetEmailLimiter, passwordResetLimiter } from "@/lib/ratelimit";
import { hashRateLimitKey } from "@/lib/rate-limit-key";
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited";


import { corsJsonResponse, corsOptionsResponse } from "@/lib/cors-utils";
const MAX_FORGOT_PASSWORD_BODY_BYTES = 16_384;
const GENERIC_RESET_RESPONSE = {
    success: true,
    message: "If an account exists, a password reset code will be sent.",
};

function createResetCode(): string {
    const range = 900_000;
    const limit = Math.floor(0x1_0000_0000 / range) * range;
    const value = new Uint32Array(1);
    do {
        globalThis.crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return String(100_000 + (value[0] % range));
}

export async function POST(req: Request, env?: any) {
    try {
        const ip = getIP(req);
        let rateLimit: Awaited<ReturnType<typeof passwordResetLimiter.limit>>;
        try {
            rateLimit = await passwordResetLimiter.limit(ip);
        } catch (error) {
            console.error("[RateLimit] Distributed password-reset protection failed; using in-memory fallback.", error);
            // Graceful degradation: use in-memory limiter fallback
            try {
                rateLimit = await passwordResetLimiter.limit(ip, undefined);
            } catch (fallbackError) {
                console.warn("[RateLimit] In-memory fallback also failed; proceeding without rate limit.", fallbackError);
                rateLimit = { success: true, limit: 5, remaining: 4, reset: Math.ceil((Date.now() + 600000) / 1000) };
            }
        }

        if (!rateLimit.success) {
            return errorResponse("Too many password reset attempts. Please try again later.", 429);
        }

        const parsedBody = await readJsonBodyLimited(req, MAX_FORGOT_PASSWORD_BODY_BYTES);
        if (parsedBody.kind === "too_large") {
            return errorResponse("Request body is too large", 413);
        }
        if (
            parsedBody.kind !== "ok" ||
            !isRecord(parsedBody.value)
        ) {
            return errorResponse("Invalid request body", 400);
        }
        const { email: inputEmail, turnstileToken } = parsedBody.value;
        if (
            typeof inputEmail !== "string" ||
            !inputEmail.trim() ||
            inputEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail.trim()) ||
            (turnstileToken !== undefined && (typeof turnstileToken !== "string" || turnstileToken.length > 4096))
        ) {
            return errorResponse("Invalid request body", 400);
        }
        const email = inputEmail.trim().toLowerCase();

        const isProduction = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production';
        const hasTurnstileSecret = Boolean(process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET);
        if (isProduction || hasTurnstileSecret) {
            if (!turnstileToken) {
                return errorResponse("Please verify CAPTCHA", 428);
            }
            const isHuman = await verifyTurnstile(turnstileToken, undefined, env);
            if (!isHuman) {
                return errorResponse("CAPTCHA verification failed", 400);
            }
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Security: Don't leak whether the email exists or not
        if (!user) {
            return Response.json(GENERIC_RESET_RESPONSE);
        }

        if (!user.telegramId) {
            return Response.json(GENERIC_RESET_RESPONSE);
        }

        let emailLimit: Awaited<ReturnType<typeof passwordResetEmailLimiter.limit>>;
        try {
            emailLimit = await passwordResetEmailLimiter.limit(await hashRateLimitKey(email));
        } catch (error) {
            console.error("[RateLimit] Password-reset email protection failed; using in-memory fallback.", error);
            // Graceful degradation: use in-memory limiter fallback
            try {
                emailLimit = await passwordResetEmailLimiter.limit(await hashRateLimitKey(email), undefined);
            } catch (fallbackError) {
                console.warn("[RateLimit] In-memory fallback also failed; proceeding without rate limit.", fallbackError);
                emailLimit = { success: true, limit: 1, remaining: 0, reset: Math.ceil((Date.now() + 120000) / 1000) };
            }
        }
        if (!emailLimit.success) {
            return Response.json(GENERIC_RESET_RESPONSE);
        }

        // Check for existing tokens to prevent spam
        const existingToken = await prisma.passwordResetToken.findFirst({
            where: { email },
            orderBy: { createdAt: 'desc' }
        });

        if (existingToken && existingToken.createdAt.getTime() > Date.now() - 1000 * 60 * 2) {
            // Rate limit: 1 email per 2 minutes
            return Response.json(GENERIC_RESET_RESPONSE);
        }

        const token = createResetCode();
        const tokenHash = await hashPasswordResetToken(token);

        await prisma.passwordResetToken.create({
            data: {
                email,
                token: tokenHash,
                expiresAt: new Date(Date.now() + 1000 * 60 * 10),
            },
        });

        const sent = await sendTelegramMessage(
            user.telegramId,
            `MONEA password reset code: ${token}\nThis code expires in 10 minutes.`,
            env
        );
        if (!sent) {
            await prisma.passwordResetToken.deleteMany({ where: { token: tokenHash } });
            console.error("[Forgot Password] Telegram reset code could not be delivered.");
            return Response.json(GENERIC_RESET_RESPONSE);
        }
        console.log("[Forgot Password] Telegram reset code sent.");

        return Response.json(GENERIC_RESET_RESPONSE);

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}

