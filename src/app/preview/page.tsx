"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { WeddingData } from "@/components/templates/types";

const KhmerLegacy = dynamic(() => import('@/components/templates/KhmerLegacy'), { ssr: false });
const VIPPremiumKhmer = dynamic(() => import('@/components/templates/VIPPremiumKhmer'), { ssr: false });

export default function PreviewPage() {
    const [wedding, setWedding] = useState<WeddingData | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "UPDATE_PREVIEW" && event.data.payload) {
                const cleanPayload = { ...event.data.payload };

                // Sanitize heroImage
                if (cleanPayload.themeSettings?.heroImage?.includes("/preview")) {
                    cleanPayload.themeSettings.heroImage = "";
                }

                // Sanitize galleryItems
                if (cleanPayload.galleryItems && Array.isArray(cleanPayload.galleryItems)) {
                    cleanPayload.galleryItems = cleanPayload.galleryItems.map((item: any) => {
                        if (item.url?.includes("/preview")) {
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

    if (!wedding) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm animate-pulse">
                Loading Preview...
            </div>
        );
    }

    // 4. Render Selected Template with real-time data
    switch (wedding.templateId) {
        case 'khmer-legacy':
            return <KhmerLegacy wedding={wedding} />;
        case 'vip-premium-khmer':
            return <VIPPremiumKhmer wedding={wedding} />;
        default:
            return <VIPPremiumKhmer wedding={wedding} />;
    }
}
