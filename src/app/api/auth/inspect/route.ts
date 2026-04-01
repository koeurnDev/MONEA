import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { COOKIE_NAMES } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export async function GET() {
    const cookieStore = cookies();
    const headersList = headers();
    
    const token = cookieStore.get(COOKIE_NAMES.TOKEN);
    const staffToken = cookieStore.get(COOKIE_NAMES.STAFF_TOKEN);
    
    return NextResponse.json({
        cookiesPresent: {
            token: !!token,
            tokenValue: token ? token.value.substring(0, 10) + "..." : null,
            staffToken: !!staffToken,
        },
        userAgent: headersList.get("user-agent"),
        host: headersList.get("host"),
        allCookies: cookieStore.getAll().map(c => c.name),
        time: new Date().toISOString()
    });
}
