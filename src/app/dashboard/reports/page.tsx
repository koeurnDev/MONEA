"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Users, DollarSign, Gift, MessageSquare, CheckCircle, Activity, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import { CardSkeleton, TableSkeleton } from "../_components/SkeletonComponents";

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

    const { data: guests = [], isLoading: loadingGuests } = useSWR("/api/guests", safeFetcher, { refreshInterval: 5000 });
    const { data: gifts = [], isLoading: loadingGifts } = useSWR("/api/gifts", safeFetcher, { refreshInterval: 5000 });
    const { data: logs = [], isLoading: loadingLogs } = useSWR("/api/logs", safeFetcher, { refreshInterval: 5000 });
    const { data: wishes = [], isLoading: loadingWishes } = useSWR("/api/guestbook", safeFetcher, { refreshInterval: 5000 });
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


    const exportFinancialReport = async () => {
        const XLSX = await import("xlsx");
        const safeGifts = Array.isArray(gifts) ? gifts : [];

        const headers = ["ឈ្មោះភ្ញៀវ", "ទីតាំង", "ចំនួន", "រូបិយប័ណ្ណ", "វិធីសាស្ត្រ", "កាលបរិច្ឆេទ", "ម៉ោង"];
        const rows = safeGifts.map((g: any) => [
            g.guest?.name || "Anonymous",
            g.guest?.source || g.guest?.group || "",
            g.amount,
            g.currency,
            g.method || "Cash",
            new Date(g.createdAt).toLocaleDateString('km-KH'),
            new Date(g.createdAt).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: false })
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        worksheet["!cols"] = [
            { wpx: 200 }, // Name
            { wpx: 150 }, // Source
            { wpx: 100 }, // Amount
            { wpx: 80 },  // Currency
            { wpx: 100 }, // Method
            { wpx: 120 }, // Date
            { wpx: 80 }   // Time
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "របាយការណ៍ចំណងដៃ");
        XLSX.writeFile(workbook, `financial_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportGuestList = async () => {
        const XLSX = await import("xlsx");
        const safeGuests = Array.isArray(guests) ? guests : [];

        const headers = ["ឈ្មោះភ្ញៀវ", "មកពីណា / ក្រុម"];
        const rows = safeGuests.map((g: any) => [
            g.name || "",
            g.source || g.group || "មិនទាន់បញ្ជាក់"
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        worksheet["!cols"] = [
            { wpx: 250 }, // Name
            { wpx: 200 }  // Group
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "បញ្ជីឈ្មោះភ្ញៀវ");
        XLSX.writeFile(workbook, `guest_list_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

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
                    @page { margin: 0; }
                    body { 
                        padding: 0 1.5cm 1.5cm 1.5cm;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-family: 'Inter', 'Kantumruy Pro', sans-serif;
                        background: white !important;
                        color: black !important;
                    }
                    .print-break-after { page-break-after: always; }
                    .print-no-break { page-break-inside: avoid; }
                    
                    /* Force light colors for theme-aware components during print */
                    .bg-card, .bg-muted, .bg-background {
                        background-color: white !important;
                        color: black !important;
                        border-color: #e5e7eb !important; /* light gray border */
                    }
                    .text-foreground, .text-muted-foreground {
                        color: black !important;
                    }
                    .text-muted-foreground {
                        color: #4b5563 !important; /* gray-600 */
                    }
                    .border, .border-border {
                        border-color: #e5e7eb !important;
                    }
                    .shadow-sm, .shadow-md, .shadow-xl {
                        shadow: none !important;
                        box-shadow: none !important;
                        border: 1px solid #e5e7eb !important;
                    }
                }
            ` }} />

            {/* --- PRINT ONLY HEADER --- */}
            <div className="hidden print:block mb-8 text-center pt-[2cm]">
                <div className="flex justify-center mb-8">
                    <MoneaLogo showText size="xl" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black font-kantumruy tracking-tight">របាយការណ៍សរុប និងសកម្មភាពមង្គលការ</h1>
                    {wedding?.groomName && wedding?.brideName && (
                        <p className="text-lg font-bold font-kantumruy text-gray-600">
                            អាពាហ៍ពិពាហ៍ {wedding.groomName} និង {wedding.brideName}
                        </p>
                    )}
                </div>
                <div className="w-32 h-1 bg-red-600 mx-auto mt-6 rounded-full opacity-20" />
            </div>

            {/* Header Area (Hidden in Print) */}
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
                        តាមដាន និងវិភាគទិន្នន័យមង្គលការរបស់អ្នកក្នុងពេលជាក់ស្តែង។
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="h-11 px-6 border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border rounded-xl font-kantumruy font-bold transition-all"
                    >
                        <Printer className="mr-2 h-4 w-4 text-muted-foreground" /> PDF Report
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 grid-cols-2">
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
                        { label: "ពាក្យជូនពរ", value: stats.wishesCount, sub: "ពីភ្ញៀវកិត្តិយស", icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-50/50 dark:bg-pink-950/20" },
                    ].map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group relative bg-card">
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
                                <div className="mt-6 pt-4 border-t border-border">
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
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 border border-red-100 dark:border-red-900/50">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground font-kantumruy">សកម្មភាព និងស្ថិតិលម្អិត</h3>
                    </div>
                </div>

                {/* Left Side: Activity Log */}
                <Card className="lg:col-span-7 border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                    <CardHeader className="p-8 pb-4 border-b border-border flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-foreground font-kantumruy">សកម្មភាពចុងក្រោយ</CardTitle>
                        <div className="px-3 py-1 rounded-full bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                            Live updates
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!Array.isArray(logs) || logs.length === 0 ? (
                            <div className="p-20 text-center text-muted-foreground/30">
                                <span className="text-xs font-bold font-kantumruy uppercase tracking-widest">មិនទាន់មានសកម្មភាពទេ</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {logs.map((log: any) => (
                                    <div key={log.id} className="p-6 px-8 hover:bg-muted/50 transition-colors flex gap-6 items-start group">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            log.action === 'GIFT' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' :
                                                log.action === 'CHECK_IN' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' :
                                                    log.action === 'WISH' ? 'bg-pink-50 dark:bg-pink-950/20 text-pink-600' : 'bg-muted text-muted-foreground'
                                        )}>
                                            {log.action === 'GIFT' ? <Gift size={18} /> :
                                                log.action === 'CHECK_IN' ? <Users size={18} /> :
                                                    log.action === 'WISH' ? <MessageSquare size={18} /> : <CheckCircle size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-foreground font-kantumruy leading-relaxed">{log.description}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em]">{log.actorName}</span>
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {(() => {
                                                        const diff = Date.now() - new Date(log.createdAt).getTime();
                                                        if (diff < 60000) return "Just now";
                                                        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                                                        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
                                                        return new Date(log.createdAt).toLocaleDateString();
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
                    <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                        <CardHeader className="p-8 pb-4 border-b border-border">
                            <CardTitle className="text-lg font-bold text-foreground font-kantumruy">ស្ថិតិតាមទីតាំង</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pb-10">
                            <div className="space-y-8">
                                {(() => {
                                    const sourceStats = (guests as any[]).reduce((acc: any, g: any) => {
                                        const source = g.source || g.group || "មិនបានបញ្ជាក់";
                                        if (!acc[source]) acc[source] = { guests: 0, usd: 0, khr: 0 };
                                        acc[source].guests += 1;
                                        return acc;
                                    }, {});

                                    (gifts as any[]).forEach((gift: any) => {
                                        const source = gift.guest?.source || gift.guest?.group || "មិនបានបញ្ជាក់";
                                        if (sourceStats[source]) {
                                            if (gift.currency === 'USD') sourceStats[source].usd += gift.amount;
                                            if (gift.currency === 'KHR') sourceStats[source].khr += gift.amount;
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
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border">
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

                    {/* Export Actions */}
                    <div className="grid gap-6">
                        <Button
                            onClick={exportFinancialReport}
                            className="h-14 bg-card border border-border hover:bg-muted text-foreground rounded-2xl shadow-sm hover:shadow transition-all group px-6"
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center">
                                        <Download className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold font-kantumruy text-sm">Excel (ចំណងដៃ)</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase group-hover:text-emerald-600 transition-colors">Export</span>
                            </div>
                        </Button>

                        <Button
                            onClick={exportGuestList}
                            variant="outline"
                            className="h-14 bg-card border border-border hover:bg-muted text-foreground rounded-2xl shadow-sm hover:shadow transition-all group px-6"
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold font-kantumruy text-sm">Excel (បញ្ជីភ្ញៀវ)</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase group-hover:text-blue-600 transition-colors">Export</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
            {/* --- PRINT ONLY FOOTER --- */}
            <div className="hidden print:flex flex-col mb-10 pt-6 px-10 mt-12 font-kantumruy font-bold text-sm border-t border-gray-100">
                <div className="flex justify-between items-start italic opacity-60">
                    <div className="space-y-1">
                        <p suppressHydrationWarning className="text-gray-400 uppercase tracking-tight text-[10px]">Date of issue</p>
                        <p suppressHydrationWarning>{new Date().toLocaleDateString('km-KH')}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-gray-400 uppercase tracking-tight text-[10px]">Digitally Signed & Verified</p>
                        <p className="text-base text-gray-900">Monea Platform Official Report</p>
                    </div>
                </div>
                <div className="mt-20 text-center text-[10px] text-gray-300 uppercase tracking-[0.4em] font-normal">
                    End of Analytics Report
                </div>
            </div>
            {/* --- END PRINT FOOTER --- */}
        </div>
    );
}
