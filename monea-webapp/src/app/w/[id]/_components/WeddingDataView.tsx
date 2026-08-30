import React, { Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getApiUrl } from "@/lib/api-url";
import { getTemplateComponent } from "@/components/templates";

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
                const res = await fetch(getApiUrl(`api/wedding/${id}`), {
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
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
                    <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl font-black">
                        404
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-3 font-kantumruy tracking-tight">រកមិនឃើញទំព័រនេះទេ</h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed font-kantumruy mb-8">
                        ទំព័រដែលអ្នកកំពុងស្វែងរកប្រហែលជាត្រូវបានលុប ប្ដូរឈ្មោះ ឬមិនមានតាំងពីដំបូង។
                    </p>
                    <a href="/" className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl font-kantumruy shadow-xl shadow-slate-900/20 transition-all active:scale-95">
                        ត្រឡប់ទៅទំព័រដើម
                    </a>
                </div>
            </div>
        );
    }

    if (!wedding.templateId) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                        🎨
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-3 font-kantumruy tracking-tight">សំបុត្រមិនទាន់រួចរាល់ទេ</h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed font-kantumruy mb-8">
                        សូមបងធ្វើការរចនា (Design) Template សម្រាប់សំបុត្រអញ្ជើញជាមុនសិន។ សូមចុចប៊ូតុងខាងក្រោម៖
                    </p>
                    <a href="/dashboard/design" className="inline-flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 px-6 rounded-2xl font-kantumruy shadow-xl shadow-rose-600/20 transition-all active:scale-95">
                        ទៅកាន់ការរចនាឥឡូវនេះ
                    </a>
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

    let parsedActivities = wedding.activities || [];
    if (typeof parsedActivities === 'string') {
        try { parsedActivities = JSON.parse(parsedActivities); } catch (e) { parsedActivities = []; }
    }

    let parsedGalleryItems = wedding.galleryItems || [];
    if (typeof parsedGalleryItems === 'string') {
        try { parsedGalleryItems = JSON.parse(parsedGalleryItems); } catch (e) { parsedGalleryItems = []; }
    }
    if (themeSettings.galleryItems && Array.isArray(themeSettings.galleryItems)) {
        parsedGalleryItems = themeSettings.galleryItems;
    }

    const rsvpEnabled = themeSettings.rsvpEnabled !== false;

    const weddingForTemplate = {
        ...wedding,
        themeSettings: themeSettings,
        activities: parsedActivities,
        galleryItems: parsedGalleryItems,
        eventType: (wedding.eventType || "wedding") as "wedding" | "anniversary",
        guestId
    };

    const shareTitle = `${wedding.groomName || 'កូនកំលោះ'} & ${wedding.brideName || 'កូនក្រមុំ'} - អាពាហ៍ពិពាហ៍ | MONEA`;
    const shareDesc = `សូមគោរពអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ ${wedding.date ? 'នៅថ្ងៃ ' + new Date(wedding.date).toLocaleDateString('km-KH', { dateStyle: 'full' }) : ''}`;
    const heroImg = themeSettings?.heroImage || (parsedGalleryItems[0]?.url || '/og-image.jpg');

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            <Helmet>
                <title>{shareTitle}</title>
                <meta name="description" content={shareDesc} />
                <meta property="og:title" content={shareTitle} />
                <meta property="og:description" content={shareDesc} />
                <meta property="og:image" content={heroImg} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={shareTitle} />
                <meta name="twitter:description" content={shareDesc} />
                <meta name="twitter:image" content={heroImg} />
            </Helmet>
            <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] animate-pulse" />}>
                {(() => {
                    const SelectedTemplate = getTemplateComponent(template || wedding.templateId || "khmer-legacy");
                    return <SelectedTemplate wedding={weddingForTemplate as any} guestName={guestId ? "Guest" : undefined} />;
                })()}
            </Suspense>
        </main>
    );
}