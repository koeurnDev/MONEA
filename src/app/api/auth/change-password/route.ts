import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret");

export async function POST(req: Request) {
    try {
        // 1. Authenticate User
        const cookieStore = cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let payload;
        try {
            const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
            payload = verifiedPayload;
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.userId as string;
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ ខ្ទង់" }, { status: 400 });
        }

        // 2. Fetch User
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "រកមិនឃើញគណនីរបស់អ្នកទេ" }, { status: 404 });
        }

        // 3. Verify Current Password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            await prisma.securityLog.create({
                data: {
                    event: "PASSWORD_CHANGE_FAILED",
                    ip: req.headers.get("x-forwarded-for") || "unknown",
                    email: user.email,
                    details: "Incorrect current password"
                }
            });
            return NextResponse.json({ error: "លេខសម្ងាត់ចាស់មិនត្រឹមត្រូវទេ" }, { status: 400 });
        }

        // 4. Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                sessionsRevokedAt: new Date() // Revoke other sessions for security
            }
        });

        // 5. Log Security Event
        await prisma.securityLog.create({
            data: {
                event: "PASSWORD_CHANGE_SUCCESS",
                ip: req.headers.get("x-forwarded-for") || "unknown",
                email: user.email,
                details: "User changed password successfully"
            }
        });

        return NextResponse.json({ success: true, message: "ប្តូរលេខសម្ងាត់បានជោគជ័យ" });

    } catch (error: any) {
        console.error("Change Password Error:", error);
        return NextResponse.json({
            error: "មានបញ្ហាបច្ចេកទេស",
            details: error.message
        }, { status: 500 });
    }
}
