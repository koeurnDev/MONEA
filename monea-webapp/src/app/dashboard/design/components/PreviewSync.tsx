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
    const settings = wedding?.themeSettings as any;
    const heroImagePosition = settings?.heroImagePosition;
    const heroImageX = settings?.heroImageX;
    const heroImageScale = settings?.heroImageScale;
    const heroImageBrightness = settings?.heroImageBrightness;
    const heroImageContrast = settings?.heroImageContrast;
    const groomImagePosition = settings?.groomImagePosition;
    const groomImageX = settings?.groomImageX;
    const groomImageScale = settings?.groomImageScale;
    const brideImagePosition = settings?.brideImagePosition;
    const brideImageX = settings?.brideImageX;
    const brideImageScale = settings?.brideImageScale;

    useEffect(() => {
        const now = Date.now();
        if (now - lastEmit.current < 60) return; // Limit to ~16fps for slider movement

        if (iframeRef.current && iframeRef.current.contentWindow && wedding) {
            const currentSettings = wedding.themeSettings as any;
            if (currentSettings) {
                iframeRef.current.contentWindow.postMessage({
                    type: "UPDATE_PREVIEW_PARTIAL",
                    payload: {
                        heroImagePosition: currentSettings.heroImagePosition,
                        heroImageX: currentSettings.heroImageX,
                        heroImageScale: currentSettings.heroImageScale,
                        heroImageBrightness: currentSettings.heroImageBrightness,
                        heroImageContrast: currentSettings.heroImageContrast,
                        groomImagePosition: currentSettings.groomImagePosition,
                        groomImageX: currentSettings.groomImageX,
                        groomImageScale: currentSettings.groomImageScale,
                        brideImagePosition: currentSettings.brideImagePosition,
                        brideImageX: currentSettings.brideImageX,
                        brideImageScale: currentSettings.brideImageScale
                    }
                }, "*");
                lastEmit.current = now;
            }
        }
    }, [
        heroImagePosition,
        heroImageX,
        heroImageScale,
        heroImageBrightness,
        heroImageContrast,
        groomImagePosition,
        groomImageX,
        groomImageScale,
        brideImagePosition,
        brideImageX,
        brideImageScale,
        iframeRef,
        wedding
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
