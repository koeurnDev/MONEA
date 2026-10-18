import React, { lazy, Suspense } from 'react';
import { useGuests } from "./hooks/useGuests";
import { GuestListHeader } from "./components/GuestListHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Users, X, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const MobileGuestList = lazy<React.ComponentType<any>>(() => import("./components/MobileGuestList").then(m => ({ default: (m as any).MobileGuestList })));
const DesktopGuestTable = lazy<React.ComponentType<any>>(() => import("./components/DesktopGuestTable").then(m => ({ default: (m as any).DesktopGuestTable })));
const GuestDeleteDialog = lazy<React.ComponentType<any>>(() => import("./components/GuestDeleteDialog").then(m => ({ default: (m as any).GuestDeleteDialog })));
const DigitalPassModal = lazy<React.ComponentType<any>>(() => import("./components/DigitalPassModal").then(m => ({ default: (m as any).DigitalPassModal })));

export default function GuestPage() {
    const { t, locale } = useTranslation();
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isLoading && !user?.weddingId) {
            navigate('/dashboard/create', { replace: true });
        }
    }, [isLoading, user?.weddingId, navigate]);

    const {
        filteredGuests,
        wedding,
        search,
        setSearch,
        open,
        setOpen,
        loading,
        loadError,
        loadingMore,
        loadMoreError,
        fetchMoreGuests,
        hasMore,
        visibleCount,
        setVisibleCount,
        copiedId,
        editingGuest,
        setEditingGuest,
        deleteGuest,
        setDeleteGuest,
        loadData,
        addGuestOptimistic,
        updateGuestOptimistic,
        exportCSV,
        copyLink,
        shareTelegram,
        handlePrint,
        confirmDelete,
        isArchived,
        isPremium
    } = useGuests();

    const [passGuest, setPassGuest] = React.useState<any | null>(null);

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
        <div className="space-y-5 sm:space-y-8 pb-10 print:p-0 print:m-0 print:bg-white print:text-black">
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
                <h1 className="text-3xl font-black tracking-[0.08em] text-teal-600 font-sans">MONEO</h1>
                <div className="h-0.5 w-12 bg-teal-200 mx-auto mt-3 opacity-50" />
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
                    <div className="bg-teal-50/30 p-6 border-r border-slate-100">
                        <p className="text-xs text-teal-400 font-black uppercase tracking-widest mb-1.5 font-kantumruy">{t("guests.print.totalGuests")}</p>
                        <p className="text-2xl font-black text-slate-900 font-kantumruy">{filteredGuests.length} {t("guests.print.personUnit")}</p>
                    </div>
                    <div className="bg-slate-50/50 p-6">
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1.5 font-kantumruy">{t("guests.print.reportStatus")}</p>
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
                onOptimisticAdd={addGuestOptimistic}
                onOptimisticUpdate={updateGuestOptimistic}
                onExportExcel={exportCSV}
                onPrintPdf={handlePrint}
            />

            <div className="bg-card rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden print:shadow-none print:rounded-none">
                <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 print:hidden">
                    {filteredGuests.length > 0 && (
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {t("guests.total")}: {filteredGuests.length} {t("guests.personUnit")}
                        </div>
                    )}
                    <div className="relative w-full sm:max-w-sm sm:ml-auto">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                        <Input
                            type="search"
                            aria-label={t("guests.search")}
                            placeholder={t("guests.search")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={cn(
                                "pl-10 h-10 bg-muted border-transparent focus-visible:ring-primary/20 rounded-xl font-kantumruy text-sm",
                                search ? "pr-10" : ""
                            )}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label={t("guests.clearSearch", { defaultValue: "សម្អាតការស្វែងរក" })}
                                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground/60 transition-all hover:bg-background hover:text-foreground active:scale-90"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {loadError ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-10 text-center" role="alert">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="font-kantumruy text-base font-bold text-foreground">
                                មិនអាចទាញយកបញ្ជីភ្ញៀវបានទេ
                            </h2>
                            <p className="font-kantumruy text-sm text-muted-foreground">
                                សូមពិនិត្យការតភ្ជាប់ រួចសាកល្បងម្ដងទៀត។
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void loadData()}
                            disabled={loading}
                            className="mt-1 h-11 min-w-36 rounded-xl font-kantumruy text-sm font-bold"
                        >
                            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                            សាកល្បងម្ដងទៀត
                        </Button>
                    </div>
                ) : (
                    <>
                        <MobileGuestList
                            loading={loading}
                            guests={filteredGuests}
                            searchActive={Boolean(search.trim())}
                            onClearSearch={() => setSearch("")}
                            visibleCount={visibleCount}
                            setVisibleCount={setVisibleCount}
                            copiedId={copiedId}
                            isArchived={isArchived}
                            onCopyLink={copyLink}
                            onShareTelegram={shareTelegram}
                            onViewPass={(g: any) => setPassGuest(g)}
                            onEdit={(g: any) => { setEditingGuest(g); setOpen(true); }}
                            onDelete={(id: any, name: any) => setDeleteGuest({ id, name })}
                        />

                        <DesktopGuestTable
                            loading={loading}
                            guests={filteredGuests}
                            searchActive={Boolean(search.trim())}
                            onClearSearch={() => setSearch("")}
                            visibleCount={visibleCount}
                            setVisibleCount={setVisibleCount}
                            copiedId={copiedId}
                            isArchived={isArchived}
                            onCopyLink={copyLink}
                            onShareTelegram={shareTelegram}
                            onViewPass={(g: any) => setPassGuest(g)}
                            onEdit={(g: any) => { setEditingGuest(g); setOpen(true); }}
                            onDelete={(id: any, name: any) => setDeleteGuest({ id, name })}
                        />
                    </>
                )}

                {/* Load More Button for Pagination */}
                {hasMore && !search && (
                    <div className="p-4 sm:p-6 flex justify-center border-t border-slate-100 dark:border-white/5 print:hidden">
                        <div className="flex flex-col items-center gap-2">
                            {loadMoreError && (
                                <p className="font-kantumruy text-sm text-rose-600 dark:text-rose-400" role="alert">
                                    មិនអាចទាញយកភ្ញៀវបន្ថែមបានទេ។ សូមសាកល្បងម្ដងទៀត។
                                </p>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => void fetchMoreGuests()}
                                disabled={loadingMore}
                                className="h-11 rounded-xl border-slate-200 px-8 font-kantumruy font-bold shadow-sm hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                        {t("common.loading.loading", { defaultValue: "កំពុងដំណើរការ..." })}
                                    </span>
                                ) : loadMoreError ? (
                                    "សាកល្បងម្ដងទៀត"
                                ) : (
                                    t("common.actions.loadMore", { defaultValue: "ទាញយកបន្ថែម (Load More)" })
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- PRINT ONLY FOOTER --- */}
            <div className="hidden print:flex flex-col mb-10 pt-8 px-10 mt-16 font-kantumruy border-t-2 border-slate-100">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <p suppressHydrationWarning className="text-slate-400 uppercase tracking-[0.15em] text-xs font-black">{t("guests.print.reportDate")}</p>
                        <p suppressHydrationWarning className="text-sm font-bold text-slate-900">
                            {formatKhmerDate(new Date())}
                        </p>
                    </div>
                    
                    <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-slate-400 uppercase tracking-[0.15em] text-xs font-black">{t("guests.print.validity")}</p>
                        </div>
                        <p className="text-sm font-black text-slate-900">{t("guests.print.officialReport")}</p>
                    </div>
                </div>
                
                <div className="mt-24 text-center">
                    <p className="text-xs text-slate-300 uppercase tracking-[0.5em] font-medium font-kantumruy mb-2">
                        MONEO • OFFICIAL WEDDING RECORD
                    </p>
                    <p className="text-xs text-slate-300 font-medium font-kantumruy">
                        {t("guests.print.footerNote")}
                    </p>
                </div>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            {!isArchived && filteredGuests.length > 0 && (
                <div className="md:hidden fixed bottom-24 right-5 z-40 print:hidden">
                    <Button
                        onClick={() => {
                            setEditingGuest(null);
                            setOpen(true);
                        }}
                        className="w-14 h-14 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 backdrop-blur-xl border border-red-500/20 shadow-[0_8px_32px_rgba(239,68,68,0.15)] flex items-center justify-center p-0 transition-all"
                        aria-label={t("guests.form.addBtn")}
                    >
                        <Plus size={28} strokeWidth={3} />
                    </Button>
                </div>
            )}

            <GuestDeleteDialog
                deleteGuest={deleteGuest}
                onOpenChange={(v: any) => !v && setDeleteGuest(null)}
                onConfirm={confirmDelete}
            />

            <Suspense fallback={null}>
                <DigitalPassModal
                    open={Boolean(passGuest)}
                    onOpenChange={(open: boolean) => {
                        if (!open) setPassGuest(null);
                    }}
                    guest={passGuest}
                    wedding={wedding}
                />
            </Suspense>
        </div>
    );
}
