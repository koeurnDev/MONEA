export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { CryptoUtils } from "@/lib/crypto";
import { getIP } from "@/lib/utils";
import { authLimiter } from "@/lib/ratelimit";
import { hashPasswordResetToken } from "@/lib/password-reset-token";
import { hashRateLimitKey } from "@/lib/rate-limit-key";
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited";

const MAX_RESET_PASSWORD_BODY_BYTES = 16_384;

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
        const parsedBody = await readJsonBodyLimited(req, MAX_RESET_PASSWORD_BODY_BYTES);
        if (parsedBody.kind === "too_large") {
            return errorResponse("Request body is too large", 413);
        }
        if (
            parsedBody.kind !== "ok" ||
            !isRecord(parsedBody.value)
        ) {
            return errorResponse("ទម្រង់ Request JSON មិនត្រឹមត្រូវ", 400);
        }

        const body = parsedBody.value;
        const { token, newPassword } = body;
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

        if (typeof token !== "string" || token.length === 0 || token.length > 512) {
            return errorResponse("Token ត្រូវបានតម្រូវ", 400);
        }

        if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.trim().length === 0) {
            return errorResponse("Email មិនត្រឹមត្រូវ", 400);
        }

        if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
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

        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.deleteMany({
                where: { id: resetToken.id, token: resetToken.token, expiresAt: { lte: new Date() } },
            });
            return errorResponse("Token នេះបានផុតកំណត់ហើយ។ សូមស្នើសុំសារជាថ្មី។", 400);
        }

        // Hash before opening the transaction so the reset token lock is held briefly.
        const hashedPassword = await CryptoUtils.hash(newPassword);
        const now = new Date();
        const ip = getIP(req);

        const resetResult = await prisma.$transaction(async (transaction) => {
            const consumedToken = await transaction.passwordResetToken.deleteMany({
                where: {
                    id: resetToken.id,
                    email,
                    token: resetToken.token,
                    expiresAt: { gt: now },
                },
            });
            if (consumedToken.count !== 1) return "invalid" as const;

            const user = await transaction.user.findUnique({
                where: { email },
                select: { id: true },
            });
            let updatedRole: "user" | "staff";

            if (user) {
                await transaction.user.update({
                    where: { email },
                    data: {
                        password: hashedPassword,
                        failedAttempts: 0,
                        lockedUntil: null,
                        sessionsRevokedAt: now,
                    },
                });
                updatedRole = "user";
            } else {
                const staff = await transaction.staff.findUnique({
                    where: { email },
                    select: { id: true },
                });
                if (!staff) return "account_not_found" as const;

                await transaction.staff.update({
                    where: { email },
                    data: {
                        password: hashedPassword,
                        failedAttempts: 0,
                        lockedUntil: null,
                    },
                });
                updatedRole = "staff";
            }

            await transaction.passwordResetToken.deleteMany({ where: { email } });
            await transaction.securityLog.create({
                data: {
                    event: "PASSWORD_CHANGE_SUCCESS",
                    ip,
                    details: `Password reset successfully via token (${updatedRole})`,
                },
            });
            return "success" as const;
        });

        if (resetResult === "invalid") {
            return errorResponse("Token មិនត្រឹមត្រូវ ឬត្រូវបានប្រើប្រាស់រួចហើយ", 400);
        }
        if (resetResult === "account_not_found") {
            return errorResponse("រកមិនឃើញគណនីដែលពាក់ព័ន្ធនឹង Token នេះទេ", 404);
        }

        return Response.json({ 
            success: true, 
            message: "លេខសម្ងាត់របស់អ្នកត្រូវបានប្តូរដោយជោគជ័យ។" 
        });

    } catch (error: any) {
        console.error("[Reset Password Error]:", error);
        return errorResponse("Internal Server Error", 500);
    }
}