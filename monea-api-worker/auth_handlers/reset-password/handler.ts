export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { CryptoUtils } from "@/lib/crypto";
import { getIP } from "@/lib/utils";
import { authLimiter } from "@/lib/ratelimit";
import { hashPasswordResetToken } from "@/lib/password-reset-token";

async function hashRateLimitKey(value: string): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
    const isProduction = process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";
    const hasDistributedRateLimit = Boolean(
        process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    );
    if (isProduction && !hasDistributedRateLimit) {
        console.error("[RateLimit] Distributed password-reset protection is not configured.");
        return errorResponse("Password reset is temporarily unavailable. Please try again later.", 503);
    }

    try {
        const { success } = await authLimiter.limitStrict(`password-reset-ip:${getIP(req)}`);
        if (!success) {
            return errorResponse("Too many password reset attempts. Please try again later.", 429);
        }
    } catch (error) {
        console.error("[RateLimit] Password-reset protection unavailable:", error);
        return errorResponse("Password reset is temporarily unavailable. Please try again later.", 503);
    }

    try {
        // Safe JSON Request Parsing
        let body: any = {};
        try {
            body = await req.json();
        } catch {
            return errorResponse("ទម្រង់ Request JSON មិនត្រឹមត្រូវ", 400);
        }

        const { token, newPassword } = body;
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

        if (!token || typeof token !== "string") {
            return errorResponse("Token ត្រូវបានតម្រូវ", 400);
        }

        if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return errorResponse("Email មិនត្រឹមត្រូវ", 400);
        }

        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
            return errorResponse("លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ ខ្ទង់", 400);
        }

        try {
            const emailKey = await hashRateLimitKey(email);
            const { success } = await authLimiter.limitStrict(`password-reset-email:${emailKey}`);
            if (!success) {
                return errorResponse("Too many password reset attempts. Please try again later.", 429);
            }
        } catch (error) {
            console.error("[RateLimit] Password-reset account protection unavailable:", error);
            return errorResponse("Password reset is temporarily unavailable. Please try again later.", 503);
        }

        // 1. Find the token in Database
        const tokenHash = await hashPasswordResetToken(token);
        let resetToken = await prisma.passwordResetToken.findUnique({
            where: { token: tokenHash },
        });

        if (!resetToken) {
            const legacyToken = await prisma.passwordResetToken.findFirst({
                where: { email, token },
            });
            if (legacyToken) {
                const legacyTokenHash = await hashPasswordResetToken(token);
                const migratedToken = await prisma.passwordResetToken.updateMany({
                    where: { id: legacyToken.id, token },
                    data: { token: legacyTokenHash },
                });
                if (migratedToken.count === 1) {
                    resetToken = { ...legacyToken, token: legacyTokenHash };
                }
            }
        }

        if (!resetToken || resetToken.email.toLowerCase() !== email) {
            return errorResponse("Token មិនត្រឹមត្រូវ ឬត្រូវបានប្រើប្រាស់រួចហើយ", 400);
        }

        // 2. Check Expiration
        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
            return errorResponse("Token នេះបានផុតកំណត់ហើយ។ សូមស្នើសុំសារជាថ្មី។", 400);
        }

        // 3. Hash the new password using CryptoUtils Pepper
        const hashedPassword = await CryptoUtils.hash(newPassword);
        const now = new Date();

        // 4. Update password across User or Staff tables
        const userExists = await prisma.user.findUnique({ where: { email } });
        let updatedRole = "user";

        if (userExists) {
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    failedAttempts: 0,
                    lockedUntil: null,
                    sessionsRevokedAt: now, // Invalidate all existing sessions
                },
            });
        } else {
            const staffExists = await prisma.staff.findUnique({ where: { email } });
            if (!staffExists) {
                return errorResponse("រកមិនឃើញគណនីដែលពាក់ព័ន្ធនឹង Token នេះទេ", 404);
            }
            updatedRole = "staff";
            await prisma.staff.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    failedAttempts: 0,
                    lockedUntil: null,
                },
            });
        }

        // 5. Invalidate ALL pending reset tokens for this email
        await prisma.passwordResetToken.deleteMany({
            where: { email },
        });

        // 6. Log Security Event (Using existing Prisma Enum: PASSWORD_CHANGE_SUCCESS)
        const ip = getIP(req);
        await prisma.securityLog.create({
            data: {
                event: "PASSWORD_CHANGE_SUCCESS",
                ip,
                email,
                details: `Password reset successfully via token (${updatedRole})`
            }
        });

        return Response.json({ 
            success: true, 
            message: "លេខសម្ងាត់របស់អ្នកត្រូវបានប្តូរដោយជោគជ័យ។" 
        });

    } catch (error: any) {
        console.error("[Reset Password Error]:", error);
        return errorResponse("Internal Server Error", 500);
    }
}