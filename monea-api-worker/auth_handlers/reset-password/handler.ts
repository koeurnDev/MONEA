export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { CryptoUtils } from "@/lib/crypto";
import { getIP } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        // Safe JSON Request Parsing
        let body: any = {};
        try {
            body = await req.json();
        } catch {
            return errorResponse("ទម្រង់ Request JSON មិនត្រឹមត្រូវ", 400);
        }

        const { token, newPassword } = body;

        if (!token || typeof token !== "string") {
            return errorResponse("Token ត្រូវបានតម្រូវ", 400);
        }

        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
            return errorResponse("លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ ខ្ទង់", 400);
        }

        // 1. Find the token in Database
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return errorResponse("Token មិនត្រឹមត្រូវ ឬត្រូវបានប្រើប្រាស់រួចហើយ", 400);
        }

        // 2. Check Expiration
        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
            return errorResponse("Token នេះបានផុតកំណត់ហើយ។ សូមស្នើសុំសារជាថ្មី។", 400);
        }

        const email = resetToken.email.toLowerCase();

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