export const dynamic = 'force-dynamic';
import { COOKIE_NAMES } from "@/lib/constants";

export async function GET(req: Request) {
    const cookieHeader = req.headers.get("cookie") || "";
    const parseCookie  = (name: string) => {
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
        return match ? decodeURIComponent(match[1]) : null;
    };

    const token      = parseCookie(COOKIE_NAMES.TOKEN);
    const staffToken = parseCookie(COOKIE_NAMES.STAFF_TOKEN);

    // Parse all cookie names
    const allCookies = cookieHeader.split(";").map(c => c.trim().split("=")[0]).filter(Boolean);

    return Response.json({
        cookiesPresent: {
            token:      !!token,
            tokenValue: token ? token.substring(0, 10) + "..." : null,
            staffToken: !!staffToken,
        },
        userAgent:  req.headers.get("user-agent"),
        host:       req.headers.get("host"),
        allCookies,
        time:       new Date().toISOString(),
    });
}
