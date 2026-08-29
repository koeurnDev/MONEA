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
        { refreshInterval: 30000 }
    );

    // Poll for new RSVP stats
    const { data: stats } = useSWR(
        weddingId ? `/api/wedding/analytics/stats?weddingId=${weddingId}` : null,
        { refreshInterval: 30000 }
    );

    // Handle Guestbook / Wish notifications
    React.useEffect(() => {
        if (wishes && Array.isArray(wishes)) {
            if (lastWishCount.current !== null && wishes.length > lastWishCount.current) {
                // Safely grab the latest wish (assuming API returns latest at index 0)
                const newWish = wishes[0];
                if (newWish) {
                    showToast({
                        title: "សារជូនពរថ្មី! (New Wish)",
                        description: `${newWish.guestName || "ភ្ញៀវកិត្តិយស"}: "${(newWish.message || "").substring(0, 50)}..."`,
                        type: "wish"
                    });
                }
            }
            lastWishCount.current = wishes.length;
        }
    }, [wishes, showToast]);

    // Handle RSVP notifications
    React.useEffect(() => {
        if (stats && typeof stats.rsvpSubmits === 'number') {
            if (lastRsvpCount.current !== null && stats.rsvpSubmits > lastRsvpCount.current) {
                showToast({
                    title: "មានការឆ្លើយតប RSVP ថ្មី!",
                    description: "មានភ្ញៀវទើបតែได้ឆ្លើយតបមកកាន់អ្នក។",
                    type: "success"
                });
            }
            lastRsvpCount.current = stats.rsvpSubmits;
        }
    }, [stats, showToast]);

    return <>{children}</>;
}