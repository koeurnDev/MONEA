
"use client";
import React from 'react';
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import ImageUpload from "@/components/ui/image-upload-widget";
import { ImageIcon, Heart, Users } from "lucide-react";
import type { WeddingData } from '@/components/templates/types';
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";

interface Step2InfoProps {
    wedding: WeddingData;
    updateWedding: (key: keyof WeddingData, value: any) => void;
    updateTheme: (key: string, value: any) => void;
    updateParent: (key: string, value: string) => void;
    updateLabel: (key: string, value: string) => void;
    addGalleryItem: (url: string, publicId?: string, index?: number) => void;
    removeGalleryItem: (index: number) => void;
}

const Step2Info: React.FC<Step2InfoProps> = ({ 
    wedding, 
    updateWedding, 
    updateTheme,
    updateParent,
    updateLabel,
    addGalleryItem,
    removeGalleryItem
}) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-12 pb-20">
            {/* 1. Couple Information */}
            <section className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {t("wizard.steps.2.coupleTitle")}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.2.coupleSubtitle")}</p>
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pl-3.5">
                    {/* Groom */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{t("wizard.steps.2.groomName")} <span className="text-rose-500">*</span></Label>
                            <DebouncedInput
                                value={wedding.groomName}
                                onDebouncedChange={(val) => updateWedding("groomName", val)}
                                className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20"
                                placeholder={t("wizard.steps.2.groomPlaceholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("wizard.steps.2.photo")}</Label>
                            <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/5">
                                <ImageUpload
                                    value={wedding?.galleryItems?.[9]?.url}
                                    onChange={(url, publicId) => addGalleryItem(url, publicId, 9)}
                                    onRemove={() => removeGalleryItem(9)}
                                    label={t("wizard.steps.2.uploadGroom")}
                                    folder={wedding.id}
                                />
                            </div>
                        </div>
                    </div>
 
                    {/* Bride */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{t("wizard.steps.2.brideName")} <span className="text-rose-500">*</span></Label>
                            <DebouncedInput
                                value={wedding.brideName}
                                onDebouncedChange={(val) => updateWedding("brideName", val)}
                                className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20"
                                placeholder={t("wizard.steps.2.bridePlaceholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("wizard.steps.2.photo")}</Label>
                            <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/5">
                                <ImageUpload
                                    value={wedding?.galleryItems?.[10]?.url}
                                    onChange={(url, publicId) => addGalleryItem(url, publicId, 10)}
                                    onRemove={() => removeGalleryItem(10)}
                                    label={t("wizard.steps.2.uploadBride")}
                                    folder={wedding.id}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Media & Hero */}
            <section className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {t("wizard.steps.2.mediaTitle")}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.2.mediaSubtitle")}</p>
                </div>
                <div className="pl-3.5 space-y-4 max-w-xl">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.heroLabel")}</Label>
                    <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
                        <ImageUpload
                            value={wedding.themeSettings?.heroImage || ""}
                            onChange={(url: string, publicId?: string) => addGalleryItem(url, publicId, 0)}
                            onRemove={() => removeGalleryItem(0)}
                            folder={wedding.id}
                        />
                    </div>
                </div>
            </section>
 
            {/* 3. Vows & Text */}
            <section className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {t("wizard.steps.2.vowsTitle")}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.2.vowsSubtitle")}</p>
                </div>
                <div className="pl-3.5 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.groomName")}</Label>
                            <DebouncedTextarea
                                className="min-h-[120px] rounded-xl bg-slate-50 dark:bg-white/5 border-none p-4 shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20"
                                value={wedding.themeSettings?.groomVow || ""}
                                onDebouncedChange={(val) => updateTheme('groomVow', val)}
                                placeholder={t("wizard.steps.2.vowPlaceholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.brideName")}</Label>
                            <DebouncedTextarea
                                className="min-h-[120px] rounded-xl bg-slate-50 dark:bg-white/5 border-none p-4 shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20"
                                value={wedding.themeSettings?.brideVow || ""}
                                onDebouncedChange={(val) => updateTheme('brideVow', val)}
                                placeholder={t("wizard.steps.2.vowPlaceholder")}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.quoteLabel")}</Label>
                        <DebouncedTextarea
                            className="min-h-[80px] rounded-xl bg-rose-50/30 dark:bg-rose-500/5 border-none p-4 text-center italic shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20"
                            value={wedding.themeSettings?.mainQuote || ""}
                            onDebouncedChange={(val) => updateTheme('mainQuote', val)}
                            placeholder={t("wizard.steps.2.quotePlaceholder")}
                        />
                    </div>
                </div>
            </section>
 
            {/* 4. Family Information */}
            <section className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {t("wizard.steps.2.parentsTitle")}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.2.parentsSubtitle")}</p>
                </div>
                <div className="pl-3.5 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Groom Parents */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-rose-500/20" />
                                {t("wizard.steps.2.groomSide")}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.father")}</Label>
                                    <DebouncedInput placeholder={t("wizard.steps.2.fatherPlaceholder")} className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20" value={wedding.themeSettings?.parents?.groomFather || ""} onDebouncedChange={(val) => updateParent('groomFather', val as string)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.mother")}</Label>
                                    <DebouncedInput placeholder={t("wizard.steps.2.motherPlaceholder")} className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20" value={wedding.themeSettings?.parents?.groomMother || ""} onDebouncedChange={(val) => updateParent('groomMother', val as string)} />
                                </div>
                            </div>
                        </div>
 
                        {/* Bride Parents */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-rose-500/20" />
                                {t("wizard.steps.2.brideSide")}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.father")}</Label>
                                    <DebouncedInput placeholder={t("wizard.steps.2.fatherPlaceholder")} className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20" value={wedding.themeSettings?.parents?.brideFather || ""} onDebouncedChange={(val) => updateParent('brideFather', val as string)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.mother")}</Label>
                                    <DebouncedInput placeholder={t("wizard.steps.2.motherPlaceholder")} className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20" value={wedding.themeSettings?.parents?.brideMother || ""} onDebouncedChange={(val) => updateParent('brideMother', val as string)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
 
            {/* 5. Custom Labels */}
            <section className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {t("wizard.steps.2.settingsTitle")}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.2.settingsSubtitle")}</p>
                </div>
                <div className="pl-3.5 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.editorialLabel")}</Label>
                        <DebouncedInput className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20" value={wedding.themeSettings?.customLabels?.editorial_1 || ""} onDebouncedChange={(val) => updateLabel('editorial_1', val as string)} placeholder={t("wizard.steps.2.editorialPlaceholder")} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.galleryLabel")}</Label>
                        <DebouncedInput className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20" value={wedding.themeSettings?.customLabels?.moments_title || ""} onDebouncedChange={(val) => updateLabel('moments_title', val as string)} placeholder={t("wizard.steps.2.galleryPlaceholder")} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.2.giftLabel")}</Label>
                        <DebouncedInput className="h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/20" value={wedding.themeSettings?.customLabels?.generosity_title || "Generosity"} onDebouncedChange={(val) => updateLabel('generosity_title', val as string)} placeholder={t("wizard.steps.2.giftPlaceholder")} />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default React.memo(Step2Info);
