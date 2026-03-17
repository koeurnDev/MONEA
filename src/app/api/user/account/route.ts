import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";

export async function DELETE(req: Request) {
    try {
        // 1. Authenticate User (Standardized)
        const user = await getServerUser();
        if (!user || user.type !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "សូមបញ្ចូលលេខសម្ងាត់ដើម្បីបញ្ជាក់" }, { status: 400 });
        }

        // 2. Fetch User & Verify Password
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

        // 3. Verify Password using CryptoUtils (Peppered)
        const isMatch = await CryptoUtils.compare(password, dbUser.password);
        if (!isMatch) {
            await prisma.securityLog.create({
                data: {
                    event: "PASSWORD_CHANGE_FAILED", // Mapped to generic auth failure
                    ip: req.headers.get("x-forwarded-for") || "unknown",
                    email: dbUser.email,
                    details: "Incorrect password for account deletion attempt"
                }
            });
            return NextResponse.json({ error: "លេខសម្ងាត់មិនត្រឹមត្រូវទេ" }, { status: 400 });
        }

        // 4. Perform Soft Deletion (30-day Grace Period)
        try {
            await prisma.user.update({
                where: { id: user.userId },
                data: { deletedAt: new Date() }
            });
        } catch (e) {
            // Parameterized fallback
            await (prisma as any).$executeRaw`UPDATE "User" SET "deletedAt" = ${new Date()} WHERE "id" = ${user.userId}`;
        }

        const response = NextResponse.json({ success: true, message: "គណនីត្រូវបានលុបដោយជោគជ័យ" });

        // 5. Standard Cookie Clearing
        const cookieOptions = {
            httpOnly: true,
            expires: new Date(0),
            path: "/",
            sameSite: "lax" as const
        };
        response.cookies.set("token", "", cookieOptions);
        response.cookies.set("staff_token", "", cookieOptions);
        response.cookies.set("auth_token", "", cookieOptions); // Clear legacy too

        return response;

    } catch (error: any) {
        console.error("Account Deletion Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
