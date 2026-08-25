import { prisma } from "@/lib/prisma";
import { getGoogleTokens, getGoogleUser } from "@/lib/sso";
import { signToken, generateFingerprint, createExchangeTicket } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getIP } from "@/lib/utils";

export async function GET(req: Request) {
    const appUrl = process.env.VITE_APP_URL || "http://localhost:3001";
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) return Response.redirect(`${appUrl}/login?error=no_code`);

        const tokens     = await getGoogleTokens(code);
        const googleUser = await getGoogleUser(tokens.id_token, tokens.access_token);

        if (!googleUser.email) return Response.redirect(`${appUrl}/login?error=no_email`);

        let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: googleUser.id }, { email: googleUser.email }] },
        });

        if (!user) {
            user = await prisma.user.create({
                data: { email: googleUser.email, name: googleUser.name, googleId: googleUser.id, avatar: googleUser.picture, role: ROLES.EVENT_MANAGER },
            });
        } else if (!user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.id, avatar: googleUser.picture },
            });
        }

        const ip          = getIP(req);
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });
        const token = await signToken({ userId: user.id, email: user.email, role: user.role }, { fingerprint });

        // Create a short-lived cryptographic exchange ticket (expires in 60s)
        // Validated on the frontend /auth/callback via POST /api/auth/session to set the HttpOnly cookie.
        const exchangeTicket = await createExchangeTicket(token);

        const redirectUrl = new URL(`${appUrl}/auth/callback`);
        redirectUrl.searchParams.set('code', exchangeTicket);
        return Response.redirect(redirectUrl.toString(), 302);

    } catch (error) {
        console.error("[SSO Callback Error]", error);
        return Response.redirect(`${appUrl}/login?error=sso_failed`);
    }
}
