import React, { useRef, useEffect, useState } from "react";
import type { WeddingData } from "@/components/templates/types";

// --- Custom Hook ---
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

export function PreviewSync({ wedding, iframeRef, currentStep, enableScrollSync = true }: { wedding: WeddingData | null, iframeRef: React.RefObject<HTMLIFrameElement>, currentStep: number, enableScrollSync?: boolean }) {
    // Debounce to prevent frequent updates while typing
    const debouncedWedding = useDebounce(wedding, 300);

    // 1. Send data when debounced wedding changes
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow && debouncedWedding) {
            iframeRef.current.contentWindow.postMessage({ type: "UPDATE_PREVIEW", payload: debouncedWedding }, "*");
        }
    }, [debouncedWedding, iframeRef]);

    // 1.5. Throttled sync for specific fields (bypass debounce but throttle to 60ms)
    const lastEmit = useRef(0);
    useEffect(() => {
        const now = Date.now();
        if (now - lastEmit.current < 60) return; // Limit to ~16fps for slider movement

        if (iframeRef.current && iframeRef.current.contentWindow && wedding) {
            const settings = wedding.themeSettings as any;
            if (settings) {
                iframeRef.current.contentWindow.postMessage({
                    type: "UPDATE_PREVIEW_PARTIAL",
                    payload: {
                        heroImagePosition: settings.heroImagePosition,
                        heroImageX: settings.heroImageX,
                        heroImageScale: settings.heroImageScale,
                        heroImageBrightness: settings.heroImageBrightness,
                        heroImageContrast: settings.heroImageContrast,
                        groomImagePosition: settings.groomImagePosition,
                        groomImageX: settings.groomImageX,
                        groomImageScale: settings.groomImageScale,
                        brideImagePosition: settings.brideImagePosition,
                        brideImageX: settings.brideImageX,
                        brideImageScale: settings.brideImageScale
                    }
                }, "*");
                lastEmit.current = now;
            }
        }
    }, [
        wedding?.themeSettings?.heroImagePosition,
        (wedding?.themeSettings as any)?.heroImageX,
        (wedding?.themeSettings as any)?.heroImageScale,
        (wedding?.themeSettings as any)?.heroImageBrightness,
        (wedding?.themeSettings as any)?.heroImageContrast,
        wedding?.themeSettings?.groomImagePosition,
        (wedding?.themeSettings as any)?.groomImageX,
        (wedding?.themeSettings as any)?.groomImageScale,
        wedding?.themeSettings?.brideImagePosition,
        (wedding?.themeSettings as any)?.brideImageX,
        (wedding?.themeSettings as any)?.brideImageScale,
        iframeRef
    ]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "PREVIEW_READY") {
                if (iframeRef.current && iframeRef.current.contentWindow && wedding) {
                    iframeRef.current.contentWindow.postMessage({ type: "UPDATE_PREVIEW", payload: wedding }, "*");
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [wedding, iframeRef]);

    // 3. Scroll Sync
    useEffect(() => {
        if (!iframeRef.current?.contentWindow || !enableScrollSync) return;

        const sectionMap: Record<number, string[]> = {
            1: ['hero'],
            2: ['hero', 'invitation-english', 'invitation-khmer'],
            3: ['hero', 'event-info', 'schedule-khmer'],
            4: ['gallery', 'dynamic-gallery'],
            5: ['sacred-bond', 'location', 'guestbook', 'footer']
        };

        const sectionIds = sectionMap[currentStep] || [];
        sectionIds.forEach(id => {
            iframeRef.current?.contentWindow?.postMessage({ type: "SCROLL_TO_SECTION", payload: id }, "*");
        });
    }, [currentStep, iframeRef, enableScrollSync]);

    return null;
}

export function MobilePreviewWrapper({ wedding, currentStep }: { wedding: WeddingData | null, currentStep: number }) {
    const mobileIframeRef = useRef<HTMLIFrameElement>(null);
    return (
        <>
            <iframe
                ref={mobileIframeRef}
                src="/preview"
                className="w-full h-full border-none bg-background"
                title="Mobile Preview"
            />
            <PreviewSync wedding={wedding} iframeRef={mobileIframeRef} currentStep={currentStep} enableScrollSync={true} />
        </>
    );
}
