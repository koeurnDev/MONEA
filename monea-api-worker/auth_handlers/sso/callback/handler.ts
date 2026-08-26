import { prisma } from "@/lib/prisma";
import { getGoogleTokens, getGoogleUser } from "@/lib/sso";
import { signToken, generateFingerprint, createExchangeTicket } from "@/lib/auth";
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

        if (!code) return Response.redirect(`${appUrl}/sign-in?error=no_code`);

        const tokens     = await getGoogleTokens(code, req);
        const googleUser = await getGoogleUser(tokens.id_token, tokens.access_token);

        if (!googleUser.email) return Response.redirect(`${appUrl}/sign-in?error=no_email`);

        const cleanEmail = googleUser.email.toLowerCase().trim();

        let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: googleUser.id }, { email: cleanEmail }] },
        });

        if (!user) {
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
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.id, avatar: googleUser.picture || user.avatar },
            });
        }

        const ip          = getIP(req);
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });
        const token = await signToken({ userId: user.id, email: user.email, role: user.role }, { fingerprint });

        // Create a short-lived cryptographic exchange ticket (expires in 60s)
        const exchangeTicket = await createExchangeTicket(token);

        const redirectUrl = new URL(`${appUrl}/auth/callback`);
        redirectUrl.searchParams.set('code', exchangeTicket);
        return Response.redirect(redirectUrl.toString(), 302);

    } catch (error: any) {
        console.error("[SSO Callback Error]:", error?.message || error);
        return Response.redirect(`${appUrl}/sign-in?error=sso_failed&details=${encodeURIComponent(error?.message || 'sso_error')}`);
    }
}
