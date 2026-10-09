import React from 'react';
import { m } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { Clock, Trash2, Plus, ExternalLink, Sparkles, CalendarDays, ArrowUp, ArrowDown } from "lucide-react";
import type { WeddingData } from '@/components/templates/types';
import { useTranslation } from "@/i18n/LanguageProvider";
import { toKhmerLunarDate } from "khmer-chhankitek-calendar";

interface Step3TimeProps {
    wedding: WeddingData;
    updateWedding: (key: keyof WeddingData, value: any) => void;
    updateTheme: (key: string, value: any) => void;
    setWedding: React.Dispatch<React.SetStateAction<WeddingData | null>>;
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

const Step3Time: React.FC<Step3TimeProps> = ({ wedding, updateWedding, updateTheme, setWedding }) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = React.useState(false);
    const [showExtraDetails, setShowExtraDetails] = React.useState(false);
    const isAnniv = wedding.eventType === 'anniversary';

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!wedding.date) return;
        const dateValue = toDateInputString(wedding.date);
        if (!dateValue) return;
        const lunarDate = toKhmerLunarDate(dateValue).lunarDateText;
        if (lunarDate && lunarDate !== wedding.themeSettings?.lunarDate) {
            updateTheme("lunarDate", lunarDate);
        }
    }, [wedding.date]);

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
                const lunarDate = toKhmerLunarDate(dateVal).lunarDateText;
                if (lunarDate) updateTheme("lunarDate", lunarDate);
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
    const updateActivity = (index: number, key: "title" | "time" | "description", value: string) => {
        setWedding((current) => current ? {
            ...current,
            activities: current.activities.map((activity, activityIndex) =>
                activityIndex === index ? { ...activity, [key]: value } : activity,
            ),
        } : current);
    };
    const addActivity = () => {
        setWedding((current) => current ? {
            ...current,
            activities: [
                ...current.activities,
                { title: "", time: "", description: "", order: current.activities.length },
            ],
        } : current);
    };
    const removeActivity = (index: number) => {
        setWedding((current) => current ? {
            ...current,
            activities: current.activities.filter((_, activityIndex) => activityIndex !== index),
        } : current);
    };
    const moveActivity = (index: number, direction: -1 | 1) => {
        setWedding((current) => {
            if (!current) return current;
            const nextIndex = index + direction;
            if (nextIndex < 0 || nextIndex >= current.activities.length) return current;
            const activities = [...current.activities];
            [activities[index], activities[nextIndex]] = [activities[nextIndex], activities[index]];
            return {
                ...current,
                activities: activities.map((activity, activityIndex) => ({ ...activity, order: activityIndex })),
            };
        });
    };

    return (
        <div className="space-y-6 font-kantumruy">
            <div className="rounded-2xl border border-teal-200/70 bg-teal-50/60 p-4 dark:border-teal-500/20 dark:bg-teal-500/5">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-foreground">ថ្ងៃ និងទីតាំងកម្មវិធី</h3>
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">ត្រូវបំពេញ</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t("wizard.steps.3.requiredIntro", { defaultValue: "សូមបញ្ចូលថ្ងៃ ទីតាំង និង Google Maps link។ ម៉ោងអាចរំលងបាន។" })}
                </p>
            </div>

            {/* Date & Location Fields */}
            <div className="space-y-5">
                {/* Event Date & Time Grid */}
                <div className="space-y-2.5 bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* 1. Date Picker */}
                        <div className="space-y-1.5">
                            <Label className="block text-xs font-bold text-foreground">
                                {t("wizard.steps.3.eventDate", { defaultValue: "ថ្ងៃ ខែ ឆ្នាំ កម្មវិធី" })} <span className="text-teal-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    aria-required="true"
                                    className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 shadow-sm cursor-pointer"
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
                                <span className="ml-1 font-normal text-muted-foreground">(អាចរំលងបាន)</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    type="time"
                                    className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 shadow-sm cursor-pointer font-mono"
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
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200/60 dark:border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold font-kantumruy">
                                <Sparkles className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                <span>ត្រូវនឹង៖ {khmerDatePreview}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2.5 bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <Label className="block text-xs font-bold text-foreground">
                        ឈ្មោះទីតាំងកម្មវិធី <span className="text-teal-500">*</span>
                    </Label>
                    <DebouncedInput
                        aria-required="true"
                        className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 placeholder:text-muted-foreground/60 shadow-sm"
                        placeholder="ឧ. មជ្ឈមណ្ឌលកោះពេជ្រ អគារ A"
                        value={wedding.location || ""}
                        onDebouncedChange={(val) => updateWedding("location", val)}
                    />
                    <p className="text-[11px] text-muted-foreground">ព័ត៌មាននេះនឹងបង្ហាញលើសំបុត្រអញ្ជើញ។</p>
                </div>

                {/* Required Google Maps link */}
                <section className="space-y-3 rounded-2xl border border-teal-200/80 bg-teal-50/40 p-4 dark:border-teal-500/20 dark:bg-teal-500/[0.03] sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="wedding-map-link" className="text-xs font-bold text-foreground">
                            {t("wizard.steps.3.mapLabel", { defaultValue: "ទីតាំងលើ Google Maps" })}
                            <span className="ml-1 text-rose-500">*</span>
                        </Label>
                        <a
                            href="https://www.google.com/maps"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-teal-700 shadow-sm hover:underline dark:bg-white/10 dark:text-teal-300"
                        >
                            <ExternalLink className="h-3 w-3" />
                            {t("wizard.steps.3.mapOpen", { defaultValue: "បើក Google Maps" })}
                        </a>
                    </div>
                    <ol className="list-decimal space-y-1 pl-5 text-[11px] leading-relaxed text-muted-foreground">
                        <li>{t("wizard.steps.3.mapStep1", { defaultValue: "បើក Google Maps ហើយស្វែងរកឈ្មោះទីតាំងកម្មវិធី។" })}</li>
                        <li>{t("wizard.steps.3.mapStep2", { defaultValue: "ចុច ឬចុចឲ្យជាប់លើទីតាំង រួចជ្រើសរើស «ចែករំលែក» (Share)។" })}</li>
                        <li>{t("wizard.steps.3.mapStep3", { defaultValue: "ចុច «ចម្លងតំណ» (Copy link) ហើយយកមកបិទភ្ជាប់ក្នុងប្រអប់ខាងក្រោម។" })}</li>
                    </ol>
                    <DebouncedInput
                        id="wedding-map-link"
                        aria-required="true"
                        aria-invalid={!wedding.themeSettings?.mapLink?.trim() && !wedding.mapUrl?.trim()}
                        className="h-11 rounded-xl border border-slate-200/80 bg-white text-xs text-foreground shadow-sm placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-teal-500/20 dark:border-white/10 dark:bg-black/20"
                        placeholder={t("wizard.steps.3.mapPlaceholder", { defaultValue: "ចម្លងតំណភ្ជាប់ 'Share' ពី Google Maps មកដាក់ទីនេះ..." })}
                        value={wedding.themeSettings?.mapLink || wedding.mapUrl || ""}
                        onDebouncedChange={(val) => updateTheme("mapLink", val)}
                    />
                    {!wedding.themeSettings?.mapLink?.trim() && !wedding.mapUrl?.trim() && (
                        <p role="status" className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            {t("wizard.steps.3.mapRequiredHint", { defaultValue: "ត្រូវបញ្ចូល Google Maps link មុនពេលបន្ត ឬរក្សាទុក។" })}
                        </p>
                    )}
                </section>

                <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02] sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-foreground">
                                    {isAnniv ? "កម្មវិធីសិរីមង្គលភ្ជាប់ពាក្យ" : "កម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍"}
                                </h3>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    មានកម្មវិធីគំរូស្រាប់។ អ្នកអាចកែចំណងជើង ម៉ោង និងព័ត៌មាន ឬបន្ថែមកម្មវិធីថ្មីបាន។
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {wedding.activities.length} វគ្គ
                        </span>
                    </div>

                    {wedding.activities.map((activity, index) => (
                        <div key={index} className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-black/10 sm:p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-black text-white">
                                        {index + 1}
                                    </span>
                                    <p className="truncate text-xs font-bold text-foreground">
                                        {activity.title.trim() || `វគ្គទី ${index + 1}`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveActivity(index, -1)}
                                        disabled={index === 0}
                                        aria-label={`ផ្លាស់ទីវគ្គទី ${index + 1} ឡើងលើ`}
                                        title="ផ្លាស់ទីឡើងលើ"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-300 dark:hover:bg-white/10"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveActivity(index, 1)}
                                        disabled={index === wedding.activities.length - 1}
                                        aria-label={`ផ្លាស់ទីវគ្គទី ${index + 1} ចុះក្រោម`}
                                        title="ផ្លាស់ទីចុះក្រោម"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-300 dark:hover:bg-white/10"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeActivity(index)}
                                        aria-label={`លុបវគ្គទី ${index + 1}`}
                                        title="លុបវគ្គ"
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
                                <div className="space-y-1.5">
                                    <Label htmlFor={`activity-title-${index}`} className="text-xs font-bold text-foreground">
                                        ចំណងជើងវគ្គ <span className="text-teal-600">(ត្រូវបំពេញ)</span>
                                    </Label>
                                    <Input
                                        id={`activity-title-${index}`}
                                        value={activity.title}
                                        onChange={(event) => updateActivity(index, "title", event.target.value)}
                                        placeholder="ឧ. ពិធីសំពះផ្ទឹម"
                                        className="h-11 rounded-xl bg-white text-sm dark:bg-black/20"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`activity-time-${index}`} className="text-xs font-bold text-foreground">
                                        ម៉ោង
                                    </Label>
                                    <Input
                                        id={`activity-time-${index}`}
                                        value={activity.time}
                                        onChange={(event) => updateActivity(index, "time", event.target.value)}
                                        placeholder="ឧ. ០៨:៣០ ព្រឹក"
                                        className="h-11 rounded-xl bg-white text-sm dark:bg-black/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`activity-description-${index}`} className="text-xs font-bold text-foreground">
                                    ព័ត៌មានលម្អិត <span className="font-normal text-muted-foreground">(អាចរំលងបាន)</span>
                                </Label>
                                <textarea
                                    id={`activity-description-${index}`}
                                    value={activity.description || ""}
                                    onChange={(event) => updateActivity(index, "description", event.target.value)}
                                    placeholder="សរសេរព័ត៌មានបន្ថែមអំពីវគ្គនេះ..."
                                    rows={2}
                                    className="w-full resize-y rounded-xl border border-input bg-white px-3 py-2.5 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 dark:bg-black/20"
                                />
                            </div>
                        </div>
                    ))}

                    {wedding.activities.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-teal-300 bg-teal-50/40 px-4 py-6 text-center dark:border-teal-500/30 dark:bg-teal-500/5">
                            <CalendarDays className="mx-auto h-8 w-8 text-teal-700/60 dark:text-teal-300/60" />
                            <p className="mt-2 text-sm font-bold text-foreground">មិនទាន់មានវគ្គកម្មវិធីទេ</p>
                            <p className="mt-1 text-xs text-muted-foreground">បន្ថែមវគ្គដំបូង រួចបញ្ចូលចំណងជើង និងម៉ោង។</p>
                            <Button type="button" onClick={addActivity} className="mt-4 h-11 gap-2 rounded-xl px-5">
                                <Plus className="h-4 w-4" />
                                បន្ថែមវគ្គដំបូង
                            </Button>
                        </div>
                    ) : (
                        <Button type="button" variant="outline" onClick={addActivity} className="h-11 w-full gap-2 rounded-xl">
                            <Plus className="h-4 w-4" />
                            បន្ថែមវគ្គកម្មវិធី
                        </Button>
                    )}
                </section>

                <button
                    type="button"
                    onClick={() => setShowExtraDetails((value) => !value)}
                    aria-expanded={showExtraDetails}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-left dark:border-white/10 dark:bg-white/[0.02]"
                >
                    <span className="font-kantumruy text-xs font-bold text-foreground">បន្ថែមព័ត៌មានកម្មវិធី (អាចរំលងបាន)</span>
                    <span className={`text-muted-foreground transition-transform ${showExtraDetails ? "rotate-180" : ""}`}>⌄</span>
                </button>

                {showExtraDetails && <>
                {/* Lunar Date Field */}
                <div className="space-y-2">
                    <Label className="block text-xs font-bold text-foreground">
                        {t("wizard.steps.3.lunarDate", { defaultValue: "កាលបរិច្ឆេទចន្ទគតិ" })}
                        <span className="ml-1 font-normal text-emerald-600">(ស្វ័យប្រវត្តិ អាចកែបាន)</span>
                    </Label>
                    <DebouncedInput
                        className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 placeholder:text-muted-foreground/60 shadow-sm"
                        placeholder={t("wizard.steps.3.lunarPlaceholder", { defaultValue: "ឧ. ថ្ងៃ ១៥ កើត ខែពិសាខ ឆ្នាំរោង" })}
                        value={wedding.themeSettings?.lunarDate || ""}
                        onDebouncedChange={(val) => updateTheme("lunarDate", val)}
                    />
                </div>

                </>}
            </div>
        </div>
    );
};

export default React.memo(Step3Time);
