import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
        sameSite: "lax" as const
    };

    response.cookies.set("token", "", cookieOptions);
    response.cookies.set("staff_token", "", cookieOptions);

    return response;
}
