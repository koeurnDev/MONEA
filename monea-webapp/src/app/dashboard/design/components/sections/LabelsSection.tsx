"use client";
import * as React from 'react';
import { m } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import type { WeddingData } from '@/components/templates/types';

interface LabelsSectionProps {
    wedding: WeddingData;
    updateTheme: (key: string, value: any) => void;
    updateLabel: (key: string, value: string) => void;
    t: (key: string, opts?: any) => string;
}

const LABEL_SECTIONS = (t: (k: string) => string) => [
    {
        title: t("wizard.steps.5.labelBannerSection"),
        fields: [
            { key: 'invite_title', label: t("wizard.steps.5.labelInviteHeader"), type: 'input' },
            { key: 'hero_subtitle', label: t("wizard.steps.5.labelHeroSubtitle"), type: 'input' },
            { key: 'hero_button', label: t("wizard.steps.5.labelHeroButton"), type: 'input' },
            { key: 'andLabel', label: t("wizard.steps.5.labelAndLabel"), type: 'input' },
            { key: 'invitationBadge', label: t("wizard.steps.5.labelInvitationBadge"), type: 'input' },
            { key: 'invitationTitle', label: t("wizard.steps.5.labelInvitationTitle"), type: 'input' },
            { key: 'invitationHonorTitle', label: t("wizard.steps.5.labelInvitationHonorTitle"), type: 'input' },
            { key: 'invitationText', label: t("wizard.steps.5.labelInvitationText"), type: 'textarea' }
        ]
    },
    {
        title: t("wizard.steps.5.labelLocationSection"),
        fields: [
            { key: 'locationTitle', label: t("wizard.steps.5.labelLocationTitle"), type: 'input' },
            { key: 'locationSubtitle', label: t("wizard.steps.5.labelLocationSubtitle"), type: 'input' },
            { key: 'locationCardLabel', label: t("wizard.steps.5.labelLocationCardLabel"), type: 'input' },
            { key: 'countdownLabel', label: t("wizard.steps.5.labelCountdownLabel"), type: 'input' }
        ]
    },
    {
        title: t("wizard.steps.5.labelGallerySection"),
        fields: [
            { key: 'gallery_title', label: t("wizard.steps.5.labelGalleryTitle"), type: 'input' },
            { key: 'gallerySubtitle', label: t("wizard.steps.5.labelGallerySubtitle"), type: 'input' },
            { key: 'giftTitle', label: t("wizard.steps.5.labelGiftTitle"), type: 'input' },
            { key: 'giftBadge', label: t("wizard.steps.5.labelGiftBadge"), type: 'input' },
            { key: 'giftCopyBtn', label: t("wizard.steps.5.labelGiftCopyBtn"), type: 'input' },
            { key: 'rsvpSubmittedText', label: t("wizard.steps.5.labelRsvpSubmittedText"), type: 'input' }
        ]
    }
];

export function LabelsSection({ wedding, updateTheme, updateLabel, t }: LabelsSectionProps) {
    const sections = LABEL_SECTIONS(t);
    return (
        <div className="space-y-8 pt-4">
            {sections.map((section, sIdx) => (
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sIdx * 0.1 }}
                    key={sIdx}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/30" />
                        <h5 className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] italic">{section.title}</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/50 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5">
                        {section.fields.map((field) => (
                            <div key={field.key} className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 pl-1">{field.label}</Label>
                                {field.type === 'textarea' ? (
                                    <DebouncedTextarea
                                        placeholder={field.label}
                                        value={field.key === 'invitationText' ? (wedding.themeSettings?.invitationText || "") : ((wedding.themeSettings?.customLabels as any)?.[field.key] || "")}
                                        onDebouncedChange={(val) => field.key === 'invitationText' ? updateTheme('invitationText', val) : updateLabel(field.key, val)}
                                        className="min-h-[80px] rounded-xl border-none bg-white dark:bg-white/5 shadow-sm focus:ring-1 ring-rose-500/20 text-xs font-medium leading-relaxed"
                                    />
                                ) : (
                                    <DebouncedInput
                                        placeholder={field.label}
                                        value={(wedding.themeSettings?.customLabels as any)?.[field.key] || ""}
                                        onDebouncedChange={(val) => updateLabel(field.key, val as string)}
                                        className="h-10 rounded-xl border-none bg-white dark:bg-white/5 shadow-sm focus:ring-1 ring-rose-500/20 text-xs font-medium"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </m.div>
            ))}
        </div>
    );
}
