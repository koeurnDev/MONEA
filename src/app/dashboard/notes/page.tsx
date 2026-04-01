"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Save, Loader2, Sparkles, AlertCircle, CheckCircle2, FileText, StickyNote, History, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m, AnimatePresence } from 'framer-motion';
import { useDebounce } from "@/hooks/use-debounce";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import useSWR from "swr";
import { useTranslation } from "@/i18n/LanguageProvider";

export default function NotesPage() {
    const { t } = useTranslation();
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { data: wedding = null } = useSWR("/api/wedding", (url) => fetch(url).then(res => res.json()).catch(() => null));

    const fetchNotes = useCallback(async () => {
        try {
            const res = await fetch("/api/wedding/notes");
            if (res.ok) {
                const data = await res.json();
                setNotes(data.notes || "");
            } else {
                setError(t("dashboard.notes.error.fetch"));
            }
        } catch (err) {
            setError(t("dashboard.notes.error.connection"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    // Fetch existing notes
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/wedding/notes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });
            if (res.ok) {
                setLastSaved(new Date());
            } else {
                setError(t("dashboard.notes.error.save"));
            }
        } catch (err) {
            setError(t("dashboard.notes.error.connection"));
        } finally {
            setSaving(false);
        }
    }, [notes, t]);

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = ""; // Clear title to hide from browser print header
        window.print();
        document.title = originalTitle;
    };

    // Localization Helpers
    const formatEventDate = (date: Date | string | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        const day = d.getDate();
        const monthIndex = d.getMonth();
        const year = d.getFullYear();

        const khmerDigits = t("common.calendar.digits", { returnObjects: true }) as string[];
        const khmerMonths = t("common.calendar.months", { returnObjects: true }) as string[];

        const toLocalizedNum = (num: number) => {
            if (t("common.constants.locale") === "en-US") return String(num);
            return String(num).split('').map(digit => khmerDigits[parseInt(digit)] || digit).join('');
        };

        if (t("common.constants.locale") === "en-US") {
            return `${khmerMonths[monthIndex]} ${day}, ${year}`;
        }

        return `${t("common.calendar.day")}${t("common.calendar.number")}${toLocalizedNum(day)} ${t("common.calendar.month")}${khmerMonths[monthIndex]} ${t("common.calendar.year")} ${toLocalizedNum(year)}`;
    };

    // Auto-save logic (optional, but let's provide a save button for manual control too)
    const debouncedNotes = useDebounce(notes, 3000);
    useEffect(() => {
        if (debouncedNotes && !loading && notes !== "") {
            handleSave();
        }
    }, [debouncedNotes, loading, notes, handleSave]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                <p className="text-muted-foreground font-khmer animate-pulse">{t("dashboard.notes.loading")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 p-6 md:p-10 print:p-0 print:m-0 print:bg-white print:text-black">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        margin: 1.5cm;
                        size: A4 portrait;
                    }
                    body { 
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-family: 'Inter', 'Kantumruy Pro', sans-serif;
                        background: white !important;
                        color: black !important;
                    }
                    .print-hidden { display: none !important; }
                    .bg-card, .bg-muted { background: white !important; border: none !important; box-shadow: none !important; }
                    textarea { border: 1px solid #eee !important; background: white !important; height: auto !important; min-height: 10cm !important; }
                }
            ` }} />

            {/* --- PRINT ONLY HEADER --- */}
            <div className="hidden print:block text-center pt-8 mb-8 border-b-2 border-slate-100 pb-8">
                <div className="flex justify-center mb-6">
                    <MoneaLogo showText size="xl" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2 font-kantumruy">{t("dashboard.notes.print.header")}</h1>
                {wedding?.groomName && (
                    <p className="text-xl text-slate-500 font-bold font-kantumruy">
                        {t("dashboard.notes.print.weddingLabel")} {wedding.groomName} & {wedding.brideName}
                    </p>
                )}
                <p className="text-sm text-slate-400 font-bold font-kantumruy mt-2">
                    {formatEventDate(new Date())}
                </p>
            </div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:bg-slate-800">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight font-kantumruy">{t("dashboard.notes.title")}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground font-bold font-khmer">{t("dashboard.notes.organizerOnly")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 print:hidden">
                    {lastSaved && (
                        <div className="hidden sm:flex items-center gap-2 text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-full shadow-sm animate-in fade-in slide-in-from-right-4">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-bold font-khmer">{t("dashboard.notes.saved")}</span>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="h-12 px-6 rounded-xl border-dashed border-2 hover:bg-muted font-kantumruy font-bold transition-all flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        {t("dashboard.notes.pdf")}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {t("dashboard.notes.save")}
                    </Button>
                </div>
            </div>

            {/* Main Content Card */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)] p-8 md:p-12 relative overflow-hidden will-change-transform"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[60px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <StickyNote className="w-5 h-5 text-red-500" />
                        <h3 className="text-sm font-black text-foreground uppercase tracking-wide">{t("dashboard.notes.workspace")}</h3>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-600 rounded-2xl flex items-center gap-3 animate-pulse">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-bold font-khmer">{error}</p>
                        </div>
                    )}

                    <div className="relative group">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t("dashboard.notes.placeholder")}
                            className="w-full min-h-[500px] bg-muted/40 border-none rounded-3xl p-8 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-background shadow-inner transition-all font-kantumruy leading-relaxed text-lg resize-none"
                        />
                        <div className="absolute bottom-6 right-8 flex items-center gap-2 text-muted-foreground/30 group-focus-within:text-muted-foreground transition-colors">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                        <div className="p-6 bg-muted/30 rounded-2xl space-y-2 group hover:bg-background hover:shadow-sm transition-all">
                            <div className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-red-500 transition-colors">
                                <History className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-foreground uppercase tracking-wide">{t("dashboard.notes.persistence.title")}</h4>
                            <p className="text-[11px] text-muted-foreground font-khmer">{t("dashboard.notes.persistence.description")}</p>
                        </div>
                        <div className="p-6 bg-muted/30 rounded-2xl space-y-2 group hover:bg-background hover:shadow-sm transition-all">
                            <div className="w-10 h-10 rounded-xl bg-background shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-red-500 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-foreground uppercase tracking-wide">{t("dashboard.notes.usage.title")}</h4>
                            <p className="text-[11px] text-muted-foreground font-khmer">{t("dashboard.notes.usage.description")}</p>
                        </div>
                        <div className="p-6 bg-muted/20 rounded-2xl flex items-center justify-center text-center shadow-inner">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-loose">{t("dashboard.notes.premium")} <br /> {t("dashboard.notes.adminCenter")}</p>
                        </div>
                    </div>
                </div>
            </m.div>

            {/* --- PRINT ONLY FOOTER --- */}
            <div className="hidden print:flex flex-col mb-10 pt-8 px-10 mt-16 font-kantumruy border-t-2 border-slate-100 italic opacity-60">
                <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{t("common.constants.brandName")} Platform</p>
                    <p className="text-[10px] font-bold">{t("dashboard.notes.print.generated")} {new Date().toLocaleString(t("common.constants.locale"), { timeZone: 'Asia/Phnom_Penh' })}</p>
                </div>
            </div>
        </div>
    );
}
