"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Gift, MessageSquare, CheckCircle, Activity, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { CardSkeleton, TableSkeleton } from "../_components/SkeletonComponents";
import { LazyMotion, domMax, m } from "framer-motion";

export default function ReportsPage() {
    // SWR hooks for real-time data fetching (polls every 5 seconds)
    // We use a safe fetcher that returns empty array on error to prevent crashes
    const safeFetcher = (url: string) => fetch(url).then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        // Handle both raw arrays and objects containing data arrays (e.g., { gifts: [], role: 'staff' })
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
            return data.gifts || data.guests || data.logs || data.wishes || [];
        }
        return [];
    }).catch(() => []);

    const { data: guests = [], isLoading: loadingGuests } = useSWR("/api/guests", safeFetcher, { refreshInterval: 30000 });
    const { data: gifts = [], isLoading: loadingGifts } = useSWR("/api/gifts", safeFetcher, { refreshInterval: 30000 });
    const { data: logs = [], isLoading: loadingLogs } = useSWR("/api/logs", safeFetcher, { refreshInterval: 30000 });
    const { data: wishes = [], isLoading: loadingWishes } = useSWR("/api/guestbook", safeFetcher, { refreshInterval: 30000 });
    const { data: wedding = null } = useSWR("/api/wedding", (url) => fetch(url).then(res => res.json()).catch(() => null), { refreshInterval: 60000 });

    const loading = loadingGuests || loadingGifts || loadingLogs || loadingWishes;

    // Calculate stats derived from the fetched data
    const stats = useMemo(() => {
        // Ensure arrays are valid before filtering
        const safeGifts = Array.isArray(gifts) ? gifts : [];
        const safeGuests = Array.isArray(guests) ? guests : [];
        const safeWishes = Array.isArray(wishes) ? wishes : [];

        const usd = safeGifts
            .filter((g: any) => g.currency === 'USD')
            .reduce((sum: number, g: any) => sum + (Number(g.amount) || 0), 0);

        const khr = safeGifts
            .filter((g: any) => g.currency === 'KHR')
            .reduce((sum: number, g: any) => sum + (Number(g.amount) || 0), 0);

        const checkIns = safeGuests.filter((g: any) => g.hasArrived).length;

        return {
            totalGuests: safeGuests.length,
            totalGiftsUsd: usd,
            totalGiftsKhr: khr,
            giftsCount: safeGifts.length,
            wishesCount: safeWishes.length || 0,
            checkInCount: checkIns
        };
    }, [guests, gifts, wishes]);



    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = ""; // Clear title to hide from browser print header
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="space-y-10 pb-10 print:p-0 print:m-0 print:bg-white print:text-black">
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
                    
                    .print-break-after { page-break-after: always; }
                    .print-no-break { page-break-inside: avoid; }
                    
                    table { border-collapse: collapse !important; width: 100% !important; border: 1.5pt solid #cbd5e1 !important; border-top: 2pt solid #fda4af !important; }
                    th, td { border: 1px solid #cbd5e1 !important; }
                    
                    /* Specific fixes for text clipping */
                    .khmer-symbol { display: inline-block; padding-left: 4px; }
                }
            ` }} />

            {/* --- PRINT ONLY HEADER --- */}
            <div className="hidden print:block text-center pt-8 mb-2">
                <h1 className="text-3xl font-black tracking-[0.25em] text-rose-600 font-sans">MONEA</h1>
                <div className="h-0.5 w-12 bg-rose-200 mx-auto mt-3 opacity-50" />
            </div>

            <div className="hidden print:block mb-10 text-center pt-4">
                <h1 className="text-3xl font-black text-slate-900 mb-2 font-kantumruy uppercase tracking-tight">របាយការណ៍សរុប និងសកម្មភាពមង្គលការ</h1>
                <p className="text-xl text-slate-500 font-bold font-kantumruy">អាពាហ៍ពិពាហ៍ {wedding?.groomName || '...'} និង {wedding?.brideName || '...'}</p>
                <p className="text-lg text-slate-400 font-bold font-kantumruy mt-2 italic shadow-sm bg-zinc-50/50 py-2 rounded-full inline-block px-8 border border-zinc-100/50">របាយការណ៍ផ្លូវការសម្រាប់អ្នករៀបចំ</p>
            </div>

            {/* --- PRINT ONLY SUMMARY SECTION --- */}
            <div className="hidden print:grid grid-cols-2 gap-6 mb-12 print-no-break">
                <div className="border-2 border-slate-100 rounded-[2.5rem] p-8 bg-blue-50/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">ស្ថិតិវត្តមានភ្ញៀវ</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 font-kantumruy leading-none">{stats.checkInCount} / {stats.totalGuests}</span>
                        <span className="text-sm font-bold text-slate-400 font-kantumruy">នាក់</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 font-kantumruy italic opacity-70">ភ្ញៀវដែលបានចូលរួមក្នុងកម្មវិធី</p>
                </div>

                <div className="border-2 border-slate-100 rounded-[2.5rem] p-8 bg-pink-50/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full -mr-16 -mt-16" />
                    <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.2em] mb-4">ពាក្យជូនពរសរុប</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 font-kantumruy leading-none">{stats.wishesCount}</span>
                        <span className="text-sm font-bold text-slate-400 font-kantumruy">ពាក្យជូនពរ</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 font-kantumruy italic opacity-70">សំណេរពីភ្ញៀវកិត្តិយស</p>
                </div>

                <div className="border-2 border-slate-100 rounded-[2.5rem] p-8 bg-emerald-50/20 relative overflow-hidden col-span-2">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32" />
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 text-center">សរុបសាច់ប្រាក់ចំណងដៃ</p>
                    <div className="flex items-center justify-around gap-12 py-2">
                        <div className="text-center">
                            <span className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest font-sans">USD</span>
                            <span className="text-3xl font-black text-slate-900 font-kantumruy tracking-tight">${stats.totalGiftsUsd.toLocaleString()}</span>
                        </div>
                        <div className="h-12 w-px bg-slate-200" />
                        <div className="text-center">
                            <span className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest font-sans">KHR</span>
                            <div className="flex items-center justify-center">
                                <span className="text-3xl font-black text-slate-900 font-kantumruy tracking-tight" style={{ overflow: 'visible' }}>{stats.totalGiftsKhr.toLocaleString()}</span>
                                <span className="text-2xl font-black text-slate-900 khmer-symbol">៛</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">
                        <Activity className="w-3 h-3" />
                        Platform Analytics
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground font-kantumruy">
                        របាយការណ៍ & ស្ថិតិ
                    </h2>
                    <p className="text-muted-foreground font-medium font-kantumruy text-sm">
                        តាមដាន និងវិភាគទ្និន្ន័យមង្គលការរបស់អ្នកក្នុងពេលជាក់ស្តែង។
                    </p>
                </div>
            </div>

            {/* Stats Overview (Hidden in print as we have the summary above) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 grid-cols-2 print:hidden">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    [
                        { label: "ភ្ញៀវសរុប", value: stats.totalGuests, sub: "Check-in: " + stats.checkInCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50/50 dark:bg-blue-950/20" },
                        { label: "សាច់ប្រាក់ដុល្លារ", value: "$" + stats.totalGiftsUsd.toLocaleString(), sub: "សរុបចំនួន " + stats.giftsCount + " នាក់", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
                        { label: "សាច់ប្រាក់រៀល", value: stats.totalGiftsKhr.toLocaleString() + " ៛", sub: "សរុបចំនួន " + stats.giftsCount + " នាក់", icon: Gift, color: "text-amber-600", bg: "bg-amber-50/50 dark:bg-amber-950/20" },
                        { label: "ពាក្យជូនពរ", value: stats.wishesCount, sub: "ពីភ្ញៀវកិត្តិយស", icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-500/10" },
                    ].map((stat, i) => (
                        <Card key={i} className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all rounded-[2rem] overflow-hidden group relative bg-card">
                            <CardContent className="p-8 pt-10">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-6 transition-transform group-hover:scale-110 duration-500`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-black text-foreground font-kantumruy">
                                        {stat.value}
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                </div>
                                <div className="mt-6 pt-4 bg-muted/20 -mx-8 -mb-10 p-8">
                                    <span className="text-[10px] font-bold text-muted-foreground font-kantumruy">{stat.sub}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Insights Section */}
            <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 shadow-sm">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground font-kantumruy">សកម្មភាព និងស្ថិតិលម្អិត</h3>
                    </div>
                </div>

                {/* Left Side: Activity Log */}
                <Card className="lg:col-span-7 border-none shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)] rounded-[2.5rem] bg-card overflow-hidden print:border print:border-slate-100 print:shadow-none print-no-break">
                    <CardHeader className="p-10 pb-6 bg-muted/30 border-b border-border/5 flex flex-row items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-xl font-black text-foreground font-kantumruy">សកម្មភាពចុងក្រោយ</CardTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Real-time Activity Stream</p>
                        </div>
                        <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                            Live
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!Array.isArray(logs) || logs.length === 0 ? (
                            <div className="p-20 text-center text-muted-foreground/30">
                                <span className="text-xs font-bold font-kantumruy uppercase tracking-widest">មិនទាន់មានសកម្មភាពទេ</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/10">
                                {logs.map((log: any) => (
                                    <div key={log.id} className="p-8 px-10 hover:bg-muted/30 transition-all flex gap-8 items-start group relative">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:scale-110 duration-300 shrink-0",
                                            log.action === 'GIFT' ? 'bg-emerald-500/10 text-emerald-600' :
                                                log.action === 'CHECK_IN' ? 'bg-blue-500/10 text-blue-600' :
                                                    log.action === 'WISH' ? 'bg-pink-500/10 text-pink-600' : 'bg-muted text-muted-foreground'
                                        )}>
                                            {log.action === 'GIFT' ? <Gift size={22} className="stroke-[2.5]" /> :
                                                log.action === 'CHECK_IN' ? <Users size={22} className="stroke-[2.5]" /> :
                                                    log.action === 'WISH' ? <MessageSquare size={22} className="stroke-[2.5]" /> : <CheckCircle size={22} />}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="font-black text-lg text-foreground font-kantumruy leading-normal tracking-tight">{log.description}</p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                    <span className="text-[11px] font-black text-foreground uppercase tracking-wider">{log.actorName}</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded-md">
                                                    {(() => {
                                                        const diff = Date.now() - new Date(log.createdAt).getTime();
                                                        if (diff < 60000) return "Just now";
                                                        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                                                        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                                                        return new Date(log.createdAt).toLocaleDateString('km-KH', { day: 'numeric', month: 'short' });
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Side: Insights & Exports */}
                <div className="lg:col-span-5 space-y-8">
                    <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)] rounded-[2rem] bg-card overflow-hidden">
                        <CardHeader className="p-8 pb-4 bg-muted/20">
                            <CardTitle className="text-lg font-bold text-foreground font-kantumruy">ស្ថិតិតាមទីតាំង</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pb-10">
                            <div className="space-y-8">
                                {(() => {
                                    const safeGuests = Array.isArray(guests) ? guests : [];
                                    const safeGifts = Array.isArray(gifts) ? gifts : [];

                                    const sourceStats = safeGuests.reduce((acc: any, g: any) => {
                                        const source = g.source || g.group || "មិនបានបញ្ជាក់";
                                        if (!acc[source]) acc[source] = { guests: 0, usd: 0, khr: 0 };
                                        acc[source].guests += 1;
                                        return acc;
                                    }, {});

                                    safeGifts.forEach((gift: any) => {
                                        const source = gift.guest?.source || gift.guest?.group || "មិនបានបញ្ជាក់";
                                        if (sourceStats[source]) {
                                            if (gift.currency === 'USD') sourceStats[source].usd += Number(gift.amount || 0);
                                            if (gift.currency === 'KHR') sourceStats[source].khr += Number(gift.amount || 0);
                                        }
                                    });

                                    const sortedSources = Object.entries(sourceStats)
                                        .sort((a: any, b: any) => b[1].guests - a[1].guests)
                                        .slice(0, 5);

                                    if (sortedSources.length === 0) return (
                                        <div className="text-center py-10 opacity-30">
                                            <Users size={32} className="mx-auto mb-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">មិនទាន់មានទិន្នន័យ</p>
                                        </div>
                                    );

                                    return sortedSources.map(([name, data]: [string, any]) => (
                                        <div key={name} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-sm font-black text-foreground font-kantumruy">{name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{data.guests} នាក់</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-emerald-600">${data.usd.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground font-mono">{data.khr.toLocaleString()} ៛</p>
                                                </div>
                                            </div>
                                            <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className="h-full bg-red-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${stats.totalGuests > 0 ? (data.guests / stats.totalGuests) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
            {/* --- PRINT ONLY FOOTER --- */}
            <div className="hidden print:flex flex-col mb-10 pt-8 px-10 mt-16 font-kantumruy border-t-2 border-slate-100">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <p suppressHydrationWarning className="text-slate-400 uppercase tracking-[0.15em] text-[10px] font-black">កាលបរិច្ឆេទចេញរបាយការណ៍</p>
                        <p suppressHydrationWarning className="text-sm font-bold text-slate-900">
                            {new Date().toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-slate-400 uppercase tracking-[0.15em] text-[10px] font-black">សុពលភាពឯកសារ</p>
                        </div>
                        <p className="text-sm font-black text-slate-900">របាយការណ៍ផ្លូវការ - ប្រព័ន្ធ MONEA</p>
                    </div>
                </div>
                
                <div className="mt-24 text-center">
                    <p className="text-[10px] text-zinc-300 uppercase tracking-[0.5em] font-medium font-kantumruy mb-2">
                        MONEA PLATFORM • OFFICIAL ANALYTICS RECORD
                    </p>
                    <p className="text-[9px] text-zinc-300 font-medium font-kantumruy">
                        ឯកសារនេះត្រូវបានបង្កើតឡើងដោយស្វ័យប្រវត្តិតាមរយៈប្រព័ន្ធ MONEA និងជាកំណត់ត្រាផ្លូវការនៃស្ថិតិមង្គលការ។
                    </p>
                </div>
            </div>
            {/* --- END PRINT FOOTER --- */}
        </div>
    );
}
