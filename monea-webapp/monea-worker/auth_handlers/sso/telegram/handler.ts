
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { verifyTelegramAuth } from "@/lib/telegram-auth";
import { signToken, generateFingerprint, createExchangeTicket } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getIP } from "@/lib/utils";


export async function GET(req: Request) {
    const isLocal = typeof req !== 'undefined' && (new URL(req.url).hostname === 'localhost' || new URL(req.url).hostname === '127.0.0.1');
    const appUrl = isLocal
        ? (process.env.VITE_APP_URL || "http://localhost:3001")
        : (process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || "https://monea-webapp.pages.dev");

    try {
        const { searchParams } = new URL(req.url);
        const data: Record<string, string> = {};
        
        searchParams.forEach((value, key) => {
            data[key] = value;
        });

        // 1. Verify Telegram Auth Data
        if (!verifyTelegramAuth(data)) {
            console.error("[Telegram SSO] Verification failed");
            return Response.redirect(`${appUrl}/sign-in?error=telegram_failed`);
        }

        // 2. Check for Auth Expiration (24h)
        const authDate = parseInt(data.auth_date);
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
            return Response.redirect(`${appUrl}/sign-in?error=telegram_expired`);
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
            // New user via Telegram — placeholder email since Telegram doesn't provide one
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

        // 4. Create Session Token
        const ip = getIP(req);
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, { fingerprint });

        // 5. Use the exchange ticket flow — same as Google SSO.
        //    Avoids the cross-origin SameSite cookie issue between workers.dev and pages.dev.
        //    The frontend /auth/callback page exchanges this short-lived code via the
        //    /api/auth/session endpoint (same Pages origin) to set the HttpOnly cookie correctly.
        const exchangeTicket = await createExchangeTicket(token);

        const redirectUrl = new URL(`${appUrl}/auth/callback`);
        redirectUrl.searchParams.set('code', exchangeTicket);
        return Response.redirect(redirectUrl.toString(), 302);

    } catch (error) {
        console.error("[Telegram SSO Callback Error]", error);
        return Response.redirect(`${appUrl}/sign-in?error=sso_failed`);
    }
}
