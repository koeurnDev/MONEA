import React from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Type, LayoutTemplate, Image as ImageIcon, Settings, Clock, ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

export const StepWizard = ({ children, currentStep, onSave, loading, setStep, progress }: any) => {
    const { t } = useTranslation();

    const STEPS = [
        { id: 1, title: t("wizard.steps.1.navTitle", { defaultValue: "គំរូធៀប" }), fullName: t("wizard.steps.1.header", { defaultValue: "ជ្រើសរើស Template" }), icon: LayoutTemplate },
        { id: 2, title: t("wizard.steps.2.navTitle", { defaultValue: "ព័ត៌មាន" }), fullName: t("wizard.steps.2.header", { defaultValue: "ព័ត៌មានផ្ទាល់ខ្លួន" }), icon: Type },
        { id: 3, title: t("wizard.steps.3.navTitle", { defaultValue: "កាលបរិច្ឆេទ" }), fullName: t("wizard.steps.3.header", { defaultValue: "កាលបរិច្ឆេទ & ទីតាំង" }), icon: Clock },
        { id: 4, title: t("wizard.steps.4.navTitle", { defaultValue: "រូបថត" }), fullName: t("wizard.steps.4.header", { defaultValue: "វិចិត្រសាលរូបភាព" }), icon: ImageIcon },
        { id: 5, title: t("wizard.steps.5.navTitle", { defaultValue: "ការកំណត់" }), fullName: t("wizard.steps.5.header", { defaultValue: "ការកំណត់កម្រិតខ្ពស់" }), icon: Settings }
    ];

    const currentStepObj = STEPS.find(s => s.id === currentStep) || STEPS[0];
    const CurrentIcon = currentStepObj.icon;

    return (
        <div className="flex h-full w-full bg-white dark:bg-[#141419] overflow-hidden z-20">
            {/* Left Vertical Sub-Navigation Rail (Desktop Only) */}
            <div className="hidden md:flex w-[82px] flex-none border-r border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#101014] flex-col items-center py-5 gap-3 z-30">
                {/* Brand / Logo Top Anchor */}
                <div 
                    className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-2 shadow-sm border border-rose-500/20"
                    title="MONEA Design Studio"
                >
                    <Sparkles className="w-5 h-5" />
                </div>
                
                {/* Step Buttons */}
                <div className="flex-1 w-full flex flex-col items-center gap-2">
                    {STEPS.map((step) => {
                        const isActive = currentStep === step.id;
                        const isPassed = currentStep > step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setStep && setStep(step.id)}
                                className={clsx(
                                    "flex flex-col items-center justify-center w-[68px] h-[64px] rounded-2xl transition-all duration-200 gap-1.5 px-1 outline-none relative",
                                    isActive 
                                        ? "bg-white dark:bg-white/10 text-rose-600 dark:text-rose-400 shadow-sm border border-rose-500/30 font-black scale-102 ring-2 ring-rose-500/10" 
                                        : isPassed
                                            ? "text-slate-600 dark:text-white/70 hover:bg-slate-200/50 dark:hover:bg-white/5"
                                            : "text-slate-400 dark:text-white/40 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-white"
                                )}
                                title={step.fullName}
                            >
                                <step.icon className={clsx("w-5 h-5 transition-transform", isActive ? "stroke-[2.5] scale-105" : "stroke-2")} />
                                <span className="text-[10px] font-bold font-kantumruy text-center leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full">
                                    {step.title}
                                </span>
                                {isPassed && !isActive && (
                                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-20 bg-white dark:bg-[#141419]">
                {/* Header (Desktop) */}
                <div className="hidden md:flex flex-none px-6 py-4 border-b border-slate-200/80 dark:border-white/10 items-center justify-between bg-white/80 dark:bg-[#141419]/80 backdrop-blur-md sticky top-0 z-30">
                    <div>
                        <h2 className="text-lg font-bold text-foreground tracking-tight font-kantumruy">
                            {currentStepObj.fullName}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                                ជំហានទី {currentStep} / {STEPS.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mobile Step Header Banner */}
                <div className="flex md:hidden flex-none px-3.5 py-2.5 bg-slate-50/90 dark:bg-[#121216] border-b border-slate-200/80 dark:border-white/10 items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-none font-bold border border-rose-500/20 shadow-xs">
                            <CurrentIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xs font-bold text-foreground font-kantumruy truncate leading-tight">
                                {currentStepObj.fullName}
                            </h2>
                            <p className="text-[10px] font-semibold text-muted-foreground font-kantumruy">
                                ជំហានទី {currentStep} នៃ {STEPS.length}
                            </p>
                        </div>
                    </div>

                    {/* Quick step jump indicators on mobile header */}
                    <div className="flex items-center gap-1 flex-none pl-2">
                        {STEPS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStep && setStep(s.id)}
                                className={clsx(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    currentStep === s.id
                                        ? "w-5 bg-rose-500"
                                        : currentStep > s.id
                                            ? "w-2 bg-emerald-500"
                                            : "w-2 bg-slate-200 dark:bg-white/20"
                                )}
                                title={s.title}
                                aria-label={`Step ${s.id}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 scrollbar-hide bg-slate-50/30 dark:bg-[#101014]/50 relative overscroll-contain">
                    <div className="w-full max-w-xl mx-auto pb-4 sm:pb-6 space-y-5 sm:space-y-6">
                        {children}

                        {/* Mobile in-flow Action Navigation */}
                        <div className="flex md:hidden items-center justify-between pt-4 pb-2 border-t border-slate-200/80 dark:border-white/10 gap-2.5">
                            {currentStep > 1 ? (
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setStep && setStep(currentStep - 1);
                                    }}
                                    className="flex-1 rounded-xl h-11 font-bold font-kantumruy text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 active:scale-95 transition-all shadow-xs"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    {t("common.actions.back", { defaultValue: "ថយក្រោយ" })}
                                </Button>
                            ) : null}

                            {currentStep < STEPS.length ? (
                                <Button 
                                    onClick={() => {
                                        onSave && onSave(undefined, { silent: true });
                                        setStep && setStep(currentStep + 1);
                                    }}
                                    className="flex-1 rounded-xl h-11 font-bold font-kantumruy text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <span>{t("common.actions.next", { defaultValue: "បន្តទៅមុខ" })}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={onSave}
                                    disabled={loading}
                                    className="flex-1 rounded-xl h-11 font-bold font-kantumruy text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{t("common.actions.save", { defaultValue: "រក្សាទុក" })}</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Sticky Footer Navigation Buttons (Desktop Only) */}
                <div className="hidden md:flex flex-none items-center justify-between border-t border-slate-200/80 dark:border-white/10 p-4 px-6 bg-white dark:bg-[#141419] z-30 shadow-sm">
                    {currentStep > 1 ? (
                        <Button 
                            variant="outline" 
                            onClick={() => setStep && setStep(currentStep - 1)}
                            className="rounded-xl px-5 h-11 font-bold font-kantumruy text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            {t("common.actions.back", { defaultValue: "ថយក្រោយ" })}
                        </Button>
                    ) : <div />}

                    {currentStep < STEPS.length ? (
                        <Button 
                            onClick={() => {
                                onSave && onSave(undefined, { silent: true });
                                setStep && setStep(currentStep + 1);
                            }}
                            className="rounded-xl px-6 h-11 font-bold font-kantumruy text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                            <span>{t("common.actions.next", { defaultValue: "បន្តទៅមុខ" })}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={onSave}
                            disabled={loading}
                            className="rounded-xl px-6 h-11 font-bold font-kantumruy text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{t("common.actions.save", { defaultValue: "រក្សាទុក" })}</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

