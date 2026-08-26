import { getGoogleAuthUrl } from "@/lib/sso";

export async function GET(req?: Request) {
    try {
        const state = req ? (new URL(req.url).searchParams.get("state") || globalThis.crypto.randomUUID()) : globalThis.crypto.randomUUID();
        const url = getGoogleAuthUrl(state, req);
        return Response.redirect(url);
    } catch (error) {
        console.error("[SSO Redirect Error]", error);
        return Response.json({ error: "Failed to initiate SSO" }, { status: 500 });
    }
}
