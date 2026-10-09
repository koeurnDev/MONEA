export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { CryptoUtils } from "@/lib/crypto";
import { authLimiter, getIP, signupEmailLimiter } from "@/lib/ratelimit";
import { verifyTurnstileDetailed } from "@/lib/turnstile";

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

    const isProduction = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production';
    const hasDistributedRateLimit = Boolean(
        process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    );
    if (isProduction && !hasDistributedRateLimit) {
        console.error('[RateLimit] Distributed signup protection is not configured');
        return createCorsResponse({ error: "សេវាចុះឈ្មោះកំពុងរៀបចំសុវត្ថិភាព។ សូមព្យាយាមម្ដងទៀតពេលក្រោយ។" }, 503, origin);
    }

    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 16_384) {
        return createCorsResponse({ error: "Request body is too large" }, 413, origin);
    }
    
    // Simplified rate limiting
    const ip = getIP(req);
    try {
        const { success } = await authLimiter.limit(ip);
        if (!success) {
            return createCorsResponse({ error: "Too many attempts. Please try again later." }, 429, origin);
        }
    } catch (e) {
        console.error('[RateLimit] Signup protection unavailable:', e);
        return createCorsResponse({ error: "សេវាការពារកំពុងរវល់។ សូមព្យាយាមម្ដងទៀត។" }, 503, origin);
    }

    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return createCorsResponse({ error: "Invalid request body" }, 400, origin);
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return createCorsResponse({ error: "Invalid request body" }, 400, origin);
        }

        const { name, email, password, turnstileToken } = body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
        const normalizedName = typeof name === 'string' ? name.trim() : name;

        if (!normalizedEmail || !password) {
            return createCorsResponse({ error: "Email and password required" }, 400, origin);
        }
        if (typeof normalizedName !== 'string' || normalizedName.length < 2 || normalizedName.length > 80) {
            return createCorsResponse({ error: "សូមបញ្ចូលឈ្មោះដែលមានពី ២ ដល់ ៨០ តួអក្សរ។" }, 400, origin);
        }
        if (typeof normalizedEmail !== 'string' || normalizedEmail.length > 254) {
            return createCorsResponse({ error: "សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ។" }, 400, origin);
        }
        if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
            return createCorsResponse({ error: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ ខ្ទង់ (Password must be at least 8 characters)" }, 400, origin);
        }

        const hasTurnstileSecret = Boolean(process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET);
        if (isProduction || hasTurnstileSecret) {
            if (!turnstileToken) {
                return createCorsResponse({ error: "សូមផ្ទៀងផ្ទាត់សុវត្ថិភាព CAPTCHA ដើម្បីបន្ត។" }, 428, origin);
            }

            const verification = await verifyTurnstileDetailed(turnstileToken, { remoteip: ip });
            if (!verification.success) {
                const isVerificationUnavailable = verification.errorCodes?.some(code =>
                    code === 'missing-secret-key' || code === 'request-timeout' || code?.startsWith('http-status-') || code === 'internal-error'
                );
                return createCorsResponse({
                    error: isVerificationUnavailable
                        ? "សេវាផ្ទៀងផ្ទាត់កំពុងរវល់។ សូមព្យាយាមម្ដងទៀត។"
                        : "ការផ្ទៀងផ្ទាត់ CAPTCHA បរាជ័យ។ សូមព្យាយាមម្ដងទៀត។"
                }, isVerificationUnavailable ? 503 : 400, origin);
            }
        }

        try {
            const emailLimit = await signupEmailLimiter.limit(normalizedEmail);
            if (!emailLimit.success) {
                return createCorsResponse({ error: "Too many signup attempts for this email. Please try again later." }, 429, origin);
            }
        } catch (e) {
            console.error('[RateLimit] Signup email protection unavailable:', e);
            return createCorsResponse({ error: "សេវាការពារកំពុងរវល់។ សូមព្យាយាមម្ដងទៀត។" }, 503, origin);
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
            userId: user.id,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        }), { status: 200, headers });
    } catch (error: any) {
        console.error("[Auth Signup] Registration Error:", error);
        if (error?.code === 'P2002') {
            return createCorsResponse({
                error: "អ៊ីមែលនេះមានគណនីក្នុងប្រព័ន្ធរួចហើយ។ សូមចូលគណនី។"
            }, 409, origin);
        }
        return createCorsResponse({
            error: "ការបង្កើតគណនីមិនទាន់បានសម្រេចទេ។ សូមព្យាយាមម្ដងទៀត។"
        }, 500, origin);
    }
}
