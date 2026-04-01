import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { errorResponse } from "@/lib/api-utils";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email, turnstileToken } = await req.json();

        if (!email) {
            return errorResponse("Email is required", 400);
        }

        // Verify Turnstile
        if (!turnstileToken) {
            return errorResponse("Please verify CAPTCHA", 428); // Precondition Required
        }
        const isHuman = await verifyTurnstile(turnstileToken);
        if (!isHuman) {
            return errorResponse("CAPTCHA verification failed", 400);
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Security: Don't leak whether the email exists or not
        if (!user) {
            return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
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

        const token = crypto.randomBytes(32).toString("hex");

        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
            },
        });

        await sendPasswordResetEmail(email, token);
        console.log(`[Forgot Password] Reset token sent for: ${email}`);

        return NextResponse.json({ success: true, message: "A password reset link has been sent to your email." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}
