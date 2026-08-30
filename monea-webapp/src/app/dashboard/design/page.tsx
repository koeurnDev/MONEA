import React, { lazy, useEffect, useState, useCallback, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Smartphone, LayoutTemplate, Settings2, Loader2, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink, Lock, Type, Clock, Image as ImageIcon, Settings, Save, Share2, Copy } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import SafeQRCode from "@/components/ui/SafeQRCode";
import confetti from "canvas-confetti";
// @ts-ignore
import { Joyride, Step } from "react-joyride";
import clsx from "clsx";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useMobileDetection } from "@/hooks/useMobileDetection";

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
        prevStep
    } = useDesignWizard();

    // Confetti effect when progress hits 100%
    const [hasFiredConfetti, setHasFiredConfetti] = useState(false);
    useEffect(() => {
        if (progress === 100 && !hasFiredConfetti) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f43f5e', '#ec4899', '#f9a8d4', '#ffffff'] // Rose/Pink themed
            });
            setHasFiredConfetti(true);
        }
    }, [progress, hasFiredConfetti]);

    // Joyride Tour
    const [runTour, setRunTour] = useState(false);
    useEffect(() => {
        if (mounted && !localStorage.getItem("monea-tour-seen")) {
            setRunTour(true);
        }
    }, [mounted]);

    const tourSteps: Step[] = [
        {
            target: '.tour-preview',
            content: 'ចុចទីនេះដើម្បីមើលលទ្ធផលពិតនៃធៀបការរបស់អ្នកទាំងលើទូរស័ព្ទនិងកុំព្យូទ័រ។',
            placement: 'bottom'
        }
    ];

    const handleJoyrideCallback = (data: any) => {
        const { status } = data;
        if (status === "finished" || status === "skipped") {
            setRunTour(false);
            localStorage.setItem("monea-tour-seen", "true");
        }
    };

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
                        addGalleryItem={addGalleryItem}
                        removeGalleryItem={removeGalleryItem}
                    />
                );
            case 3:
                return (
                    <Step3Time 
                        wedding={wedding} 
                        updateWedding={updateWedding} 
                        updateTheme={updateTheme} 
                        setWedding={setWedding} 
                        addGalleryItem={addGalleryItem}
                        removeGalleryItem={removeGalleryItem}
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
                        {saveToast === "error" 
                            ? "មិនអាចរក្សាទុកបានទេ សូមពិនិត្យមើលព័ត៌មាន (ឈ្មោះ, ថ្ងៃខែ) ឡើងវិញ"
                            : saveToast}
                    </m.div>
                )}
            </AnimatePresence>
            <StepWizard currentStep={currentStep} onSave={saveChanges} loading={loading} setStep={setCurrentStep} progress={progress}>
                {renderStepContent()}
            </StepWizard>
        </div>
    );

    const shareUrl = wedding ? `https://monea.app/invite/${wedding.id}` : "";
    
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
                            onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                // could use a local toast here if needed
                            }}
                        >
                            <Copy size={14} className="mr-2" /> ចម្លង
                        </Button>
                    </div>
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
        <div className="hidden md:flex flex-row overflow-hidden bg-background h-screen w-full">
            {/* 1. EDITOR PANEL (Left Sidebar) */}
            <div className="flex-none w-[520px] flex flex-col z-20 bg-card shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-none h-full">
                {editorPanel}
            </div>

            {/* 2. PREVIEW AREA (Right Fluid) */}
            <div className="flex-1 bg-slate-50/50 dark:bg-black/20 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
                {/* Subtle Background Accent */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[120px]"></div>
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
                                    src="/preview"
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
                            src="/preview"
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
                    <a
                        href="/preview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-300 dark:hover:bg-rose-950/30 transition-all"
                        title={t("design.wizard.viewPublic", { defaultValue: "មើលពេញអេក្រង់ (Open Fullscreen)" })}
                    >
                        <ExternalLink size={16} />
                    </a>
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
                                <><Loader2 size={13} className="animate-spin text-rose-500 mr-1.5" /> <span>រក្សាទុក...</span></>
                            ) : (
                                <><CheckCircle2 size={14} className="text-emerald-500 mr-1.5" /> <span>រក្សាទុករួចរាល់</span></>
                            )}
                        </div>
                    </div>
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
            {mounted && <Joyride 
                steps={tourSteps} 
                run={runTour} 
                // @ts-ignore
                callback={handleJoyrideCallback}
                continuous 
                showProgress 
                showSkipButton 
                locale={{ back: 'ថយក្រោយ', close: 'បិទ', last: 'បញ្ចប់', next: 'បន្ទាប់', skip: 'រំលង' }}
            />}
        </div>
    );

    // MOBILE LAYOUT (Portal to Body, Full Screen Overlay)
    const mobileLayout = mounted ? createPortal(
        <div className="md:hidden fixed inset-0 w-screen h-[100dvh] z-[99999] bg-background flex flex-col overflow-hidden" role="dialog" aria-label="Mobile Design Editor">
            {/* MOBILE HEADER */}
            <div className={clsx(
                "h-[48px] bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between px-3 z-50 transition-all shadow-xs",
                isSheetOpen ? "flex-none relative" : "absolute top-0 left-0 w-full"
            )}>
                <div className="flex-1 flex justify-start items-center">
                    {isSheetOpen ? (
                        <Link to="/dashboard" className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1">
                            <ArrowLeft size={20} strokeWidth={2.5} />
                            <span className="text-xs font-bold font-kantumruy">Dashboard</span>
                        </Link>
                    ) : (
                        <button 
                            onClick={() => setIsSheetOpen(true)} 
                            className="px-2.5 py-1 text-slate-700 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 rounded-full flex items-center gap-1.5 transition-all font-bold text-xs font-kantumruy active:scale-95"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                            <span>កែសម្រួល</span>
                        </button>
                    )}
                </div>
                
                <div className="flex-none flex justify-center items-center scale-95">
                    <MoneaLogo size="sm" showText={true} />
                </div>
                
                <div className="flex-1 flex justify-end items-center gap-1.5 pr-0.5">
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 h-8 w-8 flex items-center justify-center rounded-full transition-all"
                        title="ចែករំលែក (Share)"
                    >
                        <Share2 size={15} />
                    </button>
                    {isSheetOpen ? (
                        <button
                            onClick={() => setIsSheetOpen(false)}
                            className="tour-preview text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 h-8 px-2.5 flex items-center justify-center rounded-full transition-all font-kantumruy font-bold text-xs gap-1 active:scale-95"
                            title={t("design.wizard.preview", { defaultValue: "មើលលទ្ធផល" })}
                        >
                            <ExternalLink size={14} />
                            <span>មើលគំរូ</span>
                        </button>
                    ) : (
                        <Link
                            to="/dashboard"
                            className="text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 h-8 px-2.5 flex items-center justify-center rounded-full transition-all font-kantumruy font-bold text-xs"
                        >
                            រួចរាល់
                        </Link>
                    )}
                    {/* Auto-save Indicator (Mobile) */}
                    <div className="flex items-center justify-center h-8 pl-1 text-slate-400 dark:text-slate-500">
                        {loading ? <Loader2 size={16} className="animate-spin text-rose-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                </div>
            </div>
            {/* Progress Bar */}
            <div className={clsx(
                "h-1 w-full bg-slate-100 dark:bg-white/5 relative overflow-hidden z-50 transition-all",
                isSheetOpen ? "flex-none" : "absolute top-[48px] left-0 w-full"
            )}>
                <div className="absolute top-0 left-0 h-full bg-rose-500 transition-all duration-500 rounded-r-full" style={{ width: `${progress}%` }} />
            </div>

            {/* TABS FOR MOBILE */}
            <div className="flex-1 flex flex-col min-h-0 bg-background relative">
                {isSheetOpen ? (
                    // EDITOR MODE
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        <div className="flex-1 flex flex-col overflow-hidden relative">
                            {editorPanel}
                        </div>

                        {/* Floating Quick Preview Button in Mobile Editor Mode */}
                        <div className="absolute bottom-[72px] right-3 z-40 pointer-events-auto">
                            <button
                                onClick={() => setIsSheetOpen(false)}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 font-bold text-xs font-kantumruy rounded-full shadow-xl shadow-black/25 backdrop-blur-md active:scale-95 transition-all border border-white/20"
                            >
                                <ExternalLink size={14} />
                                <span>មើលគំរូ (Preview)</span>
                            </button>
                        </div>

                        {/* BOTTOM TABS FOR EDITOR */}
                        <div className="flex-none min-h-[64px] pb-[env(safe-area-inset-bottom,8px)] pt-1.5 bg-card border-t border-slate-200/80 dark:border-white/10 flex items-center justify-around px-2 font-khmer shadow-[0_-10px_30px_rgba(0,0,0,0.08)] gap-1">
                            {[1,2,3,4,5].map((stepId) => {
                                const stepTitles = ["ទម្រង់", "ព័ត៌មាន", "ពេលវេលា", "រូបភាព", "ការកំណត់"];
                                const icons = [LayoutTemplate, Type, Clock, ImageIcon, Settings];
                                const Icon = icons[stepId - 1];
                                return (
                                    <button
                                        key={stepId}
                                        onClick={() => setCurrentStep(stepId)}
                                        className={clsx(
                                            "flex-1 flex flex-col items-center justify-center h-[52px] rounded-xl transition-all duration-200 gap-1 active:scale-95",
                                            currentStep === stepId
                                                ? "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-xs border border-rose-200/60 dark:border-rose-500/30 font-bold" 
                                                : "text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <Icon className={clsx("w-5 h-5", currentStep === stepId ? "stroke-[2.5]" : "stroke-2")} />
                                        <span className="text-[10px] font-bold font-kantumruy leading-none tracking-wide">{stepTitles[stepId - 1]}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    // PREVIEW MODE
                    <div className="flex-1 flex flex-col bg-background relative">
                        <div className="flex-1 relative overflow-hidden">
                            <MobilePreviewWrapper wedding={wedding} currentStep={currentStep} />
                        </div>
                        {/* Floating Edit Button in Preview Mode */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                            <button
                                onClick={() => setIsSheetOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm font-kantumruy rounded-full shadow-2xl active:scale-95 transition-all border border-white/20"
                            >
                                <Palette size={16} />
                                <span>ត្រឡប់ទៅកែប្រែវិញ (Edit)</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative h-[calc(100vh)] w-full overflow-hidden flex flex-col">
            {!isMobile && desktopLayout}
            {isMobile && mobileLayout}

            {isLocked && (
                <div className="absolute inset-0 z-[100001] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
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
