export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { CryptoUtils } from "@/lib/crypto";

// No explicit GET handler to avoid 405 conflicts.


export async function OPTIONS(req: Request) {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export async function POST(req: Request) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { name, email, password, turnstileToken } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }
        // 1. Password Complexity Validation
        if (password.length < 8) {
            return NextResponse.json({ error: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ ខ្ទង់ (Password must be at least 8 characters)" }, { status: 400 });
        }

        // 2. Cloudflare Turnstile Verification
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        const isTurnstileConfigured = turnstileSecret && turnstileSecret !== '1x0000000000000000000000000000000AA';

        if (isTurnstileConfigured) {
            if (!turnstileToken) {
                return NextResponse.json({ error: "សូមផ្ទៀងផ្ទាត់ CAPTCHA (CAPTCHA required)" }, { status: 428 });
            }
            const formData = new URLSearchParams();
            formData.append('secret', turnstileSecret);
            formData.append('response', turnstileToken);

            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const verifyData = await verifyRes.json();
            console.log(`[Auth Signup] Turnstile verification: success=${verifyData.success}`);

            if (!verifyData.success) {
                console.warn(`[Auth Signup] 400: Turnstile verification failed. Result: ${JSON.stringify(verifyData)}`);
                return NextResponse.json({ error: "ការផ្ទៀងផ្ទាត់ CAPTCHA បរាជ័យ (CAPTCHA verification failed)" }, { status: 400 });
            }
        }

        // 3. Check for existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });
        if (existingUser) {
            // Log the attempt internally but return generic error to mitigate enumeration
            console.warn(`[Security] Registration attempt for existing email: ${email}`);
            return NextResponse.json({
                error: "ការចុះឈ្មោះមិនទាន់អាចជោគជ័យបានទេ។ សូមពិនិត្យទិន្នន័យរបស់អ្នកម្ដងទៀត។ "
            }, { status: 400 });
        }

        const hashedPassword = await CryptoUtils.hash(password);
        const user = await prisma.user.create({
            data: {
                email,
                name: name || null,
                password: hashedPassword,
                role: ROLES.EVENT_MANAGER, // First user is Admin (Event Manager)
            },
        });

        return NextResponse.json({ success: true, userId: user.id });
    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error?.message || String(error),
            stack: error?.stack
        }, { status: 500 });
    }
}
