"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { WeddingData } from "@/components/templates/types";
import { SafeBoundary } from "@/components/ui/SafeBoundary";

const KhmerLegacy = dynamic(() => import('@/components/templates/KhmerLegacy'), { ssr: false });
const AnniversaryElegant = dynamic(() => import('@/components/templates/AnniversaryElegant'), { ssr: false });
const ModernMinimal = dynamic(() => import('@/components/templates/ModernMinimal'), { ssr: false });

export default function PreviewPage() {
    const [wedding, setWedding] = useState<WeddingData | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "UPDATE_PREVIEW" && event.data.payload) {
                const cleanPayload = { ...event.data.payload };

                // Sanitize heroImage - only if it's a local relative preview path
                if (cleanPayload.themeSettings?.heroImage?.startsWith("/images/preview/")) {
                    cleanPayload.themeSettings.heroImage = "";
                }

                // Sanitize galleryItems - only if they are local relative preview paths
                if (cleanPayload.galleryItems && Array.isArray(cleanPayload.galleryItems)) {
                    cleanPayload.galleryItems = cleanPayload.galleryItems.map((item: any) => {
                        if (item.url?.startsWith("/images/preview/")) {
                            return { ...item, url: "" };
                        }
                        return item;
                    });
                }

                setWedding(cleanPayload);
            }

            if (event.data?.type === "UPDATE_PREVIEW_PARTIAL" && event.data.payload) {
                setWedding(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        themeSettings: {
                            ...(prev.themeSettings || {}),
                            ...event.data.payload
                        }
                    };
                });
            }

            if (event.data?.type === "SCROLL_TO_SECTION" && event.data.payload) {
                const sectionId = event.data.payload;
                // Force reveal any overlay for the preview so that we can scroll
                window.dispatchEvent(new CustomEvent('FORCE_REVEAL'));
                
                // Allow a small delay for the DOM to update (e.g. overflow hidden removed)
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        };

        window.addEventListener("message", handleMessage);

        // Signal parent that we are ready
        window.parent.postMessage({ type: "PREVIEW_READY" }, "*");

        return () => window.removeEventListener("message", handleMessage);
    }, []);

    if (!mounted || !wedding) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm animate-pulse font-kantumruy">
                {mounted ? "Loading Preview..." : "Initializing..."}
            </div>
        );
    }

    // If no template is selected, or if they have the legacy template which we removed, show a placeholder
    if (!wedding.templateId || wedding.templateId === 'khmer-legacy') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-400 font-kantumruy text-center p-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-2">មិនទាន់មានទិន្នន័យបង្ហាញ</p>
                <p className="text-xs leading-relaxed">សូមជ្រើសរើស Template (ទាន់សម័យ ឬ ខួបប្រណីត) <br/>ពីបញ្ជីខាងឆ្វេង ដើម្បីមើលការបង្ហាញផ្ទាល់</p>
            </div>
        );
    }

    // Always render KhmerLegacy for preview with a Safe Boundary
    return (
        <SafeBoundary name="Preview Template" isSilent={false}>
            <style>{`
                /* Hide scrollbar for mobile preview to prevent off-center layout */
                ::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }
            `}</style>
            {wedding.templateId === 'anniversary-elegant' ? (
                <AnniversaryElegant wedding={wedding} />
            ) : wedding.templateId === 'modern-minimal' ? (
                <ModernMinimal wedding={wedding} />
            ) : null}
        </SafeBoundary>
    );
}
