export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const referer = request.headers.get("referer") || "unknown";
    console.log(`[Auth Logout Debug] Logout triggered from Referer: ${referer}`);

    const response = NextResponse.json({ success: true });

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
        path: "/",
        sameSite: "strict" as const
    };

    response.cookies.set("token", "", cookieOptions);
    response.cookies.set("staff_token", "", cookieOptions);

    return response;
}
