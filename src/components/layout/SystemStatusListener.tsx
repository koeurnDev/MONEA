"use client";
import { useEffect } from "react";

/**
 * SystemStatusListener
 * 
 * Silently polls the edge network every 30 seconds to check if the platform
 * has gone into Maintenance Mode. If true, it triggers a hard reload to enforce
 * the middleware-level blockade without waiting for the user to navigate.
 */
export default function SystemStatusListener() {
    useEffect(() => {
        let isChecking = false;

        const checkStatus = async () => {
            if (isChecking) return;
            isChecking = true;
            try {
                const res = await fetch("/api/system/status", { cache: "no-store" });
                
                // Read response safely
                let isMaintenance = res.status === 503;
                if (!isMaintenance && res.ok) {
                    const data = await res.json();
                    if (data.maintenance === true) isMaintenance = true;
                }
                
                if (isMaintenance) {
                    // Purge PWA Caches before reload to guarantee we hit the edge middleware
                    if ('caches' in window) {
                        try {
                            const keys = await caches.keys();
                            await Promise.all(keys.map(key => caches.delete(key)));
                        } catch(e) {}
                    }
                    window.location.reload();
                    return;
                }
            } catch (e) {
                // Middleware interception or network offline
            } finally {
                isChecking = false;
            }
        };

        const interval = setInterval(checkStatus, 30000); // Poll every 30s
        
        // Instant check when user tabs back into the app
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") checkStatus();
        };
        
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return null;
}
