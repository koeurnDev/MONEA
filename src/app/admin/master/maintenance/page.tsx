"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, Database, Trash2, ShieldCheck, Loader2, Globe } from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function MasterMaintenancePage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);
    const [cleanupConfirm, setCleanupConfirm] = useState(false);
    const [cleanResult, setCleanResult] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        fetch("/api/admin/master/maintenance/tasks")
            .then(res => res.json())
            .then(setStats)
            .finally(() => setLoading(false));
    };

    const handleCleanup = async () => {
        setCleanupConfirm(true);
    };

    const confirmCleanup = async () => {
        setCleaning(true);
        try {
            const res = await fetch("/api/admin/master/maintenance/tasks", { method: "DELETE" });
            const data = await res.json();
            setCleanResult(`Cleanup successful! Removed ${data.deletedCount} old logs.`);
            setCleanupConfirm(false);
            loadData();
            setTimeout(() => setCleanResult(null), 5000);
        } finally {
            setCleaning(false);
        }
    };

    const handleOptimize = async () => {
        setCleaning(true);
        try {
            const res = await fetch("/api/admin/master/maintenance/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "VACUUM" })
            });
            const data = await res.json();
            if (data.success) { setCleanResult("✅ Database optimization complete!"); setTimeout(() => setCleanResult(null), 3500); }
            loadData();
        } finally {
            setCleaning(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <ConfirmModal
                open={cleanupConfirm}
                onClose={() => setCleanupConfirm(false)}
                onConfirm={confirmCleanup}
                loading={cleaning}
                title="សម្អាត Logs ចាស់"
                description="សកម្មភាពនេះនឹងលុប Log ចាស់ទាំងអស់ (ចាស់ជាង 30 ថ្ងៃ) ពី Database ។ ការណ៍នេះមិនអាចដកស្រាយបានឡើយ។"
                confirmLabel="ចាប់ផ្ដើម Cleanup"
                detail="Delete all logs older than 30 days"
                variant="warning"
            />
            {cleanResult && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold">
                    ✅ {cleanResult}
                </div>
            )}
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/master">
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-100 bg-white">
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Diagnostics</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Maintenance & Health Utility</p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-white p-8">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                <Database size={16} /> Data Distribution
                            </CardTitle>
                            <div className="space-y-4">
                                {[
                                    { label: "Total Users", value: stats.users },
                                    { label: "Active Weddings", value: stats.weddings },
                                    { label: "System Logs", value: stats.logs, alert: stats.logs > 10000 },
                                    { label: "Guest Profiles", value: stats.guests },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{item.label}</span>
                                        <span className={cn(
                                            "font-black text-lg",
                                            item.alert ? "text-red-500" : "text-slate-900"
                                        )}>{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-slate-900 p-8 text-white">
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">Service Health Status</CardTitle>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Database size={18} className={stats.services?.database === "HEALTHY" ? "text-green-400" : "text-red-400"} />
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Database</span>
                                        </div>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", stats.services?.database === "HEALTHY" ? "text-green-400" : "text-red-400")}>
                                            {stats.services?.database}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Globe size={18} className={stats.services?.cloudinary === "HEALTHY" ? "text-green-400" : "text-red-400"} />
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Cloudinary</span>
                                        </div>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", stats.services?.cloudinary === "HEALTHY" ? "text-green-400" : "text-red-400")}>
                                            {stats.services?.cloudinary}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-3 h-3 rounded-full animate-pulse", stats.health === "HEALTHY" ? "bg-green-400" : "bg-orange-400")} />
                                        <span className="text-xs font-black uppercase tracking-widest">Global: {stats.health}</span>
                                    </div>
                                    <span className="text-[9px] text-white/30 font-mono italic">TS: {new Date(stats.timestamp).toLocaleTimeString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}</span>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 gap-6">
                                <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-white p-8">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Storage Cleanup</CardTitle>
                                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                        Improve performance by removing non-critical audit logs older than 30 days.
                                    </p>
                                    <Button
                                        onClick={handleCleanup}
                                        disabled={cleaning}
                                        variant="outline"
                                        className="w-full h-12 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
                                    >
                                        {cleaning ? <Loader2 className="animate-spin" /> : <Trash2 size={16} />}
                                        Clear Old Logs
                                    </Button>
                                </Card>

                                <Card className="border-none shadow-sm shadow-slate-200/50 rounded-[2.5rem] bg-white p-8">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Deep Optimization</CardTitle>
                                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                        Reclaim unused space and optimize database indexes for peak performance.
                                    </p>
                                    <Button
                                        onClick={handleOptimize}
                                        disabled={cleaning}
                                        variant="outline"
                                        className="w-full h-12 border-slate-100 text-slate-900 hover:bg-slate-50 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
                                    >
                                        {cleaning ? <Loader2 className="animate-spin" /> : <Activity size={16} />}
                                        Run VACUUM Action
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
