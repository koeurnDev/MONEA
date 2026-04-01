import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return errorResponse("Token and new password are required", 400);
        }

        if (newPassword.length < 8) {
            return errorResponse("Password must be at least 8 characters", 400);
        }

        // Find the token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return errorResponse("Invalid or expired reset token", 400);
        }

        // Check expiration
        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
            return errorResponse("Reset token has expired. Please request a new one.", 400);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user
        await prisma.user.update({
            where: { email: resetToken.email },
            data: {
                password: hashedPassword,
                failedAttempts: 0,
                lockedUntil: null,
                sessionsRevokedAt: new Date(), // Invalidate all existing sessions
            },
        });

        // Delete the used token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        return NextResponse.json({ success: true, message: "Password has been successfully reset." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}
