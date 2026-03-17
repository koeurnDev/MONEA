
import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/sso";

export async function GET() {
    try {
        const url = getGoogleAuthUrl();
        return NextResponse.redirect(url);
    } catch (error) {
        console.error("[SSO Redirect Error]", error);
        return NextResponse.json({ error: "Failed to initiate SSO" }, { status: 500 });
    }
}
