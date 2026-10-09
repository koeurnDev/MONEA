import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { errorResponse } from "@/lib/api-utils";
import { sendTelegramMessage } from "@/lib/telegram";
import { hashPasswordResetToken } from "@/lib/password-reset-token";
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
        const { email: inputEmail, turnstileToken } = await req.json();
        const email = typeof inputEmail === "string" ? inputEmail.trim().toLowerCase() : "";

        if (!email) {
            return errorResponse("Email is required", 400);
        }

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
            return Response.json({ success: true, message: "If an account exists, an OTP has been sent to Telegram." });
        }

        if (!user.telegramId) {
            return Response.json({ success: true, message: "If an account exists, an OTP has been sent to Telegram." });
        }

        // Check for existing tokens to prevent spam
        const existingToken = await prisma.passwordResetToken.findFirst({
            where: { email },
            orderBy: { createdAt: 'desc' }
        });

        if (existingToken && existingToken.createdAt.getTime() > Date.now() - 1000 * 60 * 2) {
            // Rate limit: 1 email per 2 minutes
             return errorResponse("Please wait a few minutes before requesting another reset link.", 429);
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
            return errorResponse("មិនអាចផ្ញើកូដទៅ Telegram បានទេ។ សូមពិនិត្យថាបានភ្ជាប់ Telegram និងអនុញ្ញាតឲ្យ bot ផ្ញើសារ។", 503);
        }
        console.log("[Forgot Password] Telegram reset code sent.");

        return Response.json({ success: true, message: "An OTP has been sent to your Telegram." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}
