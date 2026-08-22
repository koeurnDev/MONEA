export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getGoogleTokens, getGoogleUser } from "@/lib/sso";
import { signToken, generateFingerprint, isSecureCookie } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getIP } from "@/lib/utils";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) return Response.redirect(new URL("/sign-in?error=no_code", req.url));

        const tokens     = await getGoogleTokens(code);
        const googleUser = await getGoogleUser(tokens.id_token, tokens.access_token);

        if (!googleUser.email) return Response.redirect(new URL("/sign-in?error=no_email", req.url));

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
        const token       = await signToken({ userId: user.id, email: user.email, role: user.role }, { fingerprint });

        const cookieSecure = isSecureCookie(req as any);
        const secure       = cookieSecure ? "; Secure" : "";
        const headers      = new Headers({ Location: new URL("/dashboard", req.url).toString() });
        headers.append("Set-Cookie", `token=${token}; HttpOnly${secure}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);
        return new Response(null, { status: 302, headers });

    } catch (error) {
        console.error("[SSO Callback Error]", error);
        return Response.redirect(new URL("/sign-in?error=sso_failed", req.url));
    }
}
