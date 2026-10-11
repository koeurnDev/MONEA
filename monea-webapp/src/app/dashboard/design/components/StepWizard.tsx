import React from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Type, LayoutTemplate, Image as ImageIcon, Settings, Clock, ArrowLeft, ArrowRight, Sparkles, Check, PartyPopper, Globe } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

export const StepWizard = ({ children, currentStep, weddingId, onSave, loading, setStep, progress, isDirty, lastSavedAt, canContinue = true, canContinueHint, isUploading = false }: any) => {
    const { t } = useTranslation();

    const STEPS = [
        { id: 1, title: t("wizard.steps.1.navTitle", { defaultValue: "គំរូធៀប" }), fullName: t("wizard.steps.1.header", { defaultValue: "ជ្រើសរើស Template" }), guide: "ជ្រើសរើសរូបរាងធៀបដែលអ្នកចូលចិត្ត។", icon: LayoutTemplate, required: true },
        { id: 2, title: t("wizard.steps.2.navTitle", { defaultValue: "ព័ត៌មាន" }), fullName: t("wizard.steps.2.header", { defaultValue: "ព័ត៌មានផ្ទាល់ខ្លួន" }), guide: "បញ្ចូលឈ្មោះគូស្នេហ៍ និងព័ត៌មានសំខាន់ៗ។", icon: Type, required: true },
        { id: 3, title: t("wizard.steps.3.navTitle", { defaultValue: "ថ្ងៃ និងទីតាំង" }), fullName: t("wizard.steps.3.header", { defaultValue: "ថ្ងៃ និងទីតាំងកម្មវិធី" }), guide: "បំពេញថ្ងៃ និងទីតាំងកម្មវិធី។", icon: Clock, required: true },
        { id: 4, title: t("wizard.steps.4.navTitle", { defaultValue: "រូបភាព" }), fullName: t("wizard.steps.4.header", { defaultValue: "បន្ថែមរូបភាព និងឯកសារ (អាចរំលងបាន)" }), guide: "បន្ថែមរូបភាពសម្រាប់បង្ហាញក្នុងធៀប។", icon: ImageIcon, required: false },
        { id: 5, title: t("wizard.steps.5.navTitle", { defaultValue: "រចនា" }), fullName: t("wizard.steps.5.header", { defaultValue: "រចនា និងព័ត៌មានបន្ថែម (អាចរំលងបាន)" }), guide: "កែសម្រួលរចនា និងព័ត៌មានបន្ថែមតាម template ដែលបានជ្រើស។", icon: Settings, required: false }
    ];

    const currentStepObj = STEPS.find(s => s.id === currentStep) || STEPS[0];
    const nextStepObj = STEPS.find(s => s.id === currentStep + 1);
    const CurrentIcon = currentStepObj.icon;
    const mobileStepTitles = [
        t("wizard.steps.1.mobileTitle", { defaultValue: "គំរូ" }),
        t("wizard.steps.2.mobileTitle", { defaultValue: "ព័ត៌មានគូ" }),
        t("wizard.steps.3.navTitle", { defaultValue: "ថ្ងៃ និងទីតាំង" }),
        t("wizard.steps.4.mobileTitle", { defaultValue: "រូបភាព" }),
        t("wizard.steps.5.mobileTitle", { defaultValue: "រចនា" }),
    ];
    const [savingNext, setSavingNext] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);

    const saveState = loading
        ? { label: "កំពុងរក្សាទុក", tone: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" }
        : isDirty
            ? { label: "មានការកែប្រែមិនទាន់រក្សាទុក", tone: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" }
            : { label: "ការកែប្រែបានរក្សាទុក", tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" };

    const handleNext = async () => {
        if (isUploading || savingNext) return;
        if (onSave) {
            setSavingNext(true);
            try {
                const saved = await onSave(undefined, { silent: true });
                if (saved !== false && setStep) {
                    setStep(currentStep + 1);
                }
            } finally {
                setSavingNext(false);
            }
        } else if (setStep) {
            setStep(currentStep + 1);
        }
    };

    const handleFinalSave = async () => {
        if (!onSave || isUploading) return;
        setSavingNext(true);
        try {
            const saved = await onSave();
            if (saved !== false) {
                setShowSuccess(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D4AF37', '#10B981', '#F43F5E']
                });
            }
        } finally {
            setSavingNext(false);
        }
    };

    return (
        <div className="flex h-full w-full bg-white dark:bg-[#141419] overflow-hidden z-20">
            {/* Left Vertical Sub-Navigation Rail (Desktop Only) */}
            <div className="hidden md:flex w-[72px] flex-none border-r border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#101014] flex-col items-center py-4 gap-2 z-30">
                <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 ring-1 ring-teal-500/20">
                    <Sparkles className="h-4 w-4" />
                </div>

                <div className="flex-1 w-full flex flex-col items-center gap-1.5">
                    {STEPS.map((step) => {
                        const isActive = currentStep === step.id;
                        const isPassed = currentStep > step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => {
                                    if (step.id <= currentStep) setStep && setStep(step.id);
                                }}
                                disabled={step.id > currentStep}
                                className={clsx(
                                    "relative flex h-[58px] w-[58px] flex-col items-center justify-center rounded-xl transition-all duration-200 outline-none",
                                    isActive
                                        ? "bg-white text-teal-600 shadow-sm ring-1 ring-teal-500/25 dark:bg-white/10 dark:text-teal-400"
                                        : isPassed
                                            ? "text-slate-600 hover:bg-slate-200/60 dark:text-white/70 dark:hover:bg-white/5"
                                            : "cursor-not-allowed text-slate-300 dark:text-white/20"
                                )}
                                title={step.fullName}
                            >
                                <step.icon className={clsx("h-4 w-4 transition-transform", isActive ? "scale-105 stroke-[2.5]" : "stroke-2")} />
                                <span className="mt-1 text-[9px] font-black leading-none tracking-tight">
                                    {step.id}
                                </span>
                                {isPassed && !isActive && (
                                    <div className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-20 bg-white dark:bg-[#141419]">
                {/* Header (Desktop) */}
                <div className="hidden md:flex flex-none items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 py-3 backdrop-blur-md dark:border-white/10 dark:bg-[#141419]/80 sticky top-0 z-30">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-600">
                            <CurrentIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-black text-foreground font-kantumruy">
                                {currentStepObj.fullName}
                            </h2>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Step {currentStep} / {STEPS.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={clsx("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold", saveState.tone)}>
                            {loading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : isDirty ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            ) : (
                                <Check className="h-3 w-3" />
                            )}
                            <span>{saveState.label}</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Step Header Banner (cleaner, less noisy) */}
                <div className="sticky top-0 z-20 flex flex-none items-center justify-between border-b border-slate-200/80 bg-[#121418] px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.08)] md:hidden">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-500">
                            <CurrentIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-black leading-tight text-white font-kantumruy">
                                {mobileStepTitles[currentStep - 1] || currentStepObj.title}
                            </h2>
                            <p className="text-[10px] font-medium text-slate-400">
                                {currentStep}/{STEPS.length}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span
                            className={clsx(
                                "flex h-7 w-7 items-center justify-center rounded-full",
                                loading || isDirty ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                            )}
                            title={saveState.label}
                        >
                            {loading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isDirty ? (
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            ) : (
                                <Check className="h-3.5 w-3.5" />
                            )}
                        </span>
                    </div>
                </div>

                {/* Main Content with visible subtle scrollbar */}
                <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-5 md:p-6 bg-slate-50/30 dark:bg-[#101014]/50 relative overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(156,163,175,0.4)_transparent]">
                    <div className="tour-step-content w-full max-w-[420px] mx-auto pb-[calc(env(safe-area-inset-bottom)+7rem)] sm:pb-8 space-y-3 sm:space-y-5">
                        {children}

                        {/* Mobile in-flow Action Navigation */}
                        <div className="sticky bottom-0 z-30 -mx-2.5 flex flex-col md:hidden items-center justify-between gap-2.5 border-t border-slate-200/80 bg-slate-50/95 px-2.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 backdrop-blur-sm dark:border-white/10 dark:bg-[#101014]/95">
                            {!canContinue && canContinueHint && (
                                <p role="status" className="w-full text-center text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                                    {canContinueHint}
                                </p>
                            )}
                            <div className="flex w-full items-center justify-between gap-2.5">
                            {currentStep > 1 ? (
                                <Button
                                    variant="outline" 
                                    onClick={() => {
                                        setStep && setStep(currentStep - 1);
                                    }}
                                    disabled={savingNext || loading || isUploading}
                                    className="h-11 flex-1 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm transition-all active:scale-95 dark:border-white/10 dark:bg-[#1a1d22] dark:text-slate-200"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    {t("common.actions.back", { defaultValue: "ថយ" })}
                                </Button>
                            ) : null}

                            {currentStep < STEPS.length ? (
                                <Button 
                                    onClick={handleNext}
                                    disabled={savingNext || loading || isUploading || !canContinue}
                                    className="tour-next h-11 flex-1 rounded-xl bg-teal-600 text-xs font-black text-white shadow-md shadow-teal-600/20 transition-all active:scale-95 hover:bg-teal-700"
                                >
                                    {savingNext ? (
                                        <span className="flex items-center justify-center gap-1.5">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>រក្សាទុក...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1.5">
                                            <span>បន្ទាប់{nextStepObj ? `: ${nextStepObj.title}` : ""}</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleFinalSave}
                                    disabled={loading || savingNext || isUploading || !canContinue}
                                    className="h-11 flex-1 rounded-xl bg-emerald-600 text-xs font-black text-white shadow-md shadow-emerald-500/20 transition-all active:scale-95 hover:bg-emerald-700"
                                >
                                    {savingNext ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    <span className="ml-1.5">{t("common.actions.save", { defaultValue: "រក្សាទុក" })}</span>
                                </Button>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Sticky Footer Navigation Buttons (Desktop Only) */}
                <div className="hidden md:flex flex-none items-center justify-between border-t border-slate-200/80 dark:border-white/10 p-4 px-6 bg-white dark:bg-[#141419] z-30 shadow-sm">
                    <div className="flex items-center gap-2">
                    {currentStep > 1 ? (
                        <Button 
                            variant="outline" 
                            onClick={() => setStep && setStep(currentStep - 1)}
                            disabled={savingNext || loading || isUploading}
                            className="rounded-xl px-5 h-11 font-bold font-kantumruy text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            {t("common.actions.back", { defaultValue: "ថយក្រោយ" })}
                        </Button>
                    ) : <div />}
                    {!canContinue && canContinueHint && (
                        <p role="status" className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            {canContinueHint}
                        </p>
                    )}
                    </div>

                    {currentStep < STEPS.length ? (
                        <div className="flex flex-col items-end gap-1">
                            <Button
                                onClick={handleNext}
                                disabled={savingNext || loading || isUploading || !canContinue}
                                className="tour-next rounded-xl px-6 h-11 font-bold font-kantumruy text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                {savingNext ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        <span>រក្សាទុក...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>បន្ទាប់{nextStepObj ? `: ${nextStepObj.title}` : ""}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            onClick={handleFinalSave}
                            disabled={loading || savingNext || isUploading || !canContinue}
                            className="rounded-xl px-6 h-11 font-bold font-kantumruy text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                            {savingNext ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{t("common.actions.save", { defaultValue: "រក្សាទុក" })}</span>
                        </Button>
                    )}
                </div>
            </div>

            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#141419] border-0 shadow-2xl rounded-3xl overflow-hidden p-0">
                    <div className="bg-gradient-to-b from-emerald-500/10 to-transparent pt-10 pb-8 px-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5 shadow-inner">
                            <PartyPopper className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogHeader className="space-y-2 mb-6 w-full">
                            <DialogTitle className="text-xl sm:text-2xl font-black text-foreground font-kantumruy text-center uppercase tracking-wider">
                                {t("design.success.title", { defaultValue: "រក្សាទុករួចរាល់!" })}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground font-kantumruy text-sm max-w-xs mx-auto text-center">
                                {t("design.success.description", { defaultValue: "ព័ត៌មានរបស់អ្នកត្រូវបានរក្សាទុកដោយជោគជ័យ។ អ្នកអាចត្រឡប់ទៅផ្ទាំងគ្រប់គ្រងដើមវិញបាន។" })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex w-full flex-col gap-3">
                            {weddingId && (
                                <Button asChild className="h-12 w-full rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-700/20 transition-all hover:bg-teal-800 active:scale-95">
                                    <Link to={`/w/${encodeURIComponent(weddingId)}`} target="_blank" rel="noopener noreferrer">
                                        <Globe className="mr-2 h-4 w-4" />
                                        {t("design.success.viewInvitation", { defaultValue: "មើលធៀបសាធារណៈ" })}
                                    </Link>
                                </Button>
                            )}
                            <Button asChild className="h-12 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                <Link to="/dashboard">{t("design.success.backToDashboard", { defaultValue: "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង ដើម្បីមើលធៀបពេលក្រោយ" })}</Link>
                            </Button>
                            <Button variant="ghost" onClick={() => setShowSuccess(false)} className="h-12 w-full rounded-2xl font-bold font-kantumruy text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                {t("common.actions.continueEditing", { defaultValue: "កែប្រែបន្ត" })}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
