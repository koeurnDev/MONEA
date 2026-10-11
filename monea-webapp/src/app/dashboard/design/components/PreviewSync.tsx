import React, { useRef, useEffect, useState } from "react";
import type { WeddingData } from "@/components/templates/types";

export function PreviewSync({ wedding, iframeRef, currentStep, enableScrollSync = true }: { wedding: WeddingData | null, iframeRef: React.RefObject<HTMLIFrameElement>, currentStep: number, enableScrollSync?: boolean }) {
    const weddingRef = useRef(wedding);
    const lastPreviewSnapshotRef = useRef<string | null>(null);
    weddingRef.current = wedding;

    // Track previous templateId to detect template switches
    const prevTemplateIdRef = useRef<string | null>(null);

    // INSTANT sync when templateId changes (no debounce)
    useEffect(() => {
        const newTemplateId = wedding?.templateId || null;
        if (newTemplateId && newTemplateId !== prevTemplateIdRef.current) {
            prevTemplateIdRef.current = newTemplateId;
            if (iframeRef.current?.contentWindow && wedding) {
                iframeRef.current.contentWindow.postMessage({ type: "RESET_PREVIEW" }, "*");
                iframeRef.current.contentWindow.postMessage({ type: "UPDATE_PREVIEW", payload: wedding }, "*");
            }
        }
    }, [wedding?.templateId, wedding, iframeRef]);

    // 1. Send data when wedding changes
    useEffect(() => {
        if (!iframeRef.current?.contentWindow || !wedding) return;

        const snapshot = JSON.stringify(wedding);
        if (snapshot === lastPreviewSnapshotRef.current) return;

        lastPreviewSnapshotRef.current = snapshot;
        iframeRef.current.contentWindow.postMessage({ type: "UPDATE_PREVIEW", payload: wedding }, "*");
    }, [wedding, iframeRef]);

    // 1.5. Sync high-frequency image controls and M-05 theme controls independently.
    const lastEmit = useRef(0);
    const pendingEmit = useRef<number | null>(null);
    const lastPartialSnapshotRef = useRef<string | null>(null);
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
    const customTypographyScale = settings?.customTypographyScale;
    const customTypographyY = settings?.customTypographyY;
    const customTypographyDropShadow = settings?.customTypographyDropShadow;
    const customMonogramScale = settings?.customMonogramScale;
    const customMonogramY = settings?.customMonogramY;
    const customMonogramDropShadow = settings?.customMonogramDropShadow;
    const primaryColor = settings?.primaryColor;
    const paperTexture = settings?.paperTexture;
    const paperColor = settings?.paperColor;
    const m05ColorPreset = settings?.m05ColorPreset;
    const m05EnvelopeColor = settings?.m05EnvelopeColor;
    const m05SealColor = settings?.m05SealColor;
    const m05SurfaceColor = settings?.m05SurfaceColor;
    const m05HighlightColor = settings?.m05HighlightColor;
    const m05FoilShadeColor = settings?.m05FoilShadeColor;
    const m05PhotoTint = settings?.m05PhotoTint;
    const m05TitleFont = settings?.m05TitleFont;
    const m05NameFont = settings?.m05NameFont;

    useEffect(() => {
        if (pendingEmit.current !== null) {
            window.clearTimeout(pendingEmit.current);
            pendingEmit.current = null;
        }

        const emit = () => {
            pendingEmit.current = null;
            const now = Date.now();
            const previewWindow = iframeRef.current?.contentWindow;
            const currentWedding = weddingRef.current;
            if (!previewWindow || !currentWedding) return;

            const currentSettings = currentWedding.themeSettings as any;
            if (!currentSettings) return;

            const payload = {
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
                brideImageScale: currentSettings.brideImageScale,
                customTypographyScale: currentSettings.customTypographyScale,
                customTypographyY: currentSettings.customTypographyY,
                customTypographyDropShadow: currentSettings.customTypographyDropShadow,
                customMonogramScale: currentSettings.customMonogramScale,
                customMonogramY: currentSettings.customMonogramY,
                customMonogramDropShadow: currentSettings.customMonogramDropShadow,
                primaryColor: currentSettings.primaryColor,
                paperTexture: currentSettings.paperTexture,
                paperColor: currentSettings.paperColor,
                colorPalettePreset: currentSettings.colorPalettePreset,
                m05ColorPreset: currentSettings.m05ColorPreset,
                m05EnvelopeColor: currentSettings.m05EnvelopeColor,
                m05SealColor: currentSettings.m05SealColor,
                m05SurfaceColor: currentSettings.m05SurfaceColor,
                m05HighlightColor: currentSettings.m05HighlightColor,
                m05FoilShadeColor: currentSettings.m05FoilShadeColor,
                m05PhotoTint: currentSettings.m05PhotoTint,
                m05TitleFont: currentSettings.m05TitleFont,
                m05NameFont: currentSettings.m05NameFont
            };
            const hasPreviewControlChange = Object.values(payload).some(value => value !== undefined);
            if (!hasPreviewControlChange) return;

            const partialSnapshot = JSON.stringify(payload);
            if (partialSnapshot === lastPartialSnapshotRef.current) return;

            lastPartialSnapshotRef.current = partialSnapshot;
            previewWindow.postMessage({
                type: "UPDATE_PREVIEW_PARTIAL",
                payload
            }, "*");
            lastEmit.current = now;
        };
        const remainingDelay = 60 - (Date.now() - lastEmit.current);
        if (remainingDelay <= 0) {
            emit();
        } else {
            pendingEmit.current = window.setTimeout(emit, remainingDelay);
        }

        return () => {
            if (pendingEmit.current !== null) {
                window.clearTimeout(pendingEmit.current);
                pendingEmit.current = null;
            }
        };
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
        customTypographyScale,
        customTypographyY,
        customTypographyDropShadow,
        customMonogramScale,
        customMonogramY,
        customMonogramDropShadow,
        primaryColor,
        paperTexture,
        paperColor,
        m05ColorPreset,
        m05EnvelopeColor,
        m05SealColor,
        m05SurfaceColor,
        m05HighlightColor,
        m05FoilShadeColor,
        m05PhotoTint,
        m05TitleFont,
        m05NameFont,
        iframeRef
    ]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const iframeWindow = iframeRef.current?.contentWindow;
            const expectedOrigin = window.location.origin;
            const isTrustedPreview = event.source === iframeWindow && event.origin === expectedOrigin;

            if (!isTrustedPreview) return;

            if (event.data?.type === "PREVIEW_READY") {
                if (iframeWindow && weddingRef.current) {
                    iframeWindow.postMessage({ type: "UPDATE_PREVIEW", payload: weddingRef.current }, "*");
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [iframeRef]);

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

export function MobilePreviewWrapper({
    wedding,
    currentStep,
    onReadyChange,
}: {
    wedding: WeddingData | null;
    currentStep: number;
    onReadyChange: (ready: boolean) => void;
}) {
    const mobileIframeRef = useRef<HTMLIFrameElement>(null);
    const [previewState, setPreviewState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [reloadKey, setReloadKey] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const previewTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setPreviewState('loading');
        onReadyChange(false);
        previewTimeoutRef.current = window.setTimeout(() => setPreviewState('error'), 30000);
        return () => {
            if (previewTimeoutRef.current !== null) {
                window.clearTimeout(previewTimeoutRef.current);
                previewTimeoutRef.current = null;
            }
        };
    }, [onReadyChange, reloadKey]);

    const retryPreview = () => {
        setRetryCount((count) => count + 1);
        setReloadKey((key) => key + 1);
    };

    return (
        <div className="relative h-full w-full bg-background">
            <iframe
                key={reloadKey}
                ref={mobileIframeRef}
                src={`/preview?mode=editor&reload=${reloadKey}`}
                onLoad={() => {
                    if (previewTimeoutRef.current !== null) {
                        window.clearTimeout(previewTimeoutRef.current);
                        previewTimeoutRef.current = null;
                    }
                    setPreviewState('ready');
                    onReadyChange(true);
                    if (mobileIframeRef.current?.contentWindow && wedding) {
                        mobileIframeRef.current.contentWindow.postMessage({
                            type: "UPDATE_PREVIEW",
                            payload: wedding
                        }, "*");
                    }
                }}
                onError={() => {
                    if (retryCount < 2) {
                        onReadyChange(false);
                        window.setTimeout(retryPreview, 1000);
                    } else {
                        setPreviewState('error');
                        onReadyChange(false);
                    }
                }}
                className="h-full w-full border-none bg-background"
                title="Mobile Preview"
            />
            {previewState !== 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/95 p-6 text-center font-kantumruy">
                    {previewState === 'loading' ? (
                        <div className="space-y-3">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-500/20 border-t-teal-500" />
                            <p className="text-xs font-bold text-muted-foreground">កំពុងរៀបចំ Preview...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-foreground">Preview មិនអាចបើកបានទេ</p>
                            <p className="text-xs text-muted-foreground">សូមពិនិត្យអ៊ីនធឺណិត ហើយសាកល្បងម្តងទៀត។</p>
                            <button
                                type="button"
                                onClick={retryPreview}
                                className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white active:scale-95"
                            >
                                សាកល្បងម្តងទៀត
                            </button>
                        </div>
                    )}
                </div>
            )}
            <PreviewSync wedding={wedding} iframeRef={mobileIframeRef} currentStep={currentStep} enableScrollSync={true} />
        </div>
    );
}
