"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PartyPopper, CalendarCheck, TrendingUp, Sparkles, Activity, ShieldCheck, Database, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { m } from 'framer-motion';
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ErrorBoundary } from "@/components/error-boundary";
import { useTranslation } from "@/i18n/LanguageProvider";

interface AdminStats {
    totalUsers: number;
    totalProjects: number;
    activeProjects: number;
    newProjectsToday: number;
    financialOverview: {
        USD: number;
        KHR: number;
    };
}

interface AdminDashboardClientProps {
    initialStats: AdminStats;
    initialLogs: any[];
    userRole: string | null;
}

export default function AdminDashboardClient({ initialStats, initialLogs, userRole }: AdminDashboardClientProps) {
    const { t } = useTranslation();

    const cards = [
        {
            title: t('admin.overview.stats.activeHirers'),
            value: initialStats.totalUsers,
            trend: "+12%",
            desc: t('account.profile.description'),
            icon: Users,
            color: "from-blue-500/20 to-blue-600/5",
            accent: "bg-blue-400/10 text-blue-400",
            shadow: "shadow-blue-500/10"
        },
        {
            title: t('admin.overview.stats.totalProjects'),
            value: initialStats.totalProjects,
            trend: "+5.4%",
            desc: t('admin.overview.recentWeddings.subtitle'),
            icon: PartyPopper,
            color: "from-pink-500/20 to-pink-600/5",
            accent: "bg-pink-400/10 text-pink-400",
            shadow: "shadow-pink-500/10"
        },
        {
            title: t('admin.overview.stats.activeProjects'),
            value: initialStats.activeProjects,
            trend: "Active",
            desc: t('admin.overview.stats.activeHirers'),
            icon: CalendarCheck,
            color: "from-green-500/20 to-green-600/5",
            accent: "bg-green-400/10 text-green-400",
            shadow: "shadow-green-500/10"
        },
        {
            title: t('admin.overview.stats.totalRevenue'),
            value: initialStats.financialOverview.USD,
            trend: "USD",
            desc: t('admin.overview.actions.revenueGrowth'),
            icon: TrendingUp,
            color: "from-amber-500/20 to-amber-600/5",
            accent: "bg-amber-400/10 text-amber-400",
            shadow: "shadow-amber-500/10"
        }
    ];

    return (
        <ErrorBoundary name="Admin Dashboard">
            <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-12 pb-20"
            >
                {/* Premium Welcome Banner */}
                <m.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-10 md:p-14 rounded-[3.5rem] bg-slate-900 dark:bg-red-950/20 text-white overflow-hidden group border border-white/5"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full -ml-20 -mb-20" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                                <Sparkles size={12} />
                                MONEA Intelligence v2.1
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
                                {t('dashboard.welcome', { name: '' })} <span className="text-red-500">{t('admin.header.role')}</span>
                            </h2>
                            <p className="text-slate-400 max-w-md font-medium font-kantumruy leading-relaxed text-sm">
                                {t('dashboard.adminSubtitle')}
                            </p>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center min-w-[120px]">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
                                <div className="text-2xl font-black text-emerald-500 flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    LIVE
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center min-w-[120px]">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Safety</div>
                                <div className="text-2xl font-black text-white">99.9%</div>
                            </div>
                        </div>
                    </div>
                </m.div>

                {/* Main Stats Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card, idx) => (
                        <m.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 + 0.2, duration: 0.5 }}
                        >
                            <Card className="bg-white dark:bg-slate-900 border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 rounded-[2.5rem] overflow-hidden group border border-slate-100 dark:border-slate-800">
                                <CardHeader className="flex flex-row items-center justify-between pb-4 pt-8 px-8">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{card.title}</CardTitle>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-300 group-hover:text-red-500 group-hover:bg-red-500/10 transition-all duration-500">
                                        <card.icon size={20} />
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <div className="flex items-center justify-between">
                                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                                            {card.value.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-black text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-500/10">
                                            {card.trend}
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
                                        <m.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "70%" }}
                                            transition={{ delay: idx * 0.1 + 0.5, duration: 2, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-red-500 to-red-600"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-1.5 font-kantumruy">
                                        <ArrowUpRight size={10} className="text-green-500" />
                                        {card.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        </m.div>
                    ))}
                </div>

                <div className="grid gap-10 lg:grid-cols-12">
                    <m.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-8 space-y-8"
                    >
                        <Card className="bg-white dark:bg-slate-900 border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/50 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-800">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 py-8 px-10 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-red-500" />
                                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-kantumruy">សកម្មភាពចុងក្រោយ</CardTitle>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time system updates</p>
                                </div>
                                <Link href="/admin/logs">
                                    <Button
                                        variant="ghost"
                                        className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        {t('admin.overview.recentWeddings.viewAll')}
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {initialLogs.map((log, i) => (
                                        <m.div 
                                            key={log.id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 + 0.6 }}
                                            className="flex items-center justify-between p-6 px-10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group/item"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover/item:text-red-600 group-hover/item:border-red-500/20 group-hover/item:shadow-lg group-hover/item:shadow-red-500/10 transition-all duration-300">
                                                    {log.action === 'CREATE' ? <ArrowUpRight size={20} /> :
                                                        log.action === 'GIFT' ? <Sparkles size={20} /> :
                                                            <CheckCircle2 size={20} />}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{log.actorName}</span>
                                                    <span className="text-xs text-slate-500 font-medium font-kantumruy">{log.description}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">
                                                    {new Date(log.createdAt).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Phnom_Penh' })}
                                                </span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover/item:scale-150 transition-transform" />
                                            </div>
                                        </m.div>
                                    ))}
                                    {initialLogs.length === 0 && (
                                        <div className="p-20 text-center space-y-4">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                                <Activity className="text-slate-200" size={32} />
                                            </div>
                                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest font-kantumruy">{t('admin.settings.support.noTickets')}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </m.div>

                    <m.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-4 space-y-8"
                    >
                        <Card className="bg-white dark:bg-slate-900 border-none shadow-2xl shadow-red-200/20 dark:shadow-red-950/20 rounded-[3rem] border border-red-500/10 dark:border-red-500/10 overflow-hidden">
                            <CardHeader className="border-b border-red-50 dark:border-red-900/20 py-8 px-10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-red-600" />
                                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white font-kantumruy">{t('admin.overview.stats.securityAudit')}</CardTitle>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('admin.overview.stats.activeDefenses')}</p>
                                </div>
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-[2rem] bg-red-500 text-white shadow-xl shadow-red-500/20">
                                        <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{t('admin.overview.stats.failures')}</div>
                                        <div className="text-3xl font-black tabular-nums">24</div>
                                    </div>
                                    <div className="p-6 rounded-[2rem] bg-slate-950 text-white shadow-xl">
                                        <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{t('admin.overview.stats.blocked')}</div>
                                        <div className="text-3xl font-black tabular-nums">0</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t('admin.overview.actions.auditExplorer')}</h4>
                                    {[
                                        { ip: "103.243.24.12", attempts: 8, severity: "High" },
                                        { ip: "202.1.23.45", attempts: 3, severity: "Medium" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-red-500/30 transition-all duration-300">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{item.ip}</span>
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.attempts} Attempts</span>
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-2.5 py-1 rounded-lg",
                                                item.severity === 'High' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-amber-100 text-amber-700'
                                            )}>
                                                {item.severity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {userRole === "PLATFORM_OWNER" && (
                                    <Link href="/admin/master/security">
                                        <Button className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 dark:shadow-black">
                                            {t('admin.overview.actions.auditExplorer')}
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* System Health Block */}
                        <Card className="bg-slate-900 border-none shadow-2xl rounded-[3rem] overflow-hidden text-white group">
                            <CardHeader className="py-8 px-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-600 rounded-xl">
                                        <Activity size={16} className="text-white animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tight font-kantumruy uppercase">{t('admin.overview.systemHealth.title')}</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="px-10 pb-10 space-y-6">
                                {[
                                    { label: "Server", value: "Online", color: "text-emerald-500", progress: 98, icon: <Activity size={12} /> },
                                    { label: "Database", value: "Healthy", color: "text-blue-500", progress: 100, icon: <Database size={12} /> },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                {item.icon}
                                                {item.label}
                                            </span>
                                            <span className={cn("text-[9px] font-black tracking-widest uppercase", item.color)}>
                                                {item.value}
                                            </span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <m.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.progress}%` }}
                                                transition={{ delay: 1 + (i * 0.1), duration: 2 }}
                                                className="h-full bg-emerald-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </m.div>
                </div>
            </m.div>
        </ErrorBoundary>
    );
}
