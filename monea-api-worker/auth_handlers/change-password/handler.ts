export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";
import { getIP } from "@/lib/utils";
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited";
import { hashRateLimitKey } from "@/lib/rate-limit-key";
import { changePasswordLimiter } from "@/lib/ratelimit";


import { corsJsonResponse, corsOptionsResponse } from "@/lib/cors-utils";
const MAX_CHANGE_PASSWORD_BODY_BYTES = 2_048;

export async function POST(req: Request) {
    try {
        // 1. Authenticate User passing Request context
        const user = await getServerUser(req);
        if (!user || (!user.userId && !user.id)) {
            return corsJsonResponse({ error: "Unauthorized" }, 401, req);
        }
        
        const targetUserId = user.userId || user.id;
        const userRole = user.type || "user";

        const parsedBody = await readJsonBodyLimited(req, MAX_CHANGE_PASSWORD_BODY_BYTES);
        if (parsedBody.kind === "too_large") {
            return corsJsonResponse({ error: "Request body is too large" }, 413, req);
        }
        if (parsedBody.kind !== "ok" || !isRecord(parsedBody.value)) {
            return corsJsonResponse({ error: "ទម្រង់ Request JSON មិនត្រឹមត្រូវ" }, 400, req);
        }

        const { currentPassword, newPassword } = parsedBody.value;

        if (
            typeof currentPassword !== "string" ||
            currentPassword.length === 0 ||
            currentPassword.length > 128
        ) {
            return corsJsonResponse({ error: "សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់" }, 400, req);
        }

        if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
            return corsJsonResponse({ error: "លេខសម្ងាត់ថ្មីត្រូវមានពី ៨ ដល់ ១២៨ តួអក្សរ" }, 400, req);
        }

        const ip = getIP(req);
        let ipLimit: Awaited<ReturnType<typeof changePasswordLimiter.limit>>;
        let accountLimit: Awaited<ReturnType<typeof changePasswordLimiter.limit>>;
        try {
            const accountKey = await hashRateLimitKey(`${userRole}:${targetUserId}`);
            [ipLimit, accountLimit] = await Promise.all([
                changePasswordLimiter.limit(`ip:${ip}`),
                changePasswordLimiter.limit(`account:${accountKey}`),
            ]);
        } catch (error) {
            console.error("[RateLimit] Password change protection failed; using in-memory fallback.", error);
            // Graceful degradation: use in-memory limiter fallback
            try {
                const accountKey = await hashRateLimitKey(`${userRole}:${targetUserId}`);
                [ipLimit, accountLimit] = await Promise.all([
                    changePasswordLimiter.limit(`ip:${ip}`, undefined),
                    changePasswordLimiter.limit(`account:${accountKey}`, undefined),
                ]);
            } catch (fallbackError) {
                console.warn("[RateLimit] In-memory fallback also failed; proceeding without rate limit.", fallbackError);
                ipLimit = { success: true, limit: 5, remaining: 4, reset: Math.ceil((Date.now() + 600000) / 1000) };
                accountLimit = { success: true, limit: 5, remaining: 4, reset: Math.ceil((Date.now() + 600000) / 1000) };
            }
        }
        if (!ipLimit.success || !accountLimit.success) {
            return Response.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 },
            );
        }

        // 2. Fetch User/Staff details dynamically based on role
        let dbUser: { id: string; password: string | null } | null = null;

        if (userRole === "admin" || userRole === "user") {
            dbUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { id: true, password: true }
            });
        } else {
            dbUser = await prisma.staff.findUnique({
                where: { id: targetUserId },
                select: { id: true, password: true }
            });
        }

        if (!dbUser) {
            return corsJsonResponse({ error: "រកមិនឃើញគណនីរបស់អ្នកទេ" }, 404, req);
        }

        if (!dbUser.password) {
            return corsJsonResponse({ 
                error: "គណនីនេះចូលប្រើតាមរយៈ SSO (Google/Telegram) ពុំមានលេខសម្ងាត់ឡើយ" 
            }, 400, req);
        }

        // 4. Verify Current Password
        const isMatch = await CryptoUtils.compare(currentPassword, dbUser.password);
        if (!isMatch) {
            await prisma.securityLog.create({
                data: {
                    event: "PASSWORD_CHANGE_FAILED",
                    ip,
                    details: "Incorrect current password attempt"
                }
            });
            return corsJsonResponse({ error: "លេខសម្ងាត់ចាស់មិនត្រឹមត្រូវទេ" }, 400, req);
        }

        // 5. Check if new password is identical to the current one
        const isSameAsOld = await CryptoUtils.compare(newPassword, dbUser.password);
        if (isSameAsOld) {
            return corsJsonResponse({ 
                error: "លេខសម្ងាត់ថ្មីមិនអាចដូចគ្នានឹងលេខសម្ងាត់ចាស់បានទេ" 
            }, 400, req);
        }

        // 6. Update Password and Revoke active sessions
        const hashedPassword = await CryptoUtils.hash(newPassword);

        if (userRole === "admin" || userRole === "user") {
            await prisma.user.update({
                where: { id: targetUserId },
                data: {
                    password: hashedPassword,
                    sessionsRevokedAt: new Date()
                }
            });
        } else {
            await prisma.staff.update({
                where: { id: targetUserId },
                data: {
                    password: hashedPassword,
                    sessionsRevokedAt: new Date()
                }
            });
        }

        // 7. Log Security Audit Event
        await prisma.securityLog.create({
            data: {
                event: "PASSWORD_CHANGE_SUCCESS",
                ip,
                details: `User changed password successfully (${userRole})`
            }
        });

        return Response.json({ success: true, message: "ប្តូរលេខសម្ងាត់បានជោគជ័យ" });

    } catch (error: any) {
        console.error("[Change Password Error]:", error);
        return corsJsonResponse({ error: "Internal Server Error" }, 500, req);
    }
}
