export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { verifyTelegramAuth } from "@/lib/telegram-auth";
import { signToken, generateFingerprint, createExchangeTicket, getCookieHeader } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getIP } from "@/lib/utils";

export async function GET(req: Request) {
    const isLocal = typeof req !== 'undefined' && (
        new URL(req.url).hostname === 'localhost' || 
        new URL(req.url).hostname === '127.0.0.1'
    );
    
    const appUrl = isLocal
        ? (process.env.VITE_APP_URL || "http://localhost:5173")
        : (process.env.NEXT_PUBLIC_APP_URL || "https://monea-webapp.pages.dev");

    try {
        const { searchParams } = new URL(req.url);
        const data: Record<string, string> = {};
        
        searchParams.forEach((value, key) => {
            data[key] = value;
        });

        // 1. Verify Telegram Auth Data
        if (!verifyTelegramAuth(data)) {
            console.error("[Telegram SSO] Verification failed");
            return Response.redirect(`${appUrl}/sign-in?error=telegram_failed`, 302);
        }

        // 2. Check for Auth Expiration (24h)
        const authDate = parseInt(data.auth_date);
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
            return Response.redirect(`${appUrl}/sign-in?error=telegram_expired`, 302);
        }

        // 3. Extract Telegram Data
        const telegramId = data.id;
        const name = data.username ? `@${data.username}` : `${data.first_name} ${data.last_name || ""}`.trim();
        const avatar = data.photo_url || null;

        // 4. Find or Create User
        let user = await prisma.user.findFirst({
            where: { telegramId }
        });

        // Security check for soft-deleted accounts
        if (user && (user as any).deletedAt) {
            return Response.redirect(`${appUrl}/sign-in?error=account_deleted`, 302);
        }

        if (!user) {
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

        // 5. Create Session Token & Cryptographic Exchange Ticket
        const ip = getIP(req);
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });
        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, { fingerprint, expiresIn: "30d" });

        // Generate Ticket for Exchange (Avoid Cookie Mismatch)
        const exchangeTicket = await createExchangeTicket(token);

        const redirectUrl = new URL(`${appUrl}/auth/callback`);
        redirectUrl.searchParams.set('code', exchangeTicket);

        // 6. Build Response with Cross-Domain Cookie Header
        const response = Response.redirect(redirectUrl.toString(), 302);
        response.headers.append("Set-Cookie", getCookieHeader("token", token, req, 60 * 60 * 24 * 30));
        
        return response;

    } catch (error: any) {
        console.error("[Telegram SSO Callback Error]", error);
        return Response.redirect(`${appUrl}/sign-in?error=sso_failed`, 302);
    }
}