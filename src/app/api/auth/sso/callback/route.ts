
import { NextResponse } from "next/server";

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

        if (!code) {
            return NextResponse.redirect(new URL("/sign-in?error=no_code", req.url));
        }

        // 1. Exchange code for tokens
        const tokens = await getGoogleTokens(code);
        
        // 2. Get user info from Google
        const googleUser = await getGoogleUser(tokens.id_token, tokens.access_token);
        
        if (!googleUser.email) {
            return NextResponse.redirect(new URL("/sign-in?error=no_email", req.url));
        }

        // 3. Find or Create User in MONEA
        let user = await prisma.user.findFirst({
            where: { 
                OR: [
                    { googleId: googleUser.id },
                    { email: googleUser.email }
                ]
            }
        });

        if (!user) {
            // New user via Google
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    googleId: googleUser.id,
                    avatar: googleUser.picture,
                    role: ROLES.EVENT_MANAGER,
                }
            });
        } else if (!user.googleId) {
            // Link existing email to Google
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: googleUser.id,
                    avatar: googleUser.picture
                }
            });
        }

        // 4. Create Session
        const ip = getIP(req);
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, { fingerprint });

        // 5. Build Response with Cookie
        const response = NextResponse.redirect(new URL("/dashboard", req.url));
        
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: isSecureCookie(req as any),
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error) {
        console.error("[SSO Callback Error]", error);
        return NextResponse.redirect(new URL("/sign-in?error=sso_failed", req.url));
    }
}
