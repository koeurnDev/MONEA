

const getAppUrl = (req?: Request) => {
    // In browser environment (client-side)
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    
    // In server environment with request object
    if (req) {
        const url = new URL(req.url);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            return `http://${url.host}`;
        }
        return `https://${url.host}`;
    }
    
    // Fallback for server environments without request
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development' || process.env.VITE_APP_URL?.includes('localhost')) {
        return process.env.VITE_APP_URL || 'http://localhost:3001';
    }
    
    // Production fallback
    return process.env.VITE_APP_URL || 'https://monea-webapp.pages.dev';
};

export const getRedirectUri = (req?: Request) => {
    const appUrl = getAppUrl(req);
    return `${appUrl}/api/auth/sso/callback`;
};

export function getGoogleAuthUrl(state: string, req?: Request) {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: getRedirectUri(req),
        client_id: process.env.GOOGLE_CLIENT_ID!,
        state,
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

export async function getGoogleTokens(code: string, req?: Request) {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: getRedirectUri(req),
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
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );

    if (!res.ok) {
        const errText = await res.text();
        console.error("[Google OAuth] userinfo fetch failed:", res.status, errText);
        throw new Error("Failed to fetch Google user info");
    }

    const data = await res.json();
    return {
        id: data.sub || data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
    };
}
