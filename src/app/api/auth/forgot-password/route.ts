import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/turnstile";
import { errorResponse } from "@/lib/api-utils";

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

        // In a real application, you would generate a token and send an email here.
        // For MONEA, we'll simulate success.
        console.log(`[Forgot Password] Reset request for: ${email}`);

        return NextResponse.json({ success: true, message: "តំណភ្ជាប់សម្រាប់ប្តូរពាក្យសម្ងាត់ត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នក។" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}
