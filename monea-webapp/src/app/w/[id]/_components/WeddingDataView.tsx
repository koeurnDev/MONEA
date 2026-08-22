"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const KhmerLegacy = dynamic(() => import("@/components/templates/KhmerLegacy"), {
    loading: () => <div className="min-h-screen bg-[#FDFBF7] animate-pulse" />
});

const AnniversaryElegant = dynamic(() => import("@/components/templates/AnniversaryElegant"), {
    loading: () => <div className="min-h-screen bg-[#FDFBF7] animate-pulse" />
});

const ModernMinimal = dynamic(() => import("@/components/templates/ModernMinimal"), {
    loading: () => <div className="min-h-screen bg-[#FDFBF7] animate-pulse" />
});

const FloatingRSVP = dynamic(() => import("./FloatingRSVP").then(mod => mod.FloatingRSVP), {
    ssr: false
});

type PublicWeddingData = {
    id: string;
    groomName: string;
    brideName: string;
    date: Date | string;
    location: string | null;
    eventType: string;
    templateId: string | null;
    themeSettings: any;
    activities: any[];
    galleryItems: any[];
};

export default function WeddingDataView({ id, template, guestId }: { id: string; template?: string; guestId?: string }) {
    const [wedding, setWedding] = useState<PublicWeddingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchWedding() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://monea-api.seabkoeurn64.workers.dev';
                const res = await fetch(`${apiUrl}/api/wedding/${id}`, {
                    credentials: 'include',
                });
                
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Wedding not found');
                        return;
                    }
                    throw new Error('Failed to fetch wedding');
                }
                
                const data = await res.json();
                setWedding(data);
            } catch (e) {
                console.error("[WeddingDataView] Fetch error:", e);
                setError('Failed to load wedding');
            } finally {
                setLoading(false);
            }
        }
        
        fetchWedding();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-[#FDFBF7] animate-pulse" />;
    }

    if (error || !wedding) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Wedding Not Found</h1>
                    <p className="text-gray-600">{error || 'This wedding may not exist or has been removed.'}</p>
                </div>
            </div>
        );
    }

    // Parse theme settings
    let themeSettings: any = {};
    try {
        if (typeof wedding.themeSettings === 'string') {
            themeSettings = JSON.parse(wedding.themeSettings);
        } else if (wedding.themeSettings) {
            themeSettings = wedding.themeSettings;
        }
    } catch (e) {
        console.error("Failed to parse themeSettings", e);
    }

    const rsvpEnabled = themeSettings.rsvpEnabled !== false;

    const weddingForTemplate = {
        ...wedding,
        eventType: wedding.eventType as "wedding" | "anniversary",
        guestId
    };

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            {wedding.templateId === 'anniversary-elegant' ? (
                <AnniversaryElegant wedding={weddingForTemplate} />
            ) : wedding.templateId === 'modern-minimal' ? (
                <ModernMinimal wedding={weddingForTemplate} guestName={guestId ? "Guest" : undefined} />
            ) : (
                <KhmerLegacy wedding={weddingForTemplate} guestName={guestId ? "Guest" : undefined} />
            )}

            {rsvpEnabled && (
                <FloatingRSVP weddingId={id} guestId={guestId} />
            )}
        </main>
    );
}