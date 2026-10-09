import React, { lazy, useEffect, useState, useCallback, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Smartphone, LayoutTemplate, Settings2, Loader2, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink, Lock, Save, Share2, Copy, CircleHelp } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SafeQRCode from "@/components/ui/SafeQRCode";
// @ts-ignore
import { Joyride, Step } from "react-joyride";
import clsx from "clsx";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useAuth } from "@/hooks/useAuth";

import { StepWizard } from "./components/StepWizard";
import { PreviewSync, MobilePreviewWrapper } from "./components/PreviewSync";
import { useDesignWizard, STEPS, PRESET_COLORS, TEMPLATE_LAYOUTS } from "./hooks/useDesignWizard";
import type { WeddingData } from "@/components/templates/types";
import { isEditingLocked } from "@/lib/permissions";

const StepSkeleton = () => <div className="h-64 rounded-2xl bg-muted animate-pulse" />;

// Lazy-load each step — only load when needed
const Step1Template = lazy(() => import("./components/Step1Template"));
const Step2Info     = lazy(() => import("./components/Step2Info"));
const Step3Time     = lazy(() => import("./components/Step3Time"));
const Step4Media    = lazy(() => import("./components/Step4Media"));
const Step5Extra    = lazy(() => import("./components/Step5Extra"));

export default function DesignPage() {
    const { t } = useTranslation();
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user?.weddingId) {
            navigate('/dashboard/create', { replace: true });
        }
    }, [isLoading, user?.weddingId, navigate]);

    return (
        <Suspense fallback={
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest font-kantumruy">{t("design.wizard.waiting")}</p>
            </div>
        }>
            <DesignContent />
        </Suspense>
    );
}

function DesignContent() {
    const { t } = useTranslation();
    const { isMobile } = useMobileDetection();
    const [isSheetOpen, setIsSheetOpen] = useState(true);
    const [isMediaUploading, setIsMediaUploading] = useState(false);
    const [copiedShareLink, setCopiedShareLink] = useState(false);
    const [copyLinkError, setCopyLinkError] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const {
        mounted,
        wedding,
        setWedding,
        loading,
        currentStep,
        setCurrentStep,
        progress,
        mobileTab,
        setMobileTab,
        previewMode,
        setPreviewMode,
        isDraggingGallery,
        setIsDraggingGallery,
        activeAccordion,
        setActiveAccordion,
        templateVersions,
        fetchingVersions,
        newVersionTitle,
        setNewVersionTitle,
        isSavingVersion,
        rollbackConfirm,
        setRollbackConfirm,
        rollbackLoading,
        deleteVersionConfirm,
        setDeleteVersionConfirm,
        saveToast,
        versionToast,
        iframeRef,
        galleryUploading,
        galleryProgress,
        loadError,
        retryLoad,
        updateWedding,
        updateTheme,
        updateLabel,
        updateParent,
        updateTemplate,
        updateEventType,
        addGalleryItem,
        removeGalleryItem,
        removeThemeAsset,
        handleGalleryDirectUpload,
        updateGalleryOrder,
        saveChanges,
        fetchVersions,
        handleSaveVersion,
        handleRollback,
        confirmRollback,
        handleDeleteVersion,
        confirmDeleteVersion,
        nextStep,
        prevStep,
        isDirty,
        lastSavedAt
    } = useDesignWizard();

    // Joyride Tour
    const [runTour, setRunTour] = useState(false);

    const tourSteps: Step[] = [
        {
            target: '.tour-step-content',
            content: 'នៅទីនេះ អ្នកអាចបំពេញ ឬកែព័ត៌មានរបស់សំបុត្រ។ ចាប់ផ្តើមពីប្រភេទកម្មវិធី និងឈ្មោះសិន។',
            placement: 'auto'
        },
        {
            target: '.tour-next',
            content: 'ចុចប៊ូតុងនេះ ដើម្បីទៅជំហានបន្ទាប់។ ជំហានដែលមានស្លាកអាចរំលងបាន មិនចាំបាច់បំពេញទាំងអស់ទេ។',
            placement: 'auto'
        },
        {
            target: '.tour-preview',
            content: 'ចុចទីនេះដើម្បីមើលលទ្ធផលពិតនៃធៀបការរបស់អ្នកទាំងលើទូរស័ព្ទនិងកុំព្យូទ័រ។',
            placement: 'auto'
        }
    ];

    const handleJoyrideCallback = (data: any) => {
        const { action, status } = data;
        if (action === "close" || status === "finished" || status === "skipped") {
            setRunTour(false);
        }
    };

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    if (!wedding && loadError) return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background px-6 text-center">
            <div role="alert" className="max-w-md space-y-3">
                <h1 className="font-kantumruy text-lg font-black text-foreground">
                    {t("design.wizard.loadErrorTitle", { defaultValue: "មិនអាចបើកទិន្នន័យធៀបបានទេ" })}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t("design.wizard.loadErrorDescription", { defaultValue: "សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត។" })}
                </p>
            </div>
            <Button onClick={() => void retryLoad()} className="font-kantumruy">
                {t("common.actions.retry", { defaultValue: "ព្យាយាមម្តងទៀត" })}
            </Button>
        </div>
    );

    if (!wedding) return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest font-kantumruy">{t("design.wizard.fetching")}</p>
        </div>
    );

    const isLocked = isEditingLocked(wedding);

    const renderStepContent = () => {
        if (!wedding) return null;
        switch (currentStep) {
            case 1:
                return <Step1Template wedding={wedding} updateEventType={updateEventType} updateTemplate={updateTemplate} packageType={wedding.packageType} />;
            case 2:
                return (
                    <Step2Info 
                        wedding={wedding} 
                        updateWedding={updateWedding} 
                        updateTheme={updateTheme} 
                        updateParent={updateParent}
                        updateLabel={updateLabel}
                    />
                );
            case 3:
                return (
                    <Step3Time
                        wedding={wedding}
                        updateWedding={updateWedding}
                        updateTheme={updateTheme}
                        setWedding={setWedding}
                    />
                );
            case 4:
                return (
                    <Step4Media
                        wedding={wedding}
                        updateTheme={updateTheme}
                        removeThemeAsset={removeThemeAsset}
                        addGalleryItem={addGalleryItem}
                        removeGalleryItem={removeGalleryItem}
                        handleGalleryDirectUpload={handleGalleryDirectUpload}
                        galleryUploading={galleryUploading}
                        galleryProgress={galleryProgress}
                        isDraggingGallery={isDraggingGallery}
                        setIsDraggingGallery={setIsDraggingGallery}
                        TEMPLATE_LAYOUTS={TEMPLATE_LAYOUTS}
                        updateGalleryOrder={updateGalleryOrder}
                        onUploadingChange={setIsMediaUploading}
                    />
                );
            case 5:
                return (
                    <Step5Extra
                        wedding={wedding}
                        updateTheme={updateTheme}
                        updateParent={updateParent}
                        updateLabel={updateLabel}
                        handleSaveVersion={handleSaveVersion}
                        handleRollback={handleRollback}
                        handleDeleteVersion={handleDeleteVersion}
                        fetchVersions={fetchVersions}
                        templateVersions={templateVersions}
                        fetchingVersions={fetchingVersions}
                        isSavingVersion={isSavingVersion}
                        newVersionTitle={newVersionTitle}
                        setNewVersionTitle={setNewVersionTitle}
                        activeAccordion={activeAccordion}
                        setActiveAccordion={setActiveAccordion}
                        PRESET_COLORS={PRESET_COLORS}
                        packageType={wedding.packageType}
                        addGalleryItem={addGalleryItem}
                        removeGalleryItem={removeGalleryItem}
                        removeThemeAsset={removeThemeAsset}
                    />
                );
            default:
                return null;
        }
    };
    const editorPanel = (
        <div className="flex-1 flex flex-col min-h-0 h-full w-full bg-card/60 backdrop-blur-md z-20 relative">
            <AnimatePresence>
                {saveToast === "success" && (
                    <m.div 
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 10, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg shadow-emerald-500/20 text-xs font-bold flex items-center gap-2 font-kantumruy"
                    >
                        <CheckCircle2 size={16} /> រក្សាទុករួចរាល់
                    </m.div>
                )}
                {saveToast && saveToast !== "success" && (
                    <m.div 
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 10, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg shadow-red-500/20 text-xs font-bold flex items-center gap-2 font-kantumruy"
                    >
                        {saveToast === "map-link-required"
                            ? t("wizard.steps.3.mapRequiredHint", { defaultValue: "ត្រូវបញ្ចូល Google Maps link មុនពេលបន្ត ឬរក្សាទុក។" })
                            : saveToast === "error"
                                ? "មិនអាចរក្សាទុកបានទេ សូមពិនិត្យមើលព័ត៌មាន (ឈ្មោះ, ថ្ងៃខែ) ឡើងវិញ"
                                : saveToast}
                    </m.div>
                )}
            </AnimatePresence>
            <StepWizard
                currentStep={currentStep}
                weddingId={wedding?.id}
                onSave={saveChanges}
                loading={loading}
                setStep={setCurrentStep}
                progress={progress}
                isDirty={isDirty}
                lastSavedAt={lastSavedAt}
                canContinue={
                    currentStep === 1
                        ? Boolean(wedding.eventType)
                        : currentStep === 2
                            ? Boolean(wedding.groomName?.trim() && wedding.brideName?.trim())
                            : currentStep >= 3
                                ? Boolean(wedding.date && wedding.location?.trim() && (wedding.themeSettings?.mapLink?.trim() || wedding.mapUrl?.trim()))
                            : true
                }
                canContinueHint={
                    currentStep === 1
                        ? "សូមជ្រើសរើសប្រភេទកម្មវិធី ដើម្បីបន្ត។"
                        : currentStep === 2 && !(wedding.groomName?.trim() && wedding.brideName?.trim())
                            ? "សូមបញ្ចូលឈ្មោះគូទាំងពីរ ដើម្បីបន្ត។"
                            : currentStep >= 3 && !(wedding.date && wedding.location?.trim())
                                ? "សូមបំពេញថ្ងៃ និងឈ្មោះទីតាំងកម្មវិធី មុនបន្ត។"
                                : currentStep >= 3 && !(wedding.themeSettings?.mapLink?.trim() || wedding.mapUrl?.trim())
                                    ? t("wizard.steps.3.mapRequiredHint", { defaultValue: "ត្រូវបញ្ចូល Google Maps link មុនពេលបន្ត ឬរក្សាទុក។" })
                            : undefined
                }
                isUploading={isMediaUploading || galleryUploading}
            >
                {renderStepContent()}
            </StepWizard>
        </div>
    );

    const shareUrl = wedding ? `${window.location.origin}/w/${wedding.id}` : "";
    const openSavedPreview = async () => {
        setPreviewError(false);
        const previewWindow = window.open("about:blank", "_blank");
        if (!previewWindow) {
            setPreviewError(true);
            return;
        }
        previewWindow.opener = null;
        try {
            const saved = await saveChanges();
            if (!saved) {
                previewWindow.close();
                return;
            }
            previewWindow.location.href = `/w/${encodeURIComponent(wedding.id)}`;
        } catch (error) {
            console.error("Failed to save before opening invitation preview:", error);
            previewWindow.close();
            setPreviewError(true);
        }
    };
    
    const ShareModal = () => (
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
            <DialogContent className="sm:max-w-md font-khmer p-6 rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-center font-black font-kantumruy">ចែករំលែកធៀបការរបស់អ្នក</DialogTitle>
                    <DialogDescription className="text-center text-xs">
                        ស្កេន QR Code ឬថតចម្លងតំណភ្ជាប់ខាងក្រោមដើម្បីផ្ញើទៅកាន់ភ្ញៀវកិត្តិយសរបស់អ្នក។
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="p-4 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        {shareUrl && <SafeQRCode value={shareUrl} size={200} fgColor="#0f172a" />}
                    </div>
                    <div className="w-full flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                        <input 
                            readOnly 
                            value={shareUrl} 
                            className="flex-1 bg-transparent border-none text-xs font-medium text-slate-500 px-3 outline-none" 
                        />
                        <Button 
                            size="sm" 
                            className="rounded-xl px-4 font-bold active:scale-95 transition-transform"
                            onClick={async () => {
                                setCopyLinkError(false);
                                try {
                                    await navigator.clipboard.writeText(shareUrl);
                                    setCopiedShareLink(true);
                                    window.setTimeout(() => setCopiedShareLink(false), 2000);
                                } catch (error) {
                                    console.error("Failed to copy invitation link:", error);
                                    setCopiedShareLink(false);
                                    setCopyLinkError(true);
                                }
                            }}
                        >
                            <Copy size={14} className="mr-2" /> {copiedShareLink ? "បានចម្លង" : "ចម្លង"}
                        </Button>
                    </div>
                    {copyLinkError && (
                        <p role="alert" className="w-full text-center text-xs text-red-600">
                            មិនអាចចម្លងតំណបានទេ។ សូមជ្រើសរើសតំណខាងលើ ហើយចម្លងដោយដៃ។
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );

    // ==========================================
    // RESPONSIVE LAYOUT ARCHITECTURE
    // ==========================================
    // The design page renders differently based on the device width.
    // 1. Desktop: Shows a side-by-side view with the editor on the left
    //    and a live preview (iframe) on the right.
    // 2. Mobile: Uses a bottom-navigation tab system to switch between
    //    the editor form and the fullscreen preview iframe.
    // 
    // Data synchronization between the Editor state and the Iframe is 
    // managed by the `<PreviewSync />` component.
    // ==========================================

    // DESKTOP LAYOUT (In-flow, managed by DashboardLayout)
    const desktopLayout = (
        <div className="hidden md:flex flex-row overflow-hidden bg-background h-full w-full">
            {/* 1. EDITOR PANEL (Left Sidebar) */}
            <div className="flex-none w-[520px] flex flex-col z-20 bg-card shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-none h-full">
                {editorPanel}
            </div>

            {/* 2. PREVIEW AREA (Right Fluid) */}
            <div className="flex-1 bg-slate-50/50 dark:bg-black/20 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
                {/* Subtle Background Accent */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px]"></div>
                </div>

                {/* Desktop Preview Container (iPhone Pro Ultra-Sleek Titanium Mockup) */}
                <div
                    className={clsx(
                        "relative z-10 transition-all duration-300 ease-in-out flex flex-col group origin-center",
                        previewMode === 'mobile' 
                            ? "h-[84vh] max-h-[820px] min-h-[580px] aspect-[393/852] max-w-[393px]" 
                            : "w-[95%] h-[82vh] rounded-2xl border-4 border-slate-900/10 dark:border-white/10 overflow-hidden bg-background shadow-2xl"
                    )}
                >
                    {previewMode === 'mobile' ? (
                        /* iPhone Pro Realistic Hardware Body */
                        <div className="relative w-full h-full p-[4px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 rounded-[3.2rem] shadow-[0_25px_70px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.15)] flex flex-col">
                            {/* Left Hardware Buttons (Action Button + Volume Up/Down) */}
                            <div className="absolute -left-[6px] top-[95px] w-[3px] h-[22px] bg-slate-600 rounded-l-sm shadow-sm" />
                            <div className="absolute -left-[6px] top-[130px] w-[3px] h-[42px] bg-slate-600 rounded-l-sm shadow-sm" />
                            <div className="absolute -left-[6px] top-[180px] w-[3px] h-[42px] bg-slate-600 rounded-l-sm shadow-sm" />

                            {/* Right Hardware Button (Power / Siri Button) */}
                            <div className="absolute -right-[6px] top-[135px] w-[3px] h-[60px] bg-slate-600 rounded-r-sm shadow-sm" />

                            {/* Inner Screen Bezel */}
                            <div className="relative w-full h-full bg-black rounded-[2.9rem] overflow-hidden flex flex-col ring-1 ring-black">
                                {/* Top Speaker Slit */}
                                <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[42px] h-[2.5px] bg-slate-800/90 rounded-full z-50 pointer-events-none" />

                                {/* Dynamic Island */}
                                <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[98px] h-[26px] bg-black rounded-full z-50 flex items-center justify-between px-2.5 shadow-md pointer-events-none">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#080812] opacity-70" />
                                    <div className="w-3 h-3 rounded-full bg-[#0a0a1a] shadow-[inset_0_0_2px_rgba(255,255,255,0.25)] flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-900/70 blur-[0.3px]" />
                                    </div>
                                </div>

                                {/* Glass Corner Glare Highlight */}
                                <div className="absolute top-0 right-0 w-[70%] h-[35%] bg-gradient-to-bl from-white/[0.04] to-transparent rounded-tr-[2.9rem] pointer-events-none z-40" />

                                {/* Iframe Content */}
                                <iframe
                                    ref={iframeRef}
                                    src="/preview?mode=editor"
                                    onLoad={() => {
                                        if (iframeRef.current?.contentWindow && wedding) {
                                            iframeRef.current.contentWindow.postMessage({ type: "UPDATE_PREVIEW", payload: wedding }, "*");
                                        }
                                    }}
                                    className="w-full h-full border-none bg-background"
                                    title={t("design.wizard.preview")}
                                />

                                {/* Bottom Home Indicator Bar */}
                                <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[120px] h-[3.5px] bg-black/40 dark:bg-white/40 rounded-full z-50 pointer-events-none backdrop-blur-sm" />
                            </div>
                        </div>
                    ) : (
                        /* Desktop Mode Direct Iframe */
                        <iframe
                            ref={iframeRef}
                            src="/preview?mode=editor"
                            onLoad={() => {
                                if (iframeRef.current?.contentWindow && wedding) {
                                    iframeRef.current.contentWindow.postMessage({ type: "UPDATE_PREVIEW", payload: wedding }, "*");
                                }
                            }}
                            className="w-full h-full border-none bg-background"
                            title={t("design.wizard.preview")}
                        />
                    )}
                </div>

                <PreviewSync wedding={wedding} iframeRef={iframeRef} currentStep={currentStep} enableScrollSync={false} />

                {/* View Toggle Toolbar (Desktop Only) */}
                <div className="absolute top-4 right-4 z-30 bg-white/95 dark:bg-[#141419]/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 dark:border-white/10 gap-1.5 flex items-center">
                    <button
                        type="button"
                        onClick={() => void openSavedPreview()}
                        disabled={isMediaUploading || galleryUploading}
                        className="p-2 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-teal-50 dark:text-slate-300 dark:hover:bg-teal-950/30 transition-all"
                        title={t("design.wizard.viewPublic", { defaultValue: "រក្សាទុក រួចមើលធៀបពេញអេក្រង់" })}
                    >
                        <ExternalLink size={16} />
                    </button>
                    {previewError && (
                        <span role="alert" className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-red-600 px-3 py-2 text-xs text-white shadow-lg">
                            មិនអាចបើកផ្ទាំងមើលបានទេ។ សូមអនុញ្ញាត pop-up ហើយព្យាយាមម្តងទៀត។
                        </span>
                    )}
                    <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
                    <button
                        onClick={() => setPreviewMode('mobile')}
                        className={clsx(
                            "p-2 rounded-xl transition-all font-bold text-xs",
                            previewMode === 'mobile' 
                                ? "bg-primary text-primary-foreground shadow-sm font-black" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        title={t("design.wizard.previewMode.mobile")}
                    >
                        <Smartphone size={16} />
                    </button>
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        className={clsx(
                            "p-2 rounded-xl transition-all font-bold text-xs",
                            previewMode === 'desktop' 
                                ? "bg-primary text-primary-foreground shadow-sm font-black" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        title={t("design.wizard.previewMode.desktop")}
                    >
                        <LayoutTemplate size={16} />
                    </button>
                    <div className="hidden md:flex items-center gap-2 px-2">
                        {/* Auto-save Indicator */}
                        <div className="flex items-center text-xs font-kantumruy font-bold text-foreground">
                            {loading ? (
                                <><Loader2 size={13} className="animate-spin text-teal-500 mr-1.5" /> <span>រក្សាទុក...</span></>
                            ) : isDirty ? (
                                <><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" /> <span className="text-amber-600 dark:text-amber-400">មិនទាន់រក្សាទុក</span></>
                            ) : (
                                <><CheckCircle2 size={14} className="text-emerald-500 mr-1.5" /> <span>រក្សាទុករួចរាល់</span></>
                            )}
                        </div>
                    </div>
                    <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
                    <button
                        onClick={() => setRunTour(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-teal-700 hover:text-teal-800 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/30 transition-all"
                        title="មើលការណែនាំ"
                        aria-label="មើលការណែនាំ"
                    >
                        <CircleHelp size={16} />
                        <span className="hidden lg:inline text-xs font-kantumruy font-semibold">របៀបប្រើ</span>
                    </button>
                    <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="p-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                        title="ចែករំលែក (Share)"
                    >
                        <Share2 size={16} />
                    </button>
                </div>
                <ShareModal />
            </div>
        </div>
    );

    // MOBILE LAYOUT (Portal to Body, Full Screen Overlay)
    const mobileLayout = mounted ? createPortal(
        <div className="md:hidden fixed inset-0 z-40 flex h-[100dvh] w-[100vw] max-w-none min-w-0 flex-col overflow-hidden bg-background" role="dialog" aria-label="Mobile Design Editor">
            {/* MOBILE HEADER — min 56px height for comfortable touch targets */}
            <div className={clsx(
                "h-[52px] bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between px-3 z-50 transition-all shadow-xs",
                isSheetOpen ? "flex-none relative" : "absolute top-0 left-0 w-full"
            )}>
                <div className="flex-1 flex justify-start items-center">
                    {isSheetOpen ? (
                        <Link to="/dashboard" aria-label="ត្រឡប់ទៅ Dashboard" className="h-9 w-9 px-2 -ml-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center justify-center rounded-xl active:bg-slate-100 dark:active:bg-white/10 active:scale-95">
                            <ArrowLeft size={18} strokeWidth={2.5} />
                        </Link>
                    ) : (
                        <button 
                            onClick={() => setIsSheetOpen(true)} 
                            className="h-10 px-3 -ml-1 text-slate-700 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-all font-bold text-sm font-kantumruy active:scale-95"
                        >
                            <ArrowLeft size={18} strokeWidth={2.5} />
                            <span>កែប្រែ</span>
                        </button>
                    )}
                </div>
                
                <div className="flex-none flex justify-center items-center">
                    <MoneaLogo size="sm" showText={true} />
                </div>
                
                <div className="flex-1 flex justify-end items-center gap-2">
                    {isSheetOpen && (
                        <button
                            onClick={() => setRunTour(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/30"
                            title="មើលការណែនាំ"
                            aria-label="មើលការណែនាំ"
                        >
                            <CircleHelp size={18} />
                        </button>
                    )}
                    {/* Auto-save Indicator (Mobile) */}
                    <div className="flex items-center justify-center h-10 px-1 text-slate-400 dark:text-slate-500" title={loading ? "កំពុងរក្សាទុក..." : isDirty ? "មិនទាន់រក្សាទុក" : "បានរក្សាទុក"}>
                        {loading ? (
                            <Loader2 size={18} className="animate-spin text-teal-500" />
                        ) : isDirty ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        ) : (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                        )}
                    </div>
                    {isSheetOpen ? (
                        <button
                            onClick={() => setIsSheetOpen(false)}
                            className="tour-preview h-9 px-2.5 text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center rounded-xl transition-all font-kantumruy font-bold text-sm gap-1.5 active:scale-95"
                            title={t("design.wizard.preview", { defaultValue: "មើលលទ្ធផល" })}
                        >
                            <ExternalLink size={16} />
                            <span>មើលគំរូ</span>
                        </button>
                    ) : (
                        <Link
                            to="/dashboard"
                            className="h-9 px-2.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center rounded-xl transition-all font-kantumruy font-bold text-sm active:scale-95"
                        >
                            រួចរាល់
                        </Link>
                    )}
                </div>
            </div>
            {/* TABS FOR MOBILE */}
            <div className="relative flex min-h-0 min-w-0 flex-1 w-full max-w-none flex-col bg-background">
                {isSheetOpen ? (
                    // EDITOR MODE
                    <div className="relative flex min-h-0 min-w-0 flex-1 w-full max-w-none flex-col">
                        <div className="flex-1 flex flex-col overflow-hidden relative">
                            {editorPanel}
                        </div>

                    </div>
                ) : (
                    // PREVIEW MODE
                    <div className="flex-1 flex flex-col bg-background relative">
                        <div className="flex-1 relative overflow-hidden">
                            <MobilePreviewWrapper wedding={wedding} currentStep={currentStep} />
                        </div>
                        {/* Preview action bar keeps the edit/finish choices visible. */}
                        <div className="absolute bottom-4 left-3 right-3 z-50 pointer-events-auto flex items-center rounded-2xl border border-white/10 bg-black/75 p-2 backdrop-blur-md">
                            <button
                                onClick={() => setIsSheetOpen(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 font-kantumruy shadow-lg active:scale-95 transition-all"
                            >
                                <Palette size={16} />
                                <span>កែប្រែ</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative h-[100dvh] w-full flex flex-col">
            {!isMobile && desktopLayout}
            {isMobile && mobileLayout}
            {mounted && <Joyride
                steps={tourSteps}
                run={runTour}
                // @ts-ignore
                callback={handleJoyrideCallback}
                continuous
                showProgress
                showSkipButton
                disableOverlayClose
                spotlightClicks={false}
                locale={{ back: 'ថយក្រោយ', close: 'បិទ', last: 'បញ្ចប់', next: 'បន្ទាប់', skip: 'រំលង' }}
                styles={{
                    floater: { zIndex: 10000 },
                    tooltip: {
                        width: 'min(320px, calc(100vw - 32px))',
                        maxWidth: 'calc(100vw - 32px)',
                        boxSizing: 'border-box'
                    }
                }}
            />}

            {isLocked && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="bg-card p-10 rounded-[3rem] shadow-2xl border-2 border-dashed border-primary/20 max-w-md w-full flex flex-col items-center">
                        <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-6">
                            <Lock className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground mb-4 font-kantumruy uppercase tracking-tight">{t("design.locked.title")}</h2>
                        <p className="text-muted-foreground mb-8 font-khmer leading-relaxed">{t("design.locked.description")}</p>
                        <div className="flex flex-col gap-3 w-full">
                            <Button asChild className="h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-wider shadow-xl dark:bg-slate-800 dark:hover:bg-slate-700">
                                <Link to="/dashboard/upgrade">{t("design.locked.updateBtn")}</Link>
                            </Button>
                            <Button variant="ghost" asChild className="h-12 rounded-2xl font-bold font-khmer">
                                <Link to="/dashboard">{t("design.locked.backBtn")}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
