import React from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Palette, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

export const StepWizard = ({ children, currentStep, onNext, onPrev, isLast, onSave, loading, setStep }: any) => {
    const { t } = useTranslation();

    const STEPS = [
        { id: 1, title: t("wizard.steps.1.title") },
        { id: 2, title: t("wizard.steps.2.title") },
        { id: 3, title: t("wizard.steps.3.title") },
        { id: 4, title: t("wizard.steps.4.title") },
        { id: 5, title: t("wizard.steps.5.title") }
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] overflow-hidden z-20 border-l dark:border-white/5">
            {/* Header */}
            <div className="p-6 pb-4 bg-white dark:bg-[#0a0a0a] border-b dark:border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-rose-500">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-kantumruy">{t("wizard.title")}</h2>
                            <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-[0.1em] font-medium">{t("wizard.designer")}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-50 dark:bg-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 border border-slate-100 dark:border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-white/60 uppercase tracking-widest">{t("wizard.liveEdit")}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Pills */}
                <div className="flex gap-2">
                    {STEPS.map((step) => (
                        <button
                            key={step.id}
                            onClick={() => setStep && setStep(step.id)}
                            disabled={loading}
                            className={clsx(
                                "grow h-1.5 rounded-full transition-all duration-500",
                                currentStep >= step.id ? "bg-rose-500" : "bg-slate-100 dark:bg-white/10"
                            )}
                            title={step.title}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-3 px-0.5 font-khmer">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{t("wizard.step")} {currentStep} / {STEPS.length}</span>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-white/30 uppercase tracking-tight">{STEPS[currentStep - 1].title}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div className="h-full w-full max-w-2xl mx-auto">
                    {children}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white dark:bg-[#0a0a0a] border-t dark:border-white/5">
                <div className="flex gap-4 font-khmer max-w-2xl mx-auto">
                    {currentStep > 1 && (
                        <Button
                            variant="ghost"
                            onClick={onPrev}
                            className="h-12 px-8 rounded-xl font-bold text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4" /> {t("common.actions.back")}
                        </Button>
                    )}
                    <Button
                        onClick={isLast ? onSave : onNext}
                        disabled={loading}
                        className={clsx(
                            "h-12 flex-1 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm",
                            isLast 
                                ? "bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-black" 
                                : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                        ) : (
                            <>
                                <span className="pt-0.5">{isLast ? t("common.actions.save") : t("common.actions.next")}</span>
                                {!isLast && <ArrowRight className="w-4 h-4" />}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
