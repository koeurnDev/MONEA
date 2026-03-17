"use client";

// Forced re-compilation after cache clear
import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Smartphone, LayoutTemplate, Settings2, X, Loader2, ArrowRight, ArrowLeft, StickyNote, Save, CheckCircle2, ExternalLink } from "lucide-react";

import ImageUpload from "@/components/ui/image-upload-widget";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import Image from "next/image";
import { CldUploadWidget } from 'next-cloudinary';
import clsx from "clsx";

import Step1Template from "./components/Step1Template";
import Step2Info from "./components/Step2Info";
import Step3Time from "./components/Step3Time";
import Step4Media from "./components/Step4Media";
import Step5Extra from "./components/Step5Extra";
import { StepWizard } from "./components/StepWizard";
import { PreviewSync, MobilePreviewWrapper } from "./components/PreviewSync";
import { useDesignWizard, STEPS, PRESET_COLORS, TEMPLATE_LAYOUTS } from "./hooks/useDesignWizard";
import type { WeddingData } from "@/components/templates/types";
import { isEditingLocked } from "@/lib/permissions";
import { Lock } from "lucide-react";

export default function DesignPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest font-kantumruy">រង់ចាំបន្តិច...</p>
            </div>
        }>
            <DesignContent />
        </Suspense>
    );
}

function DesignContent() {
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

    const t = {
        title: "រចនាធៀប (Design Wizard)",
        publish: "ដាក់ឱ្យប្រើប្រាស់",
        saving: "កំពុងរក្សាទុក...",
        templates: {
            modern: { title: "សិរីមង្គលភាពយន្ត (Eternal Cinematic)", desc: "ពេញអេក្រង់, តន្ត្រី, វីដេអូ, ចលនា។" },
            khmer: { title: "រចនាប័ទ្មទស្សនាវដ្តីថ្នាក់ខ្ពស់ (Royal Editorial)", desc: "រចនាប័ទ្មប្រពៃណី, ពណ៌លឿង & ក្រហម។" },
            minimal: { title: "ភាពថ្លៃថ្នូរដ៏ស្រស់ស្អាត (Glass Sophistication)", desc: "ស្អាត, សាមញ្ញ, ផ្តោតលើអត្ថបទ។" },
            floral: { title: "ផ្កាក្រអូបនៃក្តីស្រឡាញ់ (Velvet Blossom)", desc: "ផ្កាស្រស់ស្អាត, ទន់ភ្លន់, រ៉ូមែនទិក។" },
            luxury: { title: "ប្រណិត (Luxury)", desc: "ពណ៌មាស, ខ្មៅ, គុណភាពខ្ពស់។" },
            pastel: { title: "Pastel Floral", desc: "ទន់ភ្លន់, ផ្កាស្រស់, ពណ៌ឡាវែនឌ័រ។" },
            legacy: { title: "កេរ្តិ៍តំណែលខ្មែរ (Khmer Legacy)", desc: "រចនាប័ទ្មបញ្ឈរ, ស្អាត, បែបអភិជន។" },
            visionary: { title: "ទស្សនវិជ្ជាទំនើប (Visionary Modern)", desc: "រចនាប័ទ្មអនាគត, ពណ៌ខៀវចាស់, ចលនាអស្ចារ្យ។" },
            celestial: { title: "សម្រស់ចក្រវាល (Celestial Elegance)", desc: "រចនាប័ទ្មអវកាស, ពណ៌ខ្មៅប្រណិត, ចលនាផ្កាយ។" }
        },
    };
    if (!wedding) return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest font-kantumruy">កំពុងទាញយកទិន្នន័យចំណងដៃ...</p>
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
                        <span className="text-[11px] font-bold font-kantumruy uppercase tracking-wider">រក្សាទុកបានជោគជ័យ</span>
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
            <div className="flex-none w-[400px] flex flex-col z-20 bg-card shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-none h-full">
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
                        previewMode === 'mobile' ? "w-[390px] h-[844px] rounded-[3rem]" : "w-[95%] h-[85vh] rounded-2xl"
                    )}
                >
                    <iframe
                        ref={iframeRef}
                        src="/preview"
                        className="w-full h-full border-none bg-background"
                        title="Preview"
                    />
                </div>

                <PreviewSync wedding={wedding} iframeRef={iframeRef} currentStep={currentStep} enableScrollSync={false} />

                {/* View Toggle (Desktop Only) */}
                <div className="absolute top-4 right-4 z-30 bg-card/90 backdrop-blur-sm p-1 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] gap-1 flex items-center">
                    <a
                        href={`/invite/${wedding.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300"
                        title="View Public Invitation"
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
                        title="Mobile View"
                    >
                        <Smartphone size={16} />
                    </button>
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        className={clsx(
                            "p-2 rounded-full transition-all duration-300",
                            previewMode === 'desktop' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        title="Desktop View"
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
        <div className="md:hidden fixed inset-0 w-screen h-[100dvh] z-[99999] bg-background flex flex-col overflow-hidden pt-[115px]" role="dialog" aria-label="Mobile Design Editor">
            {/* MOBILE HEADER (Fixed Top) */}
            <div className="fixed top-0 left-0 right-0 h-[115px] bg-card z-[100000] shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col">
                {/* Row 1: Dashboard Nav & Tabs */}
                <div className="flex items-center px-4 pt-10 pb-2 gap-2">
                    <Link href="/dashboard" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1 bg-muted p-1 rounded-xl flex relative h-9 font-khmer">
                        <button
                            onClick={() => setMobileTab('editor')}
                            className={clsx(
                                "flex-1 text-[10px] font-bold rounded-lg transition-all z-10 flex items-center justify-center gap-1.5",
                                mobileTab === 'editor' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Settings2 size={13} /> រចនា
                        </button>
                        <button
                            onClick={() => setMobileTab('preview')}
                            className={clsx(
                                "flex-1 text-[10px] font-bold rounded-lg transition-all z-10 flex items-center justify-center gap-1.5",
                                mobileTab === 'preview' ? "bg-background text-red-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Smartphone size={13} /> មើលមុន
                        </button>
                    </div>
                    <a
                        href={`/invite/${wedding.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 ml-1 text-muted-foreground hover:text-red-600 transition-colors"
                        title="View Public"
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>

                {/* Row 2: Step Navigation */}
                <div className="flex items-center justify-between px-4 pb-2 pt-1.5 bg-muted/40 backdrop-blur-sm font-khmer shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="text-muted-foreground hover:text-foreground h-7 px-2 text-[10px] bg-background/50 shadow-sm"
                    >
                        <ArrowLeft size={14} className="mr-1" /> ថយក្រោយ
                    </Button>

                    <span className="text-[10px] font-medium text-muted-foreground">
                        ជំហានទី {currentStep} / {STEPS.length}
                    </span>

                    {currentStep < STEPS.length ? (
                        <Button
                            size="sm"
                            onClick={nextStep}
                            className="bg-slate-900 text-white hover:bg-black h-7 px-3 rounded-full text-[10px]"
                        >
                            បន្ទាប់ <ArrowRight size={14} className="ml-1" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => saveChanges()}
                            disabled={loading}
                            className="bg-red-600 text-white hover:bg-red-700 h-7 px-3 rounded-full text-[10px]"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "បោះពុម្ពផ្សាយ"}
                        </Button>
                    )}
                </div>
            </div>

            {/* 1. EDITOR PANEL (Full Content when active) */}
            <div className={clsx(
                "flex-1 flex-col z-20 relative bg-background",
                mobileTab === 'editor' ? "flex h-full overflow-y-auto" : "hidden"
            )}>
                {/* Re-render editor panel directly. Since it's a variable, it works.
                     Note: The sticky footer inside editorPanel will appear. We should hide it on mobile via CSS
                     (which we did: 'hidden md:flex' on that footer div). */}
                {editorPanel}
            </div>

            {/* 2. PREVIEW AREA (Full Content when active) */}
            <div className={clsx(
                "flex-1 bg-muted items-center justify-center p-0 relative overflow-hidden",
                mobileTab === 'preview' ? "flex h-full" : "hidden"
            )}>
                {/* Mobile Preview Container */}
                <div className="w-full h-full bg-background relative">
                    {/* We need a second iframe reference or just render iframe.
                          Providing a new ref 'mobileIframeRef' would be better to avoid conflict if both mount.
                          But keeping it simple: render iframe. Sync will handle it if we duplicate the Sync component?
                          PreviewSync uses 'iframeRef'. We should duplicate the Sync with a NEW ref for mobile.
                       */}
                    <MobilePreviewWrapper wedding={wedding} currentStep={currentStep} />
                </div>
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
                        <h2 className="text-2xl font-black text-foreground mb-4 font-kantumruy uppercase tracking-tight">ការកែសម្រួលត្រូវបានចាក់សោ</h2>
                        <p className="text-muted-foreground mb-8 font-khmer leading-relaxed">គម្រោងឥតគិតថ្លៃ (Free Plan) របស់អ្នកបានផុតកំណត់ការកែសម្រួលរយៈពេល ៣ថ្ងៃហើយ។ សូមធ្វើការអាប់ដេតគម្រោង ដើម្បីបន្តការបង្កើតធៀបដ៏អស្ចារ្យរបស់អ្នក ឬទាក់ទងមកក្រុមការងារ MONEA ។</p>
                        <div className="flex flex-col gap-3 w-full">
                            <Button asChild className="h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-wider shadow-xl dark:bg-slate-800 dark:hover:bg-slate-700">
                                <Link href="/pricing">អាប់ដេតគម្រោងឥឡូវនេះ</Link>
                            </Button>
                            <Button variant="ghost" asChild className="h-12 rounded-2xl font-bold font-khmer">
                                <Link href="/dashboard">ត្រលប់ទៅ Dashboard</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
