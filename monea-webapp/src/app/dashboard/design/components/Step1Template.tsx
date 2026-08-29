import React from 'react';
import { m } from 'framer-motion';
import clsx from 'clsx';
// next/image replaced with <img>;
import { Check, Palette } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { WeddingData } from '@/components/templates/types';

interface Step1TemplateProps {
    wedding: WeddingData;
    updateEventType: (type: 'wedding' | 'anniversary') => void;
    updateTemplate: (templateId: string) => void;
    packageType?: string | null;
}

const TEMPLATES = [
    { code: "M-01", id: "khmer-legacy", title: "M-01", categories: ['wedding'], bgClass: "bg-amber-50", textClass: "text-amber-800", image: "/images/bg_staircase.jpg", isFree: false, comingSoon: false },
    { code: "M-02", id: "modern-minimal", title: "M-02", categories: ['wedding'], bgClass: "bg-slate-100", textClass: "text-slate-800", image: "/images/bg_tunnel.webp", isFree: false, comingSoon: false },
    { code: "M-03", id: "anniversary-elegant", title: "M-03", categories: ['anniversary'], bgClass: "bg-purple-50", textClass: "text-purple-800", image: "/assets/anniversary-elegant/anniversary-elegant-bg.webp", isFree: false, comingSoon: false },
];

const Step1Template: React.FC<Step1TemplateProps> = ({ wedding, updateEventType, updateTemplate, packageType }) => {
    const { t } = useTranslation();
    const isFreePlan = !packageType || packageType === "FREE";

    const handleSwitchEventType = (type: 'wedding' | 'anniversary') => {
        updateEventType(type);
        if (type === 'anniversary') {
            updateTemplate('anniversary-elegant');
        } else if (type === 'wedding' && wedding.templateId === 'anniversary-elegant') {
            updateTemplate('khmer-legacy');
        }
    };

    const handleSelectTemplate = (tmpl: any) => {
        updateTemplate(tmpl.id);
    };

    return (
        <div className="space-y-10">
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Palette className="w-12 h-12 text-slate-800 dark:text-white" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white font-kantumruy mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
                    {t("wizard.steps.1.header")}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-white/50 leading-relaxed font-medium">
                    {t("wizard.steps.1.description")}
                </p>
            </div>

            <div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 relative">
                <button
                    onClick={() => handleSwitchEventType('wedding')}
                    className={clsx(
                        "relative px-6 py-3.5 rounded-xl transition-all duration-300 font-kantumruy font-black text-xs md:text-sm tracking-wide",
                        wedding.eventType === 'wedding' 
                            ? "bg-white dark:bg-white/10 text-foreground shadow-sm translate-y-[-1px]" 
                            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                >
                    {t("wizard.steps.1.wedding")}
                </button>
                <button
                    onClick={() => handleSwitchEventType('anniversary')}
                    className={clsx(
                        "relative px-6 py-3.5 rounded-xl transition-all duration-300 font-kantumruy font-black text-xs md:text-sm tracking-wide",
                        wedding.eventType === 'anniversary' 
                            ? "bg-white dark:bg-white/10 text-foreground shadow-sm translate-y-[-1px]" 
                            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                >
                    {t("wizard.steps.1.anniversary")}
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-[11px] font-black uppercase text-slate-400 dark:text-white/30 tracking-[0.2em] ml-2">
                        {t("wizard.steps.1.popularTemplates", { defaultValue: "Templates" })}
                    </Label>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {TEMPLATES.filter(t => t.categories.includes(wedding.eventType || 'wedding')).map((tmpl, idx) => {
                        const isSelected = wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'khmer-legacy');

                        return (
                            <m.div
                                key={tmpl.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                onClick={() => !tmpl.comingSoon && handleSelectTemplate(tmpl)}
                                className={clsx(
                                    "rounded-[1.75rem] p-3.5 sm:p-4 transition-all duration-300 relative overflow-hidden border-2",
                                    tmpl.comingSoon 
                                        ? "cursor-not-allowed opacity-60 bg-slate-50 dark:bg-white/5 border-transparent grayscale" 
                                        : "cursor-pointer group",
                                    isSelected
                                        ? "border-slate-900 bg-slate-50/70 dark:border-white dark:bg-white/10 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/10 -translate-y-0.5"
                                        : "border-slate-200/70 dark:border-white/10 bg-white dark:bg-card hover:bg-slate-50/50 hover:border-slate-400/50 hover:shadow-md hover:-translate-y-0.5"
                                )}
                            >
                                <div className="flex items-center gap-4 sm:gap-6">
                                    {/* Template Thumbnail Image */}
                                    <div className="w-24 sm:w-28 md:w-24 aspect-[2/3] bg-slate-100 rounded-2xl overflow-hidden relative shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0 border border-slate-200/50">
                                        {tmpl.image ? (
                                            <img
                                                src={tmpl.image}
                                                alt={tmpl.title} 
                                                className="w-full h-full object-cover"
                                                loading="eager"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Palette size={28} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Template Code & Badges */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className={clsx(
                                                "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-wider font-mono shadow-sm transition-colors",
                                                isSelected 
                                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                                                    : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white group-hover:bg-slate-900 group-hover:text-white"
                                            )}>
                                                {tmpl.code}
                                            </span>
                                            {tmpl.isFree && !tmpl.comingSoon && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 text-[10px] font-black uppercase tracking-wider">
                                                    {t("common.labels.free")}
                                                </span>
                                            )}
                                            {tmpl.comingSoon && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                                    Coming Soon
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selected Checkmark */}
                                    {isSelected && (
                                        <m.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full p-2 shadow-md shadow-slate-900/20 mr-2 shrink-0"
                                        >
                                            <Check size={16} strokeWidth={3.5} />
                                        </m.div>
                                    )}
                                </div>
                            </m.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step1Template);
