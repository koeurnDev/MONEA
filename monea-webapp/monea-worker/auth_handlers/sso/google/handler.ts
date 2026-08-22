import { getGoogleAuthUrl } from "@/lib/sso";
import crypto from "crypto";

export async function GET(req?: Request) {
    try {
        const state = req ? (new URL(req.url).searchParams.get("state") || crypto.randomUUID()) : crypto.randomUUID();
        const url = getGoogleAuthUrl(state);
        return Response.redirect(url);
    } catch (error) {
        console.error("[SSO Redirect Error]", error);
        return Response.json({ error: "Failed to initiate SSO" }, { status: 500 });
    }
}
