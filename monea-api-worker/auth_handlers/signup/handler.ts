export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { CryptoUtils } from "@/lib/crypto";
import { authLimiter, getIP } from "@/lib/ratelimit";

// Helper function to create CORS-compliant Response
function createCorsResponse(body: any, status: number, origin?: string): Response {
    const response = Response.json(body, { status });
    
    // Set CORS headers
    if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
        response.headers.set('Access-Control-Allow-Origin', '*');
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    
    return response;
}

export async function OPTIONS(req: Request) {
    const origin = req.headers.get('origin') || undefined;
    return createCorsResponse(null, 204, origin);
}

export async function POST(req: Request) {
    const origin = req.headers.get('origin') || undefined;
    
    // Simplified rate limiting
    const ip = getIP(req);
    try {
        const { success } = await authLimiter.limit(ip);
        if (!success) {
            return createCorsResponse({ error: "Too many attempts. Please try again later." }, 429, origin);
        }
    } catch (e) {
        console.warn('[RateLimit] Bypassing due to error:', e);
    }

    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return createCorsResponse({ error: "Invalid request body" }, 400, origin);
        }

        const { name, email, password, turnstileToken } = body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
        const normalizedName = typeof name === 'string' ? name.trim() : name;

        if (!normalizedEmail || !password) {
            return createCorsResponse({ error: "Email and password required" }, 400, origin);
        }
        // 1. Password Complexity Validation
        if (password.length < 8) {
            return createCorsResponse({ error: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ ខ្ទង់ (Password must be at least 8 characters)" }, 400, origin);
        }

        // Simplified Turnstile verification
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
        if (turnstileSecret && turnstileSecret !== '1x0000000000000000000000000000000AA') {
            if (!turnstileToken) {
                return createCorsResponse({ error: "សូមផ្ទៀងផ្ទាត់ CAPTCHA" }, 428, origin);
            }
            
            try {
                const formData = new URLSearchParams();
                formData.append('secret', turnstileSecret);
                formData.append('response', turnstileToken);

                const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                const verifyData = await verifyRes.json();
                if (!verifyData.success) {
                    return createCorsResponse({ error: "ការផ្ទៀងផ្ទាត់ CAPTCHA បរាជ័យ" }, 400, origin);
                }
            } catch (e) {
                console.warn('[Turnstile] Verification failed, continuing...', e);
            }
        }

        // 3. Check for existing user
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true }
        });
        if (existingUser) {
            console.warn(`[Security] Registration attempt for existing email: ${normalizedEmail}`);
            return createCorsResponse({
                error: "អ៊ីមែលនេះមានគណនីក្នុងប្រព័ន្ធរួចហើយ! សូមចូលទៅកាន់ទំព័រ \"ចូលប្រើ\" (Email already registered. Please sign in)."
            }, 400, origin);
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
        
        // Set CORS headers
        if (origin) {
            headers.set('Access-Control-Allow-Origin', origin);
        } else {
            headers.set('Access-Control-Allow-Origin', '*');
        }
        headers.set('Access-Control-Allow-Credentials', 'true');

        return new Response(JSON.stringify({ 
            success: true, 
            token,
            userId: user.id,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        }), { status: 200, headers });
    } catch (error: any) {
        console.error("[Auth Signup] Registration Error:", error);
        return createCorsResponse({
            error: "Internal Server Error",
            message: error?.message || "An unexpected error occurred during account creation."
        }, 500, origin);
    }
}
