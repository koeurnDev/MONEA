import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
// next/image replaced with <img>;
import { Check, Palette } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { WeddingData } from '@/components/templates/types';
import {
    getTemplatesForEventType,
    TEMPLATE_DEFINITIONS,
    type TemplatePresentationMetadata,
} from '@/components/templates/template-config';
import { moneaClient } from '@/lib/api-client';

interface Step1TemplateProps {
    wedding: WeddingData;
    updateEventType: (type: 'wedding' | 'anniversary', allowedTemplateIds?: readonly string[]) => void;
    updateTemplate: (templateId: string) => void;
    packageType?: string | null;
}

const Step1Template: React.FC<Step1TemplateProps> = ({ wedding, updateEventType, updateTemplate, packageType }) => {
    const { t } = useTranslation();
    const [availability, setAvailability] = useState<Record<string, boolean> | null>(null);
    const [metadata, setMetadata] = useState<Record<string, TemplatePresentationMetadata> | null>(null);
    const [availabilityError, setAvailabilityError] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(true);
    const isFreePlan = !packageType || packageType === "FREE";
    const activeEventType: 'wedding' | 'anniversary' = wedding.eventType === 'anniversary' ? 'anniversary' : 'wedding';
    const hasSelectedEventType = wedding.eventType === 'wedding' || wedding.eventType === 'anniversary';

    const loadAvailability = useCallback(async () => {
        setLoadingAvailability(true);
        setAvailabilityError(false);
        try {
            const [availabilityResponse, metadataResponse] = await Promise.all([
                moneaClient.get<Record<string, boolean>>("/api/templates/availability", { cache: "no-store" }),
                moneaClient.get<Record<string, TemplatePresentationMetadata>>("/api/templates/metadata", { cache: "no-store" }),
            ]);
            if (
                availabilityResponse.error
                || !availabilityResponse.data
                || metadataResponse.error
                || !metadataResponse.data
                || Object.keys(TEMPLATE_DEFINITIONS).some((id) =>
                    typeof availabilityResponse.data?.[id] !== "boolean"
                    || !metadataResponse.data?.[id]
                    || typeof metadataResponse.data[id].title !== "string"
                    || typeof metadataResponse.data[id].description !== "string"
                    || typeof metadataResponse.data[id].image !== "string"
                    || !["wedding", "anniversary", "both"].includes(metadataResponse.data[id].eventType),
                )
            ) {
                throw new Error(availabilityResponse.error || metadataResponse.error || "Template configuration response was invalid");
            }
            setAvailability(availabilityResponse.data);
            setMetadata(metadataResponse.data);
        } catch (error) {
            console.error("[Step1Template] Failed to load template availability:", error);
            setAvailabilityError(true);
        } finally {
            setLoadingAvailability(false);
        }
    }, []);

    useEffect(() => {
        void loadAvailability();
    }, [loadAvailability]);

    const enabledTemplateIds = availability
        ? new Set(Object.entries(availability).filter(([, enabled]) => enabled).map(([id]) => id))
        : new Set<string>();

    const applyEventTypeChange = (normalizedType: 'wedding' | 'anniversary') => {
        const allowedTemplates: Record<'wedding' | 'anniversary', string[]> = {
            wedding: getTemplatesForEventType('wedding', enabledTemplateIds)
                .filter((template) => metadata?.[template.id]?.eventType === "wedding" || metadata?.[template.id]?.eventType === "both")
                .map((template) => template.id),
            anniversary: getTemplatesForEventType('anniversary', enabledTemplateIds)
                .filter((template) => metadata?.[template.id]?.eventType === "anniversary" || metadata?.[template.id]?.eventType === "both")
                .map((template) => template.id),
        };
        if (!allowedTemplates[normalizedType].length) return;

        const currentTemplate = wedding.templateId;
        const isCurrentTemplateAllowed = !!currentTemplate && allowedTemplates[normalizedType].some((template) => template === currentTemplate);
        const nextTemplate = isCurrentTemplateAllowed ? currentTemplate : (allowedTemplates[normalizedType][0] || currentTemplate);

        updateEventType(normalizedType, allowedTemplates[normalizedType]);
        if (nextTemplate && nextTemplate !== currentTemplate) {
            updateTemplate(nextTemplate);
        }
    };

    const handleSwitchEventType = (type: 'wedding' | 'anniversary') => {
        const normalizedType = type === 'anniversary' ? 'anniversary' : 'wedding';
        applyEventTypeChange(normalizedType);
    };

    const visibleTemplates = availability && metadata
        ? getTemplatesForEventType(activeEventType, enabledTemplateIds)
            .filter((template) => metadata[template.id].eventType === activeEventType || metadata[template.id].eventType === "both")
            .map((template) => ({ ...template, ...metadata[template.id] }))
        : [];
    const selectedUnavailableTemplate = wedding.templateId
        ? TEMPLATE_DEFINITIONS[wedding.templateId as keyof typeof TEMPLATE_DEFINITIONS]
        : undefined;
    const selectedTemplateMetadata = wedding.templateId ? metadata?.[wedding.templateId] : undefined;
    if (
        availability && metadata &&
        wedding.templateId &&
        selectedUnavailableTemplate &&
        selectedTemplateMetadata &&
        !visibleTemplates.some((template) => template.id === selectedUnavailableTemplate.id)
    ) {
        visibleTemplates.push({ ...selectedUnavailableTemplate, ...selectedTemplateMetadata });
    }

    const handleSelectTemplate = (tmpl: any) => {
        updateTemplate(tmpl.id);
    };

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <div className="hidden sm:block bg-slate-50 dark:bg-white/5 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Palette className="w-9 h-9 sm:w-12 sm:h-12 text-slate-800 dark:text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-kantumruy mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
                    <span className="sm:hidden">ជ្រើសរើសគំរូ</span>
                    <span className="hidden sm:inline">{t("wizard.steps.1.header")}</span>
                </h3>
                <p className="hidden sm:block text-[11px] sm:text-[13px] text-slate-500 dark:text-white/50 leading-relaxed font-medium">
                    {t("wizard.steps.1.description")}
                </p>
            </div>

            <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-2xl grid grid-cols-2 gap-1 relative">
                <button
                    type="button"
                    aria-pressed={activeEventType === 'wedding'}
                    onClick={() => handleSwitchEventType('wedding')}
                    className={clsx(
                        "relative min-h-[46px] touch-manipulation select-none px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl transition-all duration-200 font-kantumruy font-black text-[11px] sm:text-xs md:text-sm tracking-wide active:scale-[0.98] pointer-events-auto",
                        activeEventType === 'wedding'
                            ? "bg-white dark:bg-white/10 text-foreground shadow-sm translate-y-[-1px]"
                            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                >
                    {t("wizard.steps.1.wedding")}
                </button>
                <button
                    type="button"
                    aria-pressed={activeEventType === 'anniversary'}
                    onClick={() => handleSwitchEventType('anniversary')}
                    className={clsx(
                        "relative min-h-[46px] touch-manipulation select-none px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl transition-all duration-200 font-kantumruy font-black text-[11px] sm:text-xs md:text-sm tracking-wide active:scale-[0.98] pointer-events-auto",
                        activeEventType === 'anniversary'
                            ? "bg-white dark:bg-white/10 text-foreground shadow-sm translate-y-[-1px]"
                            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    )}
                >
                    {t("wizard.steps.1.anniversary")}
                </button>
            </div>

            {!hasSelectedEventType && (
                <p className="rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-700 font-kantumruy dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    សូមជ្រើសរើសប្រភេទកម្មវិធីមួយ ដើម្បីបន្ត
                </p>
            )}
            {availabilityError && (
                <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-center text-xs font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    <p>មិនអាចផ្ទុកបញ្ជី template បានទេ។ សូមព្យាយាមម្តងទៀត។</p>
                    <button type="button" onClick={() => void loadAvailability()} className="mt-2 underline">
                        ព្យាយាមម្តងទៀត
                    </button>
                </div>
            )}
            {loadingAvailability && (
                <p role="status" className="text-center text-xs text-muted-foreground">
                    កំពុងផ្ទុក template...
                </p>
            )}
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground font-kantumruy">
                ប្រភេទកម្មវិធីកំណត់គំរូដែលអាចជ្រើសរើសបាន។ ការប្តូរប្រភេទនឹងប្តូរគំរូ ប្រសិនបើគំរូបច្ចុប្បន្នមិនត្រូវគ្នា។
            </p>

            <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <Label className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 dark:text-white/30 tracking-[0.2em] ml-2">
                        {t("wizard.steps.1.popularTemplates", { defaultValue: "Templates" })}
                    </Label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {visibleTemplates.map((tmpl) => {
                        const isSelected = wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'modern-minimal');
                        const isWrongEventType = tmpl.eventType !== "both" && tmpl.eventType !== activeEventType;
                        const unavailableForNewSelection = availability?.[tmpl.id] === false || isWrongEventType;

                        return (
                            <button
                                key={tmpl.id}
                                type="button"
                                disabled={tmpl.comingSoon || unavailableForNewSelection}
                                aria-pressed={isSelected}
                                onClick={() => handleSelectTemplate(tmpl)}
                                className={clsx(
                                    "w-full text-left rounded-[1.35rem] sm:rounded-[1.75rem] p-2.5 sm:p-4 transition-all duration-300 relative overflow-hidden border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
                                    tmpl.comingSoon 
                                        ? "cursor-not-allowed opacity-60 bg-slate-50 dark:bg-white/5 border-transparent grayscale" 
                                        : "cursor-pointer group",
                                    isSelected
                                        ? "border-slate-900 bg-slate-50/70 dark:border-white dark:bg-white/10 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/10 -translate-y-0.5"
                                        : "border-slate-200/70 dark:border-white/10 bg-white dark:bg-card hover:bg-slate-50/50 hover:border-slate-400/50 hover:shadow-md hover:-translate-y-0.5"
                                )}
                            >
                                <div className="flex items-stretch gap-3 sm:gap-5">
                                    {/* Template Thumbnail Image — Larger & taller */}
                                    <div className="w-24 sm:w-28 md:w-28 aspect-[9/16] bg-slate-100 dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden relative shadow-md shrink-0 border border-slate-200/50">
                                        {tmpl.image ? (
                                            <img
                                                src={tmpl.image}
                                                alt={tmpl.title} 
                                                className="w-full h-full object-contain"
                                                loading={isSelected ? "eager" : "lazy"}
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Palette size={28} />
                                            </div>
                                        )}
                                        {/* Selected overlay badge on the image */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-slate-900/30 rounded-2xl flex items-center justify-center">
                                                <div className="bg-white rounded-full p-2 shadow-lg">
                                                    <Check size={18} strokeWidth={3.5} className="text-slate-900" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Template Info */}
                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                        {/* Top: Code & Badges */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={clsx(
                                                "px-2.5 sm:px-3.5 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black tracking-wider font-mono shadow-sm transition-colors",
                                                isSelected 
                                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                                                    : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white group-hover:bg-slate-900 group-hover:text-white"
                                            )}>
                                                {tmpl.code}
                                            </span>
                                            {tmpl.isFree && !tmpl.comingSoon && (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                                                    {t("common.labels.free")}
                                                </span>
                                            )}
                                            {tmpl.comingSoon && (
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                                                    Coming Soon
                                                </span>
                                            )}
                                            {unavailableForNewSelection && isSelected && (
                                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                                    មិនទទួលការជ្រើសរើសថ្មី
                                                </span>
                                            )}
                                        </div>

                                        {/* Bottom: Category pill + Click hint */}
                                        <div className="mt-2 space-y-1">
                                            <p className="font-kantumruy text-sm font-black leading-snug text-foreground sm:text-base">
                                                {t(`wizard.steps.1.templates.${tmpl.id}.title`, { defaultValue: tmpl.title })}
                                            </p>
                                            <p className="font-kantumruy text-[11px] leading-relaxed text-muted-foreground">
                                                {t(`wizard.steps.1.templates.${tmpl.id}.description`, { defaultValue: tmpl.description })}
                                            </p>
                                            <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground font-kantumruy uppercase tracking-wider">
                                                {activeEventType === 'anniversary' ? t("wizard.steps.1.anniversary") : t("wizard.steps.1.wedding")}
                                            </p>
                                            {!tmpl.comingSoon && (
                                                <p className={clsx(
                                                    "text-[10px] sm:text-[11px] font-semibold font-kantumruy transition-colors",
                                                    isSelected ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/30 group-hover:text-slate-700 dark:group-hover:text-white/70"
                                                )}>
                                                    {isSelected 
                                                        ? (t("wizard.steps.1.selectedLabel", { defaultValue: "✓ ជ្រើសហើយ" }))
                                                        : (t("wizard.steps.1.clickToSelect", { defaultValue: "ចុចដើម្បីជ្រើស" }))
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step1Template);
