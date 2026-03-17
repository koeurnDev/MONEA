"use client";

import { useEffect, useCallback } from "react";

// Hook-like component to track events
export function AnalyticsTracker({ weddingId }: { weddingId: string }) {
    const trackEvent = useCallback(async (type: string) => {
        try {
            await fetch("/api/wedding/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ weddingId, type })
            });
        } catch (e) {
            // Fail silently
        }
    }, [weddingId]);

    useEffect(() => {
        // Track initial view
        trackEvent("VIEW");

        // Expose trackEvent to window for global access if needed, 
        // or just use it within this component tree via context if we had one.
        (window as any).trackMoneaEvent = trackEvent;

        return () => {
            delete (window as any).trackMoneaEvent;
        };
    }, [trackEvent]);

    return null;
}
