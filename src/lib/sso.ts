
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
const REDIRECT_URI = `${APP_URL}/api/auth/sso/callback`;

export function getGoogleAuthUrl() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID!,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
}

export async function getGoogleTokens(code: string) {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
    };

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(values),
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Google tokens");
    }

    return res.json();
}

export async function getGoogleUser(id_token: string, access_token: string) {
    const res = await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
            headers: {
                Authorization: `Bearer ${id_token}`,
            },
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch Google user info");
    }

    return res.json();
}
