import React from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Palette, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
    { id: 1, title: "ជ្រើសរើសពុម្ព" },
    { id: 2, title: "ព័ត៌មានផ្ទាល់ខ្លួន" },
    { id: 3, title: "ពេលវេលា និងទីកន្លែង" },
    { id: 4, title: "រូបភាព និងវីដេអូ" },
    { id: 5, title: "ការកំណត់បន្ថែម" }
];

export const StepWizard = ({ children, currentStep, onNext, onPrev, isLast, onSave, loading, setStep }: any) => (
    <div className="flex flex-col h-full bg-card overflow-hidden z-20 shadow-[0_4px_40px_rgba(0,0,0,0.08)] dark:shadow-none">
        {/* Header */}
        <div className="p-8 pb-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none z-10 bg-card/50 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg dark:shadow-none">
                        <Palette className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight leading-none font-kantumruy">រចនាធៀប</h2>
                        <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-widest font-black">កម្មវិធីរៀបចំធៀបអាពាហ៍ពិពាហ៍</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-muted p-2 px-4 rounded-full flex items-center gap-2 shadow-inner">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">កែសម្រួលផ្ទាល់</span>
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
                            "grow h-1.5 rounded-full transition-all duration-700 hover:opacity-80 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                            currentStep >= step.id ? "bg-red-600" : "bg-muted"
                        )}
                        title={step.title}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-3 px-1 font-khmer">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">ជំហានទី {currentStep} នៃ {STEPS.length}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{STEPS[currentStep - 1].title}</span>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="h-full w-full">
                {children}
            </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-muted/40 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
            <div className="flex gap-4 font-khmer">
                {currentStep > 1 && (
                    <Button
                        variant="ghost"
                        onClick={onPrev}
                        className="h-12 px-8 rounded-xl font-bold text-muted-foreground hover:bg-background hover:text-foreground transition-all flex items-center gap-2 bg-background/50 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> ថយក្រោយ
                    </Button>
                )}
                <Button
                    onClick={isLast ? onSave : onNext}
                    disabled={loading}
                    className={clsx(
                        "h-12 flex-1 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md",
                        isLast ? "bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                    )}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                        <>
                            {isLast ? "រក្សាទុកការកែប្រែ" : "បន្ទាប់"}
                            {!isLast && <ArrowRight className="w-5 h-5" />}
                        </>
                    )}
                </Button>
            </div>
        </div>
    </div>
);
