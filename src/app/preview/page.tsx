"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { WeddingData } from "@/components/templates/types";

const ClassicKhmer = dynamic(() => import("@/components/templates/ClassicKhmer"));
const ModernMinimal = dynamic(() => import("@/components/templates/ModernMinimal"));
const ModernFullTemplate = dynamic(() => import("@/components/templates/ModernFullTemplate"));
const FloralElegant = dynamic(() => import("@/components/templates/FloralElegant"));
const CanvaInvitation = dynamic(() => import("@/components/templates/CanvaInvitation"));
const EnchantedGarden = dynamic(() => import("@/components/templates/EnchantedGarden"));
const LuxuryGoldTemplate = dynamic(() => import("@/components/templates/LuxuryGoldTemplate"));
const PastelFloralTemplate = dynamic(() => import("@/components/templates/PastelFloralTemplate"));
const KhmerLegacy = dynamic(() => import("@/components/templates/KhmerLegacy"));

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

    const id = wedding.templateId || "modern-full";
    switch (id) {
        case "classic-khmer":
            return <ClassicKhmer wedding={wedding} />;
        case "modern-minimal":
            return <ModernMinimal wedding={wedding} />;
        case "floral-elegant":
        case "elegant-pink":
            return <FloralElegant wedding={wedding} />;
        case "canva-style":
            return <CanvaInvitation wedding={wedding} />;
        case "enchanted-garden":
            return <EnchantedGarden wedding={wedding} />;
        case "luxury-gold":
            return <LuxuryGoldTemplate wedding={wedding} />;
        case "pastel-floral":
            return <PastelFloralTemplate wedding={wedding} />;
        case "khmer-legacy":
            return <KhmerLegacy wedding={wedding} />;
        case "modern-full":
            return <ModernFullTemplate wedding={wedding} />;
        default:
            return <ModernFullTemplate wedding={wedding} />;
    }
}
