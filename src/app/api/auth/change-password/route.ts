import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";

export async function POST(req: Request) {
    try {
        // 1. Authenticate User (Standardized)
        const user = await getServerUser();
        if (!user || user.type !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ ខ្ទង់" }, { status: 400 });
        }

        // 2. Fetch User & Verify Current Password
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { id: true, password: true, email: true }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "រកមិនឃើញគណនីរបស់អ្នកទេ" }, { status: 404 });
        }

        if (!dbUser.password) {
            return NextResponse.json({ error: "គណនីនេះពុំមានលេខសម្ងាត់" }, { status: 400 });
        }

        // 3. Verify Current Password using CryptoUtils (Peppered)
        const isMatch = await CryptoUtils.compare(currentPassword, dbUser.password);
        if (!isMatch) {
            await prisma.securityLog.create({
                data: {
                    event: "PASSWORD_CHANGE_FAILED",
                    ip: req.headers.get("x-forwarded-for") || "unknown",
                    email: dbUser.email,
                    details: "Incorrect current password"
                }
            });
            return NextResponse.json({ error: "លេខសម្ងាត់ចាស់មិនត្រឹមត្រូវទេ" }, { status: 400 });
        }

        // 4. Update Password with Pepper
        const hashedPassword = await CryptoUtils.hash(newPassword);
        await prisma.user.update({
            where: { id: user.userId },
            data: {
                password: hashedPassword,
                sessionsRevokedAt: new Date()
            }
        });

        // 5. Log Security Event
        await prisma.securityLog.create({
            data: {
                event: "PASSWORD_CHANGE_SUCCESS",
                ip: req.headers.get("x-forwarded-for") || "unknown",
                email: dbUser.email,
                details: "User changed password successfully"
            }
        });

        return NextResponse.json({ success: true, message: "ប្តូរលេខសម្ងាត់បានជោគជ័យ" });

    } catch (error: any) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
