import React from 'react';
import { m } from 'framer-motion';
import clsx from 'clsx';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { MapPin, Clock, Trash2, Plus, ExternalLink, Calendar, Sparkles } from "lucide-react";
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

// Helper: Convert date to YYYY-MM-DD for <input type="date" />
const toDateInputString = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return "";
    }
};

// Helper: Convert date to HH:mm for <input type="time" />
const toTimeInputString = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "07:00";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "07:00";
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${mins}`;
    } catch (e) {
        return "07:00";
    }
};

// Helper: Format to natural Khmer date preview
const formatKhmerDatePreview = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString("km-KH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch (e) {
        return "";
    }
};

const Step3Time: React.FC<Step3TimeProps> = ({ wedding, updateWedding, updateTheme, setWedding, addGalleryItem, removeGalleryItem }) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = React.useState(false);
    const isAnniv = wedding.eventType === 'anniversary';

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleDateChange = (dateVal: string) => {
        if (!dateVal) return;
        try {
            const parts = dateVal.split('-').map(Number);
            if (parts.length < 3) return;
            const [y, m, d] = parts;
            const prev = wedding.date ? new Date(wedding.date) : new Date();
            const h = isNaN(prev.getTime()) ? 7 : prev.getHours();
            const min = isNaN(prev.getTime()) ? 0 : prev.getMinutes();
            const newDate = new Date(y, m - 1, d, h, min);
            if (!isNaN(newDate.getTime())) {
                updateWedding("date", newDate.toISOString());
            }
        } catch (e) {
            console.error("Failed to parse date:", e);
        }
    };

    const handleTimeChange = (timeVal: string) => {
        if (!timeVal) return;
        try {
            const [h, min] = timeVal.split(':').map(Number);
            const prev = wedding.date ? new Date(wedding.date) : new Date();
            const y = isNaN(prev.getTime()) ? new Date().getFullYear() : prev.getFullYear();
            const m = isNaN(prev.getTime()) ? new Date().getMonth() : prev.getMonth();
            const d = isNaN(prev.getTime()) ? new Date().getDate() : prev.getDate();
            const newDate = new Date(y, m, d, h || 0, min || 0);
            if (!isNaN(newDate.getTime())) {
                updateWedding("date", newDate.toISOString());
            }
        } catch (e) {
            console.error("Failed to parse time:", e);
        }
    };

    const khmerDatePreview = mounted ? formatKhmerDatePreview(wedding.date) : "";

    return (
        <div className="space-y-6 font-kantumruy">
            {/* Date & Location Fields */}
            <div className="space-y-5">
                {/* Event Date & Time Grid */}
                <div className="space-y-2.5 bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* 1. Date Picker */}
                        <div className="space-y-1.5">
                            <Label className="block text-xs font-bold text-foreground">
                                {t("wizard.steps.3.eventDate", { defaultValue: "ថ្ងៃ ខែ ឆ្នាំ កម្មវិធី" })} <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm cursor-pointer"
                                    value={mounted ? toDateInputString(wedding.date) : ""}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    onClick={(e) => (e.target as any).showPicker?.()}
                                />
                            </div>
                        </div>

                        {/* 2. Start Time Picker */}
                        <div className="space-y-1.5">
                            <Label className="block text-xs font-bold text-foreground">
                                {t("wizard.steps.3.startTime", { defaultValue: "ម៉ោងចាប់ផ្តើមកម្មវិធី" })}
                            </Label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm cursor-pointer font-mono"
                                    value={mounted ? toTimeInputString(wedding.date) : "07:00"}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    onClick={(e) => (e.target as any).showPicker?.()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Live Formatted Date Badge */}
                    {khmerDatePreview && (
                        <div className="pt-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold font-kantumruy">
                                <Sparkles className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                                <span>ត្រូវនឹង៖ {khmerDatePreview}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lunar Date Field */}
                <div className="space-y-2">
                    <Label className="block text-xs font-bold text-foreground">
                        {t("wizard.steps.3.lunarDate", { defaultValue: "កាលបរិច្ឆេទចន្ទគតិ" })}
                    </Label>
                    <DebouncedInput
                        className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 placeholder:text-muted-foreground/60 shadow-sm"
                        placeholder={t("wizard.steps.3.lunarPlaceholder", { defaultValue: "ឧ. ថ្ងៃ ១៥ កើត ខែពិសាខ ឆ្នាំរោង" })}
                        value={wedding.themeSettings?.lunarDate || ""}
                        onDebouncedChange={(val) => updateTheme("lunarDate", val)}
                    />
                </div>

                {/* Venue / Location Name */}
                <div className="space-y-2">
                    <Label className="block text-xs font-bold text-foreground">
                        {t("wizard.steps.3.venue", { defaultValue: "ឈ្មោះទីតាំងកម្មវិធី" })}
                    </Label>
                    <DebouncedInput
                        className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 placeholder:text-muted-foreground/60 shadow-sm"
                        placeholder={t("wizard.steps.3.venuePlaceholder", { defaultValue: "ឧ. មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍កោះពេជ្រ (អគារ A)" })}
                        value={wedding.location || ""}
                        onDebouncedChange={(val) => updateWedding("location", val)}
                    />
                </div>

                {/* Map Link Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-foreground">
                            {t("wizard.steps.3.mapLabel", { defaultValue: "ទីតាំងលើ Google Maps" })}
                        </Label>
                        <a 
                            href="https://www.google.com/maps" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-full hover:underline transition-all"
                        >
                            <ExternalLink className="w-3 h-3" />
                            {t("wizard.steps.3.mapHowTo", { defaultValue: "របៀបយកតំណភ្ជាប់?" })}
                        </a>
                    </div>
                    <DebouncedInput
                        className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 placeholder:text-muted-foreground/60 shadow-sm"
                        placeholder={t("wizard.steps.3.mapPlaceholder", { defaultValue: "ចម្លងតំណភ្ជាប់ 'Share' ពី Google Maps មកដាក់ទីនេះ..." })}
                        value={wedding.themeSettings?.mapLink || ""}
                        onDebouncedChange={(val) => updateTheme('mapLink', val as string)}
                    />
                </div>

                {/* Cover Banner (16:9) */}
                <div className="space-y-2 pt-2">
                    <Label className="text-xs font-bold text-foreground">
                        {t("wizard.steps.3.bannerLabel", { defaultValue: "រូបភាពអញ្ជើញ (១៦:៩)" })}
                    </Label>
                    <ImageUpload
                        value={wedding.galleryItems?.[5]?.url || ""}
                        onChange={(url, publicId) => addGalleryItem(url, publicId, 5)}
                        onRemove={() => removeGalleryItem(5)}
                        label="បញ្ចូលរូបភាពក្របទំព័រ (Cover Banner)"
                        folder={wedding.id}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(Step3Time);
