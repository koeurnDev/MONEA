import { prisma } from "@/lib/prisma";
import { getGoogleTokens, getGoogleUser } from "@/lib/sso";
import { signToken, generateFingerprint, createExchangeTicket, getCookieHeader } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getIP } from "@/lib/utils";

export async function GET(req: Request) {
    const isLocal = typeof req !== 'undefined' && (new URL(req.url).hostname === 'localhost' || new URL(req.url).hostname === '127.0.0.1');
    const appUrl = isLocal
        ? (process.env.VITE_APP_URL || "http://localhost:3001")
        : (process.env.NEXT_PUBLIC_APP_URL || "https://monea-webapp.pages.dev");

    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            console.error("[SSO Callback] No code in callback URL");
            return Response.redirect(`${appUrl}/sign-in?error=no_code`);
        }

        console.log("[SSO Callback] Step 1: Exchanging code for Google tokens...");
        const tokens = await getGoogleTokens(code, req);
        console.log("[SSO Callback] Step 2: Got tokens, fetching Google user info...");
        const googleUser = await getGoogleUser(tokens.id_token, tokens.access_token);
        console.log("[SSO Callback] Step 3: Got Google user:", googleUser.email);

        if (!googleUser.email) return Response.redirect(`${appUrl}/sign-in?error=no_email`);

        const cleanEmail = googleUser.email.toLowerCase().trim();

        console.log("[SSO Callback] Step 4: Looking up user in database...");
        let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: googleUser.id }, { email: cleanEmail }] },
        });

        if (!user) {
            console.log("[SSO Callback] Step 5a: Creating new user...");
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
            console.log("[SSO Callback] Step 5b: Linking Google ID to existing user...");
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.id, avatar: googleUser.picture || user.avatar },
            });
        } else {
            console.log("[SSO Callback] Step 5c: Existing user found:", user.id);
        }

        console.log("[SSO Callback] Step 6: Signing JWT token...");
        const token = await signToken({ userId: user.id, email: user.email, role: user.role });

        console.log("[SSO Callback] Step 7: Redirecting to frontend with token...");
        const redirectUrl = new URL(`${appUrl}/auth/callback`);
        redirectUrl.searchParams.set('token', token);

        const cookieStr = getCookieHeader('token', token, req, 60 * 60 * 24 * 30);
        const headers = new Headers();
        headers.set('Location', redirectUrl.toString());
        headers.append('Set-Cookie', cookieStr);

        return new Response(null, { status: 302, headers });

    } catch (error: any) {
        console.error("[SSO Callback Error]:", error?.message || error);
        console.error("[SSO Callback Stack]:", error?.stack);
        return Response.redirect(`${appUrl}/sign-in?error=sso_failed&details=${encodeURIComponent(error?.message || 'sso_error')}`);
    }
}
