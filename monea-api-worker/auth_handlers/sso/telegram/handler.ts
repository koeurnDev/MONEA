import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { getPrisma } from "@/lib/prisma";
import {
    createOwnerMfaSetupCookies,
    getSecret,
    signToken,
    generateFingerprint,
    createExchangeTicket,
    getServerUser,
} from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { getIP } from "@/lib/utils";
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited";

const TELEGRAM_ISSUER = "https://oauth.telegram.org";
const TELEGRAM_AUTH_URL = `${TELEGRAM_ISSUER}/auth`;
const TELEGRAM_TOKEN_URL = `${TELEGRAM_ISSUER}/token`;
const TELEGRAM_JWKS = createRemoteJWKSet(new URL(`${TELEGRAM_ISSUER}/.well-known/jwks.json`));
const OIDC_STATE_TTL_SECONDS = 600;
const OIDC_STATE_MAX_LENGTH = 240;
const MAX_TELEGRAM_CALLBACK_BODY_BYTES = 4_096;
const MAX_TELEGRAM_AUTHORIZATION_CODE_LENGTH = 2_048;
const OIDC_STATE_CONTEXT = "monea-telegram-oidc";

type TelegramIdToken = JWTPayload & {
    id?: string | number;
    name?: string;
    preferred_username?: string;
    picture?: string;
    nonce?: string;
};

type OidcState = {
    mode: "login" | "link";
    codeChallenge: string;
    userId?: string;
    issuedAt: number;
};

function base64Url(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function randomToken(): string {
    return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

async function createCodeChallenge(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return base64Url(new Uint8Array(digest));
}

async function signOidcState(mode: OidcState["mode"], codeChallenge: string, userId?: string): Promise<string> {
    const payload = base64Url(new TextEncoder().encode(JSON.stringify({
        m: mode === "login" ? "l" : "k",
        c: codeChallenge,
        t: Math.floor(Date.now() / 1000),
        ...(userId ? { u: userId } : {}),
    })));
    const input = `v1.${payload}`;
    const key = await crypto.subtle.importKey(
        "raw",
        getSecret(),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(`${OIDC_STATE_CONTEXT}.${input}`)
    );
    return `${input}.${base64Url(new Uint8Array(signature))}`;
}

async function verifyOidcState(token: string): Promise<OidcState | null> {
    if (token.length > OIDC_STATE_MAX_LENGTH) return null;
    const [version, payload, encodedSignature, ...extra] = token.split(".");
    if (version !== "v1" || !payload || !encodedSignature || extra.length ||
        !/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(encodedSignature)) {
        return null;
    }

    const key = await crypto.subtle.importKey(
        "raw",
        getSecret(),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );
    const signature = Uint8Array.from(
        atob(encodedSignature.replace(/-/g, "+").replace(/_/g, "/") + "="),
        (character) => character.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        signature,
        new TextEncoder().encode(`${OIDC_STATE_CONTEXT}.${version}.${payload}`)
    );
    if (!valid) return null;

    let data: { m?: unknown; c?: unknown; t?: unknown; u?: unknown };
    try {
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - payload.length % 4) % 4));
        data = JSON.parse(new TextDecoder().decode(
            Uint8Array.from(decoded, (character) => character.charCodeAt(0))
        ));
    } catch {
        return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if ((data.m !== "l" && data.m !== "k") ||
        typeof data.c !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(data.c) ||
        typeof data.t !== "number" || data.t > now + 30 ||
        now - data.t > OIDC_STATE_TTL_SECONDS ||
        (data.m === "k" && (typeof data.u !== "string" || !data.u)) ||
        (data.m === "l" && data.u !== undefined)) {
        return null;
    }

    return {
        mode: data.m === "l" ? "login" : "link",
        codeChallenge: data.c,
        issuedAt: data.t,
        ...(typeof data.u === "string" ? { userId: data.u } : {}),
    };
}

function getOidcConfig() {
    const clientId = process.env.OIDC_CLIENT_ID || process.env.TELEGRAM_CLIENT_ID;
    const clientSecret = process.env.OIDC_CLIENT_SECRET || process.env.TELEGRAM_CLIENT_SECRET;
    const redirectUri = process.env.TELEGRAM_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error("Telegram OIDC credentials are not configured");
    }
    const callbackUrl = new URL(redirectUri);
    if (callbackUrl.protocol !== "https:") {
        throw new Error("Telegram OIDC redirect URI must use HTTPS");
    }
    return { clientId, clientSecret, redirectUri: callbackUrl.toString() };
}

async function createAuthorization(mode: "login" | "link", userId?: string) {
    const { clientId, redirectUri } = getOidcConfig();
    const verifier = randomToken();
    const codeChallenge = await createCodeChallenge(verifier);
    const state = await signOidcState(mode, codeChallenge, userId);
    if (state.length > OIDC_STATE_MAX_LENGTH) {
        throw new Error("Telegram OIDC state exceeds the supported length");
    }

    const authorizationUrl = new URL(TELEGRAM_AUTH_URL);
    authorizationUrl.search = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid profile telegram:bot_access",
        state,
        nonce: state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
    }).toString();

    return { url: authorizationUrl.toString(), verifier };
}

export async function START(): Promise<Response> {
    try {
        return Response.json(await createAuthorization("login"), {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("[Telegram OIDC] Could not start authentication:", error);
        return Response.json(
            { success: false, error: "Telegram sign-in is not configured yet." },
            { status: 503, headers: { "Cache-Control": "no-store" } }
        );
    }
}

export async function LINK(req: Request): Promise<Response> {
    const sessionUser = await getServerUser(req);
    if (!sessionUser || sessionUser.type === "staff") {
        return Response.json({ success: false, error: "Please sign in to link Telegram." }, { status: 401 });
    }

    try {
        const authorization = await createAuthorization("link", sessionUser.userId);
        return Response.json(authorization, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("[Telegram OIDC] Could not start Telegram linking:", error);
        return Response.json(
            { success: false, error: "Telegram linking is not configured yet." },
            { status: 503, headers: { "Cache-Control": "no-store" } }
        );
    }
}

export async function CALLBACK(req: Request): Promise<Response> {
    const fail = (error: string, status = 400, code?: string) =>
        Response.json({ success: false, error, ...(code ? { code } : {}) }, {
            status,
            headers: { "Cache-Control": "no-store" },
        });

    try {
        const parsedBody = await readJsonBodyLimited(req, MAX_TELEGRAM_CALLBACK_BODY_BYTES);
        if (parsedBody.kind === "too_large") {
            return fail("Telegram authorization response is too large.", 413);
        }
        if (parsedBody.kind !== "ok" || !isRecord(parsedBody.value)) {
            return fail("Telegram authorization response is invalid.");
        }

        const { code, state: stateToken, verifier } = parsedBody.value;
        if (typeof code !== "string" || code.length === 0 ||
            code.length > MAX_TELEGRAM_AUTHORIZATION_CODE_LENGTH ||
            typeof stateToken !== "string" || stateToken.length > OIDC_STATE_MAX_LENGTH ||
            typeof verifier !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(verifier)) {
            return fail("Telegram authorization response is incomplete.");
        }

        const state = await verifyOidcState(stateToken);
        if (!state) {
            return fail("Telegram authorization state is invalid.");
        }
        if (await createCodeChallenge(verifier) !== state.codeChallenge) {
            return fail("Telegram authorization verification failed.");
        }

        let sessionUserId: string | undefined;
        if (state.mode === "link") {
            const sessionUser = await getServerUser(req);
            if (!sessionUser || sessionUser.type === "staff" || sessionUser.userId !== state.userId) {
                return fail("Please sign in again before linking Telegram.", 401);
            }
            sessionUserId = sessionUser.userId;
        }

        const { clientId, clientSecret, redirectUri } = getOidcConfig();
        const credentials = btoa(`${clientId}:${clientSecret}`);
        const tokenResponse = await fetch(TELEGRAM_TOKEN_URL, {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                code_verifier: verifier,
            }),
            signal: AbortSignal.timeout(10_000),
        });
        if (!tokenResponse.ok) {
            console.error("[Telegram OIDC] Token exchange failed with status:", tokenResponse.status);
            return fail("Telegram sign-in failed. Please try again.");
        }

        const tokens = await tokenResponse.json() as { id_token?: string };
        if (!tokens.id_token) {
            console.error("[Telegram OIDC] Token response did not contain an ID token.");
            return fail("Telegram sign-in failed. Please try again.");
        }

        const { payload } = await jwtVerify<TelegramIdToken>(tokens.id_token, TELEGRAM_JWKS, {
            issuer: TELEGRAM_ISSUER,
            audience: clientId,
            algorithms: ["RS256"],
            maxTokenAge: "1h",
            clockTolerance: 60,
        });
        if (!payload.sub || payload.nonce !== stateToken) {
            console.error("[Telegram OIDC] ID token subject or nonce validation failed.");
            return fail("Telegram sign-in verification failed.");
        }

        const telegramId = String(payload.id ?? payload.sub);
        const prisma = getPrisma();
        let user;

        if (state.mode === "link") {
            const existingLink = await prisma.user.findUnique({
                where: { telegramId },
                select: { id: true },
            });
            if (existingLink && existingLink.id !== sessionUserId) {
                return fail("This Telegram account is already linked to another MONEA account.", 409);
            }
            user = await prisma.user.update({
                where: { id: sessionUserId },
                data: { telegramId },
                select: { id: true, email: true, role: true, deletedAt: true, twoFactorEnabled: true },
            });
        } else {
            user = await prisma.user.findUnique({
                where: { telegramId },
                select: { id: true, email: true, role: true, deletedAt: true, twoFactorEnabled: true },
            });
            if (!user) {
                const name = payload.name || (payload.preferred_username
                    ? `@${payload.preferred_username}`
                    : "Telegram User");
                user = await prisma.user.create({
                    data: {
                        email: `tg_${telegramId}@monea.local`,
                        name,
                        telegramId,
                        avatar: payload.picture || null,
                        role: ROLES.EVENT_MANAGER,
                    },
                    select: { id: true, email: true, role: true, deletedAt: true, twoFactorEnabled: true },
                });
            }
        }

        if (user.deletedAt) {
            return fail("This MONEA account is unavailable.", 403);
        }

        if (state.mode === "link") {
            return Response.json({ success: true, linked: true }, {
                headers: { "Cache-Control": "no-store" },
            });
        }

        if (user.role === ROLES.PLATFORM_OWNER && !user.twoFactorEnabled) {
            const headers = new Headers({ "Cache-Control": "no-store" });
            for (const cookie of await createOwnerMfaSetupCookies(req, user)) {
                headers.append("Set-Cookie", cookie);
            }
            return new Response(JSON.stringify({ success: true, ownerMfaSetupRequired: true }), {
                status: 200,
                headers,
            });
        }

        if (user.twoFactorEnabled) {
            return fail(
                "This account requires sign-in with a password and authenticator code.",
                403,
                "TWO_FACTOR_REQUIRED"
            );
        }

        const ip = getIP(req);
        const fingerprint = await generateFingerprint({ headers: req.headers, ip });
        const sessionToken = await signToken(
            { userId: user.id, email: user.email, role: user.role },
            { fingerprint, expiresIn: "30d" }
        );
        const exchangeTicket = await createExchangeTicket(sessionToken);
        return Response.json({ success: true, code: exchangeTicket }, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (error) {
        console.error("[Telegram OIDC] Callback processing failed:", error);
        return fail("Telegram sign-in failed. Please try again.");
    }
}
