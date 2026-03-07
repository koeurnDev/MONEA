"use client";

import { useEffect } from "react";

export function AnalyticsTracker({ weddingId }: { weddingId: string }) {
    useEffect(() => {
        const recordView = async () => {
            try {
                await fetch("/api/wedding/analytics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ weddingId, type: "VIEW" })
                });
            } catch (e) {
                // Fail silently to not disrupt user experience
            }
        };

        recordView();
    }, [weddingId]);

    return null;
}
