import { jwtVerify } from "jose";

interface PagesFunctionContext {
    request: Request;
    env: {
        JWT_SECRET?: string;
        VITE_API_URL?: string;
    };
    next(): Promise<Response>;
}

function isAssetRequest(pathname: string): boolean {
    return /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|ttf|map|txt|xml|json)$/i.test(pathname) ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/assets/") ||
        pathname.startsWith("/api/") ||
        pathname === "/favicon.ico";
}

function isStaticAssetRequest(pathname: string): boolean {
    return /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?|ttf|map|txt|xml|json)$/i.test(pathname) ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/assets/");
}

function isAuthenticationPath(pathname: string): boolean {
    return pathname === "/sign-in" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname === "/verify-email" ||
        pathname === "/login" ||
        pathname.startsWith("/auth/");
}

async function isAdminSession(request: Request, secret: string | undefined): Promise<boolean> {
    const cookieHeader = request.headers.get("cookie") || "";
    const token = ["token", "staff_token"]
        .map((name) => cookieHeader.split(";")
            .map((part) => part.trim())
            .find((part) => part.startsWith(`${name}=`))
            ?.slice(name.length + 1))
        .find(Boolean);
    if (!token) return false;

    if (!secret) {
        console.error("[Maintenance] JWT_SECRET is missing; admin bypass is disabled.");
        return false;
    }

    try {
        const { payload } = await jwtVerify(
            decodeURIComponent(token),
            new TextEncoder().encode(secret),
        );
        return payload.role === "SUPERADMIN" || payload.role === "PLATFORM_OWNER";
    } catch {
        return false;
    }
}

async function isMaintenanceEnabled(apiBaseUrl: string): Promise<boolean> {
    try {
        const response = await fetch(`${apiBaseUrl.replace(/\/+$/, "")}/api/system/status`, {
            cache: "no-store",
        });
        if (!response.ok) {
            console.error(`[Maintenance] Status check failed with HTTP ${response.status}.`);
            return false;
        }

        const status: unknown = await response.json();
        return typeof status === "object" && status !== null &&
            "maintenance" in status && status.maintenance === true;
    } catch (error) {
        console.error("[Maintenance] Could not check the live status; continuing without the gate:", error);
        return false;
    }
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
    const url = new URL(context.request.url);
    if (isAssetRequest(url.pathname)) {
        const response = await context.next();
        if (isStaticAssetRequest(url.pathname) &&
            response.headers.get("content-type")?.toLowerCase().includes("text/html")) {
            return new Response("Not Found", {
                status: 404,
                headers: {
                    "Cache-Control": "no-store",
                    "Content-Type": "text/plain; charset=utf-8",
                },
            });
        }
        return response;
    }

    const apiBaseUrl = context.env.VITE_API_URL || "https://api.moneoez.com";

    if (await isMaintenanceEnabled(apiBaseUrl)) {
        const canLoadDuringMaintenance = url.pathname === "/maintenance" ||
            isAssetRequest(url.pathname) ||
            isAuthenticationPath(url.pathname);
        if (!canLoadDuringMaintenance &&
            !await isAdminSession(context.request, context.env.JWT_SECRET)) {
            return Response.redirect(new URL("/maintenance", url), 302);
        }
    }

    return context.next();
}
