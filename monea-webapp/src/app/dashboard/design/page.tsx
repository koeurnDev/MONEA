"use client";

// Forced re-compilation after cache clear
import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Smartphone, LayoutTemplate, Settings2, Loader2, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink, Lock } from "lucide-react";

import Image from "next/image";
import clsx from "clsx";
import { useTranslation } from "@/i18n/LanguageProvider";

import dynamic from "next/dynamic";

const StepSkeleton = () => <div className="h-64 rounded-2xl bg-muted animate-pulse" />;

// Lazy-load each step — only load when needed
const Step1Template = dynamic(() => import("./components/Step1Template"), { loading: StepSkeleton });
const Step2Info     = dynamic(() => import("./components/Step2Info"),     { loading: StepSkeleton });
const Step3Time     = dynamic(() => import("./components/Step3Time"),     { loading: StepSkeleton });
const Step4Media    = dynamic(() => import("./components/Step4Media"),    { loading: StepSkeleton });
const Step5Extra    = dynamic(() => import("./components/Step5Extra"),    { loading: StepSkeleton });
import { StepWizard } from "./components/StepWizard";
import { PreviewSync, MobilePreviewWrapper } from "./components/PreviewSync";
import { useDesignWizard, STEPS, PRESET_COLORS, TEMPLATE_LAYOUTS } from "./hooks/useDesignWizard";
import type { WeddingData } from "@/components/templates/types";
import { isEditingLocked } from "@/lib/permissions";

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
    const {
        mounted,
        wedding,
        setWedding,
        loading,
        currentStep,
        setCurrentStep,
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
        <div className="flex-1 flex flex-col min-h-0 bg-card/60 backdrop-blur-md z-20 relative">
            <AnimatePresence>
                {saveToast === "success" && (
                    <m.div 
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 10, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="absolute top-0 left-1/2 z-50 flex items-center gap-2 px-4 py-1.5 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/30"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[11px] font-bold font-kantumruy uppercase tracking-wider">{t("design.success")}</span>
                    </m.div>
                )}
            </AnimatePresence>
            <StepWizard
                currentStep={currentStep}
                onNext={nextStep}
                onPrev={prevStep}
                isLast={currentStep === STEPS.length}
                onSave={saveChanges}
                loading={loading}
                setStep={setCurrentStep}
            >
                {renderStepContent()}
            </StepWizard>
        </div>
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
            <div className="flex-1 bg-background flex items-center justify-center p-12 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 dark:bg-red-950/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-slate-100 dark:bg-slate-950/20 rounded-full blur-[100px]"></div>
                </div>

                {/* Desktop Preview Container */}
                <div
                    className={clsx(
                        "relative z-10 bg-background overflow-hidden transition-all duration-300 ease-in-out flex flex-col group origin-center shadow-[0_32px_120px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_120px_-20px_rgba(0,0,0,0.6)]",
                        previewMode === 'mobile' 
                            ? "h-[88vh] max-h-[844px] min-h-[650px] aspect-[390/844] rounded-[3rem] border-[10px] border-slate-900 dark:border-slate-800 ring-4 ring-slate-900/20 dark:ring-white/10" 
                            : "w-[95%] h-[85vh] rounded-2xl border-4 border-slate-900/5 dark:border-white/5"
                    )}
                >
                    {/* Device Notch / Dynamic Island (iPhone Pro Max Style) */}
                    <AnimatePresence>
                        {previewMode === 'mobile' && (
                            <m.div 
                                initial={{ y: -20, x: "-50%", opacity: 0 }}
                                animate={{ y: 0, x: "-50%", opacity: 1 }}
                                exit={{ y: -20, x: "-50%", opacity: 0 }}
                                className="absolute top-[1.5%] left-1/2 w-[32%] aspect-[3.5/1] bg-black rounded-full z-50 flex items-center justify-end px-[5%] shadow-sm pointer-events-none"
                            >
                                {/* Realistic single camera lens on the right side */}
                                <div className="w-3.5 h-3.5 rounded-full bg-[#0a0a1a] shadow-[inset_0_0_3px_rgba(255,255,255,0.15)] flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40 blur-[0.5px]"></div>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>

                    <iframe
                        ref={iframeRef}
                        src="/preview"
                        className="w-full h-full border-none bg-background"
                        title={t("design.wizard.preview")}
                    />
                </div>

                <PreviewSync wedding={wedding} iframeRef={iframeRef} currentStep={currentStep} enableScrollSync={false} />

                {/* View Toggle (Desktop Only) */}
                <div className="absolute top-4 right-4 z-30 bg-card/90 backdrop-blur-sm p-1 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] gap-1 flex items-center">
                    <a
                        href="/preview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300"
                        title={t("design.wizard.viewPublic") || "Open Fullscreen Preview"}
                    >
                        <ExternalLink size={16} />
                    </a>
                    <div className="w-[1px] h-4 bg-muted mx-0.5" />
                    <button
                        onClick={() => setPreviewMode('mobile')}
                        className={clsx(
                            "p-2 rounded-full transition-all duration-300",
                            previewMode === 'mobile' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        title={t("design.wizard.previewMode.mobile")}
                    >
                        <Smartphone size={16} />
                    </button>
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        className={clsx(
                            "p-2 rounded-full transition-all duration-300",
                            previewMode === 'desktop' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        title={t("design.wizard.previewMode.desktop")}
                    >
                        <LayoutTemplate size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    // MOBILE LAYOUT (Portal to Body, Full Screen Overlay)
    // Only render if mounted and on mobile (we use CSS md:hidden on the wrapper to handle resizing)
    const mobileLayout = mounted ? createPortal(
        <div className="md:hidden fixed inset-0 w-screen h-[100dvh] z-[99999] bg-background flex flex-col overflow-hidden pt-[75px]" role="dialog" aria-label="Mobile Design Editor">
            {/* MOBILE HEADER (Fixed Top) */}
            <div className="fixed top-0 left-0 right-0 h-[75px] bg-card z-[100000] shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-end pb-3">
                {/* Row 1: Dashboard Nav & Tabs */}
                <div className="flex items-center px-4 gap-2">
                    <Link href="/dashboard" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1 bg-muted/80 p-1.5 rounded-[14px] flex relative h-10 font-khmer shadow-inner border border-slate-200/60 dark:border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setMobileTab('editor')}
                            className={clsx(
                                "flex-1 text-[11px] font-bold rounded-[10px] transition-all duration-300 z-10 flex items-center justify-center gap-1.5",
                                mobileTab === 'editor' ? "bg-background text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Settings2 size={14} /> {t("design.wizard.editor")}
                        </button>
                        <button
                            onClick={() => setMobileTab('preview')}
                            className={clsx(
                                "flex-1 text-[11px] font-bold rounded-[10px] transition-all duration-300 z-10 flex items-center justify-center gap-1.5",
                                mobileTab === 'preview' ? "bg-background text-red-600 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Smartphone size={13} /> {t("design.wizard.preview")}
                        </button>
                    </div>
                    <a
                        href={`/invite/${wedding.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 ml-1 text-muted-foreground hover:text-red-600 transition-colors"
                        title={t("design.wizard.viewPublic")}
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* 1. EDITOR PANEL (Full Content when active) */}
            <div className={clsx(
                "flex-1 flex-col z-20 relative bg-background",
                mobileTab === 'editor' ? "flex h-full overflow-y-auto pb-[80px]" : "hidden"
            )}>
                {editorPanel}
            </div>

            {/* 2. PREVIEW AREA (Full Content when active) */}
            <div className={clsx(
                "flex-1 bg-muted items-center justify-center p-0 relative overflow-hidden",
                mobileTab === 'preview' ? "flex h-full" : "hidden"
            )}>
                <div className="w-full h-full bg-background relative">
                    <MobilePreviewWrapper wedding={wedding} currentStep={currentStep} />
                </div>
            </div>

            {/* MOBILE FOOTER (Fixed Bottom - Step Navigation) */}
            <div className={clsx(
                "fixed bottom-0 left-0 right-0 h-[65px] bg-card z-[100000] border-t dark:border-white/5 flex items-center justify-between px-4 font-khmer shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform duration-300",
                mobileTab === 'preview' ? "translate-y-full" : "translate-y-0"
            )}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={clsx(
                        "h-10 px-4 rounded-xl text-[11px] transition-all font-bold",
                        currentStep === 1
                            ? "opacity-30 cursor-not-allowed text-muted-foreground"
                            : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20"
                    )}
                >
                    <ArrowLeft size={16} className="mr-2" /> {t("design.wizard.back")}
                </Button>

                <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                    {t("design.wizard.step", { current: currentStep, total: STEPS.length })}
                </span>

                {currentStep < STEPS.length ? (
                    <Button
                        size="sm"
                        onClick={nextStep}
                        className="bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 h-10 px-5 rounded-xl text-[11px] font-bold shadow-md"
                    >
                        {t("design.wizard.next")} <ArrowRight size={16} className="ml-2" />
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={() => saveChanges()}
                        disabled={loading}
                        className="bg-red-600 text-white hover:bg-red-700 h-10 px-5 rounded-xl text-[11px] font-bold shadow-md"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("design.publish")}
                    </Button>
                )}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative h-[calc(100vh)] w-full overflow-hidden flex flex-col">
            {desktopLayout}
            {mobileLayout}

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
                                <Link href="/dashboard/upgrade">{t("design.locked.updateBtn")}</Link>
                            </Button>
                            <Button variant="ghost" asChild className="h-12 rounded-2xl font-bold font-khmer">
                                <Link href="/dashboard">{t("design.locked.backBtn")}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
