

const getAppUrl = (req?: Request) => {
    // Always return frontend URL, not API worker URL
    
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development' || 
        (req && (req.url.includes('localhost') || req.url.includes('127.0.0.1')))) {
        return process.env.VITE_APP_URL || 'http://localhost:3001';
    }
    
    // Production: Always use the deployed frontend URL
    // Check if we have NEXT_PUBLIC_APP_URL env variable
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    
    // Fallback to Cloudflare Pages deployment
    return 'https://monea-webapp.pages.dev';
};

export const getRedirectUri = (req?: Request) => {
    // This is the OAuth redirect_uri that Google will callback to
    // MUST match exactly what's configured in Google Console
    
    if (req) {
        const url = new URL(req.url);
        // Development: localhost
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            return `http://${url.host}/api/auth/sso/callback`;
        }
        // Production: Use actual hostname from request
        return `https://${url.hostname}/api/auth/sso/callback`;
    }
    
    // Fallback: Use the deployed worker URL
    // This MUST match what's in Google OAuth Console
    return 'https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback';
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
