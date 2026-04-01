"use client";
import React from 'react';
import { m } from 'framer-motion';
import clsx from 'clsx';
import Image from 'next/image';
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
    { id: "khmer-legacy", title: "កេរ្តិ៍តំណែលខ្មែរ (Legacy)", categories: ['wedding', 'anniversary'], bgClass: "bg-stone-50", textClass: "text-stone-600", image: "/assets/khmer-legacy/legacy-preview-clean.png", isFree: true },
];

const Step1Template: React.FC<Step1TemplateProps> = ({ wedding, updateEventType, updateTemplate, packageType }) => {
    const { t } = useTranslation();
    const isFreePlan = !packageType || packageType === "FREE";

    const handleSelectTemplate = (tmpl: any) => {
        updateTemplate(tmpl.id);
    };

    return (
        <div className="space-y-10">
            <div className="bg-rose-50/50 dark:bg-rose-500/5 p-6 rounded-3xl border border-rose-100/50 dark:border-rose-500/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Palette className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white font-kantumruy mb-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {t("wizard.steps.1.header")}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-white/50 leading-relaxed font-medium">
                    {t("wizard.steps.1.description")}
                </p>
            </div>

            <div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 relative">
                <button
                    onClick={() => updateEventType('wedding')}
                    className={clsx(
                        "relative px-6 py-3.5 rounded-xl transition-all duration-500 font-kantumruy font-black text-xs md:text-sm tracking-wide overflow-hidden",
                        wedding.eventType === 'wedding' 
                            ? "bg-white dark:bg-white/10 text-rose-500 shadow-md translate-y-[-1px]" 
                            : "text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60"
                    )}
                >
                    {t("wizard.steps.1.wedding")}
                </button>
                <button
                    onClick={() => updateEventType('anniversary')}
                    className={clsx(
                        "relative px-6 py-3.5 rounded-xl transition-all duration-500 font-kantumruy font-black text-xs md:text-sm tracking-wide overflow-hidden",
                        wedding.eventType === 'anniversary' 
                            ? "bg-white dark:bg-white/10 text-rose-500 shadow-md translate-y-[-1px]" 
                            : "text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60"
                    )}
                >
                    {t("wizard.steps.1.anniversary")}
                </button>
            </div>

            <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase text-slate-400 dark:text-white/30 tracking-[0.2em] ml-2">{t("wizard.steps.1.popularTemplates")}</Label>
                <div className="grid grid-cols-1 gap-4">
                    {TEMPLATES.map((tmpl, idx) => (
                        <m.div
                            key={tmpl.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleSelectTemplate(tmpl)}
                            className={clsx(
                                "cursor-pointer rounded-[2rem] p-4 transition-all duration-500 relative overflow-hidden group border-2",
                                (wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'khmer-legacy'))
                                    ? "bg-rose-50/50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 shadow-xl shadow-rose-500/5"
                                    : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-rose-100 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-24 aspect-[2/3] ${tmpl.bgClass} rounded-2xl overflow-hidden relative shadow-lg group-hover:scale-105 transition-transform duration-500`}>
                                    <Image
                                        src={tmpl.image}
                                        alt={tmpl.title}
                                        fill
                                        className="object-cover"
                                        sizes="120px"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-base md:text-lg text-slate-900 dark:text-white tracking-tight">
                                            {t(`wizard.steps.1.templates.${tmpl.id}.title`, { defaultValue: tmpl.title })}
                                        </p>
                                        {tmpl.isFree && (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                                                {t("common.labels.free")}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-500 dark:text-white/40 font-medium font-kantumruy leading-relaxed">
                                        {t(`wizard.steps.1.templates.${tmpl.id}.description`)}
                                    </p>
                                </div>
                                {(wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'khmer-legacy')) && (
                                    <m.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-rose-500 text-white rounded-full p-2 shadow-lg shadow-rose-500/30 mr-2"
                                    >
                                        <Check size={16} strokeWidth={4} />
                                    </m.div>
                                )}
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step1Template);
