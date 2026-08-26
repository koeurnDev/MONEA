export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { CryptoUtils } from "@/lib/crypto";
import { authLimiter, getIP } from "@/lib/ratelimit";

// No explicit GET handler to avoid 405 conflicts.


export async function OPTIONS(req: Request) {
    const response = new Response(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export async function POST(req: Request) {
    // 1. Rate Limiting Check (Auth Tier)
    const ip = getIP(req);
    const { success, limit, reset, remaining } = await authLimiter.limit(ip);
    
    if (!success) {
        console.warn(`[RateLimit] Auth threshold exceeded for IP: ${ip}`);
        return Response.json(
            { error: "Too many attempts. Please try again later." },
            { 
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                }
            }
        );
    }

    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { name, email, password, turnstileToken } = body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
        const normalizedName = typeof name === 'string' ? name.trim() : name;

        if (!normalizedEmail || !password) {
            return Response.json({ error: "Email and password required" }, { status: 400 });
        }
        // 1. Password Complexity Validation
        if (password.length < 8) {
            return Response.json({ error: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ ខ្ទង់ (Password must be at least 8 characters)" }, { status: 400 });
        }

        // 2. Cloudflare Turnstile Verification
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        const isTurnstileConfigured = turnstileSecret && turnstileSecret !== '1x0000000000000000000000000000000AA';

        if (isTurnstileConfigured) {
            if (!turnstileToken) {
                return Response.json({ error: "សូមផ្ទៀងផ្ទាត់ CAPTCHA (CAPTCHA required)" }, { status: 428 });
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
                return Response.json({ error: "ការផ្ទៀងផ្ទាត់ CAPTCHA បរាជ័យ (CAPTCHA verification failed)" }, { status: 400 });
            }
        }

        // 3. Check for existing user
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true }
        });
        if (existingUser) {
            console.warn(`[Security] Registration attempt for existing email: ${normalizedEmail}`);
            return Response.json({
                error: "អ៊ីមែលនេះមានគណនីក្នុងប្រព័ន្ធរួចហើយ! សូមចូលទៅកាន់ទំព័រ \"ចូលប្រើ\" (Email already registered. Please sign in)."
            }, { status: 400 });
        }

        const hashedPassword = await CryptoUtils.hash(password);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name: normalizedName || null,
                password: hashedPassword,
                role: ROLES.EVENT_MANAGER, // First user is Admin (Event Manager)
            },
        });

        // 4. Auto-login on registration
        const { signToken, generateFingerprint, getCookieHeader } = await import("@/lib/auth");
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });
        const token = await signToken({ userId: user.id, email: user.email, role: user.role }, { fingerprint, expiresIn: "30d" });

        const headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Set-Cookie", getCookieHeader("token", token, req, 60 * 60 * 24 * 30));

        return new Response(JSON.stringify({ 
            success: true, 
            token,
            userId: user.id,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        }), { status: 200, headers });
    } catch (error: any) {
        console.error("[Auth Signup] Registration Error:", error);
        return Response.json({
            error: "Internal Server Error",
            message: error?.message || "An unexpected error occurred during account creation."
        }, { status: 500 });
    }
}
