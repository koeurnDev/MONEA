"use client";
import React from 'react';
import { m } from 'framer-motion';
import clsx from 'clsx';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { MapPin, Clock, Trash2, Plus, ExternalLink } from "lucide-react";
import type { WeddingData } from '@/components/templates/types';
import ImageUpload from "@/components/ui/image-upload-widget";
import { useTranslation } from "@/i18n/LanguageProvider";

interface Step3TimeProps {
    wedding: WeddingData;
    updateWedding: (key: keyof WeddingData, value: any) => void;
    updateTheme: (key: string, value: any) => void;
    setWedding: React.Dispatch<React.SetStateAction<WeddingData | null>>;
    addGalleryItem: (url: string, publicId?: string, index?: number) => void;
    removeGalleryItem: (index: number) => void;
}

// Helper for Date Handling
const toLocalISO = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const offsetMs = d.getTimezoneOffset() * 60 * 1000;
        const localTime = new Date(d.getTime() - offsetMs);
        return localTime.toISOString().slice(0, 16);
    } catch (e) {
        return "";
    }
};

const Step3Time: React.FC<Step3TimeProps> = ({ wedding, updateWedding, updateTheme, setWedding, addGalleryItem, removeGalleryItem }) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-8 pb-10 font-khmer">
            {/* Date & Location Section */}
            <section className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {t("wizard.steps.3.datetimeTitle")}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.3.datetimeSubtitle")}</p>
                </div>
                
                <div className="pl-3.5 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">
                                {t("wizard.steps.3.eventDate")} <span className="text-rose-500 font-bold">*</span>
                            </Label>
                            <Input
                                type="datetime-local"
                                className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none font-bold text-sm focus:ring-1 ring-rose-500/20"
                                value={mounted ? toLocalISO(wedding.date) : ""}
                                onChange={(e) => {
                                    const newVal = e.target.value;
                                    if (!newVal) return;
                                    const d = new Date(newVal);
                                    if (!isNaN(d.getTime())) {
                                        updateWedding("date", d.toISOString());
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">{t("wizard.steps.3.lunarDate")}</Label>
                            <DebouncedInput
                                className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none font-bold text-sm focus:ring-1 ring-rose-500/20"
                                placeholder={t("wizard.steps.3.lunarPlaceholder")}
                                value={wedding.themeSettings?.lunarDate || ""}
                                onDebouncedChange={(val) => updateTheme("lunarDate", val)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">{t("wizard.steps.3.venue")}</Label>
                        <DebouncedInput
                            className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none font-bold text-sm focus:ring-1 ring-rose-500/20"
                            placeholder={t("wizard.steps.3.venuePlaceholder")}
                            value={wedding.location || ""}
                            onDebouncedChange={(val) => updateWedding("location", val)}
                        />
                    </div>

                    {/* Map Link Section */}
                    <div className="space-y-5 pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.3.mapLabel")}</Label>
                            <a 
                                href="https://www.google.com/maps" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[9px] text-rose-500 flex items-center gap-1 hover:underline font-bold bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-full transition-all"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {t("wizard.steps.3.mapHowTo")}
                            </a>
                        </div>
                        <div className="space-y-3">
                            <DebouncedInput
                                className="h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-none shadow-none text-sm placeholder:text-slate-300 focus:ring-1 ring-rose-500/20"
                                placeholder={t("wizard.steps.3.mapPlaceholder")}
                                value={wedding.themeSettings?.mapLink || ""}
                                onDebouncedChange={(val) => updateTheme('mapLink', val as string)}
                            />
                        </div>
                    </div>

                    {/* Banner & QR Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.3.bannerLabel")}</Label>
                            <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/5">
                                <ImageUpload
                                    value={wedding.galleryItems?.[5]?.url || ""}
                                    onChange={(url, publicId) => addGalleryItem(url, publicId, 5)}
                                    onRemove={() => removeGalleryItem(5)}
                                    folder={wedding.id}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t("wizard.steps.3.locationQr")}</Label>
                            <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/5">
                                <ImageUpload
                                    value={wedding.themeSettings?.locationQrUrl || ""}
                                    onChange={(url, publicId) => {
                                        updateTheme('locationQrUrl', url);
                                        if (publicId) updateTheme('locationQrPublicId', publicId);
                                    }}
                                    onRemove={() => {
                                        updateTheme('locationQrUrl', "");
                                        updateTheme('locationQrPublicId', "");
                                    }}
                                    folder={wedding.id}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Schedule Section */}
            <section className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {t("wizard.steps.3.scheduleTitle")}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.3.scheduleSubtitle")}</p>
                </div>
 
                <div className="pl-3.5 space-y-4">
                    {wedding.activities?.map((activity: any, idx: number) => {
                        const isHeader = activity.icon === "header";
                        return (
                            <m.div 
                                key={idx}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={clsx(
                                    "relative p-4 rounded-xl transition-all duration-300 group border",
                                    isHeader 
                                        ? "bg-rose-50/20 dark:bg-rose-500/5 border-rose-100/30 dark:border-rose-500/10 mt-6 first:mt-0" 
                                        : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5"
                                )}
                            >
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Button
                                            variant={isHeader ? "default" : "ghost"}
                                            size="sm"
                                            className={clsx(
                                                "h-9 w-9 p-0 font-bold text-[10px] rounded-lg flex-shrink-0 transition-all",
                                                isHeader 
                                                    ? "bg-rose-500 hover:bg-rose-600 shadow-none" 
                                                    : "text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                            )}
                                            onClick={() => {
                                                const newActs = [...(wedding.activities || [])];
                                                newActs[idx] = { ...newActs[idx], icon: isHeader ? null : "header" };
                                                updateWedding("activities", newActs);
                                            }}
                                            title={t("wizard.steps.3.headerBtnTooltip")}
                                        >
                                            {t("wizard.steps.3.headerBtn")}
                                        </Button>
                                        {!isHeader && (
                                            <DebouncedInput
                                                className="w-28 h-9 text-xs font-bold text-rose-500 bg-slate-50 dark:bg-white/5 border-none rounded-lg text-center shadow-none"
                                                value={activity.time}
                                                onDebouncedChange={(val) => {
                                                    const newActs = [...(wedding.activities || [])];
                                                    newActs[idx] = { ...newActs[idx], time: val as string };
                                                    updateWedding("activities", newActs);
                                                }}
                                                placeholder={t("wizard.steps.3.activityTime")}
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 w-full space-y-2">
                                        <DebouncedInput
                                            className={clsx(
                                                "h-9 text-xs w-full bg-slate-50/50 dark:bg-white/5 border-none rounded-lg px-4 font-bold placeholder:text-slate-300 shadow-none focus-visible:ring-1 focus-visible:ring-rose-500/10",
                                                isHeader ? 'text-rose-600 dark:text-rose-400 uppercase tracking-widest' : 'text-slate-900 dark:text-white'
                                            )}
                                            value={activity.title}
                                            onDebouncedChange={(val) => {
                                                const newActs = [...(wedding.activities || [])];
                                                newActs[idx] = { ...newActs[idx], title: val as string };
                                                updateWedding("activities", newActs);
                                            }}
                                            placeholder={isHeader ? t("wizard.steps.3.headerLabel") : t("wizard.steps.3.activityTitle")}
                                        />
                                        {!isHeader && (
                                            <DebouncedTextarea
                                                className="min-h-[40px] text-[11px] py-2 px-4 bg-slate-50/30 dark:bg-white/5 border-none rounded-lg focus-visible:ring-1 focus-visible:ring-rose-500/10 placeholder:text-slate-200"
                                                value={activity.description || ""}
                                                onDebouncedChange={(val) => {
                                                    const newActs = [...(wedding.activities || [])];
                                                    newActs[idx] = { ...newActs[idx], description: val as string };
                                                    updateWedding("activities", newActs);
                                                }}
                                                placeholder={t("wizard.steps.3.activityDesc")}
                                            />
                                        )}
                                    </div>
 
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex-shrink-0 sm:self-start opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            const newActs = wedding.activities!.filter((_: any, i: number) => i !== idx);
                                            updateWedding("activities", newActs);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </m.div>
                        );
                    })}
                    
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setWedding((prev: any) => ({
                                ...prev,
                                activities: [...(prev.activities || []), { 
                                    time: t("wizard.steps.3.activityTime"), 
                                    title: "", 
                                    description: "",
                                    icon: null,
                                    order: (prev.activities?.length || 0)
                                }]
                            }));
                        }}
                        className="w-full text-[10px] font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-500/5 h-12 rounded-xl transition-all"
                    >
                        <Plus size={14} className="mr-2" /> {t("wizard.steps.3.addActivity")}
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default React.memo(Step3Time);
