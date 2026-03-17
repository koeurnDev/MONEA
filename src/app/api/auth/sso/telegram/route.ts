
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { verifyTelegramAuth } from "@/lib/telegram-auth";
import { signToken, generateFingerprint, isSecureCookie } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const data: Record<string, string> = {};
        
        searchParams.forEach((value, key) => {
            data[key] = value;
        });

        // 1. Verify Telegram Auth Data
        if (!verifyTelegramAuth(data)) {
            console.error("[Telegram SSO] Verification failed");
            return NextResponse.redirect(new URL("/login?error=telegram_failed", req.url));
        }

        // 2. Check for Auth Expiration (optional but recommended: 24h)
        const authDate = parseInt(data.auth_date);
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
            return NextResponse.redirect(new URL("/login?error=telegram_expired", req.url));
        }

        // 3. Find or Create User
        // Telegram data fields: id, first_name, last_name, username, photo_url, auth_date, hash
        const telegramId = data.id;
        const name = data.username ? `@${data.username}` : `${data.first_name} ${data.last_name || ""}`.trim();
        const avatar = data.photo_url || null;

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { telegramId },
                    // We don't have email from Telegram, so we only match by telegramId
                ]
            }
        });

        if (!user) {
            // New user via Telegram
            // Note: Since Telegram doesn't provide email, we create a placeholder email or ask later.
            // For now, we'll use a placeholder email like telegram_ID@monea.local
            user = await prisma.user.create({
                data: {
                    email: `tg_${telegramId}@monea.local`, 
                    name: name,
                    telegramId: telegramId,
                    avatar: avatar,
                    role: ROLES.EVENT_MANAGER,
                }
            });
        }

        // 4. Create Session
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });
        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, { fingerprint });

        // 5. Build Response
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
        console.error("[Telegram SSO Callback Error]", error);
        return NextResponse.redirect(new URL("/login?error=sso_failed", req.url));
    }
}
