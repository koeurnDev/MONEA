export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";
import { getIP } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        // 1. Authenticate User passing Request context
        const user = await getServerUser(req);
        if (!user || (!user.userId && !user.id)) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const targetUserId = user.userId || user.id;
        const userRole = user.type || "user";

        // Safe Request Parsing
        let body: any = {};
        try {
            body = await req.json();
        } catch {
            return Response.json({ error: "ទម្រង់ Request JSON មិនត្រឹមត្រូវ" }, { status: 400 });
        }

        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return Response.json({ error: "សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់" }, { status: 400 });
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return Response.json({ error: "លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ ខ្ទង់" }, { status: 400 });
        }

        // 2. Fetch User/Staff details dynamically based on role
        let dbUser: { id: string; password: string | null; email: string | null } | null = null;

        if (userRole === "admin" || userRole === "user") {
            dbUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { id: true, password: true, email: true }
            });
        } else {
            dbUser = await prisma.staff.findUnique({
                where: { id: targetUserId },
                select: { id: true, password: true, email: true }
            });
        }

        if (!dbUser) {
            return Response.json({ error: "រកមិនឃើញគណនីរបស់អ្នកទេ" }, { status: 404 });
        }

        if (!dbUser.password) {
            return Response.json({ 
                error: "គណនីនេះចូលប្រើតាមរយៈ SSO (Google/Telegram) ពុំមានលេខសម្ងាត់ឡើយ" 
            }, { status: 400 });
        }

        // 3. Extract Client IP
        const ip = getIP(req);

        // 4. Verify Current Password
        const isMatch = await CryptoUtils.compare(currentPassword, dbUser.password);
        if (!isMatch) {
            await prisma.securityLog.create({
                data: {
                    event: "PASSWORD_CHANGE_FAILED",
                    ip,
                    email: dbUser.email || "unknown",
                    details: "Incorrect current password attempt"
                }
            });
            return Response.json({ error: "លេខសម្ងាត់ចាស់មិនត្រឹមត្រូវទេ" }, { status: 400 });
        }

        // 5. Check if new password is identical to the current one
        const isSameAsOld = await CryptoUtils.compare(newPassword, dbUser.password);
        if (isSameAsOld) {
            return Response.json({ 
                error: "លេខសម្ងាត់ថ្មីមិនអាចដូចគ្នានឹងលេខសម្ងាត់ចាស់បានទេ" 
            }, { status: 400 });
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
                email: dbUser.email || "unknown",
                details: `User changed password successfully (${userRole})`
            }
        });

        return Response.json({ success: true, message: "ប្តូរលេខសម្ងាត់បានជោគជ័យ" });

    } catch (error: any) {
        console.error("[Change Password Error]:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}