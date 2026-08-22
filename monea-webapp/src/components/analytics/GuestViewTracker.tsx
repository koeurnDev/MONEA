"use client";

import { useEffect } from "react";

export function GuestViewTracker({ weddingId, guestId, guestName }: { weddingId: string, guestId?: string, guestName?: string }) {
    useEffect(() => {
        const recordView = async () => {
            try {
                // If we have guestId, use it directly
                // If not, we could search by name, but safer to just use guestId if provided in link
                if (guestId) {
                    await fetch("/api/guests/view", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ guestId })
                    });
                }
            } catch (error) {
                console.error("View tracking failed", error);
            }
        };

        recordView();
    }, [guestId]);

    return null; // Silent component
}
