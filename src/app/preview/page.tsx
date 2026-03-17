"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { WeddingData } from "@/components/templates/types";
import { SafeBoundary } from "@/components/ui/SafeBoundary";

const KhmerLegacy = dynamic(() => import('@/components/templates/KhmerLegacy'), { ssr: false });

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
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
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

    // Always render KhmerLegacy for preview with a Safe Boundary
    return (
        <SafeBoundary name="Preview Template" isSilent={false}>
            <KhmerLegacy wedding={wedding} />
        </SafeBoundary>
    );
}
