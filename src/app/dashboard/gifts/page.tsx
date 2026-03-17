"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Gift, Monitor, Printer, Eye, EyeOff, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GiftForm } from "./gift-form";
import Link from "next/link";

// Extracted Components
import { GiftSummaryCards } from "./components/GiftSummaryCards";
import { MobileGiftList } from "./components/MobileGiftList";
import { DesktopGiftTable } from "./components/DesktopGiftTable";
import { OfflineSyncBanner } from "./components/OfflineSyncBanner";

// Extracted Hook
import { useGiftsPage } from "./hooks/useGiftsPage";

export default function GiftPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Using the extracted hook
    const {
        wedding,
        sortedGifts,
        userRole,
        loading,
        visibleCount,
        setVisibleCount,
        offlineCount,
        isSyncing,
        sortConfig,
        toggleSort,
        syncOfflineGifts,
        clearOfflineQueue,
        handlePrint,
        exportExcel,
        toggleShowGifts,
        totals,
        refresh,
        searchQuery,
        setSearchQuery
    } = useGiftsPage(() => setIsDialogOpen(false));

    // Manual Khmer Date Formatter for robustness
    const formatKhmerDate = (date: Date | string | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        const day = d.getDate();
        const monthIndex = d.getMonth();
        const year = d.getFullYear();
        const dayOfWeek = d.getDay();
        
        const khmerDays = [
            "អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"
        ];
        
        const khmerMonths = [
            "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
            "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
        ];
        
        const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
        const toKhmerNum = (num: number) => String(num).split('').map(digit => khmerDigits[parseInt(digit)] || digit).join('');

        return `ថ្ងៃ${khmerDays[dayOfWeek]} ទី${toKhmerNum(day)} ខែ${khmerMonths[monthIndex]} ឆ្នាំ ${toKhmerNum(year)}`;
    };

    return (
        <div className="space-y-6 pb-10 print:p-0 print:m-0 print:bg-white print:text-black min-h-screen">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; }
                    body { 
                        padding: 0 1.5cm 1.5cm 1.5cm;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-family: 'Inter', 'Kantumruy Pro', sans-serif;
                    }
                    .print-break-after { page-break-after: always; }
                    .print-no-break { page-break-inside: avoid; }
                    @media print {
                        @page { 
                            margin: 1.5cm 1.5cm 1.5cm 2.5cm; /* Top, Right, Bottom, Left (Gutter for binding) */
                            size: A4 portrait; 
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
                            --card: 0 0% 100% !important;
                            --card-foreground: 0 0% 3.9% !important;
                            --popover: 0 0% 100% !important;
                            --popover-foreground: 0 0% 3.9% !important;
                            --primary: 0 0% 9% !important;
                            --primary-foreground: 0 0% 98% !important;
                            --secondary: 0 0% 96.1% !important;
                            --secondary-foreground: 0 0% 9% !important;
                            --muted: 0 0% 96.1% !important;
                            --muted-foreground: 0 0% 45.1% !important;
                            --accent: 0 0% 96.1% !important;
                            --accent-foreground: 0 0% 9% !important;
                            --destructive: 0 84.2% 60.2% !important;
                            --destructive-foreground: 0 0% 98% !important;
                            --border: 0 0% 89.8% !important;
                            --input: 0 0% 89.8% !important;
                            --ring: 0 0% 3.9% !important;
                        }

                        /* Ensure borders remain visible but light */
                        * { 
                            border-color: #e5e7eb !important;
                            text-shadow: none !important;
                            box-shadow: none !important;
                        }

                        /* Maintain visibility for critical UI elements that should keep colors (like amount badges) */
                        .bg-emerald-50, .bg-indigo-50, .text-emerald-700, .text-indigo-700 {
                             -webkit-print-color-adjust: exact !important;
                             print-color-adjust: exact !important;
                        }

                        header, nav, aside, footer:not(.print-footer), .print-hidden, .fab-container {
                            display: none !important;
                        }

                        table { border-collapse: collapse !important; width: 100% !important; }
                        th, td { border: 1px solid #e5e7eb !important; padding: 10px !important; }
                    }
                }
                /* Hide number input spinners */
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            ` }} />

            {/* --- PRINT ONLY HEADER --- */}
                <div className="hidden print:block text-center pt-8 mb-2">
                    <h1 className="text-3xl font-black tracking-[0.25em] text-rose-600 font-sans">MONEA</h1>
                    <div className="h-0.5 w-12 bg-rose-200 mx-auto mt-3 opacity-50" />
                </div>

                {/* Print Title Only */}
                <div className="hidden print:block mb-8 text-center pt-4">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 font-kantumruy">របាយការណ៍សរុប និងបញ្ជីចំណងដៃ</h1>
                    <p className="text-xl text-slate-500 font-bold font-kantumruy">អាពាហ៍ពិពាហ៍ {wedding?.groomNameKh || wedding?.groomName || '...'} និង {wedding?.brideNameKh || wedding?.brideName || '...'}</p>
                    {wedding?.date && (
                        <p className="text-lg text-slate-400 font-bold font-kantumruy mt-1">
                            {formatKhmerDate(wedding.date)}
                        </p>
                    )}
                </div>

                {/* PRINT ONLY SUMMARY - Premium Version */}
                <div className="hidden print:block mb-8">
                    <div className="grid grid-cols-3 gap-0 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-rose-50/30 p-6 border-r border-slate-100">
                            <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1.5 font-kantumruy">សរុបភ្ញៀវ</p>
                            <p className="text-2xl font-black text-slate-900 font-kantumruy">{sortedGifts.length} នាក់</p>
                        </div>
                        <div className="bg-amber-50/40 p-6 border-r border-slate-100">
                            <p className="text-[10px] text-amber-600/60 font-black uppercase tracking-widest mb-1.5 font-kantumruy">សាច់ប្រាក់ដុល្លារ</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-amber-600">$</span>
                                <span className="text-3xl font-black text-slate-900 font-kantumruy">{totals.usd.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50/50 p-6">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 font-kantumruy">សាច់ប្រាក់រៀល</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-900 font-kantumruy">{totals.khr.toLocaleString()}</span>
                                <span className="text-lg font-black text-slate-400">៛</span>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Offline Sync Banner */}
            <OfflineSyncBanner
                count={offlineCount}
                isSyncing={isSyncing}
                onSync={syncOfflineGifts}
                onClear={clearOfflineQueue}
            />

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden -mt-4">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="bg-rose-500/10 p-2 rounded-xl">
                            <Gift className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-foreground font-kantumruy leading-none">
                                ការត្រួតពិនិត្យចំណងដៃ
                            </h1>
                            <p className="text-[10px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-[0.1em] mt-1">
                                Gift & Guest Management System
                            </p>
                        </div>
                    </div>
                </div>


                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={toggleShowGifts}
                        className={cn(
                            "h-9 md:h-10 px-4 md:px-6 rounded-xl font-kantumruy font-bold transition-all flex-1 sm:flex-none text-[11px] md:text-sm shadow-sm",
                            wedding?.themeSettings?.showGiftAmounts === false
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-none"
                        )}
                    >
                        {wedding?.themeSettings?.showGiftAmounts === false ? <Eye className="mr-2 h-3.5 w-3.5" /> : <EyeOff className="mr-2 h-3.5 w-3.5" />}
                        {wedding?.themeSettings?.showGiftAmounts === false ? "បង្ហាញចំនួនប្រាក់" : "លាក់ចំនួនប្រាក់"}
                    </Button>

                    <Link href="/dashboard/gifts/live" target="_blank" prefetch={false} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full h-9 md:h-10 px-4 md:px-6 border-none bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl font-kantumruy font-bold transition-all text-[11px] md:text-sm shadow-sm">
                            <Monitor className="mr-2 h-3.5 w-3.5" /> Live
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        onClick={exportExcel}
                        className="h-9 md:h-10 px-4 md:px-6 border-none bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl font-kantumruy font-bold transition-all flex-1 sm:flex-none text-[11px] md:text-sm shadow-sm"
                    >
                        <Plus className="mr-2 h-3.5 w-3.5 text-blue-600 rotate-45" aria-hidden="true" /> 
                        <span className="hidden sm:inline">Excel</span>
                        <span className="sm:hidden text-[10px]">Excel</span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="h-9 md:h-10 px-4 md:px-6 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl font-kantumruy font-bold transition-all flex-1 sm:flex-none text-[11px] md:text-sm shadow-sm"
                    >
                        <Printer className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> PDF
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-9 md:h-10 px-4 md:px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-100 dark:shadow-none transition-all font-kantumruy font-bold flex-1 sm:flex-none text-[11px] md:text-sm">
                                <Plus className="mr-2 h-4 w-4" /> <span className="sm:hidden">ថ្មី</span><span className="hidden sm:inline">កត់ត្រាថ្មី</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] rounded-3xl border-none shadow-2xl p-4 pt-10 md:p-8 md:pt-14 bg-card">
                            <DialogTitle className="sr-only">កត់ត្រាចំណងដៃថ្មី (Add New Gift)</DialogTitle>
                            <DialogDescription className="sr-only">
                                បំពេញព័ត៌មានដើម្បីកត់ត្រាចំណងដដៃថ្មី (Fill in the details to add a new gift record)
                            </DialogDescription>
                            <GiftForm
                                onSuccess={() => refresh()}
                                onDone={() => setIsDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Summary Cards */}
            <GiftSummaryCards
                totalGuests={sortedGifts.length}
                totalUSD={totals.usd}
                totalKHR={totals.khr}
                loading={loading}
                userRole={userRole}
                showGiftAmounts={wedding?.themeSettings?.showGiftAmounts !== false}
            />

            {/* Search Toolbar */}
            <div className="flex items-center justify-end gap-4 print:hidden px-2 -mt-6 mb-3">
                <div className="w-full max-w-md relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-rose-500" />
                    <Input
                        placeholder="ស្វែងរកតាមឈ្មោះ ឬ លេខរៀង..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-10 h-12 rounded-2xl border-none bg-card shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none focus-visible:ring-rose-500/20 font-kantumruy text-sm"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* List Section */}
            <div className="bg-card rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden min-h-[400px] border-none print:shadow-none print:bg-white print:rounded-none">
                <MobileGiftList
                    gifts={sortedGifts}
                    loading={loading}
                    visibleCount={visibleCount}
                    setVisibleCount={setVisibleCount}
                    showGiftAmounts={wedding?.themeSettings?.showGiftAmounts !== false}
                />

                <DesktopGiftTable
                    gifts={sortedGifts}
                    loading={loading}
                    visibleCount={visibleCount}
                    setVisibleCount={setVisibleCount}
                    sortConfig={sortConfig}
                    toggleSort={toggleSort}
                    onAddClick={() => setIsDialogOpen(true)}
                    showGiftAmounts={wedding?.themeSettings?.showGiftAmounts !== false}
                />
            </div>

            {/* --- PRINT ONLY FOOTER --- */}
            <div className="hidden print:flex flex-col mb-10 pt-8 px-10 mt-16 font-kantumruy border-t-2 border-slate-100">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <p suppressHydrationWarning className="text-slate-400 uppercase tracking-[0.15em] text-[9px] font-black">កាលបរិច្ឆេទចេញរបាយការណ៍</p>
                        <p suppressHydrationWarning className="text-sm font-bold text-slate-900">
                            {formatKhmerDate(new Date())}
                        </p>
                    </div>
                    
                    <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-slate-400 uppercase tracking-[0.15em] text-[9px] font-black">សុពលភាពឯកសារ</p>
                        </div>
                        <p className="text-sm font-black text-slate-900">របាយការណ៍ចំណងដៃផ្លូវការ - ប្រព័ន្ធ MONEA</p>
                    </div>
                </div>
                
                <div className="mt-24 text-center">
                    <p className="text-[10px] text-slate-300 uppercase tracking-[0.5em] font-medium font-kantumruy mb-2">
                        MONEA PLATFORM • OFFICIAL WEDDING RECORD
                    </p>
                    <p className="text-[9px] text-slate-300 font-medium font-kantumruy">
                        ឯកសារនេះត្រូវបានបង្កើតឡើងដោយស្វ័យប្រវត្តិតាមរយៈប្រព័ន្ធ MONEA និងជាកំណត់ត្រាផ្លូវការនៃពិធីមង្គលការ។
                    </p>
                </div>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <div className="md:hidden fixed bottom-28 right-6 z-40 print:hidden">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-[0_12px_40px_-8px_rgba(225,29,72,0.4)] flex items-center justify-center p-0 transition-all border-none"
                        >
                            <Plus size={28} strokeWidth={3} />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[94vw] max-w-[480px] rounded-3xl border-none shadow-2xl p-4 pt-10 bg-card">
                        <DialogTitle className="sr-only">កត់ត្រាចំណងដៃថ្មី (Add New Gift - Mobile)</DialogTitle>
                        <DialogDescription className="sr-only">
                            បំពេញព័ត៌មានដើម្បីកត់ត្រាចំណងដដៃថ្មី (Fill in the details to add a new gift record)
                        </DialogDescription>
                        <GiftForm
                            onSuccess={() => refresh()}
                            onDone={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
