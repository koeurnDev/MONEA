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
    normalizeTemplateAvailability,
    normalizeTemplatePresentationMetadata,
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
    const canUsePaidTemplates = wedding.paymentStatus === "PAID"
        || packageType === "PRO"
        || packageType === "PREMIUM";
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
            if (availabilityResponse.error || !availabilityResponse.data || metadataResponse.error || !metadataResponse.data) {
                throw new Error(availabilityResponse.error || metadataResponse.error || "Template configuration response was invalid");
            }
            setAvailability(normalizeTemplateAvailability(availabilityResponse.data));
            setMetadata(normalizeTemplatePresentationMetadata(metadataResponse.data));
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
        ? new Set(Object.entries(availability)
            .filter(([id, enabled]) => enabled && (canUsePaidTemplates || id === "khmer-legacy"))
            .map(([id]) => id))
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
        canUsePaidTemplates &&
        !visibleTemplates.some((template) => template.id === selectedUnavailableTemplate.id)
    ) {
        visibleTemplates.push({ ...selectedUnavailableTemplate, ...selectedTemplateMetadata });
    }

    const handleSelectTemplate = (tmpl: any) => {
        updateTemplate(tmpl.id);
    };

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <div className="bg-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-border shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Palette className="w-9 h-9 sm:w-12 sm:h-12 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-foreground font-kantumruy mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="sm:hidden">ជ្រើសរើសគំរូ</span>
                    <span className="hidden sm:inline">{t("wizard.steps.1.header")}</span>
                </h3>
                <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed font-medium">
                    {t("wizard.steps.1.description")}
                </p>
            </div>

            <div className="bg-muted p-1 rounded-2xl grid grid-cols-2 gap-1 relative">
                <button
                    type="button"
                    aria-pressed={activeEventType === 'wedding'}
                    onClick={() => handleSwitchEventType('wedding')}
                    className={clsx(
                        "relative min-h-[46px] touch-manipulation select-none px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl transition-all duration-200 font-kantumruy font-black text-xs sm:text-xs md:text-sm tracking-wide active:scale-[0.98] pointer-events-auto",
                        activeEventType === 'wedding'
                            ? "bg-card text-foreground shadow-sm translate-y-[-1px]"
                            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    )}
                >
                    {t("wizard.steps.1.wedding")}
                </button>
                <button
                    type="button"
                    aria-pressed={activeEventType === 'anniversary'}
                    onClick={() => handleSwitchEventType('anniversary')}
                    className={clsx(
                        "relative min-h-[46px] touch-manipulation select-none px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl transition-all duration-200 font-kantumruy font-black text-xs sm:text-xs md:text-sm tracking-wide active:scale-[0.98] pointer-events-auto",
                        activeEventType === 'anniversary'
                            ? "bg-card text-foreground shadow-sm translate-y-[-1px]"
                            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
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
            <p className="text-center text-xs leading-relaxed text-muted-foreground font-kantumruy">
                ប្រភេទកម្មវិធីកំណត់គំរូដែលអាចជ្រើសរើសបាន។ ការប្តូរប្រភេទនឹងប្តូរគំរូ ប្រសិនបើគំរូបច្ចុប្បន្នមិនត្រូវគ្នា។
            </p>

            <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <Label className="text-xs sm:text-xs font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">
                        {t("wizard.steps.1.popularTemplates", { defaultValue: "Templates" })}
                    </Label>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                                    "w-full min-w-0 rounded-2xl p-2.5 text-left transition-all duration-200 relative overflow-hidden border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-3",
                                    tmpl.comingSoon 
                                        ? "cursor-not-allowed opacity-60 bg-muted border-transparent grayscale"
                                        : "cursor-pointer group",
                                    isSelected
                                        ? "border-primary bg-accent/50 shadow-lg shadow-primary/5 ring-1 ring-primary/10 -translate-y-0.5"
                                        : "border-border bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                                )}
                            >
                                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-muted">
                                        {tmpl.image ? (
                                            <img
                                                src={tmpl.image}
                                                alt={tmpl.title} 
                                                className="h-full w-full object-cover"
                                                loading={isSelected ? "eager" : "lazy"}
                                                decoding="async"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <Palette size={20} />
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-md ring-1 ring-border">
                                                <Check size={13} strokeWidth={3.5} className="text-primary" />
                                            </div>
                                        )}
                                        {(tmpl.comingSoon || unavailableForNewSelection) && (
                                            <span className="absolute bottom-2 left-2 rounded-full bg-foreground/75 px-2 py-1 font-kantumruy text-xs font-bold text-background backdrop-blur-sm">
                                                {tmpl.comingSoon ? "ឆាប់ៗនេះ" : "មិនទទួលថ្មី"}
                                            </span>
                                        )}
                                </div>

                                <div className="min-w-0 px-0.5 pt-2.5">
                                    <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
                                        <span className={clsx(
                                            "inline-flex min-h-5 items-center rounded-md px-1.5 text-xs font-black tracking-wide font-mono transition-colors sm:text-xs",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                                        )}>
                                            {tmpl.code}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                            <p className="line-clamp-2 min-h-[2.5rem] break-words font-kantumruy text-xs font-black leading-5 text-foreground sm:text-sm">
                                                {t(`wizard.steps.1.templates.${tmpl.id}.title`, { defaultValue: tmpl.title })}
                                            </p>
                                            <p className="mt-1 truncate font-kantumruy text-xs font-semibold leading-4 text-muted-foreground sm:text-xs">
                                                {activeEventType === 'anniversary' ? t("wizard.steps.1.anniversary") : t("wizard.steps.1.wedding")}
                                            </p>
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
