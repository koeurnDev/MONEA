"use client";

import { useGuests } from "./hooks/useGuests";
import { GuestListHeader } from "./components/GuestListHeader";
import { MobileGuestList } from "./components/MobileGuestList";
import { DesktopGuestTable } from "./components/DesktopGuestTable";
import { GuestDeleteDialog } from "./components/GuestDeleteDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Users } from "lucide-react";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/LanguageProvider";

import { GuestForm } from "./guest-form";

export default function GuestPage() {
    const { t, locale } = useTranslation();
    const {
        filteredGuests,
        wedding,
        search,
        setSearch,
        open,
        setOpen,
        loading,
        visibleCount,
        setVisibleCount,
        copiedId,
        editingGuest,
        setEditingGuest,
        deleteId,
        setDeleteId,
        loadData,
        exportCSV,
        copyLink,
        handlePrint,
        confirmDelete,
        isArchived,
        isPremium
    } = useGuests();

    // Manual Khmer Date Formatter for robustness
    const formatKhmerDate = (date: Date | string | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        
        if (locale === 'en') {
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        const day = d.getDate();
        const monthIndex = d.getMonth();
        const year = d.getFullYear();
        const dayOfWeek = d.getDay();
        
        const khmerDays = t("common.calendar.days", { returnObjects: true }) as string[];
        const khmerMonths = t("common.calendar.months", { returnObjects: true }) as string[];
        const khmerDigits = t("common.calendar.digits", { returnObjects: true }) as string[];
        
        const toKhmerNum = (num: number) => String(num).split('').map(digit => khmerDigits[parseInt(digit)] || digit).join('');

        return `${t("common.calendar.day")}${khmerDays[dayOfWeek]} ${t("common.calendar.number")}${toKhmerNum(day)} ${t("common.calendar.month")}${khmerMonths[monthIndex]} ${t("common.calendar.year")}${toKhmerNum(year)}`;
    };

    return (
        <div className="space-y-8 pb-10 print:p-0 print:m-0 print:bg-white print:text-black">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        margin: 1.5cm 1.5cm 1.5cm 2.5cm;
                        size: A4 portrait;
                    }
                    body { 
                        padding: 0 1.5cm 1.5cm 1.5cm;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-family: 'Inter', 'Kantumruy Pro', sans-serif;
                        background: white !important;
                        color: black !important;
                    }
                    
                    /* NUCLEAR RESET: Force Light Mode for EVERYTHING in print */
                    html, body, #__next, main, div, section, p, span, table, tr, td, th {
                        color-scheme: light !important;
                        background-color: white !important;
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Reset all theme variables to Light Mode values specifically for print */
                    :root, .dark, [data-theme='dark'], body.dark {
                        --background: 0 0% 100% !important;
                        --foreground: 0 0% 3.9% !important;
                        --border: 0 0% 89.8% !important;
                        --muted: 0 0% 96.1% !important;
                        --muted-foreground: 0 0% 45.1% !important;
                        --card: 255 255% 255% !important;
                    }

                    .print-hidden, .fab-container, nav, aside, footer:not(.print-footer) {
                        display: none !important;
                    }
                    
                    table { border-collapse: collapse !important; width: 100% !important; border: 1.5pt solid #cbd5e1 !important; border-top: 2pt solid #fda4af !important; }
                    th, td { border: 1px solid #cbd5e1 !important; }
                }
            ` }} />

            {/* --- PRINT ONLY HEADER --- */}
            <div className="hidden print:block text-center pt-8 mb-2">
                <h1 className="text-3xl font-black tracking-[0.25em] text-rose-600 font-sans">MONEA</h1>
                <div className="h-0.5 w-12 bg-rose-200 mx-auto mt-3 opacity-50" />
            </div>

            <div className="hidden print:block mb-8 text-center pt-4">
                <h1 className="text-3xl font-black text-slate-900 mb-2 font-kantumruy">{t("guests.print.header")}</h1>
                <p className="text-xl text-slate-500 font-bold font-kantumruy">{t("guests.print.weddingOf", { groom: wedding?.groomName || '...', bride: wedding?.brideName || '...' })}</p>
                {wedding?.date && (
                    <p className="text-lg text-slate-400 font-bold font-kantumruy mt-1">
                        {formatKhmerDate(wedding.date)}
                    </p>
                )}
            </div>

            <div className="hidden print:block mb-8">
                <div className="grid grid-cols-2 gap-0 border border-slate-100 rounded-3xl overflow-hidden">
                    <div className="bg-rose-50/30 p-6 border-r border-slate-100">
                        <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1.5 font-kantumruy">{t("guests.print.totalGuests")}</p>
                        <p className="text-2xl font-black text-slate-900 font-kantumruy">{filteredGuests.length} {t("guests.print.personUnit")}</p>
                    </div>
                    <div className="bg-slate-50/50 p-6">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 font-kantumruy">{t("guests.print.reportStatus")}</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-base font-black text-slate-900 font-kantumruy">{t("guests.print.official")}</p>
                        </div>
                    </div>
                </div>
            </div>

            <GuestListHeader
                isArchived={isArchived}
                isPremium={isPremium}
                loading={loading}
                open={open}
                setOpen={setOpen}
                editingGuest={editingGuest}
                setEditingGuest={setEditingGuest}
                loadData={loadData}
                onExportExcel={exportCSV}
                onPrintPdf={handlePrint}
            />

            <div className="bg-card rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden print:shadow-none print:rounded-none">
                <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4 print:hidden">
                    {filteredGuests.length > 0 && (
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {t("guests.total")}: {filteredGuests.length} {t("guests.personUnit")}
                        </div>
                    )}
                    <div className="relative w-full sm:max-w-sm sm:ml-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            placeholder={t("guests.search")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10 bg-muted border-transparent focus-visible:ring-rose-600/20 rounded-xl font-kantumruy text-sm"
                        />
                    </div>
                </div>

                <MobileGuestList
                    loading={loading}
                    guests={filteredGuests}
                    visibleCount={visibleCount}
                    setVisibleCount={setVisibleCount}
                    copiedId={copiedId}
                    isArchived={isArchived}
                    onCopyLink={copyLink}
                    onEdit={(g) => { setEditingGuest(g); setOpen(true); }}
                    onDelete={setDeleteId}
                />

                <DesktopGuestTable
                    loading={loading}
                    guests={filteredGuests}
                    visibleCount={visibleCount}
                    setVisibleCount={setVisibleCount}
                    copiedId={copiedId}
                    isArchived={isArchived}
                    onCopyLink={copyLink}
                    onEdit={(g) => { setEditingGuest(g); setOpen(true); }}
                    onDelete={setDeleteId}
                />
            </div>

            {/* --- PRINT ONLY FOOTER --- */}
            <div className="hidden print:flex flex-col mb-10 pt-8 px-10 mt-16 font-kantumruy border-t-2 border-slate-100">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <p suppressHydrationWarning className="text-slate-400 uppercase tracking-[0.15em] text-[9px] font-black">{t("guests.print.reportDate")}</p>
                        <p suppressHydrationWarning className="text-sm font-bold text-slate-900">
                            {formatKhmerDate(new Date())}
                        </p>
                    </div>
                    
                    <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-slate-400 uppercase tracking-[0.15em] text-[9px] font-black">{t("guests.print.validity")}</p>
                        </div>
                        <p className="text-sm font-black text-slate-900">{t("guests.print.officialReport")}</p>
                    </div>
                </div>
                
                <div className="mt-24 text-center">
                    <p className="text-[10px] text-slate-300 uppercase tracking-[0.5em] font-medium font-kantumruy mb-2">
                        MONEA PLATFORM • OFFICIAL WEDDING RECORD
                    </p>
                    <p className="text-[9px] text-slate-300 font-medium font-kantumruy">
                        {t("guests.print.footerNote")}
                    </p>
                </div>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            {!isArchived && (
                <div className="md:hidden fixed bottom-28 right-6 z-40 print:hidden">
                    <Dialog open={open} onOpenChange={(v) => {
                        setOpen(v);
                        if (!v) setEditingGuest(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button
                                className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center p-0 transition-all border-none"
                            >
                                <Plus size={28} strokeWidth={3} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[94vw] max-w-[480px] rounded-3xl border-none shadow-2xl p-4 pt-10 bg-card">
                            <div className="sr-only">
                                <DialogTitle>{t("guests.form.title")}</DialogTitle>
                                <DialogDescription>
                                    {t("guests.form.description")}
                                </DialogDescription>
                            </div>
                            <GuestForm
                                initialData={editingGuest}
                                onSuccess={loadData}
                                onDone={() => {
                                    setOpen(false);
                                    setEditingGuest(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <GuestDeleteDialog
                deleteId={deleteId}
                onOpenChange={(v) => !v && setDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
