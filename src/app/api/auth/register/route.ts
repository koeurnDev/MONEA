import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { CryptoUtils } from "@/lib/crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, turnstileToken } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        // 1. Password Complexity Validation
        if (password.length < 8) {
            return NextResponse.json({ error: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ ខ្ទង់ (Password must be at least 8 characters)" }, { status: 400 });
        }

        // 2. Cloudflare Turnstile Verification
        if (process.env.NODE_ENV === "production" || process.env.TURNSTILE_SECRET_KEY) {
            if (!turnstileToken) {
                return NextResponse.json({ error: "សូមផ្ទៀងផ្ទាត់ CAPTCHA (CAPTCHA required)" }, { status: 428 });
            }
            const formData = new URLSearchParams();
            formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
            formData.append('response', turnstileToken);

            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            const turnstileResult = await verifyRes.json();
            if (!turnstileResult.success) {
                return NextResponse.json({ error: "ការផ្ទៀងផ្ទាត់ CAPTCHA បរាជ័យ (CAPTCHA verification failed)" }, { status: 400 });
            }
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });
        if (existingUser) {
            // Log the attempt internally but return generic error to mitigate enumeration
            console.warn(`[Security] Registration attempt for existing email: ${email}`);
            return NextResponse.json({
                error: "ការចុះឈ្មោះមិនទាន់អាចជោគជ័យបានទេ។ សូមពិនិត្យទិន្នន័យរបស់អ្នកម្ដងទៀត។ (Registration could not be completed. Please check your details.)"
            }, { status: 400 });
        }

        const hashedPassword = await CryptoUtils.hash(password);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: ROLES.EVENT_MANAGER, // First user is Admin (Event Manager)
            },
        });

        return NextResponse.json({ success: true, userId: user.id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
