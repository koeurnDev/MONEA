import { getPrisma } from "@/lib/prisma";
import { getGoogleTokens, getGoogleUser } from "@/lib/sso";
import { signToken, generateFingerprint, createExchangeTicket } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getIP } from "@/lib/utils";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    // Frontend URL - where users should be redirected after auth
    const appUrl = isLocal
        ? (process.env.VITE_APP_URL || "http://localhost:3001")
        : (process.env.NEXT_PUBLIC_APP_URL || "https://monea-webapp.pages.dev");

    console.log('[SSO Callback] Starting OAuth callback processing...');
    console.log('[SSO Callback] Request hostname:', url.hostname);
    console.log('[SSO Callback] App URL:', appUrl);
    console.log('[SSO Callback] Request URL:', req.url);

    try {
        const { searchParams } = url;
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        // Handle OAuth errors from Google
        if (error) {
            console.error('[SSO Callback] OAuth error from Google:', error, errorDescription);
            const errorMsg = errorDescription || error;
            return Response.redirect(
                `${appUrl}/sign-in?error=sso_failed&details=${encodeURIComponent(errorMsg)}`,
                302
            );
        }

        if (!code) {
            console.error('[SSO Callback] No authorization code received');
            return Response.redirect(`${appUrl}/sign-in?error=no_code`, 302);
        }

        console.log('[SSO Callback] Getting Google tokens...');
        const tokens = await getGoogleTokens(code, req);
        
        console.log('[SSO Callback] Getting Google user info...');
        const googleUser = await getGoogleUser(tokens.id_token, tokens.access_token);

        if (!googleUser.email) {
            console.error('[SSO Callback] No email from Google user info');
            return Response.redirect(`${appUrl}/sign-in?error=no_email`, 302);
        }

        console.log(`[SSO Callback] Processing user: ${googleUser.email}`);
        const cleanEmail = googleUser.email.toLowerCase().trim();

        // Get fresh Prisma client
        const prisma = getPrisma();
        
        // Query without date fields to avoid corruption errors
        let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: googleUser.id }, { email: cleanEmail }] },
            select: {
                id: true,
                email: true,
                name: true,
                googleId: true,
                avatar: true,
                role: true,
                twoFactorEnabled: true,
                twoFactorSecret: true,
                password: true,
            }
        }).catch((err) => {
            console.error('[SSO Callback] User query error:', err);
            // If P2023 date conversion error, try minimal query
            if (err?.code === 'P2023') {
                return prisma.user.findFirst({
                    where: { OR: [{ googleId: googleUser.id }, { email: cleanEmail }] },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        googleId: true,
                        avatar: true,
                        role: true,
                    }
                }).catch(() => null);
            }
            return null;
        });

        if (!user) {
            console.log('[SSO Callback] Creating new user...');
            user = await prisma.user.create({
                data: { 
                    email: cleanEmail, 
                    name: googleUser.name || "Google User", 
                    googleId: googleUser.id, 
                    avatar: googleUser.picture || null, 
                    role: ROLES.EVENT_MANAGER 
                },
            });
        } else if (!user.googleId) {
            console.log('[SSO Callback] Updating existing user with Google ID...');
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.id, avatar: googleUser.picture || user.avatar },
            });
        }

        console.log(`[SSO Callback] User authenticated: ${user.id}`);

        const ip = getIP(req);
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });
        const token = await signToken({ userId: user.id, email: user.email, role: user.role }, { fingerprint });

        // Create a short-lived cryptographic exchange ticket (expires in 60s)
        const exchangeTicket = await createExchangeTicket(token);

        const redirectUrl = new URL(`${appUrl}/auth/callback`);
        redirectUrl.searchParams.set('code', exchangeTicket);
        
        console.log('[SSO Callback] Redirecting to:', redirectUrl.toString());
        
        // Use 302 redirect with proper headers
        return new Response(null, {
            status: 302,
            headers: {
                'Location': redirectUrl.toString(),
                'Cache-Control': 'no-store',
            },
        });

    } catch (error: any) {
        console.error("[SSO Callback Error]:", error?.message || error);
        console.error("[SSO Callback Error] Stack:", error?.stack);
        
        const raw = String(error?.message || "Unknown SSO error");
        const errorMsg = /WebSocket|switching protocols/i.test(raw)
            ? "Database connection failed. Please try again."
            : raw.slice(0, 180);
        return Response.redirect(
            `${appUrl}/sign-in?error=sso_failed&details=${encodeURIComponent(errorMsg)}`,
            302
        );
    }
}
