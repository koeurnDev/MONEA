"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Gift, Monitor, Users, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GiftForm } from "./gift-form";
import Link from "next/link";

export default function GiftPage() {
    // ... (existing state) ...
    const [gifts, setGifts] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<"admin" | "staff" | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [offlineCount, setOfflineCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

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

    return (
        <div className="space-y-10 pb-10">
            {offlineCount > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-[1.5rem] p-6 flex justify-between items-center shadow-lg shadow-orange-500/5" role="alert">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <Activity size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 font-kantumruy">ទិន្នន័យ Offline មិនទាន់បានរក្សាទុក</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">អ្នកមាន {offlineCount} ចំណងដៃដែលត្រូវ Sync</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => {
                                localStorage.removeItem('gift_offline_queue');
                                setOfflineCount(0);
                            }}
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold font-kantumruy"
                        >
                            សម្អាត
                        </Button>
                        <Button
                            onClick={syncOfflineGifts}
                            disabled={isSyncing}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-red-100 font-kantumruy"
                        >
                            {isSyncing ? "Syncing..." : "Sync ឥឡូវនេះ"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-1">
                        <Gift size={12} />
                        Gift Tracking
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 font-kantumruy">
                        បញ្ជីចំណងដៃ
                    </h2>
                    <p className="text-slate-500 font-medium font-kantumruy text-sm">
                        គ្រប់គ្រង និងតាមដានរាល់សកម្មភាពទទួលចំណងដៃបន្តផ្ទាល់។
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href="/dashboard/gifts/live" target="_blank" prefetch={false}>
                        <Button variant="outline" className="h-11 px-6 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-kantumruy font-bold transition-all">
                            <Monitor className="mr-2 h-4 w-4" /> Live Board
                        </Button>
                    </Link>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100 transition-all font-kantumruy font-bold">
                                <Plus className="mr-2 h-4 w-4" /> កត់ត្រាថ្មី
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                            <DialogHeader className="p-8 pb-4">
                                <DialogTitle className="text-2xl font-black font-kantumruy tracking-tight text-slate-900">កត់ត្រាចំណងដៃថ្មី</DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium font-kantumruy">បញ្ចូលព័ត៌មានចំណងដៃដែលទទួលបានពីភ្ញៀវរបស់អ្នក។</DialogDescription>
                            </DialogHeader>
                            <div className="p-8 pt-4">
                                <GiftForm
                                    onSuccess={() => fetchGifts()}
                                    onDone={() => setOpen(false)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Summary Cards */}
            {userRole !== "staff" && (
                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        { label: "ភ្ញៀវសរុប", value: gifts.length, sub: "នាក់ (Guests)", color: "text-slate-900", icon: Users },
                        { label: "សាច់ប្រាក់ដុល្លារ", value: "$" + totalUSD.toLocaleString(), sub: "USD Collected", color: "text-emerald-600", icon: DollarSign },
                        { label: "សាច់ប្រាក់រៀល", value: totalKHR.toLocaleString() + " ៛", sub: "KHR Collected", color: "text-blue-600", icon: Gift },
                    ].map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden group bg-white">
                            <CardContent className="p-8">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{stat.label}</p>
                                <div className={cn("text-3xl font-black font-kantumruy mb-2", stat.color)}>
                                    {loading ? "..." : stat.value}
                                </div>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* List Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-50 hover:bg-transparent">
                                <TableHead className="h-14 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">ល.រ</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">ឈ្មោះភ្ញៀវ</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">ចំនួនទឹកប្រាក់</TableHead>
                                <TableHead className="h-14 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">វិធីសាស្ត្រ</TableHead>
                                <TableHead
                                    className="h-14 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-slate-900 transition-colors select-none group"
                                    onClick={toggleSort}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        កាលបរិច្ឆេទ
                                        <span className="text-slate-300 group-hover:text-red-600 transition-colors">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">កំពុងផ្ទុក...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : gifts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="p-12">
                                        <div className="max-w-md mx-auto bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 text-center group hover:border-red-200 transition-all">
                                            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                                                <Gift className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 mb-2 font-kantumruy">មិនទាន់មានទិន្នន័យឡើយ</h3>
                                            <p className="text-slate-500 mb-10 font-medium font-kantumruy">ចាប់ផ្តើមចំណងដៃដំបូងរបស់អ្នកដោយចុចប៊ូតុងខាងក្រោម។</p>

                                            <Button
                                                onClick={() => setOpen(true)}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 px-10 font-bold shadow-lg shadow-red-100 transition-all font-kantumruy"
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
                                        <TableRow key={g.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                            <TableCell className="px-8 py-5 text-slate-400 font-bold font-mono text-[10px]">
                                                #{String(displayId).padStart(2, '0')}
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <span className="font-bold text-slate-900 font-kantumruy">
                                                    {g.guest?.name || <span className="text-slate-300 italic">មិនស្គាល់</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black tracking-widest border shadow-sm",
                                                    g.currency === "USD" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
                                                )}>
                                                    {g.currency === "USD" ? "$" : "៛"} {g.amount.toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                                                    {g.method || "Cash"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right tabular-nums">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-slate-900 font-mono">
                                                        {new Date(g.createdAt).toLocaleDateString("km-KH")}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
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
        </div>
    );
}
