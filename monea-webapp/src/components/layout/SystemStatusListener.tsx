import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getApiUrl } from "@/lib/api-url";
import { notifyNetworkError } from "@/lib/network-errors";

const allowedPaths = [
    "/maintenance",
    "/sign-in",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/login",
    "/admin",
    "/auth",
    "/api/system/status",
];

function isAllowedPath(pathname: string) {
    return allowedPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * SystemStatusListener
 * 
 * Silently polls the edge network every 30 seconds to check if the platform
 * has gone into Maintenance Mode. If true, it triggers a hard reload to enforce
 * the middleware-level blockade without waiting for the user to navigate.
 */
export default function SystemStatusListener() {
    const { pathname } = useLocation();

    useEffect(() => {
        let isChecking = false;
        const publicPaths = ["/", "/templates", "/contact", "/support", "/privacy-policy", "/terms-and-conditions", "/khmer-digital-wedding-invitation"];

        const checkStatus = async () => {
            if (isChecking) return;
            isChecking = true;
            try {
                if (isAllowedPath(pathname) || publicPaths.includes(pathname)) {
                    return;
                }

                const res = await fetch(getApiUrl("/system/status"), {
                    cache: "no-store",
                    credentials: "include",
                });

                let isMaintenance = res.status === 503;
                if (!isMaintenance) {
                    if (!res.ok) {
                        throw new Error(`Status check failed with HTTP ${res.status}`);
                    }
                    const data: unknown = await res.json();
                    if (typeof data !== "object" || data === null || !("maintenance" in data) || typeof data.maintenance !== "boolean") {
                        throw new Error("Status check returned an invalid response");
                    }
                    isMaintenance = data.maintenance;
                }

                if (isMaintenance) {
                    window.location.replace('/maintenance');
                    return;
                }
            } catch (error) {
                console.error("[SystemStatusListener] Could not check maintenance status:", error);
                notifyNetworkError(error);
            } finally {
                isChecking = false;
            }
        };

        const initialCheck = window.setTimeout(() => { void checkStatus(); }, 2000);
        const interval = setInterval(checkStatus, 60000); // Poll every 60s

        // Instant check when user tabs back into the app
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") checkStatus();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearTimeout(initialCheck);
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pathname]);

    return null;
}
