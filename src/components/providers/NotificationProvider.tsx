"use client";

import * as React from "react";
import useSWR from "swr";
import { useToast } from "@/components/ui/Toast";

export function NotificationProvider({ weddingId, children }: { weddingId: string, children: React.ReactNode }) {
    const { showToast } = useToast();
    const lastWishCount = React.useRef<number | null>(null);
    const lastRsvpCount = React.useRef<number | null>(null);

    // Poll for new guestbook entries
    const { data: wishes } = useSWR(
        weddingId ? `/api/guestbook?weddingId=${weddingId}` : null,
        { refreshInterval: 15000 }
    );

    // Poll for new RSVP stats
    const { data: stats } = useSWR(
        weddingId ? `/api/wedding/analytics/stats?weddingId=${weddingId}` : null,
        { refreshInterval: 30000 }
    );

    React.useEffect(() => {
        if (wishes && Array.isArray(wishes)) {
            if (lastWishCount.current !== null && wishes.length > lastWishCount.current) {
                const newWish = wishes[0];
                showToast({
                    title: "សារជូនពរថ្មី! (New Wish)",
                    description: `${newWish.guestName}: "${newWish.message.substring(0, 50)}..."`,
                    type: "wish"
                });
            }
            lastWishCount.current = wishes.length;
        }
    }, [wishes, showToast]);

    React.useEffect(() => {
        if (stats && typeof stats.rsvpSubmits === 'number') {
            if (lastRsvpCount.current !== null && stats.rsvpSubmits > lastRsvpCount.current) {
                showToast({
                    title: "មានការឆ្លើយតប RSVP ថ្មី!",
                    description: "មានភ្ញៀវទើបតែបានឆ្លើយតបមកកាន់អ្នក។",
                    type: "success"
                });
            }
            lastRsvpCount.current = stats.rsvpSubmits;
        }
    }, [stats, showToast]);

    return <>{children}</>;
}
