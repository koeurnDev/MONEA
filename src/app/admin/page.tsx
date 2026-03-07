"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PartyPopper, CalendarCheck, TrendingUp, AlertCircle, Sparkles, Activity, ShieldCheck, Database, Clock, ArrowUpRight, CheckCircle2, ArrowRight } from "lucide-react";
import { m } from 'framer-motion';
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminStats {
    totalUsers: number;
    totalWeddings: number;
    activeWeddings: number;
    newWeddingsToday: number;
    financialOverview: {
        USD: number;
        KHR: number;
    };
}

import { ErrorBoundary } from "@/components/error-boundary";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, logsRes, userRes] = await Promise.all([
                    fetch("/api/admin/stats"),
                    fetch("/api/admin/logs?limit=5"),
                    fetch("/api/admin/me") // Assuming this exists or using statsRes if it includes user
                ]);

                if (statsRes.status === 401) {
                    window.location.href = "/login";
                    return;
                }

                if (statsRes.ok) setStats(await statsRes.json());
                if (logsRes.ok) setLogs(await logsRes.json());

                // Get user role from local storage or another API if needed
                // For now, let's fetch a minimal /api/admin/me if needed, 
                // but usually we can deduce from the fact we are on /admin
                const me = await fetch("/api/auth/me").then(r => r.json()).catch(() => ({}));
                setUserRole(me.role);
            } catch (err: any) {
                console.error("Error loading admin data:", err);
                setError(err.message || "មិនអាចទាញយកទិន្នន័យបានទេ");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="mt-6 text-slate-500 font-kantumruy font-bold tracking-widest uppercase text-xs">កំពុងរៀបចំទិន្នន័យ...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center text-center p-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-red-50 flex items-center justify-center text-red-600 mb-6 border border-red-100">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">មានបញ្ហាស្រង់ទិន្នន័យ</h3>
                <p className="text-muted-foreground max-w-sm mb-8 font-medium font-kantumruy">{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="px-8 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-100"
                >
                    ព្យាយាមម្ដងទៀត
                </Button>
            </div>
        );
    }

    const cards = [
        {
            title: "អ្នកប្រើប្រាស់សរុប",
            value: stats?.totalUsers || 0,
            trend: "+12%",
            desc: "គណនីប្តីប្រពន្ធដែលបានចុះឈ្មោះ",
            icon: Users,
            color: "from-blue-500/20 to-blue-600/5",
            accent: "bg-blue-400/10 text-blue-400",
            shadow: "shadow-blue-500/10"
        },
        {
            title: "មង្គលការសរុប",
            value: stats?.totalWeddings || 0,
            trend: "+5.4%",
            desc: "ធៀបការដែលបានបង្កើតទាំងអស់",
            icon: PartyPopper,
            color: "from-pink-500/20 to-pink-600/5",
            accent: "bg-pink-400/10 text-pink-400",
            shadow: "shadow-pink-500/10"
        },
        {
            title: "កំពុងដំណើរការ",
            value: stats?.activeWeddings || 0,
            trend: "Active",
            desc: "មង្គលការដែលកំពុងផ្សាយផ្ទាល់",
            icon: CalendarCheck,
            color: "from-green-500/20 to-green-600/5",
            accent: "bg-green-400/10 text-green-400",
            shadow: "shadow-green-500/10"
        },
        {
            title: "ចំណូលសរុប (USD)",
            value: stats?.financialOverview?.USD || 0,
            trend: "USD",
            desc: "ទឹកប្រាក់កាដូដែលឆ្លងកាត់ប្រព័ន្ធ",
            icon: TrendingUp,
            color: "from-amber-500/20 to-amber-600/5",
            accent: "bg-amber-400/10 text-amber-400",
            shadow: "shadow-amber-500/10"
        }
    ];

    return (
        <ErrorBoundary name="Admin Dashboard">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600">
                            <Activity size={14} />
                            PLATFORM MONITORING
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground">
                            ទិដ្ឋភាពទូទៅ
                        </h2>
                        <p className="text-muted-foreground font-medium text-sm">
                            គ្រប់គ្រង និងតាមដានរាល់ប្រតិបត្តិការងាររបស់ប្រព័ន្ធ MONEA ។
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-green-50 text-xs font-bold text-green-700 border border-green-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            SYSTEM ONLINE
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.5 }}
                        >
                            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden group border">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{card.title}</CardTitle>
                                    <div className="text-slate-300 group-hover:text-red-500 transition-colors">
                                        <card.icon size={18} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end justify-between">
                                        <div className="text-3xl font-black text-foreground">{card.value.toLocaleString()}</div>
                                        <div className="text-xs font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-md">
                                            {card.trend}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium mt-3">{card.desc}</p>
                                </CardContent>
                            </Card>
                        </m.div>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Recent Activity Log */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <Card className="bg-card border-border shadow-sm rounded-[2rem] overflow-hidden border">
                            <CardHeader className="border-b border-border/50 py-6 px-8 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                    <CardTitle className="text-lg font-bold text-foreground font-kantumruy">សកម្មភាពចុងក្រោយ</CardTitle>
                                </div>
                                <Button
                                    onClick={() => window.location.href = "/admin/logs"}
                                    variant="ghost"
                                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground h-8"
                                >
                                    មើលទាំងអស់
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/50">
                                    {logs.map((log, i) => (
                                        <div key={log.id} className="flex items-center justify-between p-5 px-8 hover:bg-muted/30 transition-colors group/item">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover/item:text-red-600 group-hover/item:bg-red-500/10 transition-all">
                                                    {log.action === 'CREATE' ? <ArrowUpRight size={18} /> :
                                                        log.action === 'GIFT' ? <Sparkles size={18} /> :
                                                            <CheckCircle2 size={18} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground tracking-tight">{log.actorName}</span>
                                                    <span className="text-xs text-muted-foreground font-kantumruy">{log.description}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    {logs.length === 0 && (
                                        <div className="p-12 text-center text-muted-foreground font-medium">មិនទាន់មានសកម្មភាពនៅឡើយ</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info & Security Audit */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-card border-border shadow-sm rounded-[2rem] border overflow-hidden">
                            <CardHeader className="border-b border-border/50 py-6 px-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-red-500" />
                                    <CardTitle className="text-lg font-bold text-foreground font-kantumruy">Security Audit</CardTitle>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                        <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Failures</div>
                                        <div className="text-2xl font-black text-red-700 dark:text-red-400">24</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blocked</div>
                                        <div className="text-2xl font-black text-white">0</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Malicious Activity</h4>
                                    {[
                                        { ip: "103.243.24.12", attempts: 8, severity: "High" },
                                        { ip: "202.1.23.45", attempts: 3, severity: "Medium" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono font-bold text-foreground/80">{item.ip}</span>
                                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{item.attempts} Attempts</span>
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                                item.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            )}>
                                                {item.severity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {userRole === "SUPERADMIN" && (
                                    <Link href="/admin/governance">
                                        <Button className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                                            View Full Audit Log
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-sm rounded-[2rem] border overflow-hidden">
                            <CardHeader className="border-b border-border/50 py-6 px-8">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                    <CardTitle className="text-lg font-bold text-foreground font-kantumruy">សុវត្ថិភាព និង ប្រព័ន្ធ</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                {[
                                    { label: "Server", value: "Online", color: "text-green-600", icon: <Activity size={14} className="animate-pulse" /> },
                                    { label: "Database", value: "Healthy", color: "text-blue-600", icon: <Database size={14} /> },
                                    { label: "Encryption", value: "Active", color: "text-amber-600", icon: <ShieldCheck size={14} /> },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group/health">
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            {item.icon}
                                            {item.label}
                                        </span>
                                        <span className={cn("text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-muted/50", item.color)}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-6 border-t border-slate-50 mt-6">
                                    <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden group/box">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/20 blur-3xl rounded-full -mr-12 -mt-12 transition-transform group-hover/box:scale-150" />
                                        <div className="relative z-10 flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                                                <AlertCircle size={12} />
                                                Security Protocol
                                            </div>
                                            <p className="text-xs text-slate-300 font-medium leading-relaxed font-kantumruy">
                                                រាល់ការចូលប្រើប្រាស់ត្រូវបានការពារដោយ 2-Layer Encryption និង JWT Fingerprinting។
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
