"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Gift, Monitor, Users, DollarSign, Activity, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoneaLogo } from "@/components/ui/MoneaLogo";
import useSWR from "swr";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { GiftForm } from "./gift-form";
import Link from "next/link";
import { TableSkeleton } from "../_components/SkeletonComponents";

export default function GiftPage() {
    // ... (existing state) ...
    const [gifts, setGifts] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<"admin" | "staff" | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [offlineCount, setOfflineCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Wedding data for branding
    const { data: wedding = null } = useSWR("/api/wedding", (url) => fetch(url).then(res => res.json()).catch(() => null), { refreshInterval: 60000 });

    // ... (existing fetchGifts, checkOfflineQueue, syncOfflineGifts) ...
    async function fetchGifts() {
        setLoading(true);
        try {
            const res = await fetch("/api/gifts");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setGifts(data);
                } else {
                    setGifts(data.gifts || []);
                    setUserRole(data.role);
                }
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
        checkOfflineQueue();
    }

    function checkOfflineQueue() {
        const queue = JSON.parse(localStorage.getItem('gift_offline_queue') || "[]");
        setOfflineCount(queue.length);
    }

    async function syncOfflineGifts() {
        setIsSyncing(true);
        const queue = JSON.parse(localStorage.getItem('gift_offline_queue') || "[]");
        const failed = [];
        let successCount = 0;

        for (const gift of queue) {
            try {
                const res = await fetch("/api/gifts", {
                    method: "POST",
                    body: JSON.stringify(gift),
                });
                if (res.ok) {
                    successCount++;
                } else {
                    failed.push(gift);
                }
            } catch (e) {
                failed.push(gift);
            }
        }

        localStorage.setItem('gift_offline_queue', JSON.stringify(failed));
        setOfflineCount(failed.length);
        setIsSyncing(false);
        fetchGifts();

        if (failed.length === 0) {
            // Optional: Success Toast
        }
    }

    useEffect(() => { fetchGifts(); }, []);

    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    // ... (existing sortConfig) ...

    const sortedGifts = [...gifts].sort((a, b) => {
        if (sortConfig.key === 'createdAt') {
            return sortConfig.direction === 'asc'
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
    });

    const toggleSort = () => {
        setSortConfig(current => ({
            key: 'createdAt',
            direction: current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Calculate totals
    const totalUSD = gifts.reduce((acc, g) => g.currency === 'USD' ? acc + g.amount : acc, 0);
    const totalKHR = gifts.reduce((acc, g) => g.currency === 'KHR' ? acc + g.amount : acc, 0);

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
                    }
                    .print-break-after { page-break-after: always; }
                    .print-no-break { page-break-inside: avoid; }
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
            <div className="hidden print:block mb-8 text-center pt-[2cm]">
                <div className="flex justify-center mb-8">
                    <MoneaLogo showText size="xl" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black font-kantumruy tracking-tight">របាយការណ៍សរុប និងបញ្ជីចំណងដៃ</h1>
                    {wedding?.groomName && wedding?.brideName && (
                        <p className="text-lg font-bold font-kantumruy text-gray-600">
                            អាពាហ៍ពិពាហ៍ {wedding.groomName} និង {wedding.brideName}
                        </p>
                    )}
                </div>
                <div className="w-32 h-1 bg-red-600 mx-auto mt-6 rounded-full opacity-20" />
            </div>

            {/* --- PRINT ONLY SUMMARY (Redesigned for Elegance) --- */}
            <div className="hidden print:flex flex-col mb-12 border border-gray-100 rounded-[2rem] overflow-hidden">
                <div className="bg-gray-50/50 p-6 border-b border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Financial Summary</p>
                    <h3 className="font-bold text-gray-900 font-kantumruy">សេចក្តីសង្ខេបចំណងដៃសរុប</h3>
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-100 italic">
                    <div className="p-8 space-y-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">សាច់ប្រាក់ដុល្លារ (Total USD)</p>
                        <p className="text-2xl font-black text-foreground">${totalUSD.toLocaleString()}</p>
                    </div>
                    <div className="p-8 space-y-2 text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">សាច់ប្រាក់រៀល (Total KHR)</p>
                        <p className="text-2xl font-black text-foreground">{totalKHR.toLocaleString()} ៛</p>
                    </div>
                </div>
            </div>

            {offlineCount > 0 && (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 rounded-[1.5rem] p-6 flex justify-between items-center shadow-lg shadow-orange-500/5 dark:shadow-none" role="alert">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                            <Activity size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="font-black text-foreground font-kantumruy">ទិន្នន័យ Offline មិនទាន់បានរក្សាទុក</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">អ្នកមាន {offlineCount} ចំណងដៃដែលត្រូវ Sync</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => {
                                localStorage.removeItem('gift_offline_queue');
                                setOfflineCount(0);
                            }}
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-bold font-kantumruy"
                        >
                            សម្អាត
                        </Button>
                        <Button
                            onClick={syncOfflineGifts}
                            disabled={isSyncing}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-red-100 dark:shadow-none font-kantumruy"
                        >
                            {isSyncing ? "Syncing..." : "Sync ឥឡូវនេះ"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Header Area (Hidden in Print) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">
                        <Gift size={12} />
                        Gift Tracking
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground font-kantumruy">
                        បញ្ជីចំណងដៃ
                    </h2>
                    <p className="text-muted-foreground font-medium font-kantumruy text-sm">
                        គ្រប់គ្រង និងតាមដានរាល់សកម្មភាពទទួលចំណងដៃបន្តផ្ទាល់។
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 w-full md:w-auto">
                    <Link href="/dashboard/gifts/live" target="_blank" prefetch={false} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full h-11 px-6 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-kantumruy font-bold transition-all">
                            <Monitor className="mr-2 h-4 w-4" /> Live
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="h-11 px-6 border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border rounded-xl font-kantumruy font-bold transition-all flex-1 sm:flex-none"
                    >
                        <Printer className="mr-2 h-4 w-4 text-muted-foreground" /> PDF
                    </Button>

                    <div className="hidden sm:block">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100 dark:shadow-none transition-all font-kantumruy font-bold">
                                    <Plus className="mr-2 h-4 w-4" /> កត់ត្រាថ្មី
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px] rounded-[2rem] border-none shadow-2xl p-6 pt-12 md:p-8 md:pt-14 bg-card">
                                <VisuallyHidden.Root>
                                    <DialogTitle>កត់ត្រាចំណងដៃថ្មី (Add New Gift)</DialogTitle>
                                    <DialogDescription>
                                        បំពេញព័ត៌មានដើម្បីកត់ត្រាចំណងដដៃថ្មី (Fill in the details to add a new gift record)
                                    </DialogDescription>
                                </VisuallyHidden.Root>
                                <GiftForm
                                    onSuccess={() => fetchGifts()}
                                    onDone={() => setOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Summary Cards (Hidden in Print) */}
            {userRole !== "staff" && (
                <div className="grid gap-4 md:grid-cols-3 grid-cols-2 print:hidden">
                    {[
                        { label: "ភ្ញៀវសរុប", value: gifts.length, sub: "នាក់ (Guests)", color: "text-foreground", icon: Users },
                        { label: "សាច់ប្រាក់ដុល្លារ", value: "$" + totalUSD.toLocaleString(), sub: "USD Collected", color: "text-emerald-600", icon: DollarSign },
                        { label: "សាច់ប្រាក់រៀល", value: totalKHR.toLocaleString() + " ៛", sub: "KHR Collected", color: "text-blue-600", icon: Gift },
                    ].map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group bg-card">
                            <CardContent className="p-8">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{stat.label}</p>
                                <div className={cn("text-3xl font-black font-kantumruy mb-2", stat.color)}>
                                    {loading ? "..." : stat.value}
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* List Section */}
            <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden min-h-[400px]">
                {/* Mobile Card List View */}
                <div className="md:hidden divide-y divide-border print:hidden">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">កំពុងផ្ទុក...</p>
                        </div>
                    ) : gifts.length === 0 ? (
                        <div className="p-20 text-center opacity-30">
                            <Gift size={40} className="mx-auto mb-2" />
                            <p className="font-kantumruy font-bold">មិនមានទិន្នន័យឡើយ</p>
                        </div>
                    ) : (
                        sortedGifts.map((g) => (
                            <div key={g.id} className="p-5 hover:bg-muted/30 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-foreground font-kantumruy text-base truncate">
                                            {g.guest?.name || <span className="text-muted-foreground/30 italic">មិនស្គាល់</span>}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            {new Date(g.createdAt).toLocaleDateString("km-KH")} • {new Date(g.createdAt).toLocaleTimeString("km-KH", { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <span className={cn(
                                            "inline-block px-3 py-1 rounded-lg text-[11px] font-black tracking-widest border shadow-sm",
                                            g.currency === "USD" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50" : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50"
                                        )}>
                                            {g.currency === "USD" ? "$" : "៛"} {g.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-md border border-border/50">
                                        {g.method || "Cash"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto print:block">
                    <Table className="print:border-collapse">
                        <TableHeader className="bg-muted/50 print:bg-gray-50">
                            {/* Repeating spacer for subsequent pages */}
                            <TableRow className="hidden print:table-row border-none hover:bg-transparent">
                                <TableHead colSpan={5} className="h-[2cm] p-0 border-none" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Column Titles - First Page Only */}
                            <TableRow className="border-border print:border-gray-200 hover:bg-transparent hidden print:table-row">
                                <TableHead className="h-14 px-8 text-[10px] print:text-black font-black text-muted-foreground uppercase tracking-widest w-20 border-r border-border print:border-gray-200">ល.រ</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] print:text-black font-black text-muted-foreground uppercase tracking-widest border-r border-border print:border-gray-200">ឈ្មោះភ្ញៀវ</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] print:text-black font-black text-muted-foreground uppercase tracking-widest border-r border-border print:border-gray-200">ចំនួនទឹកប្រាក់</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] print:text-black font-black text-muted-foreground uppercase tracking-widest border-r border-border print:border-gray-200">វិធីសាស្ត្រ</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] print:text-black font-black text-muted-foreground uppercase tracking-widest text-right">កាលបរិច្ឆេទ</TableHead>
                            </TableRow>
                            {/* Original Web Header Row (Hidden in Print) */}
                            <TableRow className="border-border print:hidden hover:bg-transparent">
                                <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-20 border-r border-border">ល.រ</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-r border-border">ឈ្មោះភ្ញៀវ</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-r border-border">ចំនួនទឹកប្រាក់</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-r border-border">វិធីសាស្ត្រ</TableHead>
                                <TableHead
                                    className="h-14 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right cursor-pointer hover:text-foreground transition-colors select-none group"
                                    onClick={toggleSort}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        កាលបរិច្ឆេទ
                                        <span className="text-muted-foreground/30 group-hover:text-red-600 transition-colors">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    </div>
                                </TableHead>
                            </TableRow>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="p-8">
                                        <TableSkeleton />
                                    </TableCell>
                                </TableRow>
                            ) : gifts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="p-12">
                                        <div className="max-w-md mx-auto bg-muted border-2 border-dashed border-border rounded-[2.5rem] p-10 text-center group hover:border-red-200 dark:hover:border-red-900/50 transition-all">
                                            <div className="w-20 h-20 bg-card shadow-sm rounded-full flex items-center justify-center text-muted-foreground/30 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                                <Gift className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-xl font-black text-foreground mb-2 font-kantumruy">មិនទាន់មានទិន្នន័យឡើយ</h3>
                                            <p className="text-muted-foreground mb-10 font-medium font-kantumruy">ចាប់ផ្តើមចំណងដៃដំបូងរបស់អ្នកដោយចុចប៊ូតុងខាងក្រោម។</p>

                                            <Button
                                                onClick={() => setOpen(true)}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-10 font-bold shadow-lg shadow-red-100 dark:shadow-none transition-all font-kantumruy"
                                            >
                                                កត់ត្រាឥឡូវនេះ
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedGifts.map((g, index) => {
                                    const displayId = sortConfig.direction === 'asc'
                                        ? index + 1
                                        : sortedGifts.length - index;

                                    return (
                                        <TableRow key={g.id} className="border-border print:border-gray-100 hover:bg-muted/50 transition-colors group">
                                            <TableCell className="px-8 py-5 text-muted-foreground print:text-slate-900 font-bold font-mono text-[10px] border-r border-border print:border-gray-100">
                                                {String(index + 1).padStart(2, '0')}
                                            </TableCell>
                                            <TableCell className="px-8 py-5 border-r border-border print:border-gray-100">
                                                <span className="font-bold text-foreground font-kantumruy">
                                                    {g.guest?.name || <span className="text-muted-foreground/30 italic">មិនស្គាល់</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 py-5 border-r border-border print:border-gray-100">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black tracking-widest border shadow-sm print:shadow-none print:border-none print:p-0",
                                                    g.currency === "USD" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 print:bg-transparent print:text-slate-900" : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 print:bg-transparent print:text-slate-900"
                                                )}>
                                                    {g.currency === "USD" ? "$" : "៛"} {g.amount.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 py-5 border-r border-border print:border-gray-100">
                                                <span className="text-[10px] font-bold text-muted-foreground print:text-slate-900 uppercase tracking-widest bg-muted print:bg-transparent px-3 py-1 rounded-lg border border-border/50">
                                                    {g.method || "Cash"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right tabular-nums">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-foreground font-mono">
                                                        {new Date(g.createdAt).toLocaleDateString("km-KH")}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                        {new Date(g.createdAt).toLocaleTimeString("km-KH", { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
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
                    This document is an official record of the wedding event.
                </div>
            </div>
            {/* --- END PRINT FOOTER --- */}

            {/* Mobile Floating Action Button (FAB) */}
            <div className="md:hidden fixed bottom-28 right-6 z-40 print:hidden">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-[0_12px_40px_-8px_rgba(220,38,38,0.4)] flex items-center justify-center p-0 transition-all border-none"
                        >
                            <Plus size={28} strokeWidth={3} />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[94vw] max-w-[480px] rounded-[2.5rem] border-none shadow-2xl p-6 pt-12 bg-card">
                        <VisuallyHidden.Root>
                            <DialogTitle>កត់ត្រាចំណងដៃថ្មី (Add New Gift - Mobile)</DialogTitle>
                            <DialogDescription>
                                បំពេញព័ត៌មានដើម្បីកត់ត្រាចំណងដដៃថ្មី (Fill in the details to add a new gift record)
                            </DialogDescription>
                        </VisuallyHidden.Root>
                        <GiftForm
                            onSuccess={() => fetchGifts()}
                            onDone={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
